// BOOKKARO - Modular Notification & Messaging Service
// Event-driven notification dispatchers for Email (Resend/SMTP) & WhatsApp/SMS Webhooks

export type NotificationType =
  | "BOOKING_REQUESTED"
  | "BOOKING_CONFIRMED"
  | "BOOKING_DECLINED"
  | "PROVIDER_ACTIVATED";

export interface BookingRequestedPayload {
  bookingId: string;
  bookingCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  providerName: string;
  providerEmail: string;
  providerPhone: string;
  serviceName: string;
  bookingDate: string;
  timeSlot: string;
}

export interface BookingConfirmedPayload {
  bookingId: string;
  bookingCode: string;
  verificationCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  providerName: string;
  serviceName: string;
  bookingDate: string;
  timeSlot: string;
  venueAddress: string;
}

export interface BookingDeclinedPayload {
  bookingId: string;
  bookingCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  providerName: string;
  reason: string;
}

export interface ProviderActivatedPayload {
  providerId: string;
  providerCode: string;
  businessName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  temporaryPassword: string;
  loginUrl: string;
}

export interface NotificationResult {
  success: boolean;
  type: NotificationType;
  recipient: string;
  channel: "EMAIL" | "WHATSAPP" | "SMS";
  messageId: string;
  timestamp: string;
}

// -------------------------------------------------------------
// ADAPTERS: Email & WhatsApp / SMS
// -------------------------------------------------------------

export class EmailAdapter {
  private static resendApiKey = process.env.RESEND_API_KEY;
  private static sender = "BOOKKARO <notifications@bookkaro.in>";

  static async send(to: string, subject: string, html: string): Promise<string> {
    const messageId = `email-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    if (this.resendApiKey) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: this.sender,
            to: [to],
            subject,
            html,
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as { id: string };
          return data.id || messageId;
        }
      } catch (err) {
        console.warn("[EmailAdapter] Resend API dispatch failed, using logger:", err);
      }
    }

    // Dev/Sandbox Fallback Logger
    console.log(`[EMAIL DISPATCHED] To: ${to} | Subject: "${subject}" | Id: ${messageId}`);
    return messageId;
  }
}

export class WhatsAppSmsAdapter {
  private static webhookUrl = process.env.WHATSAPP_WEBHOOK_URL;

  static async send(phone: string, text: string): Promise<string> {
    const messageId = `wa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    if (this.webhookUrl) {
      try {
        await fetch(this.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone,
            text,
            template: "bookkaro_transactional",
          }),
        });
        return messageId;
      } catch (err) {
        console.warn("[WhatsAppAdapter] Webhook delivery failed, using logger:", err);
      }
    }

    // Dev/Sandbox Fallback Logger
    console.log(`[WHATSAPP/SMS DISPATCHED] To: ${phone} | Message: "${text.slice(0, 80)}..." | Id: ${messageId}`);
    return messageId;
  }
}

// -------------------------------------------------------------
// CORE NOTIFICATION DISPATCH ENGINE
// -------------------------------------------------------------

export class NotificationService {
  /**
   * Event: BOOKING_REQUESTED
   * Notifies Merchant of incoming booking & confirms customer receipt
   */
  static async notifyBookingRequested(payload: BookingRequestedPayload): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];
    const timestamp = new Date().toISOString();

    // 1. Notify Provider Merchant
    const merchantEmailHtml = `
      <h2>New Booking Request Received</h2>
      <p>Hello <strong>${payload.providerName}</strong>,</p>
      <p>A new booking request <strong>${payload.bookingCode}</strong> has been submitted by ${payload.customerName}.</p>
      <ul>
        <li><strong>Service:</strong> ${payload.serviceName}</li>
        <li><strong>Date:</strong> ${payload.bookingDate} at ${payload.timeSlot}</li>
        <li><strong>Customer Contact:</strong> ${payload.customerPhone}</li>
      </ul>
      <p>Please log in to your Provider Portal to Accept & Confirm this slot.</p>
    `;

    const merchantEmailId = await EmailAdapter.send(
      payload.providerEmail,
      `[BOOKKARO] New Request: ${payload.serviceName} (${payload.bookingCode})`,
      merchantEmailHtml
    );

    results.push({
      success: true,
      type: "BOOKING_REQUESTED",
      recipient: payload.providerEmail,
      channel: "EMAIL",
      messageId: merchantEmailId,
      timestamp,
    });

    // 2. Notify Customer via WhatsApp/SMS
    const customerSmsText = `BOOKKARO: Your request ${payload.bookingCode} for ${payload.serviceName} at ${payload.providerName} on ${payload.bookingDate} (${payload.timeSlot}) has been received. You will be notified once confirmed.`;
    const customerSmsId = await WhatsAppSmsAdapter.send(payload.customerPhone, customerSmsText);

    results.push({
      success: true,
      type: "BOOKING_REQUESTED",
      recipient: payload.customerPhone,
      channel: "WHATSAPP",
      messageId: customerSmsId,
      timestamp,
    });

    return results;
  }

  /**
   * Event: BOOKING_CONFIRMED
   * Sends customer booking confirmation with 4-digit venue check-in verification code
   */
  static async notifyBookingConfirmed(payload: BookingConfirmedPayload): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];
    const timestamp = new Date().toISOString();

    const customerEmailHtml = `
      <h2>Your Booking is Confirmed!</h2>
      <p>Dear ${payload.customerName},</p>
      <p>Your appointment at <strong>${payload.providerName}</strong> has been confirmed.</p>
      <div style="background:#FAF9F6;padding:16px;border:1px solid #E5E2DC;margin:16px 0;">
        <p><strong>Booking Code:</strong> ${payload.bookingCode}</p>
        <p><strong>Venue Check-in Code:</strong> <span style="font-size:20px;font-weight:bold;color:#143D2B;">${payload.verificationCode}</span></p>
        <p><strong>Service:</strong> ${payload.serviceName}</p>
        <p><strong>Date & Time:</strong> ${payload.bookingDate} at ${payload.timeSlot}</p>
        <p><strong>Venue Address:</strong> ${payload.venueAddress}</p>
      </div>
      <p>Present the 4-digit check-in code at the counter for seamless verification.</p>
    `;

    const emailId = await EmailAdapter.send(
      payload.customerEmail,
      `[CONFIRMED] Booking ${payload.bookingCode} at ${payload.providerName}`,
      customerEmailHtml
    );

    results.push({
      success: true,
      type: "BOOKING_CONFIRMED",
      recipient: payload.customerEmail,
      channel: "EMAIL",
      messageId: emailId,
      timestamp,
    });

    const smsText = `BOOKKARO CONFIRMED: ${payload.serviceName} at ${payload.providerName} on ${payload.bookingDate} at ${payload.timeSlot}. Code: ${payload.bookingCode}. Venue Check-in OTP: ${payload.verificationCode}. Address: ${payload.venueAddress}`;
    const smsId = await WhatsAppSmsAdapter.send(payload.customerPhone, smsText);

    results.push({
      success: true,
      type: "BOOKING_CONFIRMED",
      recipient: payload.customerPhone,
      channel: "WHATSAPP",
      messageId: smsId,
      timestamp,
    });

    return results;
  }

  /**
   * Event: BOOKING_DECLINED
   * Notifies customer when provider declines request with reason
   */
  static async notifyBookingDeclined(payload: BookingDeclinedPayload): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];
    const timestamp = new Date().toISOString();

    const emailHtml = `
      <h2>Booking Request Update</h2>
      <p>Dear ${payload.customerName},</p>
      <p>Unfortunately, <strong>${payload.providerName}</strong> was unable to accept your request <strong>${payload.bookingCode}</strong>.</p>
      <p><strong>Reason provided:</strong> "${payload.reason}"</p>
      <p>Please browse other nearby providers or select an alternative slot on BOOKKARO.</p>
    `;

    const emailId = await EmailAdapter.send(
      payload.customerEmail,
      `[UPDATE] Booking Request ${payload.bookingCode}`,
      emailHtml
    );

    results.push({
      success: true,
      type: "BOOKING_DECLINED",
      recipient: payload.customerEmail,
      channel: "EMAIL",
      messageId: emailId,
      timestamp,
    });

    const smsText = `BOOKKARO: Your request ${payload.bookingCode} at ${payload.providerName} could not be confirmed. Reason: ${payload.reason}. Please select an alternate slot on bookkaro.in`;
    const smsId = await WhatsAppSmsAdapter.send(payload.customerPhone, smsText);

    results.push({
      success: true,
      type: "BOOKING_DECLINED",
      recipient: payload.customerPhone,
      channel: "WHATSAPP",
      messageId: smsId,
      timestamp,
    });

    return results;
  }

  /**
   * Event: PROVIDER_ACTIVATED
   * Notifies merchant of live platform activation with credentials & password reset requirement
   */
  static async notifyProviderActivated(payload: ProviderActivatedPayload): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];
    const timestamp = new Date().toISOString();

    const emailHtml = `
      <h2>Welcome to BOOKKARO Partner Network!</h2>
      <p>Dear ${payload.ownerName},</p>
      <p>Congratulations! <strong>${payload.businessName}</strong> has been successfully activated on the BOOKKARO Marketplace.</p>
      <div style="background:#FAF9F6;padding:16px;border:1px solid #E5E2DC;margin:16px 0;">
        <p><strong>Unique Provider Code:</strong> ${payload.providerCode}</p>
        <p><strong>Login Email:</strong> ${payload.ownerEmail}</p>
        <p><strong>Temporary Access Password:</strong> <code>${payload.temporaryPassword}</code></p>
        <p><strong>Portal Link:</strong> <a href="${payload.loginUrl}">${payload.loginUrl}</a></p>
      </div>
      <p><em>Security Notice: You will be prompted to create a secure personal password upon your first sign-in.</em></p>
    `;

    const emailId = await EmailAdapter.send(
      payload.ownerEmail,
      `[ACTIVATED] Welcome ${payload.businessName} to BOOKKARO!`,
      emailHtml
    );

    results.push({
      success: true,
      type: "PROVIDER_ACTIVATED",
      recipient: payload.ownerEmail,
      channel: "EMAIL",
      messageId: emailId,
      timestamp,
    });

    const smsText = `BOOKKARO: Welcome ${payload.businessName}! Your merchant account ${payload.providerCode} is active. Login: ${payload.loginUrl} with temp pass: ${payload.temporaryPassword}. You will be prompted to reset password.`;
    const smsId = await WhatsAppSmsAdapter.send(payload.ownerPhone, smsText);

    results.push({
      success: true,
      type: "PROVIDER_ACTIVATED",
      recipient: payload.ownerPhone,
      channel: "WHATSAPP",
      messageId: smsId,
      timestamp,
    });

    return results;
  }
}
