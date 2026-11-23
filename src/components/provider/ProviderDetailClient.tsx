'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Star,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  Share2,
  Building2,
  ShieldCheck,
  ChevronLeft,
  UtensilsCrossed,
  Stethoscope,
  Hotel,
  Scissors,
  Wrench,
  Bookmark,
  ExternalLink,
  Navigation,
} from 'lucide-react';
import { MockProvider } from '@/data/mockProviders';
import { savedProvidersService } from '@/services/savedProvidersService';
import {
  CategoryBookingForm,
  BookingFormSubmissionPayload,
} from '@/components/booking/CategoryBookingForm';
import { BookingConfirmationModal } from '@/components/booking/BookingConfirmationModal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';

interface ProviderDetailClientProps {
  provider: MockProvider;
}

type DetailTab = 'services' | 'about' | 'hours' | 'reviews' | 'terms';

const DETAIL_TABS: { id: DetailTab; label: string }[] = [
  { id: 'services', label: 'Services & Pricing' },
  { id: 'about', label: 'About Business' },
  { id: 'hours', label: 'Hours & Location' },
  { id: 'reviews', label: 'Verified Reviews' },
  { id: 'terms', label: 'Cancellation & Rules' },
];

export const ProviderDetailClient: React.FC<ProviderDetailClientProps> = ({
  provider,
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<DetailTab>('services');
  const [bookingPayload, setBookingPayload] = useState<BookingFormSubmissionPayload | null>(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSaved(savedProvidersService.isProviderSaved(provider.id));
    }, 0);
    const unsub = savedProvidersService.subscribe(() => {
      setIsSaved(savedProvidersService.isProviderSaved(provider.id));
    });
    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, [provider.id]);

  const handleToggleSave = () => {
    const nextSaved = savedProvidersService.toggleSaveProvider({
      providerId: provider.id,
      name: provider.name,
      category: provider.category,
      subCategory: provider.subCategory,
      city: provider.city,
      locality: provider.locality,
      rating: provider.rating,
      reviewCount: provider.reviewCount,
      startingPriceInr: provider.startingPriceInr,
      image: provider.images[0] || 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
    });
    setIsSaved(nextSaved);
  };

  const handleInitiateReview = (payload: BookingFormSubmissionPayload) => {
    setBookingPayload(payload);
    setIsConfirmationModalOpen(true);
    setMobileDrawerOpen(false);
  };

  const categoryIcons: Record<string, React.ElementType> = {
    healthcare: Stethoscope,
    hotels: Hotel,
    restaurants: UtensilsCrossed,
    salon: Scissors,
    vehicle_care: Wrench,
  };

  const CategoryIcon = categoryIcons[provider.category] || Building2;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#141413] pb-28 sm:pb-20">
      {/* Breadcrumb & Navigation Bar */}
      <div className="bg-white border-b border-[#E2DDD5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between text-xs text-[#52524E]">
          <div className="flex items-center gap-2">
            <Link
              href="/search"
              className="flex items-center gap-1 font-semibold text-[#141413] hover:text-[#143D2B] transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-[#143D2B]" />
              <span>Back to Search</span>
            </Link>
            <span className="text-[#E2DDD5]">•</span>
            <span>{provider.city}</span>
            <span className="text-[#E2DDD5]">•</span>
            <span className="capitalize">{provider.category.replace('_', ' ')}</span>
            <span className="text-[#E2DDD5] hidden md:inline">•</span>
            <span className="font-medium text-[#141413] hidden md:inline truncate max-w-xs">
              {provider.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleSave}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors
                ${isSaved
                  ? 'border-[#C25E28] bg-[#F3F1EC] text-[#C25E28]'
                  : 'border-[#E2DDD5] bg-[#FAF9F6] text-[#52524E] hover:border-[#143D2B]'
                }
              `}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#C25E28]' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.share) {
                  navigator.share({ title: provider.name, url: window.location.href });
                } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E2DDD5] bg-[#FAF9F6] text-xs font-semibold text-[#52524E] hover:border-[#143D2B] transition-colors"
              title="Share Provider"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN: HERO GALLERY, METADATA & CONTENT (8 Cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* 1. PHOTO GALLERY (Constrained aspect-[16/10] frame) */}
            <div className="space-y-3">
              <div className="group relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-[#F3F1EC] border border-[#E2DDD5]">
                <Image
                  src={provider.images[selectedPhotoIndex] || provider.images[0]}
                  alt={provider.name}
                  fill
                  priority
                  className="object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                  sizes="(max-width: 1024px) 100vw, 800px"
                />

                {/* Badges on Gallery Hero */}
                <div className="absolute top-3.5 left-3.5 flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-[#141413]/85 text-white text-[11px] font-medium uppercase tracking-wider flex items-center gap-1.5">
                    <CategoryIcon className="w-3.5 h-3.5 text-white" />
                    <span>{provider.category.replace('_', ' ')}</span>
                  </span>

                  {provider.isSponsored && (
                    <span className="px-2.5 py-1 rounded-full bg-[#141413] text-white text-[10px] font-semibold uppercase tracking-wider">
                      Sponsored
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3.5 right-3.5 px-2.5 py-1 rounded-md bg-[#141413]/80 text-white text-[11px] font-medium tabular-nums">
                  {selectedPhotoIndex + 1} of {provider.images.length} Photos
                </div>
              </div>

              {/* Thumbnails Row */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {provider.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`
                      relative w-20 aspect-[16/10] rounded-lg overflow-hidden border-2 transition-all shrink-0
                      ${selectedPhotoIndex === idx
                        ? 'border-[#143D2B]'
                        : 'border-transparent opacity-75 hover:opacity-100'
                      }
                    `}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* 2. PROVIDER TITLE, VERIFIED BADGE & QUICK RATINGS */}
            <div className="bg-white rounded-2xl border border-[#E2DDD5] p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink tracking-tight">
                      {provider.name}
                    </h1>
                  </div>
                  <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                    {provider.tagline}
                  </p>
                </div>

                {/* Rating Badge */}
                <div className="flex items-center gap-2 bg-surface-subtle px-3.5 py-2 rounded-xl text-ink shrink-0 border border-border-subtle tabular-nums">
                  <Star className="w-5 h-5 fill-[#7A5B22] text-[#7A5B22]" />
                  <div>
                    <div className="font-serif font-bold text-lg text-ink leading-none">
                      {provider.rating}
                    </div>
                    <div className="text-[11px] font-normal text-ink-muted mt-0.5">
                      {provider.reviewCount} verified reviews
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust & Location Metadata Strip */}
              <div className="pt-4 border-t border-[#E2DDD5] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Verified Badge in Forest Green */}
                <div className="flex items-center gap-2 text-[#143D2B]">
                  <div className="w-8 h-8 rounded-lg bg-[#EBF2EE] border border-[#C8DBD1] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-[#143D2B]" />
                  </div>
                  <div>
                    <span className="font-bold block text-[#141413]">KYC Verified Merchant</span>
                    <span className="text-[#52524E] text-[11px]">Trade &amp; Address Certified</span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-[#141413]">
                  <div className="w-8 h-8 rounded-lg bg-[#F3F1EC] border border-[#E2DDD5] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-[#143D2B]" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-bold block truncate">{provider.locality}, {provider.city}</span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${provider.name}, ${provider.locality}, Patna, Bihar`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#143D2B] font-semibold hover:underline inline-flex items-center gap-0.5 shrink-0"
                      >
                        <span>Directions</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <span className="text-[#52524E] text-[11px]">PIN {provider.pincode}</span>
                  </div>
                </div>

                {/* Next Slot */}
                <div className="flex items-center gap-2 text-[#143D2B]">
                  <div className="w-8 h-8 rounded-lg bg-[#EBF2EE] border border-[#C8DBD1] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-[#143D2B]" />
                  </div>
                  <div>
                    <span className="font-bold block text-[#141413]">Next Available Slot</span>
                    <span className="text-[#52524E] text-[11px]">{provider.nextAvailableSlot}</span>
                  </div>
                </div>
              </div>

              {/* Badges pills */}
              <div className="pt-2 flex flex-wrap gap-1.5">
                {provider.badges.map((b, i) => (
                  <Badge key={i} variant="sand" size="sm">
                    {b}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 3. CONTENT TABS: SERVICES & PACKAGES, ABOUT, HOURS, REVIEWS, TERMS */}
            <div className="bg-white rounded-2xl border border-[#E2DDD5] overflow-hidden">
              {/* Tab Navigation Strip */}
              <div className="flex items-center border-b border-[#E2DDD5] bg-[#FAF9F6] overflow-x-auto">
                {DETAIL_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      px-4.5 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2
                      ${activeTab === tab.id
                        ? 'border-[#143D2B] text-[#143D2B] bg-white'
                        : 'border-transparent text-[#52524E] hover:text-[#141413]'
                      }
                    `}
                  >
                    {tab.id === 'reviews' ? `Reviews (${provider.reviewCount})` : tab.label}
                  </button>
                ))}
              </div>

              {/* Tab 1: Services & Pricing */}
              {activeTab === 'services' && (
                <div className="p-5 sm:p-6 space-y-4">
                  <div>
                    <h3 className="font-heading font-bold text-base text-[#141413]">
                      Available Services &amp; Packages
                    </h3>
                    <p className="text-xs text-[#52524E] mt-0.5">
                      Select services in the booking card to schedule your slot request.
                    </p>
                  </div>

                  <div className="divide-y divide-[#E2DDD5]">
                    {provider.services.map((srv) => (
                      <div key={srv.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="font-heading font-semibold text-sm text-[#141413]">
                            {srv.name}
                          </div>
                          <p className="text-xs text-[#52524E] leading-relaxed">
                            {srv.description}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-[#52524E] pt-1">
                            <span className="flex items-center gap-1 tabular-nums font-medium">
                              <Clock className="w-3.5 h-3.5 text-[#143D2B]" />
                              <span>{srv.durationMinutes} mins</span>
                            </span>
                            <span>•</span>
                            <span>Pay at venue counter upon completion</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-heading font-bold text-base text-[#143D2B] tabular-nums">
                            ₹{srv.price}
                          </div>
                          <span className="text-[10px] text-[#52524E] uppercase tracking-wider">
                            Rate
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add-ons list if available */}
                  {provider.addons && provider.addons.length > 0 && (
                    <div className="pt-6 border-t border-[#E2DDD5] space-y-3">
                      <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-[#52524E]">
                        Optional Service Add-ons
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {provider.addons.map((add) => (
                          <div key={add.id} className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E2DDD5] flex justify-between items-start">
                            <div>
                              <div className="text-xs font-semibold text-[#141413]">{add.name}</div>
                              <div className="text-[10px] text-[#52524E] mt-0.5">{add.description}</div>
                            </div>
                            <span className="font-semibold text-xs text-[#143D2B] tabular-nums ml-2">
                              +₹{add.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: About Business */}
              {activeTab === 'about' && (
                <div className="p-5 sm:p-6 space-y-5">
                  <div>
                    <h3 className="font-heading font-bold text-base text-[#141413]">
                      About {provider.name}
                    </h3>
                    <p className="text-xs text-[#52524E] mt-1 leading-relaxed">
                      {provider.description}
                    </p>
                  </div>

                  {/* Registered Legal Details */}
                  <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E2DDD5] space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-[#141413] mb-1">
                      <ShieldCheck className="w-4 h-4 text-[#143D2B]" />
                      <span>Commercial &amp; Compliance Credentials</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#52524E]">
                      <div>
                        <span className="font-medium text-[#141413]">Legal Name:</span>{' '}
                        {provider.legalBusinessName}
                      </div>
                      <div>
                        <span className="font-medium text-[#141413]">GSTIN:</span>{' '}
                        {provider.gstin || 'Registered Taxpayer (Bihar)'}
                      </div>
                      <div>
                        <span className="font-medium text-[#141413]">Operating Locality:</span>{' '}
                        {provider.locality}, {provider.city}
                      </div>
                      <div>
                        <span className="font-medium text-[#141413]">Postal PIN:</span>{' '}
                        {provider.pincode}
                      </div>
                    </div>
                  </div>

                  {/* Doctors / Staff Roster if present */}
                  {provider.doctors && provider.doctors.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-[#52524E]">
                        Senior Medical Faculty
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {provider.doctors.map((doc) => (
                          <div key={doc.id} className="p-3.5 rounded-xl border border-[#E2DDD5] bg-white flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#EBF2EE] border border-[#C8DBD1] text-[#143D2B] flex items-center justify-center font-bold text-xs shrink-0">
                              {doc.name.split(' ')[1]?.[0] || 'D'}
                            </div>
                            <div>
                              <div className="font-semibold text-xs text-[#141413]">{doc.name}</div>
                              <div className="text-[11px] text-[#52524E]">{doc.specialty} • {doc.qualification}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Room Types if hotel */}
                  {provider.roomTypes && provider.roomTypes.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-[#52524E]">
                        Suites &amp; Room Inventory
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {provider.roomTypes.map((rt) => (
                          <div key={rt.id} className="p-3.5 rounded-xl border border-[#E2DDD5] bg-white space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-xs text-[#141413]">{rt.name}</span>
                              <span className="font-bold text-xs text-[#143D2B] tabular-nums">₹{rt.pricePerNight}/night</span>
                            </div>
                            <p className="text-[11px] text-[#52524E]">{rt.bedType} • Max {rt.maxGuests} Guests</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Hours & Location */}
              {activeTab === 'hours' && (
                <div className="p-5 sm:p-6 space-y-5">
                  <div>
                    <h3 className="font-heading font-bold text-base text-[#141413]">
                      Operating Schedule &amp; Address
                    </h3>
                    <p className="text-xs text-[#52524E] mt-0.5">
                      Check daily operational timing and exact Patna location before your visit.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E2DDD5] space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#143D2B]">
                        <Clock className="w-4 h-4 text-[#143D2B]" />
                        <span>Timings</span>
                      </div>
                      <div className="text-xs space-y-1 text-[#52524E]">
                        <div>
                          <span className="font-medium text-[#141413]">Days:</span> {provider.operatingHours.days}
                        </div>
                        <div>
                          <span className="font-medium text-[#141413]">Hours:</span> {provider.operatingHours.hours}
                        </div>
                        {provider.operatingHours.sundayHours && (
                          <div>
                            <span className="font-medium text-[#141413]">Sunday:</span> {provider.operatingHours.sundayHours}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E2DDD5] space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#143D2B]">
                        <MapPin className="w-4 h-4 text-[#143D2B]" />
                        <span>Patna Address</span>
                      </div>
                      <p className="text-xs text-[#52524E] leading-relaxed">
                        {provider.address}
                      </p>
                      <div className="text-[11px] text-[#52524E]">
                        Locality: <strong className="text-[#141413]">{provider.locality}</strong> • PIN <strong className="text-[#141413]">{provider.pincode}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Direct Contact Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${provider.name}, ${provider.address || provider.locality}, Patna, Bihar`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E2DDD5] bg-white text-xs font-medium text-[#141413] hover:border-[#143D2B] transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[#143D2B]" />
                      <span>Get Directions</span>
                    </a>
                    <a
                      href={`tel:${provider.phone}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E2DDD5] bg-white text-xs font-medium text-[#141413] hover:border-[#143D2B] transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#143D2B]" />
                      <span>Call {provider.phone}</span>
                    </a>
                    {provider.email && (
                      <a
                        href={`mailto:${provider.email}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E2DDD5] bg-white text-xs font-medium text-[#141413] hover:border-[#143D2B] transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#143D2B]" />
                        <span>Email Desk</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 4: Verified Reviews */}
              {activeTab === 'reviews' && (
                <div className="p-5 sm:p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-heading font-bold text-base text-[#141413]">
                        Verified Customer Reviews
                      </h3>
                      <p className="text-xs text-[#52524E] mt-0.5">
                        Authentic feedback from verified customers who booked through BOOKKARO.
                      </p>
                    </div>
                    <div className="flex items-center gap-1 font-serif font-bold text-xl text-ink tabular-nums">
                      <Star className="w-5 h-5 fill-[#7A5B22] text-[#7A5B22]" />
                      <span>{provider.rating}</span>
                    </div>
                  </div>

                  <div className="space-y-4 divide-y divide-[#E2DDD5]">
                    {provider.reviews.map((rev) => (
                      <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#141413]">{rev.authorName}</span>
                            <span className="text-[#52524E]">({rev.city})</span>
                            {rev.isVerifiedBooking && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#143D2B] bg-[#EBF2EE] px-2 py-0.5 rounded-full border border-[#C8DBD1]">
                                <CheckCircle2 className="w-3 h-3 text-[#143D2B]" />
                                <span>Verified Booking</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[#52524E] text-[11px] tabular-nums">{rev.date}</span>
                        </div>

                        <div className="flex items-center gap-1 text-[#7A5B22]">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < Math.floor(rev.rating)
                                ? 'fill-[#7A5B22] text-[#7A5B22]'
                                : 'text-border-subtle'
                                }`}
                            />
                          ))}
                          <span className="text-xs font-semibold text-[#141413] ml-1.5">{rev.serviceBooked}</span>
                        </div>

                        <p className="text-xs text-[#52524E] leading-relaxed">
                          &ldquo;{rev.comment}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 5: Cancellation & Rules */}
              {activeTab === 'terms' && (
                <div className="p-5 sm:p-6 space-y-4">
                  <div>
                    <h3 className="font-heading font-bold text-base text-[#141413]">
                      Transparent Cancellation &amp; Arrival Rules
                    </h3>
                    <p className="text-xs text-[#52524E] mt-0.5">
                      Clear cancellation policies with zero hidden surcharges or penalties.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E2DDD5] space-y-1.5">
                      <div className="font-semibold text-xs uppercase tracking-wider text-[#143D2B]">
                        Cancellation &amp; Rescheduling Policy
                      </div>
                      <p className="text-xs text-[#52524E] leading-relaxed">
                        {provider.cancellationPolicy}
                      </p>
                    </div>

                    {provider.disclaimer && (
                      <div className="p-4 rounded-xl bg-[#F3F1EC] border border-[#E2DDD5] space-y-1.5">
                        <div className="font-semibold text-xs uppercase tracking-wider text-[#C25E28]">
                          Category Specific Notice
                        </div>
                        <p className="text-xs text-[#52524E] leading-relaxed">
                          {provider.disclaimer}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: STICKY CATEGORY-SPECIFIC BOOKING CARD (4 Cols) */}
          {/* ========================================================= */}
          <div className="hidden lg:block lg:col-span-5 xl:col-span-4 sticky top-24">
            <CategoryBookingForm
              provider={provider}
              onInitiateReview={handleInitiateReview}
            />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MOBILE STICKY BOTTOM BAR (< 1024px) */}
      {/* ========================================================= */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#E2DDD5] p-3 sm:p-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#52524E] block">
            Prices Starting At
          </span>
          <div className="font-heading font-bold text-xl text-[#141413] tabular-nums">
            ₹{provider.startingPriceInr}
          </div>
          <span className="text-[10px] text-[#52524E] block truncate max-w-[150px]">
            {provider.nextAvailableSlot}
          </span>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setMobileDrawerOpen(true)}
          className="font-semibold"
        >
          Request Slot
        </Button>
      </div>

      {/* Mobile Booking Drawer Primitive */}
      <Drawer
        isOpen={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        side="bottom"
        title={provider.name}
        description={`${provider.locality}, ${provider.city} • PIN ${provider.pincode}`}
      >
        <div className="p-1">
          <CategoryBookingForm
            provider={provider}
            onInitiateReview={handleInitiateReview}
          />
        </div>
      </Drawer>

      {/* ========================================================= */}
      {/* MULTI-STEP REQUEST CONFIRMATION MODAL & RECEIPT SCREEN */}
      {/* ========================================================= */}
      {isConfirmationModalOpen && bookingPayload && (
        <BookingConfirmationModal
          isOpen={isConfirmationModalOpen}
          onClose={() => setIsConfirmationModalOpen(false)}
          bookingPayload={bookingPayload}
          providerPhone={provider.phone}
          providerAddress={`${provider.address}, PIN ${provider.pincode}`}
        />
      )}
    </div>
  );
};
