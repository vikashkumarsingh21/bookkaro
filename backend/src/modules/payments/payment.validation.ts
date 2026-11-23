import { z } from 'zod';

export const createOrderSchema = z.object({
  bookingId: z.string({ required_error: 'bookingId is required' }).uuid({ message: 'bookingId must be a valid UUID' }),
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string({ required_error: 'razorpayOrderId is required' }).min(1),
  razorpayPaymentId: z.string({ required_error: 'razorpayPaymentId is required' }).min(1),
  razorpaySignature: z.string({ required_error: 'razorpaySignature is required' }).min(1),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
