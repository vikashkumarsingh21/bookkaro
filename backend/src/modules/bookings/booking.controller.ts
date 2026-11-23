import { Request, Response, NextFunction } from 'express';
import { bookingService } from './booking.service';
import {
  createBookingSchema,
  cancelBookingSchema,
  disputeBookingSchema,
  refundRequestSchema,
  createReviewSchema,
  declineBookingSchema,
  completeBookingSchema,
  myBookingsQuerySchema,
  partnerBookingsQuerySchema,
} from './booking.validation';

export class BookingController {
  // ===========================================================================
  // CUSTOMER CONTROLLERS
  // ===========================================================================

  async createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedInput = createBookingSchema.parse(req.body);
      const booking = await bookingService.createBooking(req.user!.id, validatedInput);

      res.status(201).json({
        success: true,
        message: 'Booking request created successfully. Awaiting merchant confirmation.',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, page, limit } = myBookingsQuerySchema.parse(req.query);
      const result = await bookingService.getMyBookings(req.user!.id, status, page, limit);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = cancelBookingSchema.parse(req.body);
      const updated = await bookingService.cancelBooking(req.user!.id, id, reason);

      res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async raiseDispute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { reason, details } = disputeBookingSchema.parse(req.body);
      const updated = await bookingService.raiseDispute(req.user!.id, id, reason, details);

      res.status(200).json({
        success: true,
        message: 'Dispute submitted. BOOKKARO Patna customer grievance officer will contact you within 24 hours.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async requestRefund(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { reason, refundAccountDetails } = refundRequestSchema.parse(req.body);
      const updated = await bookingService.requestRefund(req.user!.id, id, reason, refundAccountDetails);

      res.status(200).json({
        success: true,
        message: 'Refund claim submitted. Under statutory review by Patna Escrow Desk.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitVerifiedReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedInput = createReviewSchema.parse(req.body);
      const review = await bookingService.submitVerifiedReview(req.user!.id, id, validatedInput);

      res.status(201).json({
        success: true,
        message: 'Thank you! Your verified visit review has been published.',
        data: review,
      });
    } catch (error) {
      next(error);
    }
  }

  // ===========================================================================
  // PARTNER CONTROLLERS
  // ===========================================================================

  async getPartnerBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, date, page, limit } = partnerBookingsQuerySchema.parse(req.query);
      const result = await bookingService.getPartnerBookings(req.user!.id, status, date, page, limit);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async acceptBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updated = await bookingService.acceptBooking(req.user!.id, id);

      res.status(200).json({
        success: true,
        message: 'Reservation accepted and confirmed.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async declineBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = declineBookingSchema.parse(req.body);
      const updated = await bookingService.declineBooking(req.user!.id, id, reason);

      res.status(200).json({
        success: true,
        message: 'Reservation declined.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async completeBookingWithPin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { venuePin, finalBillInr } = completeBookingSchema.parse(req.body);
      const updated = await bookingService.completeBookingWithPin(req.user!.id, id, venuePin, finalBillInr);

      res.status(200).json({
        success: true,
        message: 'Venue PIN verified. Visit completed and commission ledger updated.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async markNoShow(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updated = await bookingService.markNoShow(req.user!.id, id);

      res.status(200).json({
        success: true,
        message: 'Booking marked as No-Show.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const bookingController = new BookingController();
