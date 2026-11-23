import { Router } from 'express';
import { paymentController } from './payment.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// 1. Create order (Customer only)
router.post(
  '/create-order',
  requireAuth,
  requireRole(Role.CUSTOMER),
  (req, res, next) => paymentController.createOrder(req, res, next)
);

// 2. Verify signature & capture payment (Customer only)
router.post(
  '/verify',
  requireAuth,
  requireRole(Role.CUSTOMER),
  (req, res, next) => paymentController.verifyPayment(req, res, next)
);

// 3. Razorpay Webhook listener (Public, verified via x-razorpay-signature header)
router.post('/webhook', (req, res, next) => paymentController.handleWebhook(req, res, next));

export default router;
