'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  MapPin,
  SlidersHorizontal,
  Star,
  CheckCircle2,
  Clock,
  Compass,
  Phone,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { BookingCategory } from '@/types/booking';
import { PATNA_LOCALITIES } from '@/types/bookkaro';
import { MockProvider } from '@/data/mockProviders';
import { executeDiscoverySearch } from '@/lib/searchRanking';
import { Button, Badge, Card, Input, Modal, Drawer, SkeletonLoader } from '@/components/ui';
import { Reveal } from '@/components/motion/Reveal';

interface SearchInnerProps {
  queryParam: string;
  catParam: BookingCategory | 'all';
  destParam: string;
  nearMeParam: boolean;
  radiusParam: number;
  dateParam: string;
}

const HOSPITALITY_CATEGORIES: BookingCategory[] = ['hotels', 'restaurants', 'salon'];

function SearchPageContentInner({
  queryParam,
  catParam,
  destParam,
  nearMeParam,
  radiusParam,
  dateParam,
}: SearchInnerProps) {
  // State initialized directly from props (remounted cleanly via key on URL change)
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedCategory, setSelectedCategory] = useState<BookingCategory | 'all'>(catParam);
  const [destinationInput, setDestinationInput] = useState(destParam);
  const [isNearMe, setIsNearMe] = useState(nearMeParam);
  const [radiusKm, setRadiusKm] = useState<number>(radiusParam);
  const [selectedDate] = useState<string>(dateParam);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [openNowOnly, setOpenNowOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<
    'relevance' | 'distance' | 'rating' | 'price_asc' | 'price_desc'
  >('relevance');

  // Perceived performance / transition loading state
  const [isFiltering, setIsFiltering] = useState(false);

  // Mobile Filter Drawer state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Modal Booking State
  const [selectedProviderForBooking, setSelectedProviderForBooking] =
    useState<MockProvider | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Active filter count calculation
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (minRating > 0) count++;
    if (maxPrice < 10000) count++;
    if (verifiedOnly) count++;
    if (openNowOnly) count++;
    if (radiusKm !== 25) count++;
    if (isNearMe) count++;
    return count;
  }, [selectedCategory, minRating, maxPrice, verifiedOnly, openNowOnly, radiusKm, isNearMe]);

  // Execute ranking & filtering with zero lag
  const rawSearchResult = useMemo(() => {
    return executeDiscoverySearch({
      query: searchQuery,
      category: selectedCategory,
      destinationInput: isNearMe ? '' : destinationInput,
      isNearMe,
      radiusKm,
      selectedDate,
      minRating,
      maxPriceInr: maxPrice < 10000 ? maxPrice : undefined,
      verifiedOnly,
      openNowOnly,
      sortBy,
    });
  }, [
    searchQuery,
    selectedCategory,
    destinationInput,
    isNearMe,
    radiusKm,
    selectedDate,
    minRating,
    maxPrice,
    verifiedOnly,
    openNowOnly,
    sortBy,
  ]);

  // Lock customer search results strictly to Patna hospitality categories
  const searchResult = useMemo(() => {
    const hospitalityProviders = rawSearchResult.providers.filter((p) =>
      HOSPITALITY_CATEGORIES.includes(p.category)
    );
    return {
      ...rawSearchResult,
      providers: hospitalityProviders,
      totalMatches: hospitalityProviders.length,
    };
  }, [rawSearchResult]);

  // Simulated rapid micro-transition for filter clicks to demonstrate zero layout shift
  const handleFilterChange = (callback: () => void) => {
    setIsFiltering(true);
    callback();
    setTimeout(() => {
      setIsFiltering(false);
    }, 160);
  };

  const handleResetFilters = () => {
    handleFilterChange(() => {
      setSelectedCategory('all');
      setRadiusKm(25);
      setMinRating(0);
      setMaxPrice(10000);
      setVerifiedOnly(false);
      setOpenNowOnly(false);
      setIsNearMe(false);
      setDestinationInput('Patna');
      setSearchQuery('');
    });
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingConfirmed(true);
    setTimeout(() => {
      setBookingConfirmed(false);
      setIsBookingModalOpen(false);
    }, 1500);
  };

  const categories = [
    { id: 'all', label: 'All Curations' },
    { id: 'hotels', label: 'Hotels & Stays' },
    { id: 'restaurants', label: 'Dining & Cafes' },
    { id: 'salon', label: 'Salons & Spas' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#141413] pb-24">
      {/* Top Search & Destination Summary Bar */}
      <section className="bg-white border-b border-[#E2DDD5] sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Destination & Radius Indicator */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F3F1EC] border border-[#E2DDD5] text-xs font-medium text-[#141413]">
                <MapPin className="w-3.5 h-3.5 text-[#143D2B]" />
                <span>
                  {isNearMe ? (
                    <>
                      Near Me <span className="font-normal">(Fraser Rd GPS)</span>
                    </>
                  ) : (
                    <>
                      Target: <span className="underline decoration-[#143D2B]">{searchResult.effectiveDestination.displayText}</span>
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F3F1EC] border border-[#E2DDD5] text-xs font-semibold text-[#143D2B] tabular-nums">
                <Compass className="w-3.5 h-3.5" />
                <span>Within {radiusKm} km radius</span>
              </div>

              <span className="text-xs text-[#52524E] hidden sm:inline tabular-nums">
                • {searchResult.totalMatches} verified providers found
              </span>
            </div>

            {/* Quick Sort Dropdown + Mobile Filter Sheet Trigger */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2DDD5] bg-[#FAF9F6] text-xs font-medium text-[#141413] hover:border-[#143D2B]"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#143D2B]" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#143D2B] text-white text-[10px] font-bold tabular-nums">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[#52524E] hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    handleFilterChange(() =>
                      setSortBy(
                        e.target.value as
                        | 'relevance'
                        | 'distance'
                        | 'rating'
                        | 'price_asc'
                        | 'price_desc'
                      )
                    )
                  }
                  className="px-2.5 py-1.5 rounded-lg border border-[#E2DDD5] bg-white text-xs font-medium text-[#141413] focus:outline-none focus:ring-1 focus:ring-[#143D2B]"
                >
                  <option value="relevance">Relevance &amp; Sponsored First</option>
                  <option value="distance">Distance: Nearest First</option>
                  <option value="rating">Rating: Highest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Layout: Desktop Sidebar Filters + Provider Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ========================================================= */}
          {/* DESKTOP FILTER SIDEBAR (Sticky) */}
          {/* ========================================================= */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-36 bg-white rounded-xl border border-[#E2DDD5] p-5 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2DDD5]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#143D2B]" />
                <h3 className="font-heading font-semibold text-sm text-[#141413]">
                  Filter Discovery
                </h3>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-semibold text-[#143D2B] hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All</span>
              </button>
            </div>

            {/* Filter 1: Destination / Mode Switcher */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#52524E]">
                Discovery Location
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-[#FAF9F6] border border-[#E2DDD5]">
                <button
                  type="button"
                  onClick={() => handleFilterChange(() => setIsNearMe(false))}
                  className={`
                    py-1.5 text-xs font-medium rounded-md transition-all
                    ${!isNearMe
                      ? 'bg-[#143D2B] text-white'
                      : 'text-[#52524E] hover:text-[#141413]'
                    }
                  `}
                >
                  Destination
                </button>
                <button
                  type="button"
                  onClick={() => handleFilterChange(() => setIsNearMe(true))}
                  className={`
                    py-1.5 text-xs font-medium rounded-md transition-all
                    ${isNearMe
                      ? 'bg-[#143D2B] text-white'
                      : 'text-[#52524E] hover:text-[#141413]'
                    }
                  `}
                >
                  Near Me (GPS)
                </button>
              </div>

              {!isNearMe && (
                <div className="pt-1.5 space-y-2">
                  <input
                    type="text"
                    list="desktop-patna-localities"
                    value={destinationInput}
                    onChange={(e) => setDestinationInput(e.target.value)}
                    placeholder="Locality or PIN (e.g. Boring Road, 800001)"
                    className="w-full text-xs font-medium px-3 py-2 rounded-lg bg-white border border-[#E2DDD5] focus:outline-none focus:ring-1 focus:ring-[#143D2B]"
                  />
                  <datalist id="desktop-patna-localities">
                    {PATNA_LOCALITIES.map((loc) => (
                      <option
                        key={loc.name}
                        value={`${loc.name}, Patna (${loc.pincode})`}
                      />
                    ))}
                  </datalist>

                  <div className="flex flex-wrap gap-1">
                    {['Patna', 'Boring Road', 'Kankarbagh', 'Bailey Road', 'Lalganj', '800001'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() =>
                          handleFilterChange(() => setDestinationInput(preset))
                        }
                        className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${destinationInput.toLowerCase().includes(preset.toLowerCase())
                          ? 'bg-[#143D2B] text-white border-[#143D2B]'
                          : 'bg-[#FAF9F6] border-[#E2DDD5] text-[#52524E] hover:border-[#143D2B]'
                          }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filter 2: Category */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#52524E]">
                Category
              </label>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() =>
                      handleFilterChange(() =>
                        setSelectedCategory(cat.id as BookingCategory | 'all')
                      )
                    }
                    className={`
                      w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors
                      ${selectedCategory === cat.id
                        ? 'bg-[#F3F1EC] text-[#143D2B] font-semibold border border-[#E2DDD5]'
                        : 'text-[#52524E] hover:bg-[#FAF9F6]'
                      }
                    `}
                  >
                    <span>{cat.label}</span>
                    {selectedCategory === cat.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#143D2B]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter 3: Radius Slider & Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#52524E]">
                  Max Radius
                </label>
                <span className="text-xs font-bold text-[#141413] tabular-nums">
                  {radiusKm} km
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="50"
                step="1"
                value={radiusKm}
                onChange={(e) =>
                  handleFilterChange(() => setRadiusKm(parseInt(e.target.value, 10)))
                }
                className="w-full accent-[#143D2B] cursor-pointer"
              />
              <div className="grid grid-cols-4 gap-1">
                {[5, 10, 25, 50].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleFilterChange(() => setRadiusKm(r))}
                    className={`
                      py-1 text-[11px] font-semibold rounded border transition-colors tabular-nums
                      ${radiusKm === r
                        ? 'bg-[#143D2B] text-white border-[#143D2B]'
                        : 'bg-[#FAF9F6] text-[#52524E] border-[#E2DDD5] hover:border-[#143D2B]'
                      }
                    `}
                  >
                    {r}k
                  </button>
                ))}
              </div>
            </div>

            {/* Filter 4: Minimum Rating */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#52524E]">
                Minimum Rating
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[0, 4.0, 4.5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleFilterChange(() => setMinRating(val))}
                    className={`
                      py-1.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1 transition-colors
                      ${minRating === val
                        ? 'bg-[#143D2B] text-white border-[#143D2B]'
                        : 'bg-[#FAF9F6] text-[#52524E] border-[#E2DDD5] hover:border-[#143D2B]'
                      }
                    `}
                  >
                    {val === 0 ? (
                      'Any'
                    ) : (
                      <>
                        <Star className="w-3 h-3 fill-[#143D2B] text-[#143D2B]" />
                        <span>{val}+</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter 5: Verified & Open Now Toggles */}
            <div className="space-y-2.5 pt-2 border-t border-[#E2DDD5]">
              <label className="flex items-center justify-between text-xs font-medium cursor-pointer">
                <span className="text-[#141413] font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#143D2B]" />
                  <span>Verified Partners Only</span>
                </span>
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) =>
                    handleFilterChange(() => setVerifiedOnly(e.target.checked))
                  }
                  className="accent-[#143D2B] w-4 h-4 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs font-medium cursor-pointer">
                <span className="text-[#141413] font-medium flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#143D2B]" />
                  <span>Open Now</span>
                </span>
                <input
                  type="checkbox"
                  checked={openNowOnly}
                  onChange={(e) =>
                    handleFilterChange(() => setOpenNowOnly(e.target.checked))
                  }
                  className="accent-[#143D2B] w-4 h-4 rounded cursor-pointer"
                />
              </label>
            </div>
          </aside>

          {/* ========================================================= */}
          {/* SEARCH RESULTS FEED */}
          {/* ========================================================= */}
          <main className="lg:col-span-9 space-y-6">
            {/* Header info bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#141413] tracking-tight">
                  {searchQuery ? `"${searchQuery}"` : 'All Available Services'}
                </h1>
                <p className="text-xs text-[#52524E] mt-0.5">
                  Ranked by relevance, destination distance ({radiusKm} km radius), slot availability, and verified ratings.
                </p>
              </div>

              {/* Destination awareness notice */}
              <div className="text-xs text-[#52524E] bg-white px-3 py-1.5 rounded-lg border border-[#E2DDD5] shrink-0">
                Origin:{' '}
                <strong className="text-[#141413]">
                  {searchResult.effectiveDestination.displayText}
                </strong>
              </div>
            </div>

            {/* Dynamic Loading Shimmer during filter transition */}
            {isFiltering ? (
              <div className="space-y-4">
                <SkeletonLoader type="card" />
                <SkeletonLoader type="card" />
                <SkeletonLoader type="card" />
              </div>
            ) : searchResult.providers.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-xl border border-[#E2DDD5] p-10 sm:p-14 text-center max-w-xl mx-auto">
                <div className="w-12 h-12 rounded-full bg-[#F3F1EC] text-[#143D2B] flex items-center justify-center mx-auto mb-4 border border-[#E2DDD5]">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-lg font-bold text-[#141413]">
                  No providers found within {radiusKm} km of {searchResult.effectiveDestination.displayText}
                </h3>
                <p className="text-xs text-[#52524E] mt-2 leading-relaxed">
                  We couldn&apos;t find matching slots matching your current filters. Try expanding your search radius to 25 or 50 km to discover providers in neighboring areas.
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleFilterChange(() => setRadiusKm(50))}
                  >
                    Expand Radius to 50 km
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetFilters}
                  >
                    Clear Query &amp; Show All
                  </Button>
                </div>
              </div>
            ) : (
              /* Provider Cards List */
              <div className="space-y-4">
                {searchResult.providers.map((provider, index) => (
                  <Reveal key={provider.id} delay={Math.min(index * 0.05, 0.25)}>
                    <Card
                      interactive
                      className="p-5 overflow-hidden transition-all duration-200 border-[#E2DDD5] hover:border-[#143D2B]"
                    >
                      <div className="flex flex-col sm:flex-row gap-5 items-start">
                        {/* Image Thumbnail with Category and Sponsored Badges */}
                        <Link
                          href={`/provider/${provider.id}`}
                          className="group/img relative w-full sm:w-48 aspect-[16/10] sm:aspect-auto sm:h-36 rounded-xl overflow-hidden bg-[#F3F1EC] shrink-0 border border-[#E2DDD5] block"
                        >
                          <Image
                            src={provider.images[0]}
                            alt={provider.name}
                            fill
                            className="object-cover group-hover/img:scale-[1.04] transition-transform duration-700 ease-out"
                            sizes="(max-width: 640px) 100vw, 200px"
                          />
                          {/* Sponsored Badge if sponsored */}
                          {provider.isSponsored && (
                            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#141413] text-white text-[10px] font-semibold uppercase tracking-wider">
                              Sponsored
                            </div>
                          )}
                          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-[#141413]/80 text-white text-[10px] font-medium uppercase tracking-wider">
                            {provider.category.replace('_', ' ')}
                          </div>
                        </Link>

                      {/* Provider Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="font-heading text-lg font-bold text-[#141413] truncate hover:text-[#143D2B] transition-colors">
                                  <Link href={`/provider/${provider.id}`}>
                                    {provider.name}
                                  </Link>
                                </h2>
                                {provider.isVerified && (
                                  <span
                                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#143D2B] bg-[#EBF2EE] px-2 py-0.5 rounded-full border border-[#C8DBD1]"
                                    title="KYC & Trade Verified"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Verified</span>
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#52524E] line-clamp-1 mt-0.5">
                                {provider.tagline}
                              </p>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-1 bg-surface-subtle px-2 py-1 rounded-md text-xs font-semibold text-ink shrink-0 tabular-nums border border-border-subtle">
                              <Star className="w-3.5 h-3.5 fill-[#7A5B22] text-[#7A5B22]" />
                              <span>{provider.rating}</span>
                              <span className="text-ink-muted font-normal text-[11px]">
                                ({provider.reviewCount})
                              </span>
                            </div>
                          </div>

                          {/* Location & Distance from Destination */}
                          <div className="mt-2.5 flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-[#52524E]">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-[#143D2B] shrink-0" />
                              <span className="font-medium text-[#141413]">
                                {provider.locality}, {provider.city}
                              </span>
                            </div>

                            <span className="text-[#E2DDD5]">•</span>

                            <div className="font-semibold text-[#141413] tabular-nums">
                              {provider.calculatedDistanceKm} km from{' '}
                              {searchResult.effectiveDestination.isNearMe
                                ? 'you'
                                : searchResult.effectiveDestination.displayText.split(',')[0]}
                            </div>
                          </div>

                          {/* Badges / Highlights */}
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {provider.badges.map((b, i) => (
                              <Badge key={i} variant="sand" size="sm">
                                {b}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Bottom Row: Next Slot, Price & Action CTA */}
                        <div className="mt-4 pt-3 border-t border-[#E2DDD5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-xs text-[#141413] bg-[#F3F1EC] px-2.5 py-1 rounded-md font-medium border border-[#E2DDD5]">
                              <Clock className="w-3.5 h-3.5 text-[#143D2B]" />
                              <span>{provider.nextAvailableSlot}</span>
                            </div>
                            <span className="text-xs text-[#52524E]">
                              Starting from{' '}
                              <strong className="text-sm font-bold text-[#141413] tabular-nums">
                                ₹{provider.startingPriceInr}
                              </strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${provider.phone}`}
                              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2DDD5] bg-white text-xs font-medium text-[#141413] hover:border-[#143D2B] transition-colors"
                              title={`Direct Line: ${provider.phone}`}
                            >
                              <Phone className="w-3.5 h-3.5 text-[#143D2B]" />
                              <span>Call</span>
                            </a>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedProviderForBooking(provider);
                                setIsBookingModalOpen(true);
                              }}
                              className="text-xs px-2.5"
                            >
                              Quick Slot
                            </Button>
                            <Button
                              href={`/provider/${provider.id}`}
                              variant="primary"
                              size="sm"
                            >
                              View &amp; Request Slot
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Reveal>
              ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MOBILE FILTER BOTTOM DRAWER */}
      {/* ========================================================= */}
      <Drawer
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        side="bottom"
        title="Filter & Refine Discovery"
        description="Configure target radius, categories, and merchant verification"
      >
        <div className="space-y-5 p-1">
          {/* Mobile Category */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#52524E] block mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    setSelectedCategory(cat.id as BookingCategory | 'all')
                  }
                  className={`
                    p-2 text-xs font-medium rounded-lg border text-left transition-colors
                    ${selectedCategory === cat.id
                      ? 'bg-[#143D2B] text-white border-[#143D2B]'
                      : 'bg-[#FAF9F6] text-[#52524E] border-[#E2DDD5]'
                    }
                  `}
                >
                  {cat.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Radius */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#52524E] block mb-2">
              Radius ({radiusKm} km)
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[5, 10, 25, 50].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRadiusKm(r)}
                  className={`
                    py-2 text-xs font-medium rounded-lg border text-center tabular-nums transition-colors
                    ${radiusKm === r
                      ? 'bg-[#143D2B] text-white border-[#143D2B]'
                      : 'bg-[#FAF9F6] text-[#52524E] border-[#E2DDD5]'
                    }
                  `}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Minimum Rating */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#52524E] block mb-2">
              Minimum Rating
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[0, 4.0, 4.5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setMinRating(val)}
                  className={`
                    py-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1 transition-colors
                    ${minRating === val
                      ? 'bg-[#143D2B] text-white border-[#143D2B]'
                      : 'bg-[#FAF9F6] text-[#52524E] border-[#E2DDD5]'
                    }
                  `}
                >
                  {val === 0 ? 'Any' : `${val}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Verified & Open Now */}
          <div className="space-y-2 pt-2 border-t border-[#E2DDD5]">
            <label className="flex items-center justify-between text-xs font-medium cursor-pointer">
              <span className="text-[#141413]">Verified Partners Only</span>
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="accent-[#143D2B] w-4 h-4 rounded cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between text-xs font-medium cursor-pointer">
              <span className="text-[#141413]">Open Now Only</span>
              <input
                type="checkbox"
                checked={openNowOnly}
                onChange={(e) => setOpenNowOnly(e.target.checked)}
                className="accent-[#143D2B] w-4 h-4 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Mobile Actions */}
          <div className="pt-3 flex gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={handleResetFilters}
              className="w-1/3"
            >
              Reset
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setMobileFilterOpen(false)}
              className="w-2/3"
            >
              Apply ({searchResult.totalMatches})
            </Button>
          </div>
        </div>
      </Drawer>

      {/* ========================================================= */}
      {/* INSTANT SLOT REQUEST MODAL */}
      {/* ========================================================= */}
      {isBookingModalOpen && selectedProviderForBooking && (
        <Modal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          title={`Request Slot: ${selectedProviderForBooking.name}`}
          description={`Guaranteed arrival confirmation with ${selectedProviderForBooking.locality}, ${selectedProviderForBooking.city}`}
          maxWidth="lg"
        >
          {bookingConfirmed ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#EBF2EE] text-[#143D2B] flex items-center justify-center mx-auto border border-[#C8DBD1]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#141413]">
                Slot Request Sent to Merchant!
              </h3>
              <p className="text-xs text-[#52524E] max-w-sm mx-auto">
                Status is REQUESTED. The provider has been notified via their BOOKKARO Portal. Average confirmation time is under 90 seconds.
              </p>
            </div>
          ) : (
            <form onSubmit={handleBookingSubmit} className="space-y-4 pt-1">
              {/* Selected Service and Pricing Preview */}
              <div className="p-3.5 rounded-xl bg-[#F3F1EC] border border-[#E2DDD5] flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-[#143D2B]">
                    Selected Category &amp; Merchant
                  </div>
                  <div className="font-heading font-semibold text-sm text-[#141413]">
                    {selectedProviderForBooking.name}
                  </div>
                  <div className="text-xs text-[#52524E]">
                    {selectedProviderForBooking.subCategory} •{' '}
                    {selectedProviderForBooking.calculatedDistanceKm} km from destination
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#52524E] uppercase tracking-wider block">
                    Starting Fee
                  </span>
                  <div className="font-heading font-bold text-base text-[#141413] tabular-nums">
                    ₹{selectedProviderForBooking.startingPriceInr}
                  </div>
                </div>
              </div>

              {/* Service Selection Radio Group */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#52524E] block mb-1.5">
                  Choose Service Package
                </label>
                <div className="space-y-2">
                  {selectedProviderForBooking.services.map((srv, idx) => (
                    <label
                      key={srv.id}
                      className="flex items-start justify-between p-2.5 rounded-lg border border-[#E2DDD5] hover:border-[#143D2B] cursor-pointer bg-white"
                    >
                      <div className="flex items-start gap-2">
                        <input
                          type="radio"
                          name="selectedService"
                          defaultChecked={idx === 0}
                          className="mt-1 accent-[#143D2B]"
                        />
                        <div>
                          <div className="text-xs font-semibold text-[#141413]">{srv.name}</div>
                          <div className="text-[11px] text-[#52524E]">{srv.description}</div>
                        </div>
                      </div>
                      <div className="text-xs font-semibold text-[#141413] tabular-nums shrink-0 ml-2">
                        ₹{srv.price}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date & Time Slot selection */}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Date"
                  type="date"
                  defaultValue="2026-11-20"
                  required
                />
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#52524E] block mb-1.5">
                    Available Slot
                  </label>
                  <select
                    className="w-full text-xs font-medium px-3 py-2 rounded-lg bg-white border border-[#E2DDD5] focus:outline-none focus:ring-1 focus:ring-[#143D2B] h-10"
                    defaultValue={selectedProviderForBooking.timeSlots[0]}
                  >
                    {selectedProviderForBooking.timeSlots.map((ts) => (
                      <option key={ts} value={ts}>
                        {ts}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer Contact */}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Full Name"
                  placeholder="E.g. Vikramaditya Sengupta"
                  defaultValue="Vikramaditya Sengupta"
                  required
                />
                <Input
                  label="WhatsApp / Phone"
                  prefixText="+91"
                  placeholder="98450 12345"
                  defaultValue="98450 12345"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E2DDD5]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsBookingModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Confirm &amp; Request Slot
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}

function SearchPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] p-8 max-w-7xl mx-auto space-y-6">
      <SkeletonLoader lines={2} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="hidden lg:block lg:col-span-3">
          <SkeletonLoader lines={6} />
        </div>
        <div className="lg:col-span-9 space-y-4">
          <SkeletonLoader type="card" />
          <SkeletonLoader type="card" />
          <SkeletonLoader type="card" />
        </div>
      </div>
    </div>
  );
}

function SearchPageWrapper() {
  const searchParams = useSearchParams();

  const queryParam = searchParams.get('q') || '';
  const catParam = (searchParams.get('cat') as BookingCategory) || 'all';
  const destParam = searchParams.get('dest') || 'Patna';
  const nearMeParam = searchParams.get('nearMe') === 'true';
  const radiusParam = parseInt(searchParams.get('radius') || '25', 10);
  const dateParam = searchParams.get('date') || '2026-11-19';

  const compositeKey = `${queryParam}-${catParam}-${destParam}-${nearMeParam}-${radiusParam}-${dateParam}`;

  return (
    <SearchPageContentInner
      key={compositeKey}
      queryParam={queryParam}
      catParam={catParam}
      destParam={destParam}
      nearMeParam={nearMeParam}
      radiusParam={radiusParam}
      dateParam={dateParam}
    />
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchPageWrapper />
    </Suspense>
  );
}
