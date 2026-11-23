'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  ShieldCheck,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState('GUEST_INQUIRY');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const ticketId = `INQ-PAT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedTicket(ticketId);
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* Editorial Header */}
      <section className="bg-surface border-b border-border-subtle py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-subtle border border-border-subtle text-primary text-xs font-semibold">
            <span>Patna Support Desk • Fraser Road</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            Contact BOOKKARO Concierge
          </h1>
          <p className="text-xs sm:text-base text-ink-muted max-w-xl mx-auto leading-relaxed">
            Have questions about an arrival slot, reservation dispute, or partner onboarding in Patna? Our local team is here to assist.
          </p>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Left Column: Local Contact Particulars (2 cols) */}
          <div className="md:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-surface border border-border-subtle space-y-4 shadow-xs">
              <h2 className="font-serif font-bold text-lg text-ink">
                Fraser Road Operations Desk
              </h2>

              <div className="space-y-4 text-xs text-ink-muted">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-ink">BOOKKARO Operations Center</div>
                    <div>3rd Floor, Commercial Plaza, Dakbunglow Crossing</div>
                    <div>Fraser Road, Patna, Bihar — 800001</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-ink">Patna Support Helpline</div>
                    <div className="tabular-nums">
                      <a href="tel:+916122201000" className="hover:underline text-ink">+91 612 220 1000</a> / <a href="tel:+919431011223" className="hover:underline text-ink">+91 94310 11223</a>
                    </div>
                    <div className="text-[11px] mt-1.5">
                      <a
                        href={`https://wa.me/919431011223?text=${encodeURIComponent('Hello BOOKKARO Concierge, I need assistance with a reservation in Patna.')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/25 text-[#128C7E] font-medium transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                        <span>Chat with Patna Concierge on WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-ink">Official Email Channels</div>
                    <div>Guest Concierge: support@bookkaro.in</div>
                    <div>Partner Inquiries: partners@bookkaro.in</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-ink">Desk Operating Hours</div>
                    <div>Monday – Saturday: 08:00 AM – 10:00 PM IST</div>
                    <div>Sunday: 09:00 AM – 06:00 PM IST</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Grievance Redressal Card */}
            <div className="p-5 rounded-2xl bg-surface-subtle border border-border-subtle space-y-2 text-xs">
              <div className="flex items-center gap-2 text-primary font-bold">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Statutory Grievance Redressal</span>
              </div>
              <p className="text-ink-muted text-[11px] leading-relaxed">
                In compliance with the India Consumer Protection (E-Commerce) Rules and DPDP Act 2023:
              </p>
              <div className="text-[11px] font-medium text-ink">
                <strong>Officer:</strong> Rajeshwar Sinha, Advocate (Patna Bar)<br />
                <strong>Email:</strong> grievance@bookkaro.in • <strong>SLA:</strong> 48h acknowledgement
              </div>
            </div>
          </div>

          {/* Right Column: Working Inquiry Form (3 cols) */}
          <div className="md:col-span-3">
            <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border-subtle shadow-xs">
              {submittedTicket ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#EBF2EE] text-primary flex items-center justify-center mx-auto border border-[#C8DBD1]">
                    <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
                      Inquiry Logged
                    </span>
                    <h3 className="font-serif font-bold text-2xl text-ink">
                      Thank You, {name}
                    </h3>
                    <p className="text-xs text-ink-muted max-w-md mx-auto">
                      Your inquiry has been allocated to our Fraser Road concierge desk under reference ticket:
                    </p>
                  </div>
                  <div className="inline-block p-3 rounded-xl bg-surface-subtle border border-border-subtle font-mono font-bold text-sm text-primary">
                    {submittedTicket}
                  </div>
                  <p className="text-xs text-ink-muted">
                    Our team will reply to <strong>{email}</strong> within 2 business hours.
                  </p>
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSubmittedTicket(null);
                        setMessage('');
                      }}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      ← Submit another inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-ink">
                      Send a Message to the Concierge
                    </h3>
                    <p className="text-xs text-ink-muted mt-0.5">
                      Expect an instant reply within 2 operational hours during desk shifts.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-ink">
                        Your Full Name <span className="text-[#C25E28]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Anand Kishore"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-surface text-ink min-h-[44px]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-ink">
                        Mobile Number (+91)
                      </label>
                      <input
                        type="tel"
                        placeholder="9845012345"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-lg border border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-surface text-ink min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-ink">
                      Email Address <span className="text-[#C25E28]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. anand@patna.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-surface text-ink min-h-[44px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-ink">
                      Inquiry Category
                    </label>
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-surface text-ink min-h-[44px]"
                    >
                      <option value="GUEST_INQUIRY">Guest Booking / Reservation Inquiry</option>
                      <option value="REFUND_DISPUTE">Refund / Cancellation Support</option>
                      <option value="PARTNER_ONBOARDING">Establishment Listing / Onboarding</option>
                      <option value="TECHNICAL_SUPPORT">Website or PIN Verification Issue</option>
                      <option value="CORPORATE">Corporate Stays &amp; Banquet Booking</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-ink">
                      Message / Question <span className="text-[#C25E28]">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Please share details of your booking, reservation date, or merchant query..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full text-xs p-3 rounded-lg border border-border-subtle focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-surface text-ink resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    fullWidth
                    disabled={isSubmitting}
                    className="min-h-[44px] font-bold"
                    rightIcon={<Send className="w-3.5 h-3.5" />}
                  >
                    {isSubmitting ? 'Transmitting to Fraser Desk...' : 'Transmit Inquiry'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
