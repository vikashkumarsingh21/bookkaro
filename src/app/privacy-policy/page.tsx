import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | BOOKKARO (India DPDP Aligned)',
  description:
    'Our commitment to your personal data privacy under the Digital Personal Data Protection Act, 2023 (DPDP). Clear, plain-English terms on data collection, zero medical record storage, and guest rights in Patna, Bihar.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* Editorial Header */}
      <section className="bg-surface border-b border-border-subtle py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-subtle border border-border-subtle text-primary text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>Digital Personal Data Protection Act (DPDP 2023) Compliant</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            Privacy Policy &amp; Data Charter
          </h1>
          <p className="text-xs sm:text-base text-ink-muted max-w-xl mx-auto leading-relaxed">
            Effective Date: November 2026 • Published by BOOKKARO, Fraser Road, Patna.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-10 text-xs sm:text-sm text-ink-muted leading-relaxed">
        {/* Summary Banner */}
        <div className="p-5 rounded-2xl bg-[#EBF2EE] border border-[#C8DBD1] text-[#163829] space-y-2">
          <div className="font-serif font-bold text-base flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#163829]" />
            <span>Our Privacy Guarantee to Patna Citizens &amp; Guests</span>
          </div>
          <p className="text-xs text-[#163829]/90">
            BOOKKARO never sells your personal contact details to third-party ad networks, telemarketers, or loan brokers. Your phone number is used exclusively for arrival confirmations and 4-digit Venue PIN dispatch.
          </p>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="font-serif font-bold text-lg text-ink">
            1. Identity of the Data Fiduciary
          </h2>
          <p>
            Under the Digital Personal Data Protection Act, 2023 (&quot;DPDP Act&quot;), the Data Fiduciary responsible for processing your personal data on the BOOKKARO marketplace is:
          </p>
          <div className="p-4 rounded-xl bg-surface border border-border-subtle space-y-1 text-xs text-ink font-medium">
            <div><strong>Entity:</strong> BOOKKARO Hospitality Private Limited</div>
            <div><strong>CIN:</strong> U72900BR2024PTC068912</div>
            <div><strong>Registered Office:</strong> 3rd Floor, Commercial Plaza, Fraser Road, Patna, Bihar — 800001</div>
            <div><strong>Contact:</strong> privacy@bookkaro.in</div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="font-serif font-bold text-lg text-ink">
            2. Categories of Personal Data Collected
          </h2>
          <p>
            We collect only the minimum data strictly necessary to fulfill your hospitality reservations:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong>Identity &amp; Contact:</strong> Full name, 10-digit Indian mobile number, and email address.</li>
            <li><strong>Reservation Specifications:</strong> Selected check-in dates, scheduled time slots, guest counts, room preferences, or party size.</li>
            <li><strong>Voluntary Hospitality Preferences:</strong> Dietary preferences (e.g. Jain food, window table, anniversary setup) entered via optional request textareas.</li>
            <li><strong>Transactional &amp; Fulfillment Identifiers:</strong> 4-digit offline Venue PIN codes, unique booking references (e.g. BK-PAT-XXXX), and final settled bills.</li>
          </ul>
        </section>

        {/* Section 3: Strict Exclusion of Sensitive Data */}
        <section className="space-y-3 p-5 rounded-2xl bg-surface border border-border-subtle">
          <h2 className="font-serif font-bold text-lg text-ink flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            <span>3. Zero Medical &amp; Health Record Storage</span>
          </h2>
          <p className="text-xs sm:text-sm">
            BOOKKARO strictly operates as an appointment discovery and arrival slot scheduling platform. We <strong>DO NOT</strong> collect, store, scan, or analyze medical diagnostic records, physician prescriptions, blood test results, or biometric health information. Any medical inquiries occur exclusively in-person between the patient and clinic practitioner.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="font-serif font-bold text-lg text-ink">
            4. Purpose of Data Processing
          </h2>
          <p>
            Your information is processed exclusively for lawful, specified purposes:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>Transmitting booking requests to your chosen Patna establishment (Hotel, Restaurant, or Salon) within our target &lt;90s SLA window.</li>
            <li>Dispatching booking confirmation SMS, WhatsApp tokens, and Venue PIN check-in codes.</li>
            <li>Facilitating refund processing or dispute arbitrations in case of service cancellation or table unavailability.</li>
            <li>Maintaining required transaction records under the Consumer Protection (E-Commerce) Rules, 2020.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="font-serif font-bold text-lg text-ink">
            5. Data Sharing &amp; Disclosures
          </h2>
          <p>
            We share your contact and booking information solely with the single verified Patna venue you have selected for your reservation. We do not share data across unrelated third parties or sell contact profiles to commercial data aggregators.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="font-serif font-bold text-lg text-ink">
            6. Statutory Retention &amp; Immutable Audit Logs
          </h2>
          <p>
            In compliance with statutory requirements under Indian law, transaction audit ledgers and dispute resolutions are maintained in encrypted format for a statutory period of 12 months. After this statutory retention lock, non-essential personal identifiers are automatically scrubbed or anonymized.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="font-serif font-bold text-lg text-ink">
            7. Your Rights as a Data Principal
          </h2>
          <p>
            Under Section 11–14 of the DPDP Act 2023, you enjoy full rights regarding your personal data:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong>Right to Access:</strong> View all active and past booking history via your <Link href="/dashboard" className="text-primary font-bold hover:underline">My Bookings Dashboard</Link>.</li>
            <li><strong>Right to Correction &amp; Erasure:</strong> Request updating or deletion of your profile data once all active reservations are completed.</li>
            <li><strong>Right to Grievance Redressal:</strong> Direct escalation to our designated Grievance Officer.</li>
          </ul>
        </section>

        {/* Section 8: Grievance Officer */}
        <section className="space-y-3 p-6 rounded-2xl bg-surface border border-border-subtle">
          <h2 className="font-serif font-bold text-lg text-ink">
            8. Designated Grievance Officer
          </h2>
          <p>
            If you have any questions or complaints regarding data protection, please reach out to our Grievance Officer:
          </p>
          <div className="text-xs space-y-1 text-ink font-medium pt-1">
            <div><strong>Officer:</strong> Rajeshwar Sinha, Advocate (Patna High Court Bar)</div>
            <div><strong>Email:</strong> grievance@bookkaro.in</div>
            <div><strong>Phone:</strong> +91 612 250 9911</div>
            <div><strong>Office:</strong> BOOKKARO Operations Center, 3rd Floor, Fraser Road Commercial Complex, Patna 800001</div>
            <div><strong>Acknowledgement SLA:</strong> 48 hours • <strong>Resolution SLA:</strong> 30 days</div>
          </div>
        </section>
      </main>
    </div>
  );
}
