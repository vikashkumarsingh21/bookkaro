import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth';
import { Role } from '@prisma/client';
import prisma from '../../config/db';

const router = Router();

// Protect all partner routes for partner owner or staff
router.use(requireAuth, requireRole(Role.PARTNER_OWNER, Role.PARTNER_STAFF));

/**
 * GET /api/v1/partner/overview
 * Partner front desk operations snapshot
 */
router.get('/overview', async (req: Request, res: Response, next) => {
  try {
    // Find provider managed by current user
    const provider = await prisma.provider.findFirst({
      where: { ownerId: req.user!.id },
      include: {
        services: true,
      },
    });

    if (!provider) {
      res.status(404).json({
        success: false,
        message: 'No partner merchant found for this user account',
        code: 'PARTNER_NOT_FOUND',
      });
      return;
    }

    const pendingBookingsCount = await prisma.booking.count({
      where: { providerId: provider.id, status: 'REQUESTED' },
    });

    const confirmedTodayCount = await prisma.booking.count({
      where: { providerId: provider.id, status: 'CONFIRMED' },
    });

    res.json({
      success: true,
      data: {
        provider,
        metrics: {
          pendingRequests: pendingBookingsCount,
          confirmedToday: confirmedTodayCount,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/partner/bookings/:id/verify-pin
 * Verify customer's 4-digit PIN at counter to check in
 */
router.post('/bookings/:id/verify-pin', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const { pin, finalBillInr } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { provider: true },
    });

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    if (booking.venuePin !== pin) {
      res.status(400).json({
        success: false,
        message: 'Invalid 4-digit venue PIN provided by guest',
        code: 'INVALID_PIN',
      });
      return;
    }

    // Transition booking to COMPLETED and update bill
    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        finalBillInr: finalBillInr || booking.estimatedAmountInr,
        paymentStatus: 'PAID',
      },
    });

    // Create ledger commission record
    const billAmount = finalBillInr || Number(booking.estimatedAmountInr);
    const commRate = booking.provider.commissionRate;
    const commAmount = (billAmount * commRate) / 100;
    const netPayout = billAmount - commAmount;

    await prisma.commissionLedger.upsert({
      where: { bookingId: booking.id },
      update: {
        finalBillInr: billAmount,
        commissionRate: commRate,
        commissionAmountInr: commAmount,
        netPayoutInr: netPayout,
      },
      create: {
        bookingId: booking.id,
        providerId: booking.providerId,
        finalBillInr: billAmount,
        commissionRate: commRate,
        commissionAmountInr: commAmount,
        netPayoutInr: netPayout,
        status: 'PENDING',
      },
    });

    res.json({
      success: true,
      message: 'Venue PIN verified. Booking marked as COMPLETED and ledger updated.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
