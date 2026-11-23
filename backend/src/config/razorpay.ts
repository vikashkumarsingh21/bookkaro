import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from './index';

export interface RazorpayOrderParams {
  amount: number; // in paise
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResult {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  notes: Record<string, string>;
  created_at: number;
}

class RazorpayService {
  private client: Razorpay | null = null;
  public readonly isMockMode: boolean;

  constructor() {
    this.isMockMode = config.razorpay.mockMode;

    if (!this.isMockMode && config.razorpay.keyId && config.razorpay.keySecret) {
      this.client = new Razorpay({
        key_id: config.razorpay.keyId,
        key_secret: config.razorpay.keySecret,
      });
      console.log('💳 Razorpay Client initialized in LIVE/TEST API mode.');
    } else {
      console.log('💳 Razorpay Client initialized in SAFE MOCK mode (local dev enabled).');
    }
  }

  /**
   * Create Razorpay order (paise amount)
   */
  async createOrder(params: RazorpayOrderParams): Promise<RazorpayOrderResult> {
    if (this.isMockMode || !this.client) {
      const mockOrderId = `order_pat_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      return {
        id: mockOrderId,
        entity: 'order',
        amount: params.amount,
        amount_paid: 0,
        amount_due: params.amount,
        currency: params.currency || 'INR',
        receipt: params.receipt,
        status: 'created',
        notes: params.notes || {},
        created_at: Math.floor(Date.now() / 1000),
      };
    }

    const order = await this.client.orders.create({
      amount: params.amount,
      currency: params.currency,
      receipt: params.receipt,
      notes: params.notes,
    });

    return order as unknown as RazorpayOrderResult;
  }

  /**
   * Verify HMAC SHA-256 payment signature with timing-safe comparison
   */
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    if (this.isMockMode) {
      // In mock mode, allow mock signature or valid hmac
      if (signature === 'mock_signature_valid' || signature.startsWith('mock_')) {
        return true;
      }
    }

    const secret = config.razorpay.keySecret || 'mock_secret';
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const signatureBuffer = Buffer.from(signature, 'utf8');

    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  }

  /**
   * Verify Webhook signature against raw payload buffer
   */
  verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean {
    const secret = config.razorpay.webhookSecret;
    if (!secret) return false;

    if (this.isMockMode && (signature === 'mock_webhook_signature' || signature.startsWith('mock_'))) {
      return true;
    }

    const hmac = crypto.createHmac('sha256', secret);
    const expectedSignature = hmac.update(rawBody).digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const signatureBuffer = Buffer.from(signature, 'utf8');

    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  }
}

export const razorpayService = new RazorpayService();
