import {
  Prisma,
  CRMStage,
  ProviderCategory,
  CommercialModel,
  SubscriptionPlan,
  SubscriptionStatus,
  KYCStatus,
  UserRole,
  BookingStatus,
} from "@prisma/client";
import prisma from "@/lib/prisma";
import { NotFoundError, ConflictError, BadRequestError } from "@/lib/errors";
import { hashPassword } from "@/lib/auth/password";
import { NotificationService } from "@/services/notifications";
import {
  CreateLeadInput,
  UpdateLeadInput,
  UpdateVerificationInput,
} from "@/lib/admin/schemas";

export interface LeadNote {
  id: string;
  author: string;
  date: string;
  text: string;
}

export interface AdminActor {
  id: string;
  name: string;
  role: string;
  ipAddress?: string;
  userAgent?: string;
}

const CITY_GEO_DEFAULTS: Record<
  string,
  { lat: number; lng: number; state: string; pincode: string }
> = {
  patna: { lat: 25.5941, lng: 85.1376, state: "Bihar", pincode: "800001" },
  "fraser road": { lat: 25.6092, lng: 85.1376, state: "Bihar", pincode: "800001" },
  "boring road": { lat: 25.6186, lng: 85.1129, state: "Bihar", pincode: "800013" },
  kankarbagh: { lat: 25.5912, lng: 85.1528, state: "Bihar", pincode: "800020" },
  "bailey road": { lat: 25.6121, lng: 85.0886, state: "Bihar", pincode: "800014" },
  danapur: { lat: 25.6324, lng: 85.0435, state: "Bihar", pincode: "801503" },
  lalganj: { lat: 25.8694, lng: 85.1789, state: "Bihar", pincode: "844121" },
};

function resolveCityGeo(city: string) {
  const normalized = city.trim().toLowerCase();
  return (
    CITY_GEO_DEFAULTS[normalized] || {
      lat: 25.5941,
      lng: 85.1376,
      state: "Bihar",
      pincode: "800001",
    }
  );
}

// -------------------------------------------------------------
// HELPER: Audit Logging
// -------------------------------------------------------------

export async function createAuditLog(params: {
  actorId?: string | null;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  oldState?: Record<string, unknown> | null;
  newState?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  return prisma.auditLog.create({
    data: {
      actorId: params.actorId ?? null,
      actorRole: params.actorRole,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      oldState: params.oldState ? (params.oldState as Prisma.InputJsonValue) : Prisma.JsonNull,
      newState: params.newState ? (params.newState as Prisma.InputJsonValue) : Prisma.JsonNull,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
    },
  });
}

// -------------------------------------------------------------
// HELPER: Generate Next Provider Code
// -------------------------------------------------------------

export async function generateUniqueProviderCode(): Promise<string> {
  const latestProvider = await prisma.provider.findFirst({
    where: { providerCode: { startsWith: "BK-PRV-" } },
    orderBy: { providerCode: "desc" },
    select: { providerCode: true },
  });

  let nextNum = 1;
  if (latestProvider?.providerCode) {
    const match = latestProvider.providerCode.match(/BK-PRV-(\d+)/);
    if (match) {
      nextNum = parseInt(match[1], 10) + 1;
    }
  }

  let candidate = `BK-PRV-${String(nextNum).padStart(3, "0")}`;
  while (await prisma.provider.findUnique({ where: { providerCode: candidate } })) {
    nextNum++;
    candidate = `BK-PRV-${String(nextNum).padStart(3, "0")}`;
  }

  return candidate;
}

// -------------------------------------------------------------
// 1. SALES CRM PIPELINE
// -------------------------------------------------------------

export async function getCRMLeads(filters: {
  stage?: CRMStage;
  city?: string;
  category?: ProviderCategory;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 25));
  const skip = (page - 1) * limit;

  const where: Prisma.SalesLeadWhereInput = {};

  if (filters.stage) {
    where.stage = filters.stage;
  }
  if (filters.city) {
    where.city = { contains: filters.city, mode: "insensitive" };
  }
  if (filters.category) {
    where.category = filters.category;
  }
  if (filters.search) {
    const q = filters.search.trim();
    where.OR = [
      { businessName: { contains: q, mode: "insensitive" } },
      { ownerName: { contains: q, mode: "insensitive" } },
      { phone: { contains: q } },
      { email: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
    ];
  }

  const [leads, total, stageGroupCounts] = await Promise.all([
    prisma.salesLead.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
      include: {
        convertedProvider: {
          select: {
            id: true,
            providerCode: true,
            businessName: true,
            verificationStatus: true,
            rating: true,
          },
        },
      },
    }),
    prisma.salesLead.count({ where }),
    prisma.salesLead.groupBy({
      by: ["stage"],
      _count: { id: true },
    }),
  ]);

  const stageCounts: Record<string, number> = {
    LEAD_01: 0,
    DISCUSS_02: 0,
    VERIFY_03: 0,
    ACTIVATE_04: 0,
    CONFIGURE_05: 0,
    GO_LIVE_06: 0,
  };

  for (const group of stageGroupCounts) {
    stageCounts[group.stage] = group._count.id;
  }

  return {
    leads,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    stageCounts,
  };
}

export async function getCRMLeadById(leadId: string) {
  const lead = await prisma.salesLead.findUnique({
    where: { id: leadId },
    include: {
      convertedProvider: {
        select: {
          id: true,
          providerCode: true,
          businessName: true,
          category: true,
          verificationStatus: true,
          rating: true,
          reviewCount: true,
          branches: {
            select: {
              id: true,
              name: true,
              city: true,
              locality: true,
            },
          },
        },
      },
    },
  });

  if (!lead) {
    throw new NotFoundError("Sales lead");
  }

  return lead;
}

export async function createCRMLead(
  input: CreateLeadInput,
  actor?: AdminActor
) {
  const initialNotes: LeadNote[] = [];
  if (input.note) {
    initialNotes.push({
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      author: actor?.name ?? "Admin",
      date: new Date().toISOString(),
      text: input.note,
    });
  }

  const lead = await prisma.salesLead.create({
    data: {
      businessName: input.businessName,
      ownerName: input.ownerName,
      phone: input.phone,
      email: input.email.toLowerCase(),
      city: input.city,
      category: input.category,
      stage: CRMStage.LEAD_01,
      assignedCommercialModel: input.assignedCommercialModel ?? CommercialModel.COMMISSION,
      proposedCommissionRate:
        input.proposedCommissionRate !== undefined
          ? new Prisma.Decimal(input.proposedCommissionRate)
          : new Prisma.Decimal(8.0),
      planTier: input.planTier ?? SubscriptionPlan.NONE,
      notes: initialNotes as unknown as Prisma.InputJsonValue,
    },
  });

  if (actor) {
    await createAuditLog({
      actorId: actor.id,
      actorRole: actor.role,
      action: "LEAD_CREATED",
      entityType: "LEAD",
      entityId: lead.id,
      newState: {
        businessName: lead.businessName,
        city: lead.city,
        category: lead.category,
        stage: lead.stage,
      },
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });
  }

  return lead;
}

export async function updateCRMLead(
  leadId: string,
  input: UpdateLeadInput,
  actor?: AdminActor
) {
  const currentLead = await prisma.salesLead.findUnique({
    where: { id: leadId },
  });

  if (!currentLead) {
    throw new NotFoundError("Sales lead");
  }

  const existingNotes = Array.isArray(currentLead.notes)
    ? (currentLead.notes as unknown as LeadNote[])
    : [];

  const updatedNotes = [...existingNotes];

  if (input.newNote) {
    updatedNotes.push({
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      author: actor?.name ?? "Admin",
      date: new Date().toISOString(),
      text: input.newNote,
    });
  }

  const updateData: Prisma.SalesLeadUpdateInput = {
    notes: updatedNotes as unknown as Prisma.InputJsonValue,
  };

  if (input.stage !== undefined) updateData.stage = input.stage;
  if (input.businessName !== undefined) updateData.businessName = input.businessName;
  if (input.ownerName !== undefined) updateData.ownerName = input.ownerName;
  if (input.phone !== undefined) updateData.phone = input.phone;
  if (input.email !== undefined) updateData.email = input.email.toLowerCase();
  if (input.city !== undefined) updateData.city = input.city;
  if (input.category !== undefined) updateData.category = input.category;
  if (input.assignedCommercialModel !== undefined) {
    updateData.assignedCommercialModel = input.assignedCommercialModel;
  }
  if (input.proposedCommissionRate !== undefined) {
    updateData.proposedCommissionRate = new Prisma.Decimal(input.proposedCommissionRate);
  }
  if (input.planTier !== undefined) {
    updateData.planTier = input.planTier;
  }

  const updatedLead = await prisma.salesLead.update({
    where: { id: leadId },
    data: updateData,
  });

  if (actor) {
    await createAuditLog({
      actorId: actor.id,
      actorRole: actor.role,
      action: input.stage && input.stage !== currentLead.stage ? "LEAD_STAGE_MOVED" : "LEAD_UPDATED",
      entityType: "LEAD",
      entityId: leadId,
      oldState: {
        stage: currentLead.stage,
        businessName: currentLead.businessName,
      },
      newState: {
        stage: updatedLead.stage,
        businessName: updatedLead.businessName,
      },
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });
  }

  return updatedLead;
}

export async function deleteCRMLead(leadId: string, actor?: AdminActor) {
  const currentLead = await prisma.salesLead.findUnique({
    where: { id: leadId },
  });

  if (!currentLead) {
    throw new NotFoundError("Sales lead");
  }

  if (currentLead.convertedProviderId) {
    throw new BadRequestError(
      "Cannot delete a lead that has already been converted to an active provider.",
      "LEAD_ALREADY_CONVERTED"
    );
  }

  await prisma.salesLead.delete({
    where: { id: leadId },
  });

  if (actor) {
    await createAuditLog({
      actorId: actor.id,
      actorRole: actor.role,
      action: "LEAD_DELETED",
      entityType: "LEAD",
      entityId: leadId,
      oldState: {
        businessName: currentLead.businessName,
        stage: currentLead.stage,
      },
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
    });
  }

  return { success: true, message: `Lead ${currentLead.businessName} deleted successfully` };
}

// -------------------------------------------------------------
// ONE-CLICK PROVIDER ACTIVATION
// -------------------------------------------------------------

export async function activateCRMLead(
  leadId: string,
  actor: AdminActor
) {
  const lead = await prisma.salesLead.findUnique({
    where: { id: leadId },
  });

  if (!lead) {
    throw new NotFoundError("Sales lead");
  }

  if (lead.convertedProviderId) {
    throw new ConflictError(
      "This lead has already been activated and converted to an active provider.",
      "LEAD_ALREADY_ACTIVATED",
      { providerId: lead.convertedProviderId }
    );
  }

  // 1. Resolve or Create User
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: lead.email }, { phone: lead.phone }],
    },
  });

  const temporaryPassword = `Bk!${Math.random().toString(36).slice(2, 6).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}#`;
  const tempPasswordHash = await hashPassword(temporaryPassword);

  let merchantUserId: string;

  if (existingUser) {
    merchantUserId = existingUser.id;
    // Upgrade role to PROVIDER_OWNER if currently CUSTOMER
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        role: existingUser.role === UserRole.ADMIN ? UserRole.ADMIN : UserRole.PROVIDER_OWNER,
        forcePasswordChange: true,
        passwordHash: tempPasswordHash,
        isActive: true,
      },
    });
  } else {
    const nameParts = lead.ownerName.trim().split(/\s+/);
    const firstName = nameParts[0] || lead.ownerName;
    const lastName = nameParts.slice(1).join(" ") || "Partner";

    const newUser = await prisma.user.create({
      data: {
        email: lead.email,
        phone: lead.phone,
        passwordHash: tempPasswordHash,
        firstName,
        lastName,
        role: UserRole.PROVIDER_OWNER,
        forcePasswordChange: true,
        isActive: true,
      },
    });
    merchantUserId = newUser.id;
  }

  // 2. Generate unique Provider Code
  const providerCode = await generateUniqueProviderCode();
  const geo = resolveCityGeo(lead.city);

  // 3. Atomically create Provider, default Branch, update Lead, and log Audit
  const result = await prisma.$transaction(async (tx) => {
    // A. Create Provider
    const provider = await tx.provider.create({
      data: {
        providerCode,
        businessName: lead.businessName,
        legalName: lead.businessName,
        category: lead.category,
        verificationStatus: KYCStatus.VERIFIED,
        commercialModel: lead.assignedCommercialModel,
        commissionRate:
          lead.proposedCommissionRate ??
          (lead.assignedCommercialModel === CommercialModel.COMMISSION
            ? new Prisma.Decimal(8.0)
            : new Prisma.Decimal(0.0)),
        subscriptionPlan: lead.planTier ?? SubscriptionPlan.NONE,
        subscriptionStatus:
          lead.assignedCommercialModel === CommercialModel.SUBSCRIPTION
            ? SubscriptionStatus.ACTIVE
            : SubscriptionStatus.TRIAL,
        contactEmail: lead.email,
        contactPhone: lead.phone,
        ownerId: merchantUserId,
        bio: `${lead.businessName} - Premier ${lead.category.toLowerCase().replace(/_/g, " ")} service provider in ${lead.city}.`,
      },
    });

    // B. Create Default Branch
    const defaultOperatingHours = {
      monday: { open: "09:00", close: "20:00", isOpen: true },
      tuesday: { open: "09:00", close: "20:00", isOpen: true },
      wednesday: { open: "09:00", close: "20:00", isOpen: true },
      thursday: { open: "09:00", close: "20:00", isOpen: true },
      friday: { open: "09:00", close: "20:00", isOpen: true },
      saturday: { open: "09:00", close: "21:00", isOpen: true },
      sunday: { open: "10:00", close: "18:00", isOpen: true },
    };

    const mainBranch = await tx.branch.create({
      data: {
        providerId: provider.id,
        name: `${lead.businessName} - Main Branch`,
        isMainBranch: true,
        addressLine: `${lead.city} Commercial Hub`,
        locality: "City Center",
        city: lead.city,
        state: geo.state,
        pincode: geo.pincode,
        latitude: geo.lat,
        longitude: geo.lng,
        phone: lead.phone,
        email: lead.email,
        operatingHours: defaultOperatingHours,
        isActive: true,
      },
    });

    // C. Update SalesLead
    const existingNotes = Array.isArray(lead.notes)
      ? (lead.notes as unknown as LeadNote[])
      : [];
    const activationNote: LeadNote = {
      id: `note-${Date.now()}`,
      author: actor.name,
      date: new Date().toISOString(),
      text: `Merchant activated with Provider ID ${provider.providerCode}. Commercial Model: ${provider.commercialModel}.`,
    };

    const updatedLead = await tx.salesLead.update({
      where: { id: lead.id },
      data: {
        stage: CRMStage.ACTIVATE_04,
        convertedProviderId: provider.id,
        notes: [...existingNotes, activationNote] as unknown as Prisma.InputJsonValue,
      },
    });

    // D. Platform Audit Log
    const audit = await tx.auditLog.create({
      data: {
        actorId: actor.id,
        actorRole: actor.role,
        action: "LEAD_ACTIVATED",
        entityType: "PROVIDER",
        entityId: provider.id,
        oldState: {
          leadId: lead.id,
          stage: lead.stage,
        },
        newState: {
          providerId: provider.id,
          providerCode: provider.providerCode,
          commercialModel: provider.commercialModel,
          commissionRate: provider.commissionRate.toString(),
          subscriptionPlan: provider.subscriptionPlan,
        },
        ipAddress: actor.ipAddress ?? null,
        userAgent: actor.userAgent ?? null,
      },
    });

    return { provider, mainBranch, updatedLead, audit };
  });

  // 4. Trigger Dispatcher Notification to Merchant
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bookkaro.in";
  try {
    await NotificationService.notifyProviderActivated({
      providerId: result.provider.id,
      providerCode: result.provider.providerCode,
      businessName: result.provider.businessName,
      ownerName: lead.ownerName,
      ownerEmail: lead.email,
      ownerPhone: lead.phone,
      temporaryPassword,
      loginUrl: `${appBaseUrl}/provider-portal`,
    });
  } catch (notifyErr) {
    console.warn("[AdminService] Activation notification dispatch failure:", notifyErr);
  }

  return {
    success: true,
    message: `Provider ${result.provider.businessName} (${result.provider.providerCode}) successfully activated.`,
    provider: result.provider,
    mainBranch: result.mainBranch,
    lead: result.updatedLead,
    credentials: {
      email: lead.email,
      phone: lead.phone,
      temporaryPassword,
      forcePasswordChange: true,
    },
  };
}

// -------------------------------------------------------------
// 2. PROVIDER VERIFICATION DOSSIERS & STATUS
// -------------------------------------------------------------

export async function getVerifications(filters: {
  status?: KYCStatus;
  category?: ProviderCategory;
  city?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
  const skip = (page - 1) * limit;

  const where: Prisma.ProviderWhereInput = {};

  if (filters.status) {
    where.verificationStatus = filters.status;
  }
  if (filters.category) {
    where.category = filters.category;
  }
  if (filters.city) {
    where.branches = {
      some: { city: { contains: filters.city, mode: "insensitive" } },
    };
  }
  if (filters.search) {
    const q = filters.search.trim();
    where.OR = [
      { businessName: { contains: q, mode: "insensitive" } },
      { legalName: { contains: q, mode: "insensitive" } },
      { providerCode: { contains: q, mode: "insensitive" } },
      { contactEmail: { contains: q, mode: "insensitive" } },
      { contactPhone: { contains: q } },
      { gstin: { contains: q, mode: "insensitive" } },
      { panNumber: { contains: q, mode: "insensitive" } },
      { licenseNumber: { contains: q, mode: "insensitive" } },
    ];
  }

  const [providers, total, statusGroups] = await Promise.all([
    prisma.provider.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        providerCode: true,
        businessName: true,
        legalName: true,
        category: true,
        verificationStatus: true,
        commercialModel: true,
        commissionRate: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        gstin: true,
        panNumber: true,
        licenseType: true,
        licenseNumber: true,
        contactEmail: true,
        contactPhone: true,
        rating: true,
        reviewCount: true,
        createdAt: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        _count: {
          select: {
            branches: true,
            services: true,
            bookings: true,
          },
        },
      },
    }),
    prisma.provider.count({ where }),
    prisma.provider.groupBy({
      by: ["verificationStatus"],
      _count: { id: true },
    }),
  ]);

  const kycSummary: Record<string, number> = {
    PENDING: 0,
    UNDER_REVIEW: 0,
    VERIFIED: 0,
    REJECTED: 0,
    SUSPENDED: 0,
  };

  for (const group of statusGroups) {
    kycSummary[group.verificationStatus] = group._count.id;
  }

  return {
    providers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    kycSummary,
  };
}

export async function getVerificationDossier(providerId: string) {
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
          role: true,
          createdAt: true,
        },
      },
      branches: {
        select: {
          id: true,
          name: true,
          isMainBranch: true,
          addressLine: true,
          locality: true,
          city: true,
          state: true,
          pincode: true,
          latitude: true,
          longitude: true,
          phone: true,
          email: true,
          operatingHours: true,
          isActive: true,
        },
      },
      services: {
        select: {
          id: true,
          name: true,
          category: true,
          durationMinutes: true,
          basePrice: true,
          isActive: true,
        },
      },
      salesLead: {
        select: {
          id: true,
          ownerName: true,
          stage: true,
          notes: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          bookings: true,
          reviews: true,
          commissionLedgers: true,
          subscriptionInvoices: true,
        },
      },
    },
  });

  if (!provider) {
    throw new NotFoundError("Provider");
  }

  // Fetch recent audit logs for this provider
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      entityType: "PROVIDER",
      entityId: providerId,
    },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      actor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return {
    provider,
    auditLogs,
  };
}

export async function updateVerificationStatus(
  providerId: string,
  input: UpdateVerificationInput,
  actor: AdminActor
) {
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
  });

  if (!provider) {
    throw new NotFoundError("Provider");
  }

  const updateData: Prisma.ProviderUpdateInput = {
    verificationStatus: input.status,
  };

  if (input.licenseType !== undefined) updateData.licenseType = input.licenseType;
  if (input.licenseNumber !== undefined) updateData.licenseNumber = input.licenseNumber;

  const updatedProvider = await prisma.provider.update({
    where: { id: providerId },
    data: updateData,
  });

  await createAuditLog({
    actorId: actor.id,
    actorRole: actor.role,
    action: "KYC_STATUS_UPDATED",
    entityType: "PROVIDER",
    entityId: providerId,
    oldState: {
      verificationStatus: provider.verificationStatus,
      licenseType: provider.licenseType,
      licenseNumber: provider.licenseNumber,
    },
    newState: {
      verificationStatus: updatedProvider.verificationStatus,
      reason: input.reason ?? null,
      licenseType: updatedProvider.licenseType,
      licenseNumber: updatedProvider.licenseNumber,
    },
    ipAddress: actor.ipAddress,
    userAgent: actor.userAgent,
  });

  return {
    success: true,
    message: `Provider ${provider.businessName} verification status updated to ${input.status}.`,
    provider: updatedProvider,
  };
}

// -------------------------------------------------------------
// 3. PLATFORM ANALYTICS SCORECARD
// -------------------------------------------------------------

export async function getPlatformAnalytics() {
  const [
    totalProviders,
    verifiedProviders,
    totalCustomers,
    bookingStats,
    completedBookingsData,
    commissionRevenueData,
    subscriptionRevenueData,
    leadStageGroups,
    categoryGroups,
    branchCities,
  ] = await Promise.all([
    // 1. Total providers
    prisma.provider.count(),
    // 2. Active verified providers
    prisma.provider.count({
      where: { verificationStatus: KYCStatus.VERIFIED },
    }),
    // 3. Total customers
    prisma.user.count({
      where: { role: UserRole.CUSTOMER },
    }),
    // 4. Booking counts by status
    prisma.booking.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    // 5. Completed GMV aggregate
    prisma.booking.aggregate({
      where: { status: BookingStatus.COMPLETED },
      _sum: {
        finalBillAmount: true,
        estimatedBillAmount: true,
      },
    }),
    // 6. Commission Revenue from Ledger
    prisma.commissionLedger.aggregate({
      _sum: {
        commissionPayable: true,
      },
    }),
    // 7. Subscription Revenue from Invoices
    prisma.subscriptionInvoice.aggregate({
      where: { status: "PAID" },
      _sum: {
        amountDue: true,
      },
    }),
    // 8. CRM Leads by Stage
    prisma.salesLead.groupBy({
      by: ["stage"],
      _count: { id: true },
    }),
    // 9. Provider & Booking breakdown by category
    prisma.provider.groupBy({
      by: ["category"],
      _count: { id: true },
    }),
    // 10. Branches by City
    prisma.branch.groupBy({
      by: ["city"],
      _count: { id: true },
    }),
  ]);

  // Aggregate Booking counts
  const bookingCounts: Record<string, number> = {
    REQUESTED: 0,
    ACCEPTED: 0,
    CONFIRMED: 0,
    COMPLETED: 0,
    DECLINED: 0,
    EXPIRED: 0,
    CANCELLED: 0,
    NO_SHOW: 0,
    DISPUTED: 0,
  };

  let totalBookings = 0;
  for (const group of bookingStats) {
    bookingCounts[group.status] = group._count.id;
    totalBookings += group._count.id;
  }

  const completedCount = bookingCounts.COMPLETED || 0;
  const confirmedCount = bookingCounts.CONFIRMED || 0;
  const declinedCount = bookingCounts.DECLINED || 0;

  // Key Ratios
  // Search-to-Book / Completed Conversion %
  const conversionRate =
    totalBookings > 0
      ? Number(((completedCount / totalBookings) * 100).toFixed(1))
      : 0;

  // Acceptance Rate %: (confirmed + completed) / (requested + confirmed + completed + declined)
  const totalDecisions = confirmedCount + completedCount + declinedCount;
  const providerAcceptanceRate =
    totalDecisions > 0
      ? Number((((confirmedCount + completedCount) / totalDecisions) * 100).toFixed(1))
      : 100.0;

  // Gross Merchandise Value (GMV)
  const gmv = Number(
    completedBookingsData._sum.finalBillAmount ??
      completedBookingsData._sum.estimatedBillAmount ??
      0
  );

  const platformCommissionRevenue = Number(
    commissionRevenueData._sum?.commissionPayable ?? 0
  );
  const platformSubscriptionRevenue = Number(
    subscriptionRevenueData._sum?.amountDue ?? 0
  );
  const totalPlatformRevenue =
    platformCommissionRevenue + platformSubscriptionRevenue;

  // Revenue per Provider (ARPU)
  const revenuePerProvider =
    verifiedProviders > 0
      ? Number((totalPlatformRevenue / verifiedProviders).toFixed(2))
      : 0;

  // CRM Pipeline Stats
  const crmLeadStats: Record<string, number> = {
    LEAD_01: 0,
    DISCUSS_02: 0,
    VERIFY_03: 0,
    ACTIVATE_04: 0,
    CONFIGURE_05: 0,
    GO_LIVE_06: 0,
  };
  let totalLeads = 0;
  for (const group of leadStageGroups) {
    crmLeadStats[group.stage] = group._count.id;
    totalLeads += group._count.id;
  }

  // Category breakdown
  const categoryMatrix = categoryGroups.map((g) => ({
    category: g.category,
    providerCount: g._count.id,
  }));

  // City breakdown
  const cityMatrix = branchCities.map((b) => ({
    city: b.city,
    branchCount: b._count.id,
  }));

  return {
    marketplaceScorecard: {
      activeVerifiedProviders: verifiedProviders,
      totalProviders,
      totalCustomers,
      totalBookings,
      completedBookings: completedCount,
      requestedBookings: bookingCounts.REQUESTED || 0,
      confirmedBookings: confirmedCount,
      declinedBookings: declinedCount,
      cancelledBookings: bookingCounts.CANCELLED || 0,
      disputedBookings: bookingCounts.DISPUTED || 0,
      searchToBookConversion: conversionRate,
      providerAcceptanceRate,
      grossMerchandiseValue: gmv,
      platformCommissionRevenue,
      platformSubscriptionRevenue,
      totalPlatformRevenue,
      revenuePerProvider,
    },
    bookingBreakdown: bookingCounts,
    crmLeadStats: {
      totalLeads,
      byStage: crmLeadStats,
    },
    categoryMatrix,
    cityMatrix,
  };
}

// -------------------------------------------------------------
// 4. PLATFORM CONTROLS & AUDIT LOGS
// -------------------------------------------------------------

export async function getPlatformAuditLogs(filters: {
  page?: number;
  limit?: number;
  actorRole?: string;
  entityType?: string;
  action?: string;
  search?: string;
}) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 25));
  const skip = (page - 1) * limit;

  const where: Prisma.AuditLogWhereInput = {};

  if (filters.actorRole) {
    where.actorRole = filters.actorRole;
  }
  if (filters.entityType) {
    where.entityType = filters.entityType;
  }
  if (filters.action) {
    where.action = filters.action;
  }
  if (filters.search) {
    const q = filters.search.trim();
    where.OR = [
      { action: { contains: q, mode: "insensitive" } },
      { entityId: { contains: q } },
      { actor: { email: { contains: q, mode: "insensitive" } } },
      { actor: { firstName: { contains: q, mode: "insensitive" } } },
      { actor: { lastName: { contains: q, mode: "insensitive" } } },
    ];
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        actor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
