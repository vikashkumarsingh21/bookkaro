import prisma from '../../config/db';
import { config } from '../../config';
import { razorpayService } from '../../config/razorpay';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  UnauthorizedError,
} from '../../utils/errors';
import { PaymentTransactionStatus, Prisma } from '@prisma/client';

export class PaymentService {
  /**
   * Create Razorpay Order for a valid payable booking
   */
  async createOrder(customerId: string, bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { provider: true },
    });

    if (!booking) {
      throw new NotFoundError('Booking record not found.');
    }

    // IDOR Protection: Must belong to customer
    if (booking.customerId !== customerId) {
      throw new ForbiddenError('You do not have permission to pay for this booking.');
    }

    // Check payable state
    const payableStatuses = ['REQUESTED', 'ACCEPTED', 'CONFIRMED'];
    if (!payableStatuses.includes(booking.status)) {
      throw new BadRequestError(
        `Cannot initiate payment for booking in '${booking.status}' status.`
      );
    }

    if (booking.paymentStatus === 'PAID') {
      throw new BadRequestError('This booking has already been marked as PAID.');
    }

    const amountInr = Number(booking.estimatedAmountInr);
    if (amountInr <= 0) {
      throw new BadRequestError('Payable amount must be greater than zero INR.');
    }

    const amountInPaise = Math.round(amountInr * 100);

    // Call Razorpay Order API
    const order = await razorpayService.createOrder({
      amount: amountInPaise,
      currency: 'INR',
      receipt: booking.bookingCode,
      notes: {
        bookingId: booking.id,
        bookingCode: booking.bookingCode,
        customerId,
        providerName: booking.provider.brandName,
      },
    });

    // Record Payment in CREATED state
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        razorpayOrderId: order.id,
        amountInr,
        currency: 'INR',
        status: PaymentTransactionStatus.CREATED,
      },
    });

    return {
      orderId: order.id,
      paymentId: payment.id,
      amountInr,
      currency: 'INR',
      keyId: config.razorpay.keyId || 'rzp_test_bookkaro_patna_dev',
      bookingCode: booking.bookingCode,
      providerName: booking.provider.brandName,
    };
  }

  /**
   * Verify HMAC SHA-256 signature and capture payment
   */
  async verifyPayment(
    customerId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ) {
    // 1. Validate cryptographic HMAC SHA-256 signature
    const isValid = razorpayService.verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      throw new BadRequestError(
        'Cryptographic payment verification failed. Invalid Razorpay signature.',
        'PAYMENT_SIGNATURE_INVALID'
      );
    }

    // 2. Find payment record
    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId },
      include: { booking: true },
    });

    if (!payment) {
      throw new NotFoundError('Payment transaction for this order was not found.');
    }

    // IDOR Protection
    if (payment.booking.customerId !== customerId) {
      throw new ForbiddenError('You do not have permission to verify this payment.');
    }

    // 3. Atomically capture payment and update booking status
    const result = await prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          razorpayPaymentId,
          status: PaymentTransactionStatus.CAPTURED,
        },
      });

      const updatedBooking = await tx.booking.update({
        where: { id: payment.bookingId },
        data: {
          paymentStatus: 'PAID',
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: customerId,
          actorRole: 'CUSTOMER',
          actionType: 'PAYMENT_CAPTURED',
          targetId: payment.bookingId,
          summary: `Payment captured: ₹${payment.amountInr} via Razorpay (Order: ${razorpayOrderId}, Payment: ${razorpayPaymentId})`,
          metadata: { razorpayOrderId, razorpayPaymentId },
        },
      });

      return { payment: updatedPayment, booking: updatedBooking };
    });

    return {
      paymentId: result.payment.id,
      bookingId: result.booking.id,
      bookingCode: result.booking.bookingCode,
      amountInr: Number(result.payment.amountInr),
      status: 'PAID',
    };
  }

  /**
   * Idempotent Razorpay Webhook Handler
   */
  async handleWebhook(rawBody: string | Buffer, signature?: string) {
    if (!signature) {
      throw new UnauthorizedError('Missing x-razorpay-signature header on webhook dispatch.');
    }

    const isValid = razorpayService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      throw new UnauthorizedError('Invalid cryptographic webhook signature.');
    }

    const bodyString = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
    const payload = JSON.parse(bodyString);
    const event = payload.event;

    // Handle payment.captured
    if (event === 'payment.captured') {
      const entity = payload.payload?.payment?.entity;
      const orderId = entity?.order_id;
      const paymentId = entity?.id;

      if (orderId) {
        const payment = await prisma.payment.findUnique({
          where: { razorpayOrderId: orderId },
        });

        if (payment && payment.status !== PaymentTransactionStatus.CAPTURED) {
          await prisma.$transaction(async (tx) => {
            await tx.payment.update({
              where: { id: payment.id },
              data: {
                razorpayPaymentId: paymentId,
                status: PaymentTransactionStatus.CAPTURED,
                webhookPayload: payload as Prisma.InputJsonValue,
              },
            });

            await tx.booking.update({
              where: { id: payment.bookingId },
              data: { paymentStatus: 'PAID' },
            });

            await tx.auditLog.create({
              data: {
                actorId: 'RAZORPAY_WEBHOOK',
                actorRole: 'SYSTEM',
                actionType: 'WEBHOOK_PAYMENT_CAPTURED',
                targetId: payment.bookingId,
                summary: `Webhook auto-captured payment for order ${orderId}`,
                metadata: { orderId, paymentId },
              },
            });
          });
        }
      }
    }

    // Handle payment.failed
    if (event === 'payment.failed') {
      const entity = payload.payload?.payment?.entity;
      const orderId = entity?.order_id;
      const paymentId = entity?.id;

      if (orderId) {
        const payment = await prisma.payment.findUnique({
          where: { razorpayOrderId: orderId },
        });

        if (payment && payment.status !== PaymentTransactionStatus.FAILED) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              razorpayPaymentId: paymentId,
              status: PaymentTransactionStatus.FAILED,
              webhookPayload: payload as Prisma.InputJsonValue,
            },
          });
        }
      }
    }

    // Handle refund.processed
    if (event === 'refund.processed') {
      const refundEntity = payload.payload?.refund?.entity;
      const paymentId = refundEntity?.payment_id;

      if (paymentId) {
        const payment = await prisma.payment.findUnique({
          where: { razorpayPaymentId: paymentId },
        });

        if (payment && payment.status !== PaymentTransactionStatus.REFUNDED) {
          await prisma.$transaction(async (tx) => {
            await tx.payment.update({
              where: { id: payment.id },
              data: {
                status: PaymentTransactionStatus.REFUNDED,
                webhookPayload: payload as Prisma.InputJsonValue,
              },
            });

            await tx.booking.update({
              where: { id: payment.bookingId },
              data: {
                status: 'REFUNDED',
                paymentStatus: 'REFUNDED',
              },
            });

            await tx.auditLog.create({
              data: {
                actorId: 'RAZORPAY_WEBHOOK',
                actorRole: 'SYSTEM',
                actionType: 'WEBHOOK_REFUND_PROCESSED',
                targetId: payment.bookingId,
                summary: `Refund processed: ₹${(refundEntity.amount || 0) / 100}`,
                metadata: { refundId: refundEntity.id, paymentId },
              },
            });
          });
        }
      }
    }

    return { received: true, event };
  }
}

export const paymentService = new PaymentService();
