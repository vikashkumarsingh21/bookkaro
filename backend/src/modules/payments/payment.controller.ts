import { Request, Response, NextFunction } from 'express';
import { paymentService } from './payment.service';
import { createOrderSchema, verifyPaymentSchema } from './payment.validation';

export class PaymentController {
  /**
   * POST /api/v1/payments/create-order (Customer only)
   */
  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookingId } = createOrderSchema.parse(req.body);
      const result = await paymentService.createOrder(req.user!.id, bookingId);

      res.status(200).json({
        success: true,
        message: 'Razorpay order created successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/payments/verify (Customer only)
   */
  async verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } =
        verifyPaymentSchema.parse(req.body);

      const result = await paymentService.verifyPayment(
        req.user!.id,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      res.status(200).json({
        success: true,
        message: 'Payment verified and captured.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/payments/webhook (Public, Raw Payload HMAC Verified)
   */
  async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signature = req.headers['x-razorpay-signature'] as string | undefined;
      const rawBody = req.body;

      const result = await paymentService.handleWebhook(rawBody, signature);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
