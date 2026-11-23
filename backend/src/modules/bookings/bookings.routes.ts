import { Router } from 'express';
import { bookingController } from './booking.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// =============================================================================
// CUSTOMER BOOKING ROUTES
// =============================================================================

// 1. Create booking request (Customer only)
router.post(
  '/',
  requireAuth,
  requireRole(Role.CUSTOMER),
  (req, res, next) => bookingController.createBooking(req, res, next)
);

// 2. View customer's booking history (Customer only)
router.get(
  '/my',
  requireAuth,
  requireRole(Role.CUSTOMER),
  (req, res, next) => bookingController.getMyBookings(req, res, next)
);

// 3. Cancel booking (Customer only)
router.patch(
  '/:id/cancel',
  requireAuth,
  requireRole(Role.CUSTOMER),
  (req, res, next) => bookingController.cancelBooking(req, res, next)
);

// 4. Raise dispute on visit (Customer only)
router.post(
  '/:id/dispute',
  requireAuth,
  requireRole(Role.CUSTOMER),
  (req, res, next) => bookingController.raiseDispute(req, res, next)
);

// 5. Submit refund claim request (Customer only)
router.post(
  '/:id/refund-request',
  requireAuth,
  requireRole(Role.CUSTOMER),
  (req, res, next) => bookingController.requestRefund(req, res, next)
);

// 6. Submit verified review (Customer only, strictly on COMPLETED bookings)
router.post(
  '/:id/review',
  requireAuth,
  requireRole(Role.CUSTOMER),
  (req, res, next) => bookingController.submitVerifiedReview(req, res, next)
);

// =============================================================================
// PARTNER DESK BOOKING ROUTES
// =============================================================================

// 7. View partner's incoming booking queue
router.get(
  '/partner',
  requireAuth,
  requireRole(Role.PARTNER_OWNER, Role.PARTNER_STAFF),
  (req, res, next) => bookingController.getPartnerBookings(req, res, next)
);

// 8. Accept booking request
router.patch(
  '/:id/accept',
  requireAuth,
  requireRole(Role.PARTNER_OWNER, Role.PARTNER_STAFF),
  (req, res, next) => bookingController.acceptBooking(req, res, next)
);

// 9. Decline booking request
router.patch(
  '/:id/decline',
  requireAuth,
  requireRole(Role.PARTNER_OWNER, Role.PARTNER_STAFF),
  (req, res, next) => bookingController.declineBooking(req, res, next)
);

// 10. Complete booking via 4-digit venue PIN check-in & record commission ledger
router.patch(
  '/:id/complete',
  requireAuth,
  requireRole(Role.PARTNER_OWNER, Role.PARTNER_STAFF),
  (req, res, next) => bookingController.completeBookingWithPin(req, res, next)
);

// 11. Mark confirmed booking as No-Show
router.patch(
  '/:id/no-show',
  requireAuth,
  requireRole(Role.PARTNER_OWNER, Role.PARTNER_STAFF),
  (req, res, next) => bookingController.markNoShow(req, res, next)
);

export default router;
