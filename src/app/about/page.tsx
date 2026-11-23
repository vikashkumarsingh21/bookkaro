import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ShieldCheck,
  Clock,
  Sparkles,
  HeartHandshake,
  MapPin,
  ArrowRight,
  Building2,
} from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';

export const metadata: Metadata = {
  title: 'About BOOKKARO | Patna-First Local Hospitality Concierge',
  description:
    'Engineered for Patna, Bihar. Discover our mission to elevate local hospitality bookings across Fraser Road, Boring Road, Bailey Road and South Gandhi Maidan.',
  openGraph: {
    title: 'About BOOKKARO • Patna Launch',
    description: 'Patna-first local discovery & guaranteed arrival concierge for Stays, Dining & Wellness.',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      {/* Editorial Hero Header */}
      <section className="bg-surface border-b border-border-subtle py-14 sm:py-20">
        <Reveal className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-subtle border border-border-subtle text-primary text-xs font-semibold">
            <span>BOOKKARO • Patna Launch</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-ink leading-tight">
            Elevating Patna&apos;s Local Hospitality
          </h1>

          <p className="text-sm sm:text-lg text-ink-muted max-w-2xl mx-auto leading-relaxed font-sans">
            We built BOOKKARO to eliminate arrival uncertainty, crowded reception waiting bays, and generic directories—giving guests and Patna venue owners an honest, human-crafted concierge.
          </p>
        </Reveal>
      </section>

      {/* Main Editorial Story */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-16">
        {/* Section 1: The Patna-First Thesis */}
        <Reveal as="section" className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span>Local Thesis</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
            Why Patna Deserved a Dedicated Concierge
          </h2>
          <div className="prose prose-stone text-ink-muted text-sm sm:text-base leading-relaxed space-y-4">
            <p>
              Patna is a city with deep historical hospitality traditions—from landmark heritage suites overlooking South Gandhi Maidan to multi-generation culinary kitchens on Boring Road and Fraser Road. Yet, before BOOKKARO, local citizens and visiting executives had to rely on nationwide delivery apps or informal telephonic inquiries with zero confirmation visibility.
            </p>
            <p>
              Conceived and built from the ground up for Patna, <strong>BOOKKARO</strong> respects local commerce: 100% physically verified Patna venues, guaranteed arrival tokens, and offline 4-digit Venue PIN verification that protects both guests and merchants.
            </p>
          </div>
        </Reveal>

        {/* Section 2: Four Core Pillars */}
        <section className="space-y-6">
          <Reveal>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span>Core Principles</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink mt-1">
              How BOOKKARO Operates
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                icon: ShieldCheck,
                title: '100% Hand-Inspected Quality',
                desc: 'Every listed hotel suite, dining room, and wellness spa undergoes a field visit by our Patna operations team to verify licenses, hygiene standards, and service authenticity.',
              },
              {
                icon: Clock,
                title: 'Zero Arrival Lag (<90s SLA)',
                desc: 'When you request a room or dining table, the venue receptionist receives an instant triage alert with a target confirmation SLA under 90 seconds. No waiting at the lobby.',
              },
              {
                icon: HeartHandshake,
                title: 'Fair Merchant Commercials',
                desc: 'We reject exploitative marketplace take-rates. Patna partners choose between transparent subscription tiers (Free, ₹499/mo, ₹999/mo) or minimal category commissions (10% Hotels, 5% Dining, 10% Salons).',
              },
              {
                icon: Sparkles,
                title: 'Matte Tri-Workspace Architecture',
                desc: 'Zero generic SaaS templates. A warm editorial reading space for guests, a roasted walnut front-desk atelier for receptionists, and high-density tabular controls for governance.',
              },
            ].map((pillar, idx) => {
              const PillarIcon = pillar.icon;
              return (
                <Reveal key={pillar.title} delay={idx * 0.08} className="h-full">
                  <div className="p-6 rounded-2xl bg-surface border border-border-subtle space-y-3 h-full">
                    <div className="w-10 h-10 rounded-xl bg-surface-subtle border border-border-subtle flex items-center justify-center text-primary">
                      <PillarIcon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-serif font-bold text-lg text-ink">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* Section 3: Patna Corridors Active */}
        <Reveal as="section" className="p-8 rounded-2xl bg-surface border border-border-subtle space-y-4">
          <h3 className="font-serif font-bold text-xl text-ink">
            Patna Active Corridors &amp; Hubs
          </h3>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
            BOOKKARO operates with verified establishments across all central, western, and southern zones of Patna, Bihar:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-medium text-ink">
            {[
              'Fraser Road & Dakbunglow (800001)',
              'Boring Road & Canal Crossing (800013)',
              'Kankarbagh Doctors Colony (800020)',
              'Bailey Road & Raja Bazaar (800014)',
              'Patliputra Industrial Area (800013)',
              'South Gandhi Maidan & Heritage (800001)',
              'Danapur & Saguna More (801503)',
              'Rajendra Nagar & Stadium (800016)',
              'Lalganj Highway Corridor (844121)',
            ].map((loc, i) => (
              <div key={i} className="flex items-center gap-1.5 p-2 rounded-lg bg-surface-subtle border border-border-subtle">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">{loc}</span>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Section 4: Call to Action */}
        <Reveal as="section" className="text-center py-6 space-y-4">
          <h3 className="font-serif font-bold text-2xl text-ink">
            Experience Patna Hospitality Done Right
          </h3>
          <p className="text-xs sm:text-sm text-ink-muted max-w-md mx-auto">
            Browse verified suites and tables, or list your establishment with zero upfront fees.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/search?cat=hotels&dest=Patna"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-primary text-primary-fg hover:bg-primary-hover font-bold text-xs transition-colors inline-flex items-center justify-center gap-2"
            >
              <span>Explore Verified Patna Stays</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/partner/register"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-surface border border-border-subtle text-ink hover:border-primary font-bold text-xs transition-colors inline-flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4 text-primary" />
              <span>List Your Establishment</span>
            </Link>
          </div>
        </Reveal>
      </main>
    </div>
  );
}
