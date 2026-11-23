import {
  UserRole,
  BookingStatus,
  LedgerStatus,
  CommercialModel,
  SubscriptionPlan,
} from "@prisma/client";
import prisma from "@/lib/prisma";
import { AuthenticatedUser } from "@/lib/auth/rbac";
import {
  UpdateProviderProfileInput,
  CreateProviderServiceInput,
  UpdateProviderServiceInput,
  CreateProviderStaffInput,
} from "@/lib/provider/schemas";
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from "@/lib/errors";
import { hashPassword } from "@/lib/auth/password";

/**
 * Resolves the authenticated merchant's associated provider entity.
 */
export async function resolveMerchantProvider(
  user: AuthenticatedUser,
  targetProviderId?: string
) {
  if (user.role === UserRole.ADMIN) {
    if (targetProviderId) {
      const p = await prisma.provider.findUnique({ where: { id: targetProviderId } });
      if (p) return p;
    }
    const defaultProvider = await prisma.provider.findFirst({
      orderBy: { createdAt: "asc" },
    });
    if (!defaultProvider) throw new NotFoundError("Provider");
    return defaultProvider;
  }

  if (user.role === UserRole.PROVIDER_OWNER) {
    const provider = await prisma.provider.findFirst({
      where: {
        ownerId: user.id,
        ...(targetProviderId ? { id: targetProviderId } : {}),
      },
    });
    if (!provider) {
      throw new NotFoundError(
        "No merchant provider record associated with your account.",
        "PROVIDER_NOT_FOUND"
      );
    }
    return provider;
  }

  if (user.role === UserRole.PROVIDER_STAFF) {
    if (!user.providerId) {
      throw new ForbiddenError("Staff account is not assigned to any provider.");
    }
    const provider = await prisma.provider.findUnique({
      where: { id: user.providerId },
    });
    if (!provider) {
      throw new NotFoundError("Associated employer provider not found.");
    }
    return provider;
  }

  throw new ForbiddenError("Only providers or staff can access this workspace.");
}

// -------------------------------------------------------------
// 1. Profile & Branch Management
// -------------------------------------------------------------

export async function getProviderProfile(providerId: string) {
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      branches: {
        orderBy: { isMainBranch: "desc" },
      },
      staff: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          isActive: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          bookings: true,
          services: true,
          reviews: true,
        },
      },
    },
  });

  if (!provider) {
    throw new NotFoundError("Provider profile");
  }

  return {
    id: provider.id,
    providerCode: provider.providerCode,
    businessName: provider.businessName,
    legalName: provider.legalName,
    category: provider.category,
    verificationStatus: provider.verificationStatus,
    commercialModel: provider.commercialModel,
    commissionRate: Number(provider.commissionRate),
    subscriptionPlan: provider.subscriptionPlan,
    subscriptionStatus: provider.subscriptionStatus,
    gstin: provider.gstin,
    panNumber: provider.panNumber,
    licenseType: provider.licenseType,
    licenseNumber: provider.licenseNumber,
    contactEmail: provider.contactEmail,
    contactPhone: provider.contactPhone,
    website: provider.website,
    bio: provider.bio,
    rating: Number(provider.rating),
    reviewCount: provider.reviewCount,
    isSponsored: provider.isSponsored,
    cancellationPolicy: provider.cancellationPolicy,
    owner: provider.owner,
    branches: provider.branches,
    staff: provider.staff,
    counts: provider._count,
    createdAt: provider.createdAt,
    updatedAt: provider.updatedAt,
  };
}

export async function updateProviderProfile(
  providerId: string,
  input: UpdateProviderProfileInput,
  actor: AuthenticatedUser
) {
  const updated = await prisma.$transaction(async (tx) => {
    const p = await tx.provider.update({
      where: { id: providerId },
      data: {
        ...(input.businessName ? { businessName: input.businessName } : {}),
        ...(input.legalName ? { legalName: input.legalName } : {}),
        ...(input.contactPhone ? { contactPhone: input.contactPhone } : {}),
        ...(input.contactEmail ? { contactEmail: input.contactEmail } : {}),
        ...(input.website !== undefined ? { website: input.website || null } : {}),
        ...(input.bio !== undefined ? { bio: input.bio } : {}),
        ...(input.cancellationPolicy !== undefined ? { cancellationPolicy: input.cancellationPolicy } : {}),
      },
    });

    if (input.mainBranch) {
      const mainBranch = await tx.branch.findFirst({
        where: { providerId, isMainBranch: true },
      });

      if (mainBranch) {
        await tx.branch.update({
          where: { id: mainBranch.id },
          data: {
            ...(input.mainBranch.name ? { name: input.mainBranch.name } : {}),
            ...(input.mainBranch.addressLine ? { addressLine: input.mainBranch.addressLine } : {}),
            ...(input.mainBranch.locality ? { locality: input.mainBranch.locality } : {}),
            ...(input.mainBranch.city ? { city: input.mainBranch.city } : {}),
            ...(input.mainBranch.pincode ? { pincode: input.mainBranch.pincode } : {}),
            ...(input.mainBranch.phone ? { phone: input.mainBranch.phone } : {}),
            ...(input.mainBranch.operatingHours
              ? { operatingHours: JSON.parse(JSON.stringify(input.mainBranch.operatingHours)) }
              : {}),
          },
        });
      }
    }

    await tx.auditLog.create({
      data: {
        actorId: actor.id,
        actorRole: actor.role,
        action: "PROVIDER_PROFILE_UPDATED",
        entityType: "PROVIDER",
        entityId: providerId,
        newState: JSON.parse(JSON.stringify(input)),
      },
    });

    return p;
  });

  return getProviderProfile(updated.id);
}

// -------------------------------------------------------------
// 2. Services & Catalog Management
// -------------------------------------------------------------

export async function getProviderServices(providerId: string) {
  const services = await prisma.service.findMany({
    where: { providerId },
    include: {
      branch: {
        select: {
          id: true,
          name: true,
          locality: true,
          city: true,
        },
      },
      _count: {
        select: {
          bookings: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return services.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    durationMinutes: s.durationMinutes,
    basePrice: Number(s.basePrice),
    currency: s.currency,
    category: s.category,
    categoryMetadata: s.categoryMetadata,
    isActive: s.isActive,
    branch: s.branch,
    bookingCount: s._count.bookings,
    createdAt: s.createdAt,
  }));
}

export async function createProviderService(
  providerId: string,
  input: CreateProviderServiceInput
) {
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    select: { category: true },
  });

  if (!provider) throw new NotFoundError("Provider");

  const service = await prisma.service.create({
    data: {
      providerId,
      branchId: input.branchId || null,
      name: input.name,
      description: input.description || null,
      durationMinutes: input.durationMinutes,
      basePrice: input.basePrice,
      currency: "INR",
      category: input.category || provider.category,
      categoryMetadata: JSON.parse(JSON.stringify(input.categoryMetadata || {})),
      isActive: true,
    },
  });

  return {
    ...service,
    basePrice: Number(service.basePrice),
  };
}

export async function updateProviderService(
  providerId: string,
  input: UpdateProviderServiceInput
) {
  const service = await prisma.service.findFirst({
    where: { id: input.id, providerId },
  });

  if (!service) {
    throw new NotFoundError("Service");
  }

  const updated = await prisma.service.update({
    where: { id: input.id },
    data: {
      ...(input.name ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.durationMinutes ? { durationMinutes: input.durationMinutes } : {}),
      ...(input.basePrice ? { basePrice: input.basePrice } : {}),
      ...(input.categoryMetadata
        ? { categoryMetadata: JSON.parse(JSON.stringify(input.categoryMetadata)) }
        : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.branchId !== undefined ? { branchId: input.branchId } : {}),
    },
  });

  return {
    ...updated,
    basePrice: Number(updated.basePrice),
  };
}

export async function deleteProviderService(providerId: string, serviceId: string) {
  const service = await prisma.service.findFirst({
    where: { id: serviceId, providerId },
    include: {
      _count: {
        select: { bookings: true },
      },
    },
  });

  if (!service) {
    throw new NotFoundError("Service");
  }

  // If service has bookings attached, soft-delete by deactivating to preserve commission auditability
  if (service._count.bookings > 0) {
    await prisma.service.update({
      where: { id: serviceId },
      data: { isActive: false },
    });
    return { id: serviceId, archived: true };
  }

  await prisma.service.delete({
    where: { id: serviceId },
  });

  return { id: serviceId, deleted: true };
}

// -------------------------------------------------------------
// 3. Staff Provisioning (Branch Seats)
// -------------------------------------------------------------

export async function createProviderStaff(
  providerId: string,
  input: CreateProviderStaffInput,
  actor: AuthenticatedUser
) {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: input.email }, { phone: input.phone }],
    },
  });

  if (existingUser) {
    throw new ConflictError("A user with this email or phone number already exists.");
  }

  const plainPassword = input.temporaryPassword || "Staff@Bookkaro2026";
  const passwordHash = await hashPassword(plainPassword);

  const staff = await prisma.user.create({
    data: {
      email: input.email,
      phone: input.phone,
      firstName: input.firstName,
      lastName: input.lastName,
      passwordHash,
      role: UserRole.PROVIDER_STAFF,
      providerId,
      isActive: true,
      forcePasswordChange: true, // Forces staff member to pick personal password upon initial sign-in
    },
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      role: true,
      providerId: true,
      forcePasswordChange: true,
      createdAt: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: actor.id,
      actorRole: actor.role,
      action: "STAFF_INVITED",
      entityType: "USER",
      entityId: staff.id,
      newState: { email: staff.email, providerId },
    },
  });

  return {
    staff,
    temporaryPassword: plainPassword,
  };
}

// -------------------------------------------------------------
// 4. Provider Dashboard KPIs
// -------------------------------------------------------------

export async function getProviderDashboardKPIs(providerId: string) {
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    select: {
      id: true,
      businessName: true,
      commercialModel: true,
      commissionRate: true,
      subscriptionPlan: true,
      subscriptionStatus: true,
    },
  });

  if (!provider) throw new NotFoundError("Provider");

  // Today bounds (00:00:00 to 23:59:59)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Month start bound
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  // 1. Pending Requests Count
  const pendingRequestsCount = await prisma.booking.count({
    where: {
      providerId,
      status: BookingStatus.REQUESTED,
    },
  });

  // 2. Today's Confirmed Bookings Count
  const todayConfirmedCount = await prisma.booking.count({
    where: {
      providerId,
      status: BookingStatus.CONFIRMED,
      bookingDate: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  // 3. Completed Bookings this Month
  const completedThisMonth = await prisma.booking.findMany({
    where: {
      providerId,
      status: BookingStatus.COMPLETED,
      completedAt: {
        gte: monthStart,
      },
    },
    select: {
      finalBillAmount: true,
      estimatedBillAmount: true,
    },
  });

  // 4. Revenue & Net Earnings Calculation
  const commissionRate = Number(provider.commissionRate) || 8.0;
  let grossGMV = 0;
  for (const b of completedThisMonth) {
    grossGMV += b.finalBillAmount ? Number(b.finalBillAmount) : Number(b.estimatedBillAmount);
  }

  let netEarnings = grossGMV;
  let totalCommissionDeducted = 0;

  if (provider.commercialModel === CommercialModel.COMMISSION) {
    totalCommissionDeducted = (grossGMV * commissionRate) / 100;
    netEarnings = grossGMV - totalCommissionDeducted;
  }

  // 5. Recent Alerts / Incoming Requests
  const recentAlerts = await prisma.booking.findMany({
    where: {
      providerId,
      status: {
        in: [BookingStatus.REQUESTED, BookingStatus.CANCELLED, BookingStatus.DISPUTED],
      },
    },
    include: {
      customer: {
        select: { firstName: true, lastName: true, phone: true },
      },
      service: {
        select: { name: true, basePrice: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return {
    kpis: {
      pendingRequests: pendingRequestsCount,
      todayConfirmed: todayConfirmedCount,
      completedThisMonthCount: completedThisMonth.length,
      grossRevenueInr: Math.round(grossGMV),
      netEarningsInr: Math.round(netEarnings),
      commissionDeductedInr: Math.round(totalCommissionDeducted),
    },
    commercialInfo: {
      model: provider.commercialModel,
      commissionRatePercent: commissionRate,
      subscriptionPlan: provider.subscriptionPlan,
      subscriptionStatus: provider.subscriptionStatus,
    },
    recentAlerts: recentAlerts.map((a) => ({
      id: a.id,
      bookingCode: a.bookingCode,
      status: a.status,
      customerName: `${a.customer.firstName} ${a.customer.lastName}`,
      customerPhone: a.customer.phone,
      serviceName: a.service.name,
      estimatedBillAmount: Number(a.estimatedBillAmount),
      bookingDate: a.bookingDate,
      timeSlot: a.timeSlot,
      createdAt: a.createdAt,
    })),
  };
}

// -------------------------------------------------------------
// 5. Provider Incoming Queue & Bookings
// -------------------------------------------------------------

export async function getProviderBookingsQueue(
  providerId: string,
  filters: {
    status?: string;
    date?: string;
    page?: number;
    limit?: number;
  }
) {
  const pageNum = Math.max(1, Number(filters.page || 1));
  const limitNum = Math.min(50, Math.max(1, Number(filters.limit || 15)));

  let statusFilter: BookingStatus | undefined;
  if (filters.status && filters.status !== "ALL" && filters.status in BookingStatus) {
    statusFilter = filters.status as BookingStatus;
  }

  let dateFilter: { gte: Date; lte: Date } | undefined;
  if (filters.date) {
    const start = new Date(filters.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(filters.date);
    end.setHours(23, 59, 59, 999);
    dateFilter = { gte: start, lte: end };
  }

  const whereClause = {
    providerId,
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(dateFilter ? { bookingDate: dateFilter } : {}),
  };

  const [total, bookings] = await Promise.all([
    prisma.booking.count({ where: whereClause }),
    prisma.booking.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        branch: {
          select: { id: true, name: true, locality: true },
        },
        service: {
          select: { id: true, name: true, durationMinutes: true, basePrice: true },
        },
        commissionLedger: {
          select: {
            finalBillValue: true,
            commissionRatePercent: true,
            commissionPayable: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
    }),
  ]);

  return {
    bookings: bookings.map((b) => ({
      id: b.id,
      bookingCode: b.bookingCode,
      verificationCode: b.verificationCode,
      status: b.status,
      customer: b.customer,
      branch: b.branch,
      service: {
        ...b.service,
        basePrice: Number(b.service.basePrice),
      },
      bookingDate: b.bookingDate,
      timeSlot: b.timeSlot,
      categoryInputs: b.categoryInputs,
      tokenAmountPaid: Number(b.tokenAmountPaid),
      estimatedBillAmount: Number(b.estimatedBillAmount),
      finalBillAmount: b.finalBillAmount ? Number(b.finalBillAmount) : null,
      paymentStatus: b.paymentStatus,
      declineReason: b.declineReason,
      cancellationReason: b.cancellationReason,
      commissionLedger: b.commissionLedger
        ? {
            finalBillValue: Number(b.commissionLedger.finalBillValue),
            commissionRatePercent: Number(b.commissionLedger.commissionRatePercent),
            commissionPayable: Number(b.commissionLedger.commissionPayable),
            status: b.commissionLedger.status,
          }
        : null,
      acceptedAt: b.acceptedAt,
      confirmedAt: b.confirmedAt,
      completedAt: b.completedAt,
      createdAt: b.createdAt,
    })),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

// -------------------------------------------------------------
// 6. Auditable Commercial Ledger & Subscription Billing
// -------------------------------------------------------------

export async function getProviderBilling(providerId: string) {
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    include: {
      subscriptionInvoices: {
        orderBy: { billingCycleStart: "desc" },
      },
      commissionLedgers: {
        include: {
          booking: {
            select: {
              bookingCode: true,
              bookingDate: true,
              customer: {
                select: { firstName: true, lastName: true },
              },
              service: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: { serviceCompletedAt: "desc" },
      },
    },
  });

  if (!provider) throw new NotFoundError("Provider");

  // Model A: Subscription Plan Commercials
  if (provider.commercialModel === CommercialModel.SUBSCRIPTION) {
    const planPrices: Record<SubscriptionPlan, number> = {
      [SubscriptionPlan.NONE]: 0,
      [SubscriptionPlan.STARTER]: 1499,
      [SubscriptionPlan.GROWTH]: 2999,
      [SubscriptionPlan.ENTERPRISE]: 5999,
    };

    const monthlyPrice = planPrices[provider.subscriptionPlan] || 0;

    return {
      commercialModel: CommercialModel.SUBSCRIPTION,
      subscription: {
        plan: provider.subscriptionPlan,
        status: provider.subscriptionStatus,
        monthlyPriceInr: monthlyPrice,
        currency: "INR",
        benefits:
          provider.subscriptionPlan === SubscriptionPlan.GROWTH
            ? ["Unlimited bookings", "Up to 3 branch bays", "Full analytics"]
            : provider.subscriptionPlan === SubscriptionPlan.ENTERPRISE
            ? ["Unlimited branches", "Custom API integrations", "Priority support"]
            : ["Up to 100 bookings/mo", "Single branch", "Standard support"],
        nextInvoiceDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
      },
      invoices: provider.subscriptionInvoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        billingCycleStart: inv.billingCycleStart,
        billingCycleEnd: inv.billingCycleEnd,
        planTier: inv.planTier,
        amountDueInr: Number(inv.amountDue),
        currency: inv.currency,
        status: inv.status,
        paidAt: inv.paidAt,
        paymentReference: inv.paymentReference,
        createdAt: inv.createdAt,
      })),
    };
  }

  // Model B: Commission Ledger Commercials
  const commissionRate = Number(provider.commissionRate) || 8.0;
  let totalGMV = 0;
  let totalCommissionPayable = 0;
  let settledCommission = 0;
  let pendingCommission = 0;

  const itemizedLedger = provider.commissionLedgers.map((entry) => {
    const finalBill = Number(entry.finalBillValue);
    const commPayable = Number(entry.commissionPayable);
    const netPayout = finalBill - commPayable;

    totalGMV += finalBill;
    totalCommissionPayable += commPayable;

    if (entry.status === LedgerStatus.SETTLED || entry.status === LedgerStatus.PAID) {
      settledCommission += commPayable;
    } else {
      pendingCommission += commPayable;
    }

    return {
      id: entry.id,
      bookingId: entry.bookingId,
      bookingCode: entry.booking.bookingCode,
      serviceName: entry.booking.service.name,
      customerName: `${entry.booking.customer.firstName} ${entry.booking.customer.lastName}`,
      serviceCompletedAt: entry.serviceCompletedAt,
      finalBillValueInr: finalBill,
      commissionRatePercent: Number(entry.commissionRatePercent),
      commissionPayableInr: commPayable,
      netPayoutInr: Math.round(netPayout * 100) / 100,
      status: entry.status,
      settlementBatchId: entry.settlementBatchId,
      settledAt: entry.settledAt,
      createdAt: entry.createdAt,
    };
  });

  return {
    commercialModel: CommercialModel.COMMISSION,
    commissionSummary: {
      commissionRatePercent: commissionRate,
      totalCompletedBookings: provider.commissionLedgers.length,
      totalGrossGMVInr: Math.round(totalGMV * 100) / 100,
      totalCommissionPayableInr: Math.round(totalCommissionPayable * 100) / 100,
      totalNetMerchantPayoutInr: Math.round((totalGMV - totalCommissionPayable) * 100) / 100,
      settledCommissionInr: Math.round(settledCommission * 100) / 100,
      pendingSettlementInr: Math.round(pendingCommission * 100) / 100,
    },
    ledger: itemizedLedger,
  };
}
