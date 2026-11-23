import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  FileText,
  Clock,
  KeyRound,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service & Booking Rules | BOOKKARO Patna',
  description:
    'Terms of service, booking lifecycle rules, 4-digit Venue PIN verification, and cancellation & refund policy for BOOKKARO guests and partners in Patna, Bihar.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* Editorial Header */}
      <section className="bg-surface border-b border-border-subtle py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-subtle border border-border-subtle text-primary text-xs font-semibold">
            <FileText className="w-3.5 h-3.5 text-primary" />
            <span>Consumer Protection (E-Commerce) Rules Aligned</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            Terms of Service &amp; Booking Rules
          </h1>
          <p className="text-xs sm:text-base text-ink-muted max-w-xl mx-auto leading-relaxed">
            Effective Date: November 2026 • Published by BOOKKARO, Patna.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-10 text-xs sm:text-sm text-ink-muted leading-relaxed">
        {/* Core Commitments Box */}
        <div className="p-5 rounded-2xl bg-[#EBF2EE] border border-[#C8DBD1] text-[#163829] space-y-2">
          <div className="font-serif font-bold text-base flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#163829]" />
            <span>The BOOKKARO Fair Marketplace Compact</span>
          </div>
          <p className="text-xs text-[#163829]/90">
            Every reservation made through BOOKKARO is backed by physical verification, transparent pricing, guaranteed arrival tokens, and an auditable dispute &amp; refund mechanism.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="font-serif font-bold text-lg text-ink">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using the website, mobile site, or APIs of BOOKKARO, you agree to be bound by these Terms of Service. If you do not agree to these terms, please refrain from using our concierge and booking services.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="font-serif font-bold text-lg text-ink">
            2. Scope of Service (Patna Launch)
          </h2>
          <p>
            BOOKKARO operates strictly as a multi-category local discovery and guaranteed arrival concierge in <strong>Patna, Bihar</strong> across three primary verticals:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong>Hotels &amp; Stays:</strong> Boutique hotel rooms, executive suites, and conference boardrooms.</li>
            <li><strong>Dining &amp; Cafes:</strong> Table reservations and family dining slots (dine-in arrival only; not online doorstep food delivery).</li>
            <li><strong>Salons &amp; Spas:</strong> Professional salon chairs, grooming appointments, and Ayurvedic spa wellness sessions.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="font-serif font-bold text-lg text-ink flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span>3. Booking Lifecycle &amp; The 90s SLA</span>
          </h2>
          <p>
            When a guest submits a reservation request through BOOKKARO, the request enters the status <code>REQUESTED</code>. The participating establishment in Patna is alerted via our Front-Desk Atelier and target an acceptance SLA under 90 seconds. Once acknowledged, the status transitions to <code>CONFIRMED</code>, locking the guest&apos;s arrival token.
          </p>
        </section>

        {/* Section 4: 4-Digit Venue PIN Mandate */}
        <section className="space-y-3 p-5 rounded-2xl bg-surface border border-border-subtle">
          <h2 className="font-serif font-bold text-lg text-ink flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-primary" />
            <span>4. Physical 4-Digit Venue PIN Check-In Mandate</span>
          </h2>
          <p>
            To prevent fraud, phantom billings, or premature completion, every confirmed reservation issues a secret 4-digit Venue PIN to the customer. 
          </p>
          <p className="font-medium text-ink">
            A booking can ONLY be marked as <code>COMPLETED</code> when the guest physically arrives at the venue front desk and shares their 4-digit PIN with the receptionist.
          </p>
        </section>

        {/* Section 5: Cancellation & Refund Policy */}
        <section className="space-y-3 p-5 rounded-2xl bg-surface border border-border-subtle">
          <h2 className="font-serif font-bold text-lg text-ink flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-primary" />
            <span>5. Cancellation &amp; Refund Policy</span>
          </h2>
          <div className="space-y-2">
            <p>
              <strong>Free Cancellation:</strong> Guests may cancel their booking request free of charge prior to the venue&apos;s scheduled check-in window directly from the <Link href="/dashboard" className="text-primary font-bold hover:underline">Customer Dashboard</Link>.
            </p>
            <p>
              <strong>Refund Eligibility:</strong> If an advance token was collected, or if an establishment failed to honor a confirmed slot, the customer is entitled to a full refund. Bookings with status <code>CANCELLED</code> or <code>DISPUTED</code> feature a one-click <strong>&quot;Request Refund&quot;</strong> action in the booking details drawer.
            </p>
            <p>
              <strong>Refund Processing SLA:</strong> All refund requests are reviewed by our Patna Accounts Desk. Approved refunds are credited directly back to the guest&apos;s original payment method or UPI handle within <strong>24 to 48 business hours</strong>.
            </p>
          </div>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="font-serif font-bold text-lg text-ink">
            6. Partner &amp; Establishment Responsibilities
          </h2>
          <p>
            All listed Patna partners agree to:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>Honor all confirmed slots and hold reserved tables for a minimum 15-minute grace period.</li>
            <li>Charge counter rates that are identical to or lower than their offline walk-in price cards.</li>
            <li>Provide genuine GST/tax invoices to guests upon counter bill realization.</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="font-serif font-bold text-lg text-ink">
            7. Governing Law &amp; Jurisdiction
          </h2>
          <p>
            These Terms of Service are governed by the laws of India. Any legal dispute, arbitration, or statutory claim arising out of marketplace transactions shall be subject exclusively to the jurisdiction of the competent courts of <strong>Patna, Bihar, India</strong>.
          </p>
        </section>
      </main>
    </div>
  );
}
