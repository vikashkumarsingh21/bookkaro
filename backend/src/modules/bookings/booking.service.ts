import crypto from 'crypto';
import prisma from '../../config/db';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from '../../utils/errors';
import { isValidBookingTransition } from './booking.stateMachine';
import {
  CreateBookingInput,
  CreateReviewInput,
  hotelDetailsSchema,
  restaurantDetailsSchema,
  salonDetailsSchema,
} from './booking.validation';
import { BookingStatus, Prisma } from '@prisma/client';

export class BookingService {
  /**
   * Helper: Generate unique BOOKKARO reservation code: BK-PAT-XXXX
   */
  private async generateUniqueBookingCode(): Promise<string> {
    for (let attempts = 0; attempts < 10; attempts++) {
      const randomSuffix = crypto.randomInt(1000, 9999).toString();
      const code = `BK-PAT-${randomSuffix}`;

      const existing = await prisma.booking.findUnique({
        where: { bookingCode: code },
        select: { id: true },
      });

      if (!existing) {
        return code;
      }
    }
    // Fallback if collision rate is high
    return `BK-PAT-${Date.now().toString().slice(-4)}`;
  }

  /**
   * Helper: Generate 4-digit cryptographic venue PIN
   */
  private generateVenuePin(): string {
    return crypto.randomInt(1000, 10000).toString();
  }

  /**
   * Helper: Get partner provider for authenticated user
   */
  private async getPartnerProvider(userId: string) {
    const provider = await prisma.provider.findFirst({
      where: { ownerId: userId, status: 'ACTIVE' },
    });

    if (!provider) {
      throw new ForbiddenError(
        'Access denied. No active partner merchant associated with your account in Patna.'
      );
    }

    return provider;
  }

  // ===========================================================================
  // CUSTOMER ACTIONS
  // ===========================================================================

  /**
   * Create a new booking request strictly in 'REQUESTED' status
   */
  async createBooking(customerId: string, input: CreateBookingInput) {
    const { providerId, category, slotDate, slotTime, estimatedAmountInr, categoryDetails, customerNotes } = input;

    // 1. Verify category-specific details with Zod
    if (category === 'hotels') {
      hotelDetailsSchema.parse(categoryDetails);
    } else if (category === 'restaurants') {
      restaurantDetailsSchema.parse(categoryDetails);
    } else if (category === 'salon') {
      salonDetailsSchema.parse(categoryDetails);
    }

    // 2. Verify provider is active
    const provider = await prisma.provider.findFirst({
      where: { id: providerId, status: 'ACTIVE' },
    });

    if (!provider) {
      throw new NotFoundError('Selected Patna provider is not currently active or accepting bookings.');
    }

    // 3. Generate bookingCode and 4-digit venuePin
    const bookingCode = await this.generateUniqueBookingCode();
    const venuePin = this.generateVenuePin();

    // 4. Create booking record
    const booking = await prisma.booking.create({
      data: {
        bookingCode,
        venuePin,
        customerId,
        providerId: provider.id,
        category,
        slotDate,
        slotTime,
        categoryDetails: {
          ...categoryDetails,
          ...(customerNotes ? { customerNotes } : {}),
        } as Prisma.InputJsonValue,
        estimatedAmountInr,
        status: BookingStatus.REQUESTED,
        paymentStatus: 'UNPAID',
      },
      include: {
        provider: {
          select: {
            id: true,
            providerCode: true,
            brandName: true,
            locality: true,
            address: true,
            category: true,
            photos: true,
          },
        },
      },
    });

    return booking;
  }

  /**
   * Get paginated bookings for customer
   */
  async getMyBookings(customerId: string, status?: BookingStatus, page = 1, limit = 20) {
    const where: Prisma.BookingWhereInput = { customerId };

    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          provider: {
            select: {
              id: true,
              providerCode: true,
              brandName: true,
              locality: true,
              address: true,
              category: true,
              photos: true,
            },
          },
          review: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Cancel booking (Customer)
   */
  async cancelBooking(customerId: string, bookingId: string, reason?: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundError('Booking record not found.');
    }

    // IDOR Protection
    if (booking.customerId !== customerId) {
      throw new ForbiddenError('You do not have permission to modify this booking.');
    }

    if (!isValidBookingTransition(booking.status, BookingStatus.CANCELLED)) {
      throw new BadRequestError(
        `Cannot cancel booking in '${booking.status}' status. Cancellation only permitted for REQUESTED, ACCEPTED, or CONFIRMED bookings.`
      );
    }

    const existingDetails = typeof booking.categoryDetails === 'object' && booking.categoryDetails !== null
      ? (booking.categoryDetails as Record<string, unknown>)
      : {};

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
        categoryDetails: {
          ...existingDetails,
          cancellationReason: reason || 'Cancelled by guest',
          cancelledAt: new Date().toISOString(),
        } as Prisma.InputJsonValue,
      },
      include: { provider: true },
    });

    return updated;
  }

  /**
   * Raise Dispute (Customer)
   */
  async raiseDispute(customerId: string, bookingId: string, reason: string, details?: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundError('Booking record not found.');
    }

    // IDOR Protection
    if (booking.customerId !== customerId) {
      throw new ForbiddenError('You do not have permission to dispute this booking.');
    }

    if (!isValidBookingTransition(booking.status, BookingStatus.DISPUTED)) {
      throw new BadRequestError(
        `Cannot dispute booking in '${booking.status}' status. Allowed on CONFIRMED, COMPLETED, CANCELLED, or NO_SHOW bookings.`
      );
    }

    const existingDetails = typeof booking.categoryDetails === 'object' && booking.categoryDetails !== null
      ? (booking.categoryDetails as Record<string, unknown>)
      : {};

    // Execute in transaction: update booking & log statutory audit record
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.DISPUTED,
          categoryDetails: {
            ...existingDetails,
            disputeReason: reason,
            disputeDetails: details || '',
            disputedAt: new Date().toISOString(),
          } as Prisma.InputJsonValue,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: customerId,
          actorRole: 'CUSTOMER',
          actionType: 'BOOKING_DISPUTE_RAISED',
          targetId: booking.id,
          summary: `Dispute raised on booking ${booking.bookingCode}: ${reason}`,
          metadata: { reason, details },
        },
      });

      return updated;
    });

    return result;
  }

  /**
   * Request Refund (Customer)
   */
  async requestRefund(customerId: string, bookingId: string, reason: string, refundAccountDetails: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundError('Booking record not found.');
    }

    // IDOR Protection
    if (booking.customerId !== customerId) {
      throw new ForbiddenError('You do not have permission to request a refund for this booking.');
    }

    if (!isValidBookingTransition(booking.status, BookingStatus.REFUND_REQUESTED)) {
      throw new BadRequestError(
        `Cannot request refund for booking in '${booking.status}' status. Permitted only for CANCELLED or DISPUTED bookings.`
      );
    }

    const existingDetails = typeof booking.categoryDetails === 'object' && booking.categoryDetails !== null
      ? (booking.categoryDetails as Record<string, unknown>)
      : {};

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.REFUND_REQUESTED,
          categoryDetails: {
            ...existingDetails,
            refundReason: reason,
            refundAccountDetails,
            refundRequestedAt: new Date().toISOString(),
          } as Prisma.InputJsonValue,
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: customerId,
          actorRole: 'CUSTOMER',
          actionType: 'REFUND_REQUESTED',
          targetId: booking.id,
          summary: `Refund requested for ${booking.bookingCode} (Amount: ₹${booking.estimatedAmountInr})`,
          metadata: { reason, refundAccountDetails },
        },
      });

      return updated;
    });

    return result;
  }

  /**
   * Submit Verified Review (Customer) - Strictly on COMPLETED bookings
   */
  async submitVerifiedReview(customerId: string, bookingId: string, input: CreateReviewInput) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { review: true },
    });

    if (!booking) {
      throw new NotFoundError('Booking record not found.');
    }

    // IDOR Protection
    if (booking.customerId !== customerId) {
      throw new ForbiddenError('You do not have permission to review this booking.');
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestError(
        `Reviews can strictly only be submitted for COMPLETED bookings. Current status: '${booking.status}'.`
      );
    }

    if (booking.review) {
      throw new ConflictError('A verified review has already been submitted for this booking.');
    }

    // Atomic transaction: Create review and re-compute provider rating & reviewCount
    const result = await prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          bookingId: booking.id,
          providerId: booking.providerId,
          customerId,
          rating: input.rating,
          comment: input.comment,
          tags: input.tags,
        },
      });

      // Recalculate provider aggregate rating
      const aggregate = await tx.review.aggregate({
        where: { providerId: booking.providerId },
        _avg: { rating: true },
        _count: { id: true },
      });

      const avgRating = aggregate._avg.rating
        ? Number(aggregate._avg.rating.toFixed(1))
        : input.rating;

      await tx.provider.update({
        where: { id: booking.providerId },
        data: {
          rating: avgRating,
          reviewCount: aggregate._count.id,
        },
      });

      return review;
    });

    return result;
  }

  // ===========================================================================
  // PARTNER ACTIONS
  // ===========================================================================

  /**
   * Get partner provider booking queue
   */
  async getPartnerBookings(userId: string, status?: BookingStatus, date?: string, page = 1, limit = 20) {
    const provider = await this.getPartnerProvider(userId);

    const where: Prisma.BookingWhereInput = {
      providerId: provider.id,
    };

    if (status) {
      where.status = status;
    }

    if (date) {
      where.slotDate = date;
    }

    const [items, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              email: true,
            },
          },
          review: true,
          commissionLedger: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      provider: {
        id: provider.id,
        brandName: provider.brandName,
        category: provider.category,
      },
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Accept booking request (Partner)
   */
  async acceptBooking(userId: string, bookingId: string) {
    const provider = await this.getPartnerProvider(userId);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundError('Booking record not found.');
    }

    // IDOR Protection: Must belong to partner's provider
    if (booking.providerId !== provider.id) {
      throw new ForbiddenError('This booking does not belong to your managed venue.');
    }

    if (!isValidBookingTransition(booking.status, BookingStatus.CONFIRMED)) {
      throw new BadRequestError(
        `Cannot accept booking in '${booking.status}' status. Only REQUESTED bookings can be confirmed.`
      );
    }

    // Transaction-locking inventory check & transition to CONFIRMED
    const updated = await prisma.$transaction(async (tx) => {
      // Check for slot double-booking limit for the same provider, date and time
      const confirmedConflictCount = await tx.booking.count({
        where: {
          providerId: provider.id,
          slotDate: booking.slotDate,
          slotTime: booking.slotTime,
          status: BookingStatus.CONFIRMED,
        },
      });

      // Reasonable per-slot cap to prevent double booking (e.g. 10 simultaneous reservations per slot)
      if (confirmedConflictCount >= 10) {
        throw new ConflictError(
          `Capacity limit reached for slot ${booking.slotDate} at ${booking.slotTime}. Cannot accept more reservations.`
        );
      }

      return tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CONFIRMED,
        },
        include: {
          customer: {
            select: { id: true, fullName: true, phone: true },
          },
        },
      });
    });

    return updated;
  }

  /**
   * Decline booking request (Partner)
   */
  async declineBooking(userId: string, bookingId: string, reason: string) {
    const provider = await this.getPartnerProvider(userId);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundError('Booking record not found.');
    }

    if (booking.providerId !== provider.id) {
      throw new ForbiddenError('This booking does not belong to your managed venue.');
    }

    if (!isValidBookingTransition(booking.status, BookingStatus.DECLINED)) {
      throw new BadRequestError(
        `Cannot decline booking in '${booking.status}' status. Allowed only on REQUESTED or ACCEPTED bookings.`
      );
    }

    const existingDetails = typeof booking.categoryDetails === 'object' && booking.categoryDetails !== null
      ? (booking.categoryDetails as Record<string, unknown>)
      : {};

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.DECLINED,
        categoryDetails: {
          ...existingDetails,
          declineReason: reason,
          declinedAt: new Date().toISOString(),
        } as Prisma.InputJsonValue,
      },
    });

    return updated;
  }

  /**
   * Complete booking via 4-Digit Venue PIN & update Commission Ledger (Partner)
   */
  async completeBookingWithPin(userId: string, bookingId: string, venuePin: string, finalBillInr?: number) {
    const provider = await this.getPartnerProvider(userId);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { provider: true },
    });

    if (!booking) {
      throw new NotFoundError('Booking record not found.');
    }

    if (booking.providerId !== provider.id) {
      throw new ForbiddenError('This booking does not belong to your managed venue.');
    }

    // 1. PIN Verification
    if (booking.venuePin !== venuePin) {
      throw new BadRequestError(
        'Invalid 4-digit venue PIN provided by guest. Check the client receipt.',
        'INVALID_VENUE_PIN'
      );
    }

    if (!isValidBookingTransition(booking.status, BookingStatus.COMPLETED)) {
      throw new BadRequestError(
        `Cannot complete booking in '${booking.status}' status. Only CONFIRMED bookings can be completed.`
      );
    }

    const actualBill = finalBillInr !== undefined && finalBillInr > 0
      ? finalBillInr
      : Number(booking.estimatedAmountInr);

    // 2. Transaction: Mark COMPLETED + calculate immutable CommissionLedger
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.COMPLETED,
          finalBillInr: actualBill,
          paymentStatus: 'PAID',
        },
      });

      // Insert commission ledger if commercialModel is COMMISSION
      if (booking.provider.commercialModel === 'COMMISSION') {
        const commRate = booking.provider.commissionRate;
        const commAmount = (actualBill * commRate) / 100;
        const netPayout = actualBill - commAmount;

        await tx.commissionLedger.upsert({
          where: { bookingId: booking.id },
          update: {
            finalBillInr: actualBill,
            commissionRate: commRate,
            commissionAmountInr: commAmount,
            netPayoutInr: netPayout,
          },
          create: {
            bookingId: booking.id,
            providerId: booking.providerId,
            finalBillInr: actualBill,
            commissionRate: commRate,
            commissionAmountInr: commAmount,
            netPayoutInr: netPayout,
            status: 'PENDING',
          },
        });
      }

      return updated;
    });

    return result;
  }

  /**
   * Mark Booking as NO_SHOW (Partner)
   */
  async markNoShow(userId: string, bookingId: string) {
    const provider = await this.getPartnerProvider(userId);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundError('Booking record not found.');
    }

    if (booking.providerId !== provider.id) {
      throw new ForbiddenError('This booking does not belong to your managed venue.');
    }

    if (!isValidBookingTransition(booking.status, BookingStatus.NO_SHOW)) {
      throw new BadRequestError(
        `Cannot mark booking as NO_SHOW in '${booking.status}' status. Only CONFIRMED bookings can be marked as NO_SHOW.`
      );
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.NO_SHOW,
      },
    });

    return updated;
  }
}

export const bookingService = new BookingService();
