'use client';

import React, { useState, useMemo } from 'react';
import {
  CalendarCheck2,
  Clock,
  Phone,
  User,
  CheckCircle2,
  XCircle,
  Check,
  Search,
  Building2,
  UserX,
  FileText,
  KeyRound,
  AlertCircle,
  BedDouble,
  UtensilsCrossed,
  Sparkles,
} from 'lucide-react';
import { useProviderPortal } from '@/context/ProviderPortalContext';
import { PortalBookingItem } from '@/data/mockProviderPortalData';
import { BookingStatusBadge } from '@/components/dashboard/BookingStatusBadge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { BookingCategory } from '@/types/booking';

// Strict Patna hospitality category scope: Hotels, Restaurants, Salons
const HOSPITALITY_CATEGORIES: BookingCategory[] = ['hotels', 'restaurants', 'salon'];

export default function ProviderPortalBookingsPage() {
  const {
    bookings,
    acceptBooking,
    declineBooking,
    completeBookingWithPin,
    markNoShow,
  } = useProviderPortal();

  // Tab State
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'completed' | 'other' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [declineTarget, setDeclineTarget] = useState<PortalBookingItem | null>(null);
  const [declineReason, setDeclineReason] = useState('Room category fully occupied / sold out for requested dates');
  const [customDeclineReason, setCustomDeclineReason] = useState('');

  // Venue PIN Verification & Complete Modal State
  const [completeTarget, setCompleteTarget] = useState<PortalBookingItem | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [finalBillInput, setFinalBillInput] = useState<number>(0);
  const [pinError, setPinError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccessToast, setActionSuccessToast] = useState<string | null>(null);

  const scopedBookings = useMemo(() => {
    return bookings.filter((b) => {
      // If category is set, keep strictly hospitality (or fallback if untyped mock)
      if (b.category && !HOSPITALITY_CATEGORIES.includes(b.category)) {
        return false;
      }
      return true;
    });
  }, [bookings]);

  // Filtered Bookings for the active tab and search
  const filteredBookings = useMemo(() => {
    return scopedBookings.filter((b) => {
      // Tab filter
      if (activeTab === 'pending' && b.status !== 'REQUESTED') return false;
      if (activeTab === 'confirmed' && b.status !== 'CONFIRMED') return false;
      if (activeTab === 'completed' && b.status !== 'COMPLETED') return false;
      if (activeTab === 'other' && !['DECLINED', 'NO_SHOW', 'CANCELLED', 'DISPUTED'].includes(b.status)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRef = b.bookingReference.toLowerCase().includes(q);
        const matchesName = b.customerName.toLowerCase().includes(q);
        const matchesPhone = b.customerPhone.toLowerCase().includes(q);
        const matchesService = b.serviceName.toLowerCase().includes(q);
        if (!matchesRef && !matchesName && !matchesPhone && !matchesService) return false;
      }

      return true;
    });
  }, [scopedBookings, activeTab, searchQuery]);

  // Tab Counts
  const counts = useMemo(() => {
    return {
      pending: scopedBookings.filter((b) => b.status === 'REQUESTED').length,
      confirmed: scopedBookings.filter((b) => b.status === 'CONFIRMED').length,
      completed: scopedBookings.filter((b) => b.status === 'COMPLETED').length,
      other: scopedBookings.filter((b) => ['DECLINED', 'NO_SHOW', 'CANCELLED', 'DISPUTED'].includes(b.status)).length,
      all: scopedBookings.length,
    };
  }, [scopedBookings]);

  // Decline submit
  const handleConfirmDecline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!declineTarget) return;

    const reason =
      declineReason === 'Other' && customDeclineReason.trim()
        ? customDeclineReason.trim()
        : declineReason;

    try {
      await declineBooking(declineTarget.id, reason);
      setActionSuccessToast(`Reservation #${declineTarget.bookingReference} declined and guest notified via SMS.`);
      setTimeout(() => setActionSuccessToast(null), 3500);
      setDeclineTarget(null);
      setCustomDeclineReason('');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to decline booking');
    }
  };

  // Open Venue PIN & Complete modal
  const handleOpenCompleteModal = (booking: PortalBookingItem) => {
    setCompleteTarget(booking);
    setPinInput('');
    setFinalBillInput(booking.estimatedPriceInr);
    setPinError(null);
  };

  // Complete submit with PIN verification
  const handleConfirmComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeTarget) return;

    if (!pinInput.trim() || pinInput.trim().length !== 4) {
      setPinError('Please enter the guest’s 4-digit Venue PIN code.');
      return;
    }

    setIsSubmitting(true);
    setPinError(null);

    try {
      await completeBookingWithPin(
        completeTarget.id,
        pinInput.trim(),
        Number(finalBillInput) || completeTarget.estimatedPriceInr
      );
      setActionSuccessToast(`PIN verified! Reservation #${completeTarget.bookingReference} checked in and recorded into ledger.`);
      setTimeout(() => setActionSuccessToast(null), 4000);
      setCompleteTarget(null);
    } catch (err: unknown) {
      setPinError(
        err instanceof Error
          ? err.message
          : 'Invalid 4-digit Venue PIN code. Code did not match booking verification code.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#52524E]">
            <span className="w-2 h-2 rounded-full bg-[#21503A]" />
            <span>Patna Front-Desk Reservation Triage &amp; Check-In</span>
          </div>
          <h1 className="font-[var(--font-partner-display)] font-bold text-2xl sm:text-3xl text-[#141413] tracking-tight mt-1">
            Incoming Booking Queue
          </h1>
          <p className="text-xs sm:text-sm text-[#52524E] mt-0.5">
            Accept or decline incoming slots, verify guest 4-digit Venue PIN upon arrival, and disburse realized billing into the commercial ledger.
          </p>
        </div>

        {/* Live Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#52524E] absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search ref, guest, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-lg border border-[#E5DDD2] focus:border-[#9C421C] focus:ring-1 focus:ring-[#9C421C] outline-none bg-white text-[#141413] min-h-[44px]"
          />
        </div>
      </div>

      {actionSuccessToast && (
        <div className="p-3.5 rounded-lg bg-[#EBF1ED] border border-[#CFDFD5] text-[#21503A] text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-[#21503A] shrink-0" />
          <span>{actionSuccessToast}</span>
        </div>
      )}

      {/* 2. TABS STRIP (44px touch targets) */}
      <div className="flex items-center gap-2 border-b border-[#E5DDD2] pb-3 overflow-x-auto scrollbar-none">
        {[
          { id: 'pending' as const, label: 'Pending Requests', count: counts.pending, alert: counts.pending > 0 },
          { id: 'confirmed' as const, label: 'Confirmed Slots', count: counts.confirmed },
          { id: 'completed' as const, label: 'Completed Visits', count: counts.completed },
          { id: 'other' as const, label: 'Declined / No-Show', count: counts.other },
          { id: 'all' as const, label: 'All History', count: counts.all },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap min-h-[44px]
                ${
                  isActive
                    ? 'bg-[#241D18] text-[#F6F2EB] shadow-xs'
                    : 'bg-white text-[#52524E] hover:text-[#141413] border border-[#E5DDD2] hover:border-[#9C421C]/50'
                }
              `}
            >
              <span>{tab.label}</span>
              <span
                className={`
                  px-2 py-0.5 rounded-full text-[10px] font-mono tabular-nums
                  ${
                    isActive
                      ? 'bg-white/20 text-[#F6F2EB]'
                      : tab.alert
                      ? 'bg-[#FAF1EB] text-[#9C421C] font-bold border border-[#F3DEC9]'
                      : 'bg-[#F6F3EE] text-[#52524E] border border-[#E5DDD2]'
                  }
                `}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. BOOKINGS LIST / SPLIT TRIAGE CARDS */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-[10px] border border-[#E5DDD2] p-8 space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-lg bg-[#F6F3EE] border border-[#E5DDD2] flex items-center justify-center text-[#52524E] mx-auto">
              <CalendarCheck2 className="w-6 h-6" />
            </div>
            <h3 className="font-[var(--font-partner-display)] font-bold text-base text-[#141413]">
              No Bookings in this Queue
            </h3>
            <p className="text-xs text-[#52524E] max-w-sm mx-auto">
              There are currently no guest reservations in the selected tab.
            </p>
          </div>
        ) : (
          filteredBookings.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-[10px] border border-[#E5DDD2] p-5 shadow-xs hover:border-[#9C421C]/40 transition-all space-y-4"
            >
              {/* Row 1: Ref, Status, Timing & Pricing */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5DDD2]">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-black text-[#9C421C] bg-[#FAF1EB] px-2.5 py-1 rounded">
                    #{item.bookingReference}
                  </span>
                  <BookingStatusBadge status={item.status} size="sm" />
                  <span className="text-xs text-[#52524E]">
                    Submitted{' '}
                    {new Date(item.createdAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#21503A] bg-[#EBF1ED] px-2.5 py-1.5 rounded-lg border border-[#CFDFD5]">
                    <Clock className="w-3.5 h-3.5 text-[#21503A]" />
                    <span>
                      {item.scheduledDate} at {item.scheduledTime}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[#52524E] block leading-none">
                      Est. Bill
                    </span>
                    <span className="font-[var(--font-partner-display)] font-extrabold text-sm text-[#141413] tabular-nums">
                      ₹{item.estimatedPriceInr.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 2: Customer Particulars & Hospitality Specific Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {/* Guest Contact */}
                <div className="space-y-1.5 p-3.5 rounded-lg bg-[#F6F3EE] border border-[#E5DDD2]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#52524E] flex items-center gap-1">
                    <User className="w-3 h-3 text-[#21503A]" />
                    <span>Guest Details</span>
                  </div>
                  <div className="font-[var(--font-partner-display)] font-bold text-[#141413]">
                    {item.customerName}
                  </div>
                  <div className="flex items-center gap-2 text-[#52524E]">
                    <a
                      href={`tel:${item.customerPhone}`}
                      className="hover:text-[#9C421C] hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3 text-[#9C421C]" />
                      <span>{item.customerPhone}</span>
                    </a>
                  </div>
                  <div className="text-[11px] text-[#52524E] truncate">{item.customerEmail}</div>
                </div>

                {/* Service Details */}
                <div className="space-y-1.5 p-3.5 rounded-lg bg-[#F6F3EE] border border-[#E5DDD2]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#52524E] flex items-center gap-1">
                    <FileText className="w-3 h-3 text-[#21503A]" />
                    <span>Hospitality Package</span>
                  </div>
                  <div className="font-[var(--font-partner-display)] font-bold text-[#141413]">
                    {item.serviceName}
                  </div>
                  <div className="text-[11px] text-[#52524E]">
                    Marketplace Platform Fee Rate: <strong>{item.commissionPercentage}%</strong>
                  </div>
                  {item.finalRealizedPriceInr && (
                    <div className="text-[11px] font-bold text-[#21503A]">
                      Final Realized Bill: ₹{item.finalRealizedPriceInr.toLocaleString('en-IN')}
                    </div>
                  )}
                </div>

                {/* Hospitality Category Parameters */}
                <div className="space-y-1.5 p-3.5 rounded-lg bg-[#F6F3EE] border border-[#E5DDD2]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#52524E] flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-[#21503A]" />
                    <span>Venue Allocation</span>
                  </div>

                  {item.categoryDetails.branchName && (
                    <div className="text-[#52524E] truncate">
                      <strong>Wing / Venue:</strong> {item.categoryDetails.branchName}
                    </div>
                  )}

                  {item.categoryDetails.roomType && (
                    <div className="text-[#141413] flex items-center gap-1">
                      <BedDouble className="w-3.5 h-3.5 text-[#9C421C] shrink-0" />
                      <span>
                        <strong>Room:</strong> {item.categoryDetails.roomType} ({item.categoryDetails.nights || 1} nights, {item.categoryDetails.guestCount || 2} guests)
                      </span>
                    </div>
                  )}

                  {item.categoryDetails.partySize && (
                    <div className="text-[#141413] flex items-center gap-1">
                      <UtensilsCrossed className="w-3.5 h-3.5 text-[#9C421C] shrink-0" />
                      <span>
                        <strong>Party:</strong> {item.categoryDetails.partySize} Guests ({item.categoryDetails.seatingArea || 'Courtyard'})
                      </span>
                    </div>
                  )}

                  {item.categoryDetails.visitType && (
                    <div className="text-[#141413] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#9C421C] shrink-0" />
                      <span>
                        <strong>Session:</strong> {item.categoryDetails.visitType}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Special Instructions or Decline Reason */}
              {item.specialInstructions && (
                <div className="p-3 rounded-lg bg-[#FAF1EB] border border-[#F3DEC9] text-xs text-[#52524E]">
                  <strong className="text-[#9C421C]">Guest Special Request:</strong> {item.specialInstructions}
                </div>
              )}
              {item.declineReason && (
                <div className="p-3 rounded-lg bg-[#FCECEC] border border-[#F5C2C4] text-xs text-[#942228]">
                  <strong>Decline Reason Logged:</strong> {item.declineReason}
                </div>
              )}

              {/* Row 3: Action Buttons (44px touch ergonomics) */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E5DDD2]">
                <div className="text-[11px] text-[#52524E]">
                  {item.status === 'REQUESTED' && (
                    <span className="text-[#9C421C] font-bold">
                      ⚠️ Awaiting front-desk triage under Patna &lt;90s SLA.
                    </span>
                  )}
                  {item.status === 'CONFIRMED' && (
                    <span className="text-[#21503A] font-bold">
                      ✓ Slot confirmed. When guest arrives, verify 4-digit Venue PIN to complete check-in.
                    </span>
                  )}
                  {item.status === 'COMPLETED' && (
                    <span className="text-[#21503A] font-semibold">
                      ✓ Completed at venue &amp; recorded into auditable commercial ledger.
                    </span>
                  )}
                  {item.status === 'DECLINED' && (
                    <span className="text-[#942228] font-semibold">
                      ✕ Request declined and guest notified via SMS.
                    </span>
                  )}
                  {item.status === 'NO_SHOW' && (
                    <span className="text-[#6B5E55] font-semibold">
                      ✕ Marked as guest No-Show. Slot released.
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Actions for REQUESTED */}
                  {item.status === 'REQUESTED' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setDeclineTarget(item)}
                        className="text-[#942228] bg-[#FCECEC] hover:bg-[#F8DADA] border border-[#F5C2C4] font-bold text-xs min-h-[44px] px-4 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4 text-[#942228]" />
                        <span>Decline</span>
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await acceptBooking(item.id);
                          setActionSuccessToast(`Slot confirmed for Reservation #${item.bookingReference}. Guest notified!`);
                          setTimeout(() => setActionSuccessToast(null), 3500);
                        }}
                        className="bg-[#21503A] text-white hover:bg-[#1A402E] font-bold text-xs min-h-[44px] px-5 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept &amp; Confirm Slot</span>
                      </button>
                    </>
                  )}

                  {/* Actions for CONFIRMED */}
                  {item.status === 'CONFIRMED' && (
                    <>
                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm(`Mark Reservation #${item.bookingReference} as Guest No-Show?`)) {
                            await markNoShow(item.id);
                            setActionSuccessToast(`Reservation #${item.bookingReference} marked as No-Show.`);
                            setTimeout(() => setActionSuccessToast(null), 3500);
                          }
                        }}
                        className="text-[#6B5E55] hover:text-[#942228] hover:bg-[#FCECEC] border border-[#E5DDD2] font-bold text-xs min-h-[44px] px-4 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <UserX className="w-4 h-4" />
                        <span>Mark No-Show</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenCompleteModal(item)}
                        className="bg-[#9C421C] text-white hover:bg-[#7F3516] font-bold text-xs min-h-[44px] px-5 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>Verify PIN &amp; Complete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ========================================================= */}
      {/* 4. DECLINE CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {declineTarget && (
        <Modal
          isOpen={!!declineTarget}
          onClose={() => setDeclineTarget(null)}
          title="Decline Reservation Request"
          description={`Reservation #${declineTarget.bookingReference} for ${declineTarget.customerName}`}
          maxWidth="sm"
        >
          <form onSubmit={handleConfirmDecline} className="space-y-4 pt-2">
            <div className="p-3.5 rounded-lg bg-[#FAF1EB] border border-[#F3DEC9] text-xs text-[#52524E]">
              Declining will immediately notify the guest via SMS/WhatsApp and release the slot. Please select a valid operational reason:
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#141413]">
                Operational Reason <span className="text-[#9C421C]">*</span>
              </label>
              <select
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="w-full text-xs p-3 rounded-lg border border-[#E5DDD2] focus:border-[#9C421C] focus:ring-1 focus:ring-[#9C421C] outline-none text-[#141413] bg-white min-h-[44px]"
              >
                <option value="Room category fully occupied / sold out for requested dates">
                  Room category fully occupied / sold out for requested dates
                </option>
                <option value="Dining room at full surge capacity during requested seating window">
                  Dining room at full surge capacity during requested seating window
                </option>
                <option value="Requested suite / banquet hall under scheduled sanitization or maintenance">
                  Requested suite / banquet hall under scheduled sanitization or maintenance
                </option>
                <option value="Guest requested early check-in before standard turnaround hour">
                  Guest requested early check-in before standard turnaround hour
                </option>
                <option value="Other">Other Front-Desk Operational Constraint</option>
              </select>
            </div>

            {declineReason === 'Other' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#141413]">
                  Specific Operational Reason <span className="text-[#9C421C]">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={customDeclineReason}
                  onChange={(e) => setCustomDeclineReason(e.target.value)}
                  placeholder="Explain why this reservation cannot be accommodated..."
                  className="w-full text-xs p-3 rounded-lg border border-[#E5DDD2] focus:border-[#9C421C] focus:ring-1 focus:ring-[#9C421C] outline-none text-[#141413] bg-white resize-none"
                />
              </div>
            )}

            <div className="pt-2 border-t border-[#E5DDD2] flex items-center justify-end gap-2.5">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setDeclineTarget(null)}
                className="min-h-[44px]"
              >
                Keep Request
              </Button>
              <button
                type="submit"
                className="bg-[#942228] text-white hover:bg-[#7D1D22] font-bold text-xs min-h-[44px] px-5 rounded-lg shadow-xs"
              >
                Confirm Decline
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* 5. VENUE PIN VERIFICATION & MARK COMPLETED MODAL */}
      {/* ========================================================= */}
      {completeTarget && (
        <Modal
          isOpen={!!completeTarget}
          onClose={() => setCompleteTarget(null)}
          title="Front-Desk Venue PIN Check-In & Complete"
          description={`Verify guest arrival code for #${completeTarget.bookingReference}`}
          maxWidth="sm"
        >
          <form onSubmit={handleConfirmComplete} className="space-y-4 pt-2">
            <div className="p-3.5 rounded-lg bg-[#EBF1ED] border border-[#CFDFD5] text-xs text-[#52524E]">
              <div className="font-bold text-[#21503A] flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#21503A]" />
                <span>Patna Front-Desk Physical Verification</span>
              </div>
              <div className="mt-1">
                Ask arriving guest for their 4-digit Venue PIN shown in their BOOKKARO My Bookings dashboard or SMS confirmation.
              </div>
            </div>

            {pinError && (
              <div className="p-3 rounded-lg bg-[#FCECEC] border border-[#F5C2C4] text-xs text-[#942228] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#942228] shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            {/* 4-Digit Venue PIN Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#141413]">
                  4-Digit Venue Check-In PIN <span className="text-[#9C421C]">*</span>
                </label>
                <span className="text-[10px] text-[#52524E] font-mono">
                  Sample PIN: {completeTarget.checkInPin || '4821'}
                </span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#52524E] absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  maxLength={4}
                  autoFocus
                  placeholder="4821"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value.replace(/\D/g, ''));
                    setPinError(null);
                  }}
                  className="w-full text-xl font-mono tracking-[0.4em] text-center font-black py-2.5 rounded-lg border border-[#E5DDD2] focus:border-[#9C421C] focus:ring-1 focus:ring-[#9C421C] outline-none text-[#141413] bg-white tabular-nums min-h-[48px]"
                />
              </div>
              <div className="text-[11px] text-[#52524E]">
                PIN ensures zero fraudulent completion without physical guest presence at the venue desk.
              </div>
            </div>

            {/* Realized Bill Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#141413]">
                Final Realized Counter Bill (INR ₹) <span className="text-[#9C421C]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-xs font-bold text-[#52524E]">
                  ₹
                </span>
                <input
                  type="number"
                  required
                  min={1}
                  value={finalBillInput}
                  onChange={(e) => setFinalBillInput(Number(e.target.value))}
                  className="w-full text-sm font-bold pl-8 pr-3 py-2.5 rounded-lg border border-[#E5DDD2] focus:border-[#9C421C] focus:ring-1 focus:ring-[#9C421C] outline-none text-[#141413] bg-white tabular-nums min-h-[44px]"
                />
              </div>
              <div className="text-[11px] text-[#52524E]">
                Original estimate: ₹{completeTarget.estimatedPriceInr.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Live Commission Calculation Breakdown */}
            <div className="p-3.5 rounded-lg bg-[#F6F3EE] border border-[#E5DDD2] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#52524E]">
                <span>Platform Commission Rate</span>
                <span className="font-bold text-[#141413]">{completeTarget.commissionPercentage}%</span>
              </div>
              <div className="flex justify-between text-[#52524E]">
                <span>Payable Platform Fee</span>
                <span className="font-bold text-[#9C421C] tabular-nums">
                  ₹{Math.round((finalBillInput * completeTarget.commissionPercentage) / 100).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="pt-2 border-t border-[#E5DDD2] flex justify-between font-[var(--font-partner-display)] font-bold text-sm text-[#21503A]">
                <span>Net Disbursed to Bank</span>
                <span className="tabular-nums">
                  ₹{(finalBillInput - Math.round((finalBillInput * completeTarget.commissionPercentage) / 100)).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#E5DDD2] flex items-center justify-end gap-2.5">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setCompleteTarget(null)}
                className="min-h-[44px]"
              >
                Cancel
              </Button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#9C421C] text-white hover:bg-[#7F3516] font-bold text-xs min-h-[44px] px-5 rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Verifying...' : 'Verify PIN & Complete'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
