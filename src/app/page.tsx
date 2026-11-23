'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Star,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { BookingCategory } from '@/types/booking';
import { PATNA_LOCALITIES } from '@/types/bookkaro';
import { MOCK_PROVIDERS_DATA } from '@/data/mockProviders';
import { UnifiedSearchBar } from '@/components/home/UnifiedSearchBar';
import { Reveal } from '@/components/motion/Reveal';

// Strict 3-category launch scope: hotels, restaurants, salon
const HOSPITALITY_CATEGORIES: BookingCategory[] = ['hotels', 'restaurants', 'salon'];

export default function HomePage() {
  // Verified hospitality venues in Patna
  const hospitalityProviders = useMemo(() => {
    return MOCK_PROVIDERS_DATA.filter((p) =>
      HOSPITALITY_CATEGORIES.includes(p.category)
    );
  }, []);

  // Live Category Counts across Patna
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      hotels: 0,
      restaurants: 0,
      salon: 0,
    };
    for (const p of hospitalityProviders) {
      if (counts[p.category] !== undefined) {
        counts[p.category] += 1;
      }
    }
    return counts;
  }, [hospitalityProviders]);

  // Featured 6 verified hospitality establishments
  const featuredVenues = useMemo(() => {
    return hospitalityProviders.slice(0, 6);
  }, [hospitalityProviders]);

  // 3 Editorial Category Cards
  const editorialCategories = [
    {
      id: 'hotels' as BookingCategory,
      title: 'Hotels & Stays',
      subtitle: 'Heritage suites, boutique rooms & executive city suites',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
      tag: 'Verified Accommodations',
      dest: 'Fraser Road, Patna',
    },
    {
      id: 'restaurants' as BookingCategory,
      title: 'Dining & Cafes',
      subtitle: 'Champaran Ahuna handi, rooftop terraces & gourmet tables',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80',
      tag: 'Table Reservations',
      dest: 'Boring Road, Patna',
    },
    {
      id: 'salon' as BookingCategory,
      title: 'Salons & Spas',
      subtitle: 'Ayurvedic wellness, bridal artistry & botanical hair care',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=80',
      tag: 'Grooming & Therapies',
      dest: 'Patliputra Colony, Patna',
    },
  ];

  // 5-Step Editorial Workflow (Preserving truthful REQUESTED vs CONFIRMED status)
  const editorialSteps = [
    {
      number: '01',
      title: 'Search Intent',
      detail: 'Choose your desired Patna locality (Fraser Rd, Boring Rd, Bailey Rd) or use live GPS.',
    },
    {
      number: '02',
      title: 'Compare & Curate',
      detail: 'Transparent radial ranking by physical distance, authentic photos, and starting INR rates.',
    },
    {
      number: '03',
      title: 'Request Slot',
      detail: 'Select your preferred time. Generates an unambiguous REQUESTED token sent to the venue.',
    },
    {
      number: '04',
      title: 'Venue Confirms',
      detail: 'Patna partner confirms your reservation within an average 90-second response SLA.',
    },
    {
      number: '05',
      title: 'Arrive & Complete',
      detail: 'Direct arrival with 4-digit venue verification PIN. Zero queue congestion.',
    },
  ];

  return (
    <div className="min-h-screen bg-canvas text-ink pb-24">
      {/* =========================================================
          1. ANTI-AI EDITORIAL HERO WITH LOW-KEY PHOTOGRAPHY
          ========================================================= */}
      <section className="relative bg-[#191613] text-[#FCFBF8] pt-16 sm:pt-24 pb-20 sm:pb-28 overflow-hidden border-b border-[#2A241F]">
        {/* Layer 1: Low-Key Ambient Hospitality Photograph */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80"
            alt="Warm ambient boutique hotel lobby in Patna"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-30 select-none pointer-events-none"
          />
          {/* Layer 2: Flat Matte Espresso Scrim (Verified 8.62:1 AAA Contrast) */}
          <div className="absolute inset-0 bg-[#191613]/65 pointer-events-none" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            {/* Top Editorial Kicker: Small tracked uppercase with thin Champagne Brass hairline rule (NO pill border) */}
            <div className="inline-flex items-center gap-3">
              <span className="w-8 h-[1px] bg-[#C5A56A]" />
              <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-[#D6CEC2]">
                Patna Concierge • Verified Local Hospitality
              </span>
              <span className="w-8 h-[1px] bg-[#C5A56A]" />
            </div>

            {/* Display Headline in font-serif (Playfair Display) */}
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#FCFBF8] !text-[#FCFBF8] leading-[1.15]">
              Curated Stays, Dining &amp; Salons in Patna.
            </h1>

            {/* Calm Subhead in Warm Sand */}
            <p className="text-sm sm:text-base md:text-lg text-[#D6CEC2] max-w-2xl mx-auto leading-relaxed font-normal">
              Direct slot requests with verified boutique stays, fine dining tables &amp; grooming studios across Fraser Road, Boring Road, Bailey Road &amp; Patliputra Colony.
            </p>
          </div>

          {/* Unified Dual-Intent Search Bar: Anchored on crisp Warm Ivory card */}
          <div className="mt-10 sm:mt-12 max-w-4xl mx-auto">
            <UnifiedSearchBar initialDestination="Patna" initialRadius={10} />
          </div>
        </div>
      </section>

      {/* =========================================================
          2. 3 LARGE EDITORIAL CATEGORY CARDS (16:10 PHOTOGRAPHY)
          ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 sm:-mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {editorialCategories.map((cat, index) => {
            const count = categoryCounts[cat.id] || 0;
            return (
              <Reveal key={cat.id} delay={index * 0.08} className="h-full">
                <Link
                  href={`/search?cat=${cat.id}&dest=Patna`}
                  className="group bg-surface rounded-[var(--radius-card)] border border-border-subtle overflow-hidden hover:border-primary transition-all duration-200 flex flex-col h-full shadow-[0_2px_8px_rgba(20,20,19,0.03)]"
                >
                  {/* 16:10 Image Container */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-subtle">
                    <Image
                      src={cat.image}
                      alt={cat.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                    {/* Top Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-[var(--radius-control)] bg-black/60 backdrop-blur-none text-[#FCFBF8] text-[10px] font-semibold tracking-wider uppercase border border-white/20">
                        {cat.tag}
                      </span>
                    </div>

                    {/* Bottom Counter */}
                    <div className="absolute bottom-3 right-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/90 text-ink text-xs font-bold tabular-nums">
                        {count} Patna Venues
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-ink group-hover:text-primary transition-colors">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                        {cat.subtitle}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs font-semibold text-primary">
                      <span>Explore Collection</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* =========================================================
          3. FEATURED VERIFIED HOSPITALITY VENUES IN PATNA
          ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent mb-1.5">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span>Patna Curated Directory</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink tracking-tight">
                Featured Verified Establishments
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted mt-1">
                Hand-inspected hotels, dining rooms &amp; wellness sanctuaries with real-time arrival slots
              </p>
            </div>

            <Link
              href="/search?dest=Patna"
              className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
            >
              <span>Browse Full Directory</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </Reveal>

        {/* 3-Column Responsive Grid (1 col mobile, 2 col tablet, 3 col desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredVenues.map((provider, index) => {
            const primaryImage =
              provider.images[0] ||
              'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';

            return (
              <Reveal key={provider.id} delay={index * 0.06} className="h-full">
                <Link
                  href={`/provider/${provider.id}`}
                  className="group bg-surface rounded-[var(--radius-card)] border border-border-subtle overflow-hidden hover:border-primary transition-all duration-200 flex flex-col h-full shadow-[0_1px_4px_rgba(20,20,19,0.02)]"
                >
                  {/* Image Aspect Box */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-subtle">
                    <Image
                      src={primaryImage}
                      alt={provider.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                    {/* Top Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-0.5 rounded-[var(--radius-control)] bg-black/60 text-[#FCFBF8] text-[10px] font-semibold uppercase tracking-wider">
                        {provider.category.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Verified KYC Pill */}
                    {provider.isVerified && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-0.5 rounded-full bg-[#163829]/90 text-[#FCFBF8] text-[10px] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#C5A56A]" />
                          <span>Verified</span>
                        </span>
                      </div>
                    )}

                    {/* Locality & Distance */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-[#FCFBF8]">
                      <span className="flex items-center gap-1 truncate font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#C5A56A] shrink-0" />
                        <span className="truncate">{provider.locality}, Patna</span>
                      </span>
                      {provider.calculatedDistanceKm !== undefined && (
                        <span className="tabular-nums font-semibold shrink-0 bg-black/50 px-2 py-0.5 rounded">
                          {provider.calculatedDistanceKm.toFixed(1)} km
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif font-bold text-base text-ink group-hover:text-primary transition-colors leading-snug">
                          {provider.name}
                        </h3>
                        {/* Antique Brass Rating */}
                        <div className="flex items-center gap-1 text-xs font-bold text-[#7A5B22] shrink-0">
                          <Star className="w-3.5 h-3.5 fill-[#7A5B22] text-[#7A5B22]" />
                          <span className="tabular-nums">{provider.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      <p className="text-xs text-ink-muted line-clamp-2 mt-1 leading-relaxed">
                        {provider.tagline || provider.description}
                      </p>
                    </div>

                    {/* Next slot badge & Starting rate */}
                    <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-ink-muted">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span className="truncate max-w-[130px]">{provider.nextAvailableSlot}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-ink-muted block uppercase">From</span>
                        <span className="font-bold text-sm text-ink tabular-nums">
                          ₹{provider.startingPriceInr.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* =========================================================
          4. 5-STEP EDITORIAL WORKFLOW STRIP (HAIRLINE DIVIDERS)
          ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-20">
        <Reveal>
          <div className="bg-surface rounded-[var(--radius-card)] border border-border-subtle p-6 sm:p-10 shadow-[0_1px_4px_rgba(20,20,19,0.02)]">
            <div className="max-w-2xl mb-8">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent block mb-1">
                Transparent Reservation Flow
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink">
                How BOOKKARO Concierge Works
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
                Unambiguous booking lifecycle: Your slot begins as <strong className="text-ink">Requested</strong> and transitions to <strong className="text-primary">Confirmed</strong> once acknowledged by the Patna venue.
              </p>
            </div>

            {/* 5 Steps separated by thin hairline rules */}
            <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-border-subtle">
              {editorialSteps.map((step, index) => (
                <Reveal key={step.number} delay={index * 0.07}>
                  <div className="py-4 md:py-0 md:px-5 first:pl-0 last:pr-0 space-y-2">
                    <span className="text-xs font-serif font-black text-accent block">
                      {step.number}
                    </span>
                    <h3 className="font-bold text-sm text-ink">
                      {step.title}
                    </h3>
                    <p className="text-xs text-ink-muted leading-relaxed">
                      {step.detail}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* =========================================================
          5. PATNA LOCALITIES FOOTER DISCOVERY STRIP
          ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16">
        <Reveal>
          <div className="p-6 bg-surface-subtle rounded-[var(--radius-card)] border border-border-subtle">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-primary" />
                <h3 className="font-serif font-bold text-sm text-ink">
                  Patna Urban &amp; Corridor Discovery Hubs
                </h3>
              </div>
              <span className="text-xs text-ink-muted">
                Postal Index Coverage: 800001 – 844121
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {PATNA_LOCALITIES.map((loc) => (
                <Link
                  key={loc.name}
                  href={`/search?dest=${encodeURIComponent(loc.name + ', Patna')}&radius=10`}
                  className="px-3 py-1.5 rounded-[var(--radius-control)] bg-surface text-ink text-xs font-medium border border-border-subtle hover:border-primary transition-colors flex items-center gap-1.5"
                >
                  <span>{loc.name}</span>
                  <span className="text-[10px] text-ink-muted font-mono">{loc.pincode}</span>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
