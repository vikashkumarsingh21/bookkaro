'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  CheckCircle2,
  Building2,
  ChevronRight,
  Star,
  Hourglass,
  CalendarCheck,
  Bookmark,
  Check,
} from 'lucide-react';
import { BookingRequest, BookingCategory } from '@/types/booking';
import { bookingService } from '@/services/bookingService';
import { savedProvidersService } from '@/services/savedProvidersService';
import {
  INITIAL_CUSTOMER_BOOKINGS,
  INITIAL_SAVED_PROVIDERS,
  SavedProviderItem,
} from '@/data/mockDashboardBookings';
import { BookingStatusBadge } from './BookingStatusBadge';
import { BookingDetailDrawer } from './BookingDetailDrawer';
import { CancelBookingModal } from './CancelBookingModal';
import { DisputeModal } from './DisputeModal';
import { WriteReviewModal } from './WriteReviewModal';
import { SavedProvidersList } from './SavedProvidersList';
import { Button } from '@/components/ui/Button';

type DashboardTab = 'active' | 'confirmed' | 'completed' | 'cancelled_other' | 'saved';

export const DashboardClient: React.FC = () => {
  // Client state - initialized with static defaults to guarantee 0 SSR hydration diff
  const [bookings, setBookings] = useState<BookingRequest[]>(INITIAL_CUSTOMER_BOOKINGS);
  const [savedProviders, setSavedProviders] = useState<SavedProviderItem[]>(INITIAL_SAVED_PROVIDERS);

  useEffect(() => {
    // Sync storage data after hydration in a deferred timer to prevent sync render cascade
    const timer = setTimeout(() => {
      setBookings(bookingService.getAllBookings());
      setSavedProviders(savedProvidersService.getSavedProviders());
    }, 0);

    const unsubBookings = bookingService.subscribe(() => {
      setBookings(bookingService.getAllBookings());
    });
    const unsubSaved = savedProvidersService.subscribe(() => {
      setSavedProviders(savedProvidersService.getSavedProviders());
    });
    return () => {
      clearTimeout(timer);
      unsubBookings();
      unsubSaved();
    };
  }, []);

  const [currentTab, setCurrentTab] = useState<DashboardTab>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BookingCategory | 'all'>('all');

  // Modal / Drawer states
  const [selectedBookingForDrawer, setSelectedBookingForDrawer] = useState<BookingRequest | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<BookingRequest | null>(null);
  const [bookingToDispute, setBookingToDispute] = useState<BookingRequest | null>(null);
  const [bookingToReview, setBookingToReview] = useState<BookingRequest | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Tab Filtering Logic
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // 1. Tab filter
      if (currentTab === 'active') {
        if (!['REQUESTED', 'ACCEPTED'].includes(b.status)) return false;
      } else if (currentTab === 'confirmed') {
        if (b.status !== 'CONFIRMED') return false;
      } else if (currentTab === 'completed') {
        if (b.status !== 'COMPLETED') return false;
      } else if (currentTab === 'cancelled_other') {
        if (!['DECLINED', 'EXPIRED', 'CANCELLED', 'NO_SHOW', 'DISPUTED', 'REFUND_REQUESTED', 'REFUNDED'].includes(b.status)) return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'all' && b.category !== selectedCategory) {
        return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRef = b.bookingReference.toLowerCase().includes(q);
        const matchesProvider = b.providerName.toLowerCase().includes(q);
        const matchesService = b.serviceName.toLowerCase().includes(q);
        const matchesCity = b.providerAddress.toLowerCase().includes(q);
        if (!matchesRef && !matchesProvider && !matchesService && !matchesCity) return false;
      }

      return true;
    });
  }, [bookings, currentTab, selectedCategory, searchQuery]);

  // Tab Counts & KPI Stats
  const counts = useMemo(() => {
    const pendingRequests = bookings.filter((b) => b.status === 'REQUESTED').length;
    const activeRequests = bookings.filter((b) => ['REQUESTED', 'ACCEPTED'].includes(b.status)).length;
    const confirmed = bookings.filter((b) => b.status === 'CONFIRMED').length;
    const upcoming = bookings.filter((b) => ['ACCEPTED', 'CONFIRMED'].includes(b.status)).length;
    const completed = bookings.filter((b) => b.status === 'COMPLETED').length;
    const cancelledOther = bookings.filter((b) =>
      ['DECLINED', 'EXPIRED', 'CANCELLED', 'NO_SHOW', 'DISPUTED'].includes(b.status)
    ).length;

    return {
      pendingRequests,
      activeRequests,
      confirmed,
      upcoming,
      completed,
      cancelledOther,
      saved: savedProviders.length,
      total: bookings.length,
    };
  }, [bookings, savedProviders]);

  // Handler: Open Drawer
  const handleOpenDrawer = (booking: BookingRequest) => {
    setSelectedBookingForDrawer(booking);
    setIsDrawerOpen(true);
  };

  // Handler: Cancel Booking
  const handleConfirmCancel = async (bookingId: string, reason: string) => {
    try {
      const updated = await bookingService.cancelBooking(bookingId, reason);
      if (selectedBookingForDrawer?.id === bookingId) {
        setSelectedBookingForDrawer(updated);
      }
      showToast(`Booking #${updated.bookingReference} has been cancelled.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to cancel booking.';
      showToast(message);
    }
  };

  // Handler: Raise Dispute
  const handleRaiseDispute = async (
    bookingId: string,
    disputeData: { ticketId: string; reason: string; description: string }
  ) => {
    try {
      const updated = await bookingService.raiseDispute(bookingId, disputeData);
      if (selectedBookingForDrawer?.id === bookingId) {
        setSelectedBookingForDrawer(updated);
      }
      showToast(`Grievance registered. Support Ticket #${disputeData.ticketId} issued.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to register dispute.';
      showToast(message);
    }
  };

  // Handler: Write Review
  const handleSubmitReview = async (
    bookingId: string,
    review: { rating: number; comment: string; tags: string[] }
  ) => {
    try {
      const updated = await bookingService.addVerifiedReview(bookingId, review);
      if (selectedBookingForDrawer?.id === bookingId) {
        setSelectedBookingForDrawer(updated);
      }
      showToast('Verified review published! Thank you for supporting Patna partners.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit review.';
      showToast(message);
    }
  };

  // Handler: Remove Saved Provider
  const handleRemoveSaved = (savedId: string) => {
    savedProvidersService.removeSavedProvider(savedId);
    showToast('Establishment removed from your saved Patna places.');
  };

  const categoriesList: { id: BookingCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Categories' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'hotels', label: 'Stays & Resorts' },
    { id: 'restaurants', label: 'Dining & Cafes' },
    { id: 'salon', label: 'Salon & Spa' },
    { id: 'vehicle_care', label: 'Vehicle Care' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#141413] pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#143D2B] text-white text-xs px-4 py-3 rounded-xl shadow-md border border-[#C8DBD1] flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header Strip */}
      <section className="bg-white border-b border-[#E2DDD5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#52524E]">
                <span className="w-2 h-2 rounded-full bg-[#143D2B]" />
                <span>Patna Customer Workspace</span>
              </div>
              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-ink tracking-tight mt-1">
                My Bookings &amp; Saved Places
              </h1>
              <p className="text-xs sm:text-sm text-[#52524E] mt-1 max-w-xl">
                Track live request statuses, access 4-digit venue check-in codes, manage cancellations, and leave verified reviews.
              </p>
            </div>

            {/* Quick Explore CTAs */}
            <div className="flex items-center gap-2.5">
              <Button
                href="/search"
                variant="primary"
                size="sm"
                leftIcon={<Search className="w-3.5 h-3.5" />}
              >
                Explore Patna Slots
              </Button>
            </div>
          </div>

          {/* Quick Stats KPI Grid */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 1. Pending Requests */}
            <button
              type="button"
              onClick={() => setCurrentTab('active')}
              className="p-4 rounded-xl bg-[#FAF1EB] border border-[#F3DEC9] text-left transition-colors hover:border-[#C25E28] cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#C25E28]">
                  Pending Requests
                </div>
                <Hourglass className="w-3.5 h-3.5 text-[#C25E28]" />
              </div>
              <div className="font-heading font-black text-2xl text-[#C25E28] tabular-nums mt-1">
                {counts.pendingRequests}
              </div>
            </button>

            {/* 2. Confirmed Upcoming */}
            <button
              type="button"
              onClick={() => setCurrentTab('confirmed')}
              className="p-4 rounded-xl bg-[#EBF2EE] border border-[#C8DBD1] text-left transition-colors hover:border-[#143D2B] cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#143D2B]">
                  Confirmed Upcoming
                </div>
                <CalendarCheck className="w-3.5 h-3.5 text-[#143D2B]" />
              </div>
              <div className="font-heading font-black text-2xl text-[#143D2B] tabular-nums mt-1">
                {counts.confirmed}
              </div>
            </button>

            {/* 3. Completed Visits */}
            <button
              type="button"
              onClick={() => setCurrentTab('completed')}
              className="p-4 rounded-xl bg-[#F3F1EC] border border-[#E2DDD5] text-left transition-colors hover:border-[#141413] cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#52524E]">
                  Completed Visits
                </div>
                <Check className="w-3.5 h-3.5 text-[#141413]" />
              </div>
              <div className="font-heading font-black text-2xl text-[#141413] tabular-nums mt-1">
                {counts.completed}
              </div>
            </button>

            {/* 4. Saved Patna Places */}
            <button
              type="button"
              onClick={() => setCurrentTab('saved')}
              className="p-4 rounded-xl bg-white border border-[#E2DDD5] text-left transition-colors hover:border-[#143D2B] cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#52524E]">
                  Saved Places
                </div>
                <Bookmark className="w-3.5 h-3.5 text-[#52524E]" />
              </div>
              <div className="font-heading font-black text-2xl text-[#141413] tabular-nums mt-1">
                {counts.saved}
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Main Workspace Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DDD5] pb-2">
          {/* Main Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            {[
              { id: 'active' as const, label: 'Active Requests', count: counts.activeRequests },
              { id: 'confirmed' as const, label: 'Confirmed', count: counts.confirmed },
              { id: 'completed' as const, label: 'Completed', count: counts.completed },
              { id: 'cancelled_other' as const, label: 'Cancelled / Other', count: counts.cancelledOther },
              { id: 'saved' as const, label: 'Saved Places', count: counts.saved },
            ].map((tab) => {
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCurrentTab(tab.id)}
                  className={`
                    px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer
                    ${isActive
                      ? 'bg-[#143D2B] text-white'
                      : 'bg-white text-[#52524E] hover:text-[#141413] border border-[#E2DDD5] hover:border-[#143D2B]'
                    }
                  `}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`
                      px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums
                      ${isActive ? 'bg-white/20 text-white' : 'bg-[#FAF9F6] text-[#52524E] border border-[#E2DDD5]'}
                    `}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Search & Category Filter (Only for bookings tabs) */}
          {currentTab !== 'saved' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 text-[#52524E] absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search ref, partner, service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-[#E2DDD5] focus:border-[#143D2B] focus:ring-1 focus:ring-[#143D2B] outline-none bg-white text-[#141413] placeholder:text-[#A8A29E]"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as BookingCategory | 'all')}
                className="text-xs py-2 px-3 rounded-xl border border-[#E2DDD5] focus:border-[#143D2B] focus:ring-1 focus:ring-[#143D2B] outline-none bg-white text-[#141413] cursor-pointer"
              >
                {categoriesList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* View 1: Saved Providers View */}
        {currentTab === 'saved' ? (
          <SavedProvidersList
            savedProviders={savedProviders}
            onRemoveSaved={handleRemoveSaved}
          />
        ) : (
          /* View 2: Bookings List */
          <div className="space-y-4">
            {filteredBookings.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-2xl border border-[#E2DDD5] p-8 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#FAF9F6] border border-[#E2DDD5] flex items-center justify-center text-[#52524E] mx-auto">
                  <Calendar className="w-7 h-7 stroke-[1.75]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading font-bold text-lg text-[#141413]">
                    No Bookings Found in this Filter
                  </h3>
                  <p className="text-xs text-[#52524E] max-w-sm mx-auto">
                    {searchQuery.trim()
                      ? `No reservations matching "${searchQuery}". Try clearing your search keyword.`
                      : 'You do not have any requests in this status view.'}
                  </p>
                </div>
                {searchQuery.trim() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                  >
                    Clear Search Filters
                  </Button>
                )}
              </div>
            ) : (
              filteredBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-xl border border-[#E2DDD5] p-5 hover:border-[#143D2B] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-5 group"
                >
                  {/* Left: Thumbnail & Core Details */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Thumbnail */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#FAF9F6] shrink-0 border border-[#E2DDD5]">
                      {b.providerImage ? (
                        <Image
                          src={b.providerImage}
                          alt={b.providerName}
                          fill
                          className="object-cover group-hover:scale-102 transition-transform duration-300"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#143D2B]">
                          <Building2 className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Text Details */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#52524E]">
                          #{b.bookingReference}
                        </span>
                        <BookingStatusBadge status={b.status} size="sm" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#52524E] px-2 py-0.5 rounded bg-[#FAF9F6] border border-[#E2DDD5]">
                          {b.category.replace('_', ' ')}
                        </span>
                      </div>

                      <h3 className="font-heading font-semibold text-base text-[#141413] truncate hover:text-[#143D2B] transition-colors">
                        <Link href={`/provider/${b.providerId}`}>{b.providerName}</Link>
                      </h3>

                      <div className="text-xs text-[#52524E] truncate">
                        {b.serviceName}
                      </div>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-[#52524E] pt-1">
                        <div className="flex items-center gap-1 font-semibold text-[#141413]">
                          <Calendar className="w-3.5 h-3.5 text-[#C25E28]" />
                          <span>{b.scheduledDate}</span>
                        </div>
                        <span className="text-[#E2DDD5]">•</span>
                        <div className="flex items-center gap-1 text-[#143D2B] font-semibold">
                          <Clock className="w-3.5 h-3.5 text-[#143D2B]" />
                          <span>{b.scheduledSlot.startTime}</span>
                        </div>
                        <span className="text-[#E2DDD5]">•</span>
                        <div className="flex items-center gap-1 truncate max-w-xs">
                          <MapPin className="w-3.5 h-3.5 text-[#52524E] shrink-0" />
                          <span className="truncate">{b.providerAddress.split(',')[0]}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Bill Due & Action Buttons */}
                  <div className="flex flex-row md:flex-col md:items-end justify-between items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-[#E2DDD5] shrink-0">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] uppercase font-semibold text-[#52524E] block leading-none">
                        Due at Venue
                      </span>
                      <span className="font-heading font-bold text-base text-[#141413] tabular-nums">
                        ₹{b.pricing.amountPayableAtVenue.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* For COMPLETED: Review Button if unreviewed */}
                      {b.status === 'COMPLETED' && !b.verifiedReview && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setBookingToReview(b)}
                          leftIcon={<Star className="w-3.5 h-3.5 text-[#C25E28]" />}
                          className="border-[#F3DEC9] text-[#C25E28] hover:bg-[#FAF1EB]"
                        >
                          Review
                        </Button>
                      )}

                      {/* Primary Drawer CTA */}
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenDrawer(b)}
                        rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* 1. BOOKING DETAIL DRAWER */}
      {/* ========================================================= */}
      <BookingDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        booking={selectedBookingForDrawer}
        onOpenCancelModal={(b) => setBookingToCancel(b)}
        onOpenDisputeModal={(b) => setBookingToDispute(b)}
        onOpenReviewModal={(b) => setBookingToReview(b)}
      />

      {/* ========================================================= */}
      {/* 2. CANCEL BOOKING CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {bookingToCancel && (
        <CancelBookingModal
          isOpen={!!bookingToCancel}
          onClose={() => setBookingToCancel(null)}
          booking={bookingToCancel}
          onConfirmCancel={handleConfirmCancel}
        />
      )}

      {/* ========================================================= */}
      {/* 3. RAISE DISPUTE MODAL */}
      {/* ========================================================= */}
      {bookingToDispute && (
        <DisputeModal
          isOpen={!!bookingToDispute}
          onClose={() => setBookingToDispute(null)}
          booking={bookingToDispute}
          onRaiseDispute={handleRaiseDispute}
        />
      )}

      {/* ========================================================= */}
      {/* 4. WRITE VERIFIED REVIEW MODAL (COMPLETED ONLY) */}
      {/* ========================================================= */}
      {bookingToReview && (
        <WriteReviewModal
          isOpen={!!bookingToReview}
          onClose={() => setBookingToReview(null)}
          booking={bookingToReview}
          onSubmitReview={handleSubmitReview}
        />
      )}
    </div>
  );
};
