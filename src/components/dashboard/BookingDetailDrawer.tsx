'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Phone,
  Clock,
  Calendar,
  Copy,
  Check,
  AlertTriangle,
  RotateCcw,
  Star,
  ExternalLink,
  Building2,
  QrCode,
  ShieldAlert,
  CreditCard,
  User,
  HelpCircle,
  Navigation,
} from 'lucide-react';
import { BookingRequest } from '@/types/booking';
import { isValidBookingTransition, BookingStatus as BookkaroStatus } from '@/types/bookkaro';
import { BookingStatusBadge } from './BookingStatusBadge';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { bookingService } from '@/services/bookingService';

interface BookingDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingRequest | null;
  onOpenCancelModal: (booking: BookingRequest) => void;
  onOpenDisputeModal: (booking: BookingRequest) => void;
  onOpenReviewModal: (booking: BookingRequest) => void;
}

export const BookingDetailDrawer: React.FC<BookingDetailDrawerProps> = ({
  isOpen,
  onClose,
  booking,
  onOpenCancelModal,
  onOpenDisputeModal,
  onOpenReviewModal,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);

  // Local synced copy when inline action (like refund claim) completes
  const [refundUpdatedBooking, setRefundUpdatedBooking] = useState<BookingRequest | null>(null);
  const activeBooking =
    refundUpdatedBooking && refundUpdatedBooking.id === booking?.id
      ? refundUpdatedBooking
      : booking;

  // Refund Modal State
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('Partner unable to fulfill reservation / venue closed');
  const [customRefundNote, setCustomRefundNote] = useState('');
  const [refundUpiOrBankRef, setRefundUpiOrBankRef] = useState('');
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);

  if (!activeBooking) return null;

  const handleCopyCode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(activeBooking.bookingReference);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyPin = () => {
    if (activeBooking.checkInPin && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(activeBooking.checkInPin);
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    }
  };

  const handleInitiateRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundUpiOrBankRef.trim()) {
      setRefundError('Please provide a valid UPI ID (e.g. name@okhdfcbank) or Bank Account/IFSC');
      return;
    }
    try {
      setIsSubmittingRefund(true);
      setRefundError(null);
      const fullReason = customRefundNote.trim()
        ? `${refundReason} — ${customRefundNote.trim()}`
        : refundReason;
      const updated = await bookingService.requestRefund(activeBooking.id, {
        reason: fullReason,
        upiOrBankRef: refundUpiOrBankRef.trim(),
      });
      setRefundUpdatedBooking(updated);
      setIsRefundModalOpen(false);
      setCustomRefundNote('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to request refund.';
      setRefundError(msg);
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  // 4 Standard Happy-Path Lifecycle Milestones
  const milestones: {
    key: string;
    step: string;
    label: string;
    desc: string;
    statusEquivalent: string;
  }[] = [
    {
      key: 'REQUESTED',
      step: '01',
      label: 'Requested',
      desc: 'Sent to partner',
      statusEquivalent: 'REQUESTED',
    },
    {
      key: 'ACCEPTED',
      step: '02',
      label: 'Provider Accepted',
      desc: 'Slot acknowledged',
      statusEquivalent: 'ACCEPTED',
    },
    {
      key: 'CONFIRMED',
      step: '03',
      label: 'Confirmed',
      desc: 'Arrival guaranteed',
      statusEquivalent: 'CONFIRMED',
    },
    {
      key: 'COMPLETED',
      step: '04',
      label: 'Completed',
      desc: 'Service rendered',
      statusEquivalent: 'COMPLETED',
    },
  ];

  const getStageStatus = (stageStatus: string) => {
    const statusHierarchy: Record<string, number> = {
      REQUESTED: 1,
      ACCEPTED: 2,
      CONFIRMED: 3,
      COMPLETED: 4,
    };

    const currentRank = statusHierarchy[activeBooking.status] || 0;
    const stageRank = statusHierarchy[stageStatus] || 0;

    if (currentRank > stageRank) return 'DONE';
    if (currentRank === stageRank) return 'ACTIVE';
    return 'UPCOMING';
  };

  const isTerminalNegative = [
    'DECLINED',
    'EXPIRED',
    'CANCELLED',
    'NO_SHOW',
    'DISPUTED',
    'REFUND_REQUESTED',
    'REFUNDED',
  ].includes(activeBooking.status);

  const canCancel = isValidBookingTransition(activeBooking.status as BookkaroStatus, 'CANCELLED');
  const canDispute =
    isValidBookingTransition(activeBooking.status as BookkaroStatus, 'DISPUTED') &&
    activeBooking.status !== 'DISPUTED' &&
    activeBooking.status !== 'REFUND_REQUESTED' &&
    activeBooking.status !== 'REFUNDED';
  const canReview = activeBooking.status === 'COMPLETED' && !activeBooking.verifiedReview;
  const canRequestRefund =
    ['CANCELLED', 'DISPUTED'].includes(activeBooking.status) &&
    activeBooking.status !== 'REFUND_REQUESTED' &&
    activeBooking.status !== 'REFUNDED';

  return (
    <>
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={`#${activeBooking.bookingReference}`}
      description={`Managed with ${activeBooking.providerName}`}
      side="right"
      size="lg"
      className="bg-white"
    >
      <div className="space-y-6 pb-6">
        {/* Status Badge & Category Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#E2DDD5]">
          <BookingStatusBadge status={activeBooking.status} size="lg" />
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#FAF9F6] text-[#52524E] uppercase tracking-wider border border-[#E2DDD5]">
            {activeBooking.category.replace('_', ' ')}
          </span>
        </div>

        {/* 1. VISUAL STATUS TIMELINE */}
        <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E2DDD5] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#141413]">
              Lifecycle Progress
            </span>
            <span className="text-[11px] text-[#52524E]">
              Created on {new Date(activeBooking.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>

          {/* Happy Path Timeline or Terminal Deviation */}
          {!isTerminalNegative ? (
            <div className="grid grid-cols-4 gap-2 text-center pt-2">
              {milestones.map((m) => {
                const stageState = getStageStatus(m.statusEquivalent);
                return (
                  <div key={m.key} className="flex flex-col items-center">
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1 transition-all
                        ${
                          stageState === 'DONE'
                            ? 'bg-[#143D2B] text-white'
                            : stageState === 'ACTIVE'
                            ? 'bg-[#FAF1EB] text-[#C25E28] border-2 border-[#C25E28]'
                            : 'bg-white text-[#A8A29E] border border-[#E2DDD5]'
                        }
                      `}
                    >
                      {stageState === 'DONE' ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : stageState === 'ACTIVE' ? (
                        <span className="w-2 h-2 rounded-full bg-[#C25E28]" />
                      ) : (
                        <span className="text-[10px] text-[#A8A29E]">{m.step}</span>
                      )}
                    </div>
                    <div
                      className={`text-[11px] font-semibold leading-tight ${
                        stageState === 'ACTIVE'
                          ? 'text-[#C25E28]'
                          : stageState === 'DONE'
                          ? 'text-[#143D2B]'
                          : 'text-[#A8A29E]'
                      }`}
                    >
                      {m.label}
                    </div>
                    <div className="text-[9px] text-[#52524E] leading-snug mt-0.5 hidden sm:block">
                      {m.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Terminal Non-Happy Path State Notice */
            <div className="space-y-3">
              {activeBooking.status === 'REFUND_REQUESTED' ? (
                <div className="p-3.5 rounded-xl bg-[#FAF1EB] border border-[#E2DDD5] space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C25E28] animate-pulse" />
                    <span className="font-heading font-semibold text-xs text-[#C25E28]">
                      Refund Claim Under Review
                    </span>
                  </div>
                  <p className="text-xs text-[#52524E] leading-relaxed">
                    Your refund request is currently being audited by the BOOKKARO Escalation Desk. Payout will be remitted to your provided payout destination under Patna merchant protection rules.
                  </p>
                  {activeBooking.refundRequest && (
                    <div className="text-[11px] bg-white p-2.5 rounded-lg border border-[#E2DDD5] space-y-1 text-[#52524E]">
                      <div>
                        <strong className="text-[#141413]">Claim Reason:</strong> {activeBooking.refundRequest.reason}
                      </div>
                      {activeBooking.refundRequest.upiOrBankRef && (
                        <div>
                          <strong className="text-[#141413]">Payout UPI / A/C:</strong>{' '}
                          <span className="font-mono text-[#C25E28]">{activeBooking.refundRequest.upiOrBankRef}</span>
                        </div>
                      )}
                      <div className="text-[10px] text-[#78716C]">
                        Requested on {new Date(activeBooking.refundRequest.requestedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>
                  )}
                </div>
              ) : activeBooking.status === 'REFUNDED' ? (
                <div className="p-3.5 rounded-xl bg-[#F0F5F2] border border-[#143D2B]/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#143D2B]" />
                    <span className="font-heading font-semibold text-xs text-[#143D2B]">
                      Refund Processed &amp; Settled
                    </span>
                  </div>
                  <p className="text-xs text-[#143D2B]/90 leading-relaxed">
                    ₹{activeBooking.pricing.amountPayableAtVenue.toLocaleString('en-IN')} has been refunded. Payout is complete.
                  </p>
                  {activeBooking.refundRequest?.adminNote && (
                    <div className="text-[11px] bg-white p-2.5 rounded-lg border border-[#E2DDD5] text-[#52524E]">
                      <strong className="text-[#141413]">Resolution Note:</strong> {activeBooking.refundRequest.adminNote}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-white border border-[#E2DDD5] space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#9E2A2B]" />
                    <span className="font-heading font-semibold text-xs text-[#141413]">
                      Lifecycle Resolution: {activeBooking.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#52524E] leading-relaxed">
                    {activeBooking.cancellationReason ||
                      activeBooking.statusHistory[activeBooking.statusHistory.length - 1]?.note ||
                      'This booking was not completed and is archived in your history.'}
                  </p>
                  {activeBooking.dispute && (
                    <div className="mt-2 p-2.5 rounded-lg bg-[#FDF2F2] border border-[#F8D7DA] text-xs">
                      <div className="font-semibold text-[#9E2A2B] flex items-center justify-between">
                        <span>Dispute Ticket #{activeBooking.dispute.ticketId}</span>
                        <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-white border border-[#9E2A2B]/30">
                          {activeBooking.dispute.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#52524E] mt-1">{activeBooking.dispute.reason}</div>
                      <div className="text-[10px] text-[#78716C] mt-0.5">{activeBooking.dispute.description}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. VENUE OFFLINE CHECK-IN CARD & PIN VOUCHER */}
        <div className="p-5 rounded-xl bg-[#141413] text-white space-y-4 relative overflow-hidden border border-[#262624]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-[#A8A29E]">
                Venue Check-In Voucher
              </span>
              <div className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
                {activeBooking.bookingReference}
              </div>
              <div className="text-xs text-[#A8A29E] mt-1">
                Present at front desk or cash counter upon arrival
              </div>
            </div>

            {/* QR Representation */}
            <div className="w-16 h-16 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0">
              <QrCode className="w-full h-full text-[#141413]" />
            </div>
          </div>

          {/* Counter PIN & Copy Controls */}
          <div className="pt-3 border-t border-white/15 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#A8A29E]">Reception PIN:</span>
              <span className="font-mono font-bold text-sm bg-white/10 px-2 py-0.5 rounded text-white tracking-widest">
                {activeBooking.checkInPin || '4821'}
              </span>
              <button
                type="button"
                onClick={handleCopyPin}
                className="text-[11px] text-[#A8A29E] hover:text-white underline cursor-pointer"
              >
                {copiedPin ? 'Copied' : 'Copy'}
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Reference Copied' : 'Copy Ref'}</span>
            </button>
          </div>
        </div>

        {/* 3. SERVICE & VENUE PARTICULARS */}
        <div className="rounded-xl border border-[#E2DDD5] overflow-hidden divide-y divide-[#E2DDD5]">
          {/* Provider Banner */}
          <div className="p-4 flex items-center gap-3 bg-[#FAF9F6]">
            {activeBooking.providerImage ? (
              <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#E2DDD5]">
                <Image
                  src={activeBooking.providerImage}
                  alt={activeBooking.providerName}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E2DDD5] flex items-center justify-center text-[#143D2B] shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-heading font-semibold text-sm text-[#141413] truncate">
                {activeBooking.providerName}
              </h3>
              <div className="text-xs text-[#52524E] flex items-center gap-1.5 mt-0.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-[#143D2B] shrink-0" />
                <span className="truncate">{activeBooking.providerAddress}</span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${activeBooking.providerName}, ${activeBooking.providerAddress}, Patna, Bihar`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#143D2B] font-semibold hover:underline inline-flex items-center gap-0.5 shrink-0 ml-1"
                >
                  <span>Directions</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

            <Link
              href={`/provider/${activeBooking.providerId}`}
              className="p-2 rounded-lg text-[#143D2B] hover:bg-[#F3F1EC] transition-colors shrink-0"
              title="View Provider Page"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          {/* Date & Slot Details */}
          <div className="p-4 grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[#52524E] uppercase font-semibold text-[10px] tracking-wider block">
                Scheduled Date
              </span>
              <div className="font-semibold text-[#141413] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#143D2B]" />
                <span>{activeBooking.scheduledDate}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[#52524E] uppercase font-semibold text-[10px] tracking-wider block">
                Time Slot
              </span>
              <div className="font-semibold text-[#141413] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#143D2B]" />
                <span>{activeBooking.scheduledSlot.startTime}</span>
              </div>
            </div>
          </div>

          {/* Service Item & Units */}
          <div className="p-4 space-y-2 text-xs">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-[#52524E] uppercase font-semibold text-[10px] tracking-wider block">
                  Booked Service
                </span>
                <span className="font-semibold text-[#141413]">{activeBooking.serviceName}</span>
              </div>
              <div className="text-right">
                <span className="text-[#52524E] uppercase font-semibold text-[10px] tracking-wider block">
                  Units / Pax
                </span>
                <span className="font-semibold text-[#141413]">{activeBooking.paxOrUnits}</span>
              </div>
            </div>

            {/* Customer Contact Details */}
            <div className="pt-2 border-t border-[#E2DDD5]/60 flex items-center justify-between text-[11px] text-[#52524E]">
              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#143D2B]" />
                <span>{activeBooking.customerName}</span>
              </div>
              <span className="tabular-nums">{activeBooking.customerPhone}</span>
            </div>

            {activeBooking.specialInstructions && (
              <div className="mt-2 p-2.5 rounded-lg bg-[#FAF9F6] border border-[#E2DDD5] text-[11px] text-[#52524E]">
                <strong className="text-[#141413]">Special Request / Notes:</strong> {activeBooking.specialInstructions}
              </div>
            )}
          </div>

          {/* Bill Breakdown */}
          <div className="p-4 space-y-1.5 text-xs bg-[#FAF9F6]/50">
            <div className="flex justify-between text-[#52524E]">
              <span>Base Rate</span>
              <span className="tabular-nums">₹{activeBooking.pricing.basePrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[#52524E]">
              <span>GST &amp; Taxes</span>
              <span className="tabular-nums">
                {activeBooking.pricing.taxesAndGst === 0 ? 'Exempt' : `₹${activeBooking.pricing.taxesAndGst.toLocaleString('en-IN')}`}
              </span>
            </div>
            {activeBooking.pricing.discountAmount > 0 && (
              <div className="flex justify-between text-[#143D2B] font-semibold">
                <span>Partner Discount</span>
                <span className="tabular-nums">-₹{activeBooking.pricing.discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="pt-2 border-t border-[#E2DDD5] flex justify-between font-heading font-bold text-sm text-[#141413]">
              <span className="flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-[#143D2B]" />
                <span>Amount Due at Venue</span>
              </span>
              <span className="tabular-nums">
                ₹{activeBooking.pricing.amountPayableAtVenue.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* 4. VERIFIED REVIEW SECTION (For COMPLETED bookings only) */}
        {activeBooking.status === 'COMPLETED' && (
          <div className="p-4 rounded-xl bg-[#F3F1EC] border border-[#E2DDD5] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-[#143D2B] text-[#143D2B]" />
                <span className="font-heading font-semibold text-xs text-[#141413]">
                  {activeBooking.verifiedReview ? 'Your Verified Review' : 'Rate Your Visit'}
                </span>
              </div>
              {activeBooking.verifiedReview && (
                <Badge variant="plum-subtle" size="sm">
                  Verified Visit
                </Badge>
              )}
            </div>

            {activeBooking.verifiedReview ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-1 text-[#143D2B]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= activeBooking.verifiedReview!.rating ? 'fill-[#143D2B]' : 'text-[#E2DDD5]'
                      }`}
                    />
                  ))}
                  <span className="font-semibold ml-1 text-[#141413]">
                    {activeBooking.verifiedReview.rating}.0 / 5
                  </span>
                </div>
                <p className="text-xs text-[#52524E] italic bg-white p-3 rounded-xl border border-[#E2DDD5]">
                  &quot;{activeBooking.verifiedReview.comment}&quot;
                </p>
                {activeBooking.verifiedReview.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {activeBooking.verifiedReview.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-white border border-[#E2DDD5] text-[#141413]"
                      >
                        ✓ {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : canReview ? (
              <div className="space-y-2">
                <p className="text-xs text-[#52524E]">
                  Your visit was completed on {activeBooking.scheduledDate}. Help other local customers in Patna discover authentic service quality.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onOpenReviewModal(activeBooking)}
                  leftIcon={<Star className="w-3.5 h-3.5" />}
                >
                  Write Verified Review
                </Button>
              </div>
            ) : null}
          </div>
        )}

        {/* 5. CONTACT & DISPUTE TRIGGERS */}
        <div className="pt-2 flex flex-col gap-2.5">
          {/* Refund Trigger for Cancelled or Disputed bookings */}
          {canRequestRefund && (
            <div className="p-3.5 rounded-xl bg-[#FAF1EB] border border-[#E2DDD5] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-[#C25E28]" />
                  <span className="font-heading font-semibold text-xs text-[#141413]">
                    Eligible for Refund Claim
                  </span>
                </div>
                <span className="text-[10px] font-mono font-medium text-[#C25E28]">
                  ₹{activeBooking.pricing.amountPayableAtVenue.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[11px] text-[#52524E] leading-relaxed">
                If you made advance payments or experienced merchant service failure, submit a verified refund claim to the BOOKKARO Patna Escrow Desk.
              </p>
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => setIsRefundModalOpen(true)}
                className="bg-[#C25E28] hover:bg-[#A94F20] text-white"
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Claim Booking Refund
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {activeBooking.providerPhone && (
              <a
                href={`tel:${activeBooking.providerPhone}`}
                className="w-full"
              >
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  leftIcon={<Phone className="w-3.5 h-3.5 text-[#143D2B]" />}
                >
                  Call Partner
                </Button>
              </a>
            )}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${activeBooking.providerName}, ${activeBooking.providerAddress}, Patna, Bihar`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button
                variant="outline"
                size="sm"
                fullWidth
                leftIcon={<Navigation className="w-3.5 h-3.5 text-[#143D2B]" />}
              >
                Get Directions
              </Button>
            </a>
          </div>

          <div className="flex items-center gap-2">
            {/* Cancellation trigger: Guarded by isValidBookingTransition */}
            {canCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenCancelModal(activeBooking)}
                className="text-[#9E2A2B] hover:text-[#9E2A2B] hover:bg-[#FDF2F2]"
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Cancel Booking
              </Button>
            )}
          </div>

          {/* Raise Dispute button: Guarded by isValidBookingTransition */}
          {canDispute && (
            <button
              type="button"
              onClick={() => onOpenDisputeModal(activeBooking)}
              className="text-center text-xs font-semibold text-[#52524E] hover:text-[#C25E28] hover:underline py-1 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-[#C25E28]" />
              <span>Issue at venue? Raise Dispute / Contact Priority Support</span>
            </button>
          )}

          {activeBooking.status === 'DISPUTED' && (
            <div className="p-3 rounded-xl bg-[#FDF2F2] border border-[#F8D7DA] flex items-center gap-2 text-xs text-[#9E2A2B]">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Dispute active on this booking. Our customer grievance officer is reviewing.</span>
            </div>
          )}
        </div>
      </div>
    </Drawer>

    {/* Refund Claim Modal */}
    <Modal
      isOpen={isRefundModalOpen}
      onClose={() => setIsRefundModalOpen(false)}
      title="Submit Refund Claim"
      description={`Reference #${activeBooking.bookingReference} • ${activeBooking.providerName}`}
      maxWidth="md"
    >
      <form onSubmit={handleInitiateRefund} className="space-y-4">
        {refundError && (
          <div className="p-3 rounded-lg bg-[#FDF2F2] border border-[#F8D7DA] text-xs text-[#9E2A2B]">
            {refundError}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#141413]">
            Reason for Refund Claim
          </label>
          <select
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2DDD5] bg-white text-[#141413] focus:outline-none focus:border-[#C25E28]"
          >
            <option value="Partner unable to fulfill reservation / venue closed">
              Partner unable to fulfill reservation / venue closed
            </option>
            <option value="Severe service deviation or quality defect">
              Severe service deviation or quality defect
            </option>
            <option value="Overcharged or duplicate advance payment">
              Overcharged or duplicate advance payment
            </option>
            <option value="Customer cancelled within free cancellation window">
              Customer cancelled within free cancellation window
            </option>
            <option value="Other billing / payment grievance">
              Other billing / payment grievance
            </option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#141413]">
            Additional Details &amp; Comments (Optional)
          </label>
          <textarea
            value={customRefundNote}
            onChange={(e) => setCustomRefundNote(e.target.value)}
            rows={2}
            placeholder="e.g. Arrived at Fraser Road branch at 7:30 PM but venue was closed."
            className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2DDD5] bg-white text-[#141413] focus:outline-none focus:border-[#C25E28]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#141413]">
            Payout Destination (UPI ID or Bank Details) <span className="text-[#9E2A2B]">*</span>
          </label>
          <input
            type="text"
            required
            value={refundUpiOrBankRef}
            onChange={(e) => setRefundUpiOrBankRef(e.target.value)}
            placeholder="e.g. 9876543210@paytm or HDFC0001234 A/C 50100..."
            className="w-full px-3 py-2 text-xs rounded-lg border border-[#E2DDD5] bg-white text-[#141413] font-mono focus:outline-none focus:border-[#C25E28]"
          />
          <p className="text-[11px] text-[#78716C]">
            Verified refund settlements are wired directly within 4 to 24 business hours.
          </p>
        </div>

        <div className="p-3 rounded-lg bg-[#FAF9F6] border border-[#E2DDD5] flex items-start gap-2 text-[11px] text-[#52524E]">
          <HelpCircle className="w-3.5 h-3.5 text-[#C25E28] shrink-0 mt-0.5" />
          <span>
            Refund claims are governed under BOOKKARO&apos;s Bihar Consumer Protection Policy and processed through our Patna Escrow Desk.
          </span>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2DDD5]">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsRefundModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSubmittingRefund}
            className="bg-[#C25E28] hover:bg-[#A94F20] text-white"
          >
            {isSubmittingRefund ? 'Submitting...' : 'Submit Claim'}
          </Button>
        </div>
      </form>
    </Modal>
    </>
  );
};
