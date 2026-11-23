import {
  BookingStatus,
  UserRole,
  PaymentStatus,
  LedgerStatus,
  CommercialModel,
  ProviderCategory,
} from "@prisma/client";
import prisma from "@/lib/prisma";
import {
  CreateBookingInput,
  UpdateBookingStatusInput,
  CreateBookingReviewInput,
  healthcareBookingInputsSchema,
  hotelBookingInputsSchema,
  restaurantBookingInputsSchema,
  salonBookingInputsSchema,
  vehicleCareBookingInputsSchema,
} from "@/lib/booking/schemas";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from "@/lib/errors";
import { AuthenticatedUser } from "@/lib/auth/rbac";
import { NotificationService } from "@/services/notifications";

/**
 * Validates category inputs against strict vertical schemas.
 */
function validateCategoryInputs(category: ProviderCategory, inputs: unknown): Record<string, unknown> {
  switch (category) {
    case ProviderCategory.HEALTHCARE:
      return healthcareBookingInputsSchema.parse(inputs) as Record<string, unknown>;
    case ProviderCategory.HOTELS:
      return hotelBookingInputsSchema.parse(inputs) as Record<string, unknown>;
    case ProviderCategory.RESTAURANTS:
      return restaurantBookingInputsSchema.parse(inputs) as Record<string, unknown>;
    case ProviderCategory.SALON:
      return salonBookingInputsSchema.parse(inputs) as Record<string, unknown>;
    case ProviderCategory.VEHICLE_CARE:
      return vehicleCareBookingInputsSchema.parse(inputs) as Record<string, unknown>;
    default:
      return inputs as Record<string, unknown>;
  }
}

/**
 * Generates unique booking code (e.g. BK-2026-8492) and 4-digit verification code.
 */
function generateBookingCodes(): { bookingCode: string; verificationCode: string } {
  const year = new Date().getFullYear();
  const random4 = Math.floor(1000 + Math.random() * 9000);
  const bookingCode = `BK-${year}-${random4}`;
  const verificationCode = String(random4);
  return { bookingCode, verificationCode };
}

// -------------------------------------------------------------
// 1. Create Booking (Customer)
// -------------------------------------------------------------

export async function createBooking(
  customer: AuthenticatedUser,
  input: CreateBookingInput
) {
  // Validate category inputs
  const validatedInputs = validateCategoryInputs(input.category, input.categoryInputs);

  // Validate Provider & Branch existence
  const provider = await prisma.provider.findUnique({
    where: { id: input.providerId },
    select: { id: true, businessName: true, verificationStatus: true },
  });

  if (!provider) {
    throw new NotFoundError("Provider");
  }

  const branch = await prisma.branch.findFirst({
    where: { id: input.branchId, providerId: input.providerId, isActive: true },
  });

  if (!branch) {
    throw new NotFoundError("Branch");
  }

  const service = await prisma.service.findFirst({
    where: { id: input.serviceId, providerId: input.providerId, isActive: true },
  });

  if (!service) {
    throw new NotFoundError("Service");
  }

  const { bookingCode, verificationCode } = generateBookingCodes();
  const bookingDateParsed = new Date(input.bookingDate);

  // Status MUST start strictly as REQUESTED
  const booking = await prisma.$transaction(async (tx) => {
    const newBooking = await tx.booking.create({
      data: {
        bookingCode,
        verificationCode,
        status: BookingStatus.REQUESTED,
        customerId: customer.id,
        providerId: provider.id,
        branchId: branch.id,
        serviceId: service.id,
        bookingDate: bookingDateParsed,
        timeSlot: input.timeSlot,
        categoryInputs: JSON.parse(JSON.stringify(validatedInputs)),
        estimatedBillAmount: input.estimatedBillAmount,
        tokenAmountPaid: input.tokenAmountPaid || 0,
        paymentStatus:
          input.tokenAmountPaid && input.tokenAmountPaid > 0
            ? PaymentStatus.PARTIAL_TOKEN
            : PaymentStatus.PENDING,
      },
      include: {
        provider: {
          select: {
            id: true,
            providerCode: true,
            businessName: true,
            category: true,
            contactPhone: true,
            contactEmail: true,
            cancellationPolicy: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            locality: true,
            city: true,
            addressLine: true,
            phone: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            durationMinutes: true,
            basePrice: true,
          },
        },
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: customer.id,
        actorRole: customer.role,
        action: "BOOKING_REQUESTED",
        entityType: "BOOKING",
        entityId: newBooking.id,
        newState: {
          bookingCode: newBooking.bookingCode,
          providerId: provider.id,
          date: input.bookingDate,
          slot: input.timeSlot,
        },
      },
    });

    return newBooking;
  });

  // Asynchronously dispatch booking requested notification
  NotificationService.notifyBookingRequested({
    bookingId: booking.id,
    bookingCode: booking.bookingCode,
    customerName: `${customer.firstName} ${customer.lastName}`,
    customerEmail: customer.email,
    customerPhone: customer.phone,
    providerName: booking.provider.businessName,
    providerEmail: booking.provider.contactEmail || "care@bookkaro.in",
    providerPhone: booking.provider.contactPhone,
    serviceName: booking.service.name,
    bookingDate: input.bookingDate,
    timeSlot: input.timeSlot,
  }).catch((err) => console.warn("[NotificationDispatchError]", err));

  return booking;
}

// -------------------------------------------------------------
// 2. Get Customer Bookings (with Tab Filtering)
// -------------------------------------------------------------

export async function getCustomerBookings(
  customerId: string,
  tab?: "active" | "upcoming" | "completed" | "cancelled" | "all"
) {
  let statusFilter: BookingStatus[] | undefined;

  switch (tab) {
    case "active":
      statusFilter = [BookingStatus.REQUESTED, BookingStatus.ACCEPTED];
      break;
    case "upcoming":
      statusFilter = [BookingStatus.CONFIRMED];
      break;
    case "completed":
      statusFilter = [BookingStatus.COMPLETED];
      break;
    case "cancelled":
      statusFilter = [
        BookingStatus.DECLINED,
        BookingStatus.CANCELLED,
        BookingStatus.EXPIRED,
        BookingStatus.NO_SHOW,
        BookingStatus.DISPUTED,
      ];
      break;
    case "all":
    default:
      statusFilter = undefined;
      break;
  }

  const bookings = await prisma.booking.findMany({
    where: {
      customerId,
      ...(statusFilter ? { status: { in: statusFilter } } : {}),
    },
    include: {
      provider: {
        select: {
          id: true,
          providerCode: true,
          businessName: true,
          category: true,
          rating: true,
          contactPhone: true,
          cancellationPolicy: true,
        },
      },
      branch: {
        select: {
          id: true,
          name: true,
          locality: true,
          city: true,
          addressLine: true,
          phone: true,
          latitude: true,
          longitude: true,
        },
      },
      service: {
        select: {
          id: true,
          name: true,
          durationMinutes: true,
          basePrice: true,
          categoryMetadata: true,
        },
      },
      review: {
        select: {
          id: true,
          rating: true,
          reviewText: true,
          isVerifiedBooking: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return bookings.map((b) => ({
    ...b,
    tokenAmountPaid: Number(b.tokenAmountPaid),
    estimatedBillAmount: Number(b.estimatedBillAmount),
    finalBillAmount: b.finalBillAmount ? Number(b.finalBillAmount) : null,
    provider: {
      ...b.provider,
      rating: Number(b.provider.rating),
    },
    service: {
      ...b.service,
      basePrice: Number(b.service.basePrice),
    },
  }));
}

// -------------------------------------------------------------
// 3. Update Booking Status (State Machine Guard)
// -------------------------------------------------------------

export async function updateBookingStatus(
  bookingId: string,
  user: AuthenticatedUser,
  input: UpdateBookingStatusInput
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      provider: {
        select: {
          id: true,
          ownerId: true,
          commercialModel: true,
          commissionRate: true,
        },
      },
    },
  });

  if (!booking) {
    throw new NotFoundError("Booking");
  }

  const currentStatus = booking.status;
  const newStatus = input.status;

  // Role Permissions Verification
  const isCustomer = user.id === booking.customerId;
  const isProviderOwner = user.id === booking.provider.ownerId;
  const isProviderStaff = user.providerId === booking.providerId;
  const isMerchant = isProviderOwner || isProviderStaff;
  const isAdmin = user.role === UserRole.ADMIN;

  if (!isCustomer && !isMerchant && !isAdmin) {
    throw new ForbiddenError("You do not have permission to manage this booking.");
  }

  // State Machine Transition Rules
  if (currentStatus === newStatus) {
    return booking;
  }

  // Customer permitted actions: CANCELLED or DISPUTED
  if (isCustomer && !isAdmin && !isMerchant) {
    if (newStatus === BookingStatus.CANCELLED) {
      if (
        currentStatus !== BookingStatus.REQUESTED &&
        currentStatus !== BookingStatus.ACCEPTED &&
        currentStatus !== BookingStatus.CONFIRMED
      ) {
        throw new BadRequestError(`Cannot cancel booking in status '${currentStatus}'`);
      }
    } else if (newStatus === BookingStatus.DISPUTED) {
      if (currentStatus !== BookingStatus.COMPLETED && currentStatus !== BookingStatus.CONFIRMED) {
        throw new BadRequestError(`Disputes can only be raised for confirmed or completed bookings`);
      }
    } else {
      throw new ForbiddenError(`Customers cannot set status to '${newStatus}'`);
    }
  }

  // Merchant permitted actions: ACCEPTED, CONFIRMED, DECLINED, COMPLETED, NO_SHOW, CANCELLED
  if (isMerchant && !isAdmin) {
    if (
      newStatus === BookingStatus.ACCEPTED ||
      newStatus === BookingStatus.CONFIRMED ||
      newStatus === BookingStatus.DECLINED
    ) {
      if (currentStatus !== BookingStatus.REQUESTED && currentStatus !== BookingStatus.ACCEPTED) {
        throw new BadRequestError(
          `Cannot transition booking from '${currentStatus}' to '${newStatus}'`
        );
      }
    } else if (newStatus === BookingStatus.COMPLETED) {
      if (currentStatus !== BookingStatus.CONFIRMED && currentStatus !== BookingStatus.ACCEPTED) {
        throw new BadRequestError(
          `Booking must be CONFIRMED before it can be marked COMPLETED. Current: ${currentStatus}`
        );
      }
      if (!input.finalBillValue && !booking.finalBillAmount && !booking.estimatedBillAmount) {
        throw new BadRequestError("Final bill value is required to complete this booking.");
      }
    } else if (newStatus === BookingStatus.NO_SHOW) {
      if (currentStatus !== BookingStatus.CONFIRMED && currentStatus !== BookingStatus.ACCEPTED) {
        throw new BadRequestError(`Only confirmed bookings can be marked as NO_SHOW`);
      }
    }
  }

  // Atomic Execution in Database Transaction
  const updatedBooking = await prisma.$transaction(async (tx) => {
    // Overbooking prevention check when transitioning to CONFIRMED
    if (newStatus === BookingStatus.CONFIRMED) {
      const existingConfirmedCount = await tx.booking.count({
        where: {
          branchId: booking.branchId,
          bookingDate: booking.bookingDate,
          timeSlot: booking.timeSlot,
          status: BookingStatus.CONFIRMED,
          id: { not: booking.id },
        },
      });

      // Concurrency threshold (example: 10 concurrent slots per branch timeSlot)
      if (existingConfirmedCount >= 10) {
        throw new ConflictError(
          `Time slot '${booking.timeSlot}' on ${booking.bookingDate.toISOString().slice(0, 10)} is fully booked.`
        );
      }
    }

    const finalBillValue = input.finalBillValue || Number(booking.estimatedBillAmount);

    const updatePayload: Record<string, unknown> = {
      status: newStatus,
    };

    if (newStatus === BookingStatus.ACCEPTED) {
      updatePayload.acceptedAt = new Date();
    } else if (newStatus === BookingStatus.CONFIRMED) {
      updatePayload.confirmedAt = new Date();
      if (!booking.acceptedAt) updatePayload.acceptedAt = new Date();
    } else if (newStatus === BookingStatus.COMPLETED) {
      updatePayload.completedAt = new Date();
      updatePayload.finalBillAmount = finalBillValue;
      updatePayload.paymentStatus = PaymentStatus.PAID_OFFLINE;
    } else if (newStatus === BookingStatus.DECLINED) {
      updatePayload.declineReason = input.reason || "Provider unavailable";
    } else if (newStatus === BookingStatus.CANCELLED) {
      updatePayload.cancelledAt = new Date();
      updatePayload.cancellationReason = input.reason || "User requested cancellation";
    } else if (newStatus === BookingStatus.NO_SHOW) {
      updatePayload.noShowLoggedAt = new Date();
    } else if (newStatus === BookingStatus.DISPUTED) {
      updatePayload.disputeStatus = "OPEN";
      updatePayload.disputeReason = input.disputeReason || input.reason || "Customer dispute";
      updatePayload.disputeRaisedAt = new Date();
    }

    const res = await tx.booking.update({
      where: { id: bookingId },
      data: updatePayload,
      include: {
        provider: true,
        branch: true,
        service: true,
        customer: true,
      },
    });

    // If marked COMPLETED and provider is on COMMISSION model, update/create CommissionLedger entry!
    if (newStatus === BookingStatus.COMPLETED && booking.provider.commercialModel === CommercialModel.COMMISSION) {
      const commissionRate = Number(booking.provider.commissionRate) || 8.0;
      const commissionPayable = (finalBillValue * commissionRate) / 100;

      await tx.commissionLedger.upsert({
        where: { bookingId: booking.id },
        update: {
          finalBillValue,
          commissionRatePercent: commissionRate,
          commissionPayable,
          serviceCompletedAt: new Date(),
          status: LedgerStatus.PENDING_INVOICE,
        },
        create: {
          bookingId: booking.id,
          providerId: booking.providerId,
          finalBillValue,
          commissionRatePercent: commissionRate,
          commissionPayable,
          serviceCompletedAt: new Date(),
          status: LedgerStatus.PENDING_INVOICE,
        },
      });
    }

    // Platform Audit Log
    await tx.auditLog.create({
      data: {
        actorId: user.id,
        actorRole: user.role,
        action: `BOOKING_STATUS_${newStatus}`,
        entityType: "BOOKING",
        entityId: booking.id,
        oldState: { status: currentStatus },
        newState: { status: newStatus, reason: input.reason, finalBillValue },
      },
    });

    return res;
  });

  // Asynchronously dispatch notifications on status changes
  if (newStatus === BookingStatus.CONFIRMED) {
    NotificationService.notifyBookingConfirmed({
      bookingId: updatedBooking.id,
      bookingCode: updatedBooking.bookingCode,
      verificationCode: updatedBooking.verificationCode || "0000",
      customerName: `${updatedBooking.customer.firstName} ${updatedBooking.customer.lastName}`,
      customerEmail: updatedBooking.customer.email,
      customerPhone: updatedBooking.customer.phone,
      providerName: updatedBooking.provider.businessName,
      serviceName: updatedBooking.service.name,
      bookingDate: updatedBooking.bookingDate.toISOString().slice(0, 10),
      timeSlot: updatedBooking.timeSlot,
      venueAddress: `${updatedBooking.branch.addressLine}, ${updatedBooking.branch.locality}, ${updatedBooking.branch.city}`,
    }).catch((err) => console.warn("[NotificationDispatchError]", err));
  } else if (newStatus === BookingStatus.DECLINED) {
    NotificationService.notifyBookingDeclined({
      bookingId: updatedBooking.id,
      bookingCode: updatedBooking.bookingCode,
      customerName: `${updatedBooking.customer.firstName} ${updatedBooking.customer.lastName}`,
      customerEmail: updatedBooking.customer.email,
      customerPhone: updatedBooking.customer.phone,
      providerName: updatedBooking.provider.businessName,
      reason: updatedBooking.declineReason || "Slot unavailable",
    }).catch((err) => console.warn("[NotificationDispatchError]", err));
  }

  return updatedBooking;
}

// -------------------------------------------------------------
// 4. Create Booking Review (Strictly for COMPLETED Bookings)
// -------------------------------------------------------------

export async function createBookingReview(
  bookingId: string,
  customer: AuthenticatedUser,
  input: CreateBookingReviewInput
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      review: true,
      provider: true,
    },
  });

  if (!booking) {
    throw new NotFoundError("Booking");
  }

  // 1. Ownership Check
  if (booking.customerId !== customer.id && customer.role !== UserRole.ADMIN) {
    throw new ForbiddenError("You can only submit reviews for your own bookings.");
  }

  // 2. Strict Status Check: ONLY COMPLETED bookings can be reviewed
  if (booking.status !== BookingStatus.COMPLETED) {
    throw new BadRequestError(
      `Reviews can only be submitted for COMPLETED bookings. Current booking status is '${booking.status}'.`
    );
  }

  // 3. Duplicate Check: Exactly 1 review per completed booking
  if (booking.review) {
    throw new ConflictError("A verified review has already been submitted for this booking.");
  }

  // 4. Atomic Review Creation & Aggregate Rating Recomputation
  const review = await prisma.$transaction(async (tx) => {
    const newReview = await tx.review.create({
      data: {
        bookingId: booking.id,
        customerId: customer.id,
        providerId: booking.providerId,
        rating: input.rating,
        reviewText: input.reviewText,
        isVerifiedBooking: true, // Automatically verified by booking completion
      },
    });

    // Recompute provider's average rating and reviewCount
    const aggregate = await tx.review.aggregate({
      where: { providerId: booking.providerId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const newRating = aggregate._avg.rating ? Math.round(aggregate._avg.rating * 10) / 10 : input.rating;
    const newCount = aggregate._count.rating || 1;

    await tx.provider.update({
      where: { id: booking.providerId },
      data: {
        rating: newRating,
        reviewCount: newCount,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: customer.id,
        actorRole: customer.role,
        action: "REVIEW_SUBMITTED",
        entityType: "REVIEW",
        entityId: newReview.id,
        newState: {
          bookingId: booking.id,
          rating: input.rating,
          newProviderRating: newRating,
        },
      },
    });

    return newReview;
  });

  return review;
}
