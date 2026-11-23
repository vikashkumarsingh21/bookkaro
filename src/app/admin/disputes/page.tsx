'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  CheckCircle2,
  ArrowRight,
  Info,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useAdminPortal } from '@/context/AdminPortalContext';
import { PlatformDispute, adminService } from '@/services/adminService';
import { bookingService } from '@/services/bookingService';
import { BookingRequest } from '@/types/booking';
import { Drawer } from '@/components/ui/Drawer';

type FilterTab =
  | 'ALL'
  | 'OPEN_INVESTIGATING'
  | 'RESOLVED_UPHELD'
  | 'RESOLVED_REFUNDED_ADJUSTED'
  | 'REFUND_REQUESTS';

export default function AdminDisputesPage() {
  const { disputes, resolveDispute } = useAdminPortal();

  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDispute, setSelectedDispute] = useState<PlatformDispute | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Bookings list for Refund Claims management
  const [allBookings, setAllBookings] = useState<BookingRequest[]>(() => bookingService.getAllBookings());
  const [refundActionLoading, setRefundActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = bookingService.subscribe(() => {
      setAllBookings(bookingService.getAllBookings());
    });
    return unsubscribe;
  }, []);

  const refundClaims = useMemo(() => {
    return allBookings.filter((b) => ['REFUND_REQUESTED', 'REFUNDED'].includes(b.status));
  }, [allBookings]);

  const pendingRefundsCount = useMemo(() => {
    return allBookings.filter((b) => b.status === 'REFUND_REQUESTED').length;
  }, [allBookings]);

  const filteredRefundClaims = useMemo(() => {
    return refundClaims.filter((b) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchRef = b.bookingReference.toLowerCase().includes(q);
        const matchCust = b.customerName.toLowerCase().includes(q);
        const matchPhone = b.customerPhone.toLowerCase().includes(q);
        const matchProv = b.providerName.toLowerCase().includes(q);
        const matchReason = (b.refundRequest?.reason || '').toLowerCase().includes(q);
        const matchUpi = (b.refundRequest?.upiOrBankRef || '').toLowerCase().includes(q);
        if (!matchRef && !matchCust && !matchPhone && !matchProv && !matchReason && !matchUpi) return false;
      }
      return true;
    });
  }, [refundClaims, searchQuery]);

  // Resolution form state
  const [resolutionAction, setResolutionAction] = useState<'UPHOLD_BOOKING' | 'REFUND_WAIVER' | 'COMMISSION_ADJUSTMENT'>('UPHOLD_BOOKING');
  const [resolutionNote, setResolutionNote] = useState('');
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Filtered disputes
  const filteredDisputes = useMemo(() => {
    return disputes.filter((disp) => {
      // Tab filter
      if (activeTab === 'OPEN_INVESTIGATING') {
        if (!['OPEN', 'INVESTIGATING'].includes(disp.status)) return false;
      } else if (activeTab === 'RESOLVED_UPHELD') {
        if (disp.status !== 'RESOLVED_UPHELD') return false;
      } else if (activeTab === 'RESOLVED_REFUNDED_ADJUSTED') {
        if (!['RESOLVED_REFUNDED', 'RESOLVED_ADJUSTED'].includes(disp.status)) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRef = disp.bookingReference.toLowerCase().includes(q);
        const matchesId = disp.id.toLowerCase().includes(q);
        const matchesCust = disp.customerName.toLowerCase().includes(q);
        const matchesPhone = disp.customerPhone.toLowerCase().includes(q);
        const matchesProv = disp.providerName.toLowerCase().includes(q);
        const matchesReason = disp.reason.toLowerCase().includes(q);
        if (!matchesRef && !matchesId && !matchesCust && !matchesPhone && !matchesProv && !matchesReason) {
          return false;
        }
      }

      return true;
    });
  }, [disputes, activeTab, searchQuery]);

  const openInspection = (disp: PlatformDispute) => {
    setSelectedDispute(disp);
    setResolutionNote('');
    setAdjustmentAmount(disp.billAmountInr || 0);
    setResolutionAction('UPHOLD_BOOKING');
    setActionSuccessMsg(null);
    setDrawerOpen(true);
  };

  const handleApproveRefund = async (booking: BookingRequest) => {
    const defaultNote = `Settled full refund of ₹${booking.pricing.amountPayableAtVenue} to ${booking.refundRequest?.upiOrBankRef || 'customer'}. Validated under Patna merchant SLA.`;
    const note = window.prompt(
      `Approve Refund for #${booking.bookingReference}?\n\nEnter administrative audit resolution memo:`,
      defaultNote
    );
    if (note === null) return;

    try {
      setRefundActionLoading(booking.id);
      await bookingService.approveRefund(booking.id, note.trim() || defaultNote);
      adminService.appendAuditLog({
        actorRole: 'ADMIN',
        actorName: 'Patna Grievance Officer',
        actionType: 'REFUND_APPROVED',
        targetId: booking.id,
        summary: `Approved refund of ₹${booking.pricing.amountPayableAtVenue} for #${booking.bookingReference}.`,
        metadata: {
          bookingId: booking.id,
          bookingReference: booking.bookingReference,
          amountInr: booking.pricing.amountPayableAtVenue,
          customerName: booking.customerName,
          customerPhone: booking.customerPhone,
          upiOrBankRef: booking.refundRequest?.upiOrBankRef,
          note: note.trim() || defaultNote,
        },
      });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to approve refund.');
    } finally {
      setRefundActionLoading(null);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispute) return;
    if (!resolutionNote.trim()) {
      alert('Please enter a clear arbitration resolution note for the audit ledger.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await resolveDispute(selectedDispute.id, {
        action: resolutionAction,
        note: resolutionNote.trim(),
        adjustmentAmountInr:
          resolutionAction === 'REFUND_WAIVER' || resolutionAction === 'COMMISSION_ADJUSTMENT'
            ? Number(adjustmentAmount)
            : undefined,
      });

      setSelectedDispute(updated);
      setActionSuccessMsg(
        `Dispute ${updated.id} successfully resolved under ${resolutionAction}. Immutable audit log appended.`
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to resolve dispute');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCount = disputes.filter((d) => ['OPEN', 'INVESTIGATING'].includes(d.status)).length;
  const upheldCount = disputes.filter((d) => d.status === 'RESOLVED_UPHELD').length;
  const refundedCount = disputes.filter((d) => ['RESOLVED_REFUNDED', 'RESOLVED_ADJUSTED'].includes(d.status)).length;

  return (
    <div className="space-y-5">
      {/* 1. TOP HEADER & COMPLIANCE CONTEXT */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#525259]">
            <span className="w-2 h-2 rounded-full bg-[#911D23]" />
            <span>Arbitration &amp; Grievance Desk</span>
            <span className="text-[#DCDCD8]">•</span>
            <span>Consumer Protection Act (48h Notice SLA)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#151517] tracking-tight mt-1">
            Dispute Escalation Center &amp; Overrides
          </h1>
          <p className="text-xs text-[#525259] mt-0.5">
            Mediate consumer booking complaints, offline venue check-in disputes, and realized billing adjustments.
          </p>
        </div>

        {/* Quick summary stats */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1.5 bg-white rounded-[6px] border border-[#DCDCD8] text-left">
            <div className="text-[10px] font-mono uppercase text-[#525259]">Active Disputes</div>
            <div className="text-base font-mono font-bold text-[#911D23] tabular-nums">
              {openCount} Open
            </div>
          </div>
          <div className="px-3 py-1.5 bg-white rounded-[6px] border border-[#DCDCD8] text-left">
            <div className="text-[10px] font-mono uppercase text-[#525259]">Refund Claims</div>
            <div className="text-base font-mono font-bold text-[#C25E28] tabular-nums">
              {pendingRefundsCount} Pending
            </div>
          </div>
          <div className="px-3 py-1.5 bg-white rounded-[6px] border border-[#DCDCD8] text-left">
            <div className="text-[10px] font-mono uppercase text-[#525259]">Upheld (Partner)</div>
            <div className="text-base font-mono font-bold text-[#165234] tabular-nums">
              {upheldCount}
            </div>
          </div>
          <div className="px-3 py-1.5 bg-white rounded-[6px] border border-[#DCDCD8] text-left">
            <div className="text-[10px] font-mono uppercase text-[#525259]">Refunded / Adjusted</div>
            <div className="text-base font-mono font-bold text-[#151517] tabular-nums">
              {refundedCount}
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATUTORY LEGAL CALLOUT */}
      <div className="p-3.5 bg-[#F8F8F7] rounded-[6px] border border-[#DCDCD8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs text-[#525259]">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-[#6B1D2F] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-[#151517]">Statutory Dispute Mediation Mandate:</strong> In compliance with the Consumer Protection (E-Commerce) Rules 2020/2026, BOOKKARO provides dual-party dispute arbitration with offline counter Venue PIN audit trails. Grievances must be acknowledged within 48 hours.
          </div>
        </div>
        <Link
          href="/admin/controls"
          className="shrink-0 text-xs font-mono font-semibold text-[#6B1D2F] hover:underline flex items-center gap-1"
        >
          <span>Grievance Policy</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* 3. CONTROLS BAR: TABS & SEARCH */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-mono transition-colors whitespace-nowrap ${
                activeTab === 'ALL'
                  ? 'bg-[#1A1A1D] text-white font-medium'
                  : 'bg-white text-[#525259] hover:text-[#151517] border border-[#DCDCD8]'
              }`}
            >
              All Disputes ({disputes.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('OPEN_INVESTIGATING')}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-mono transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'OPEN_INVESTIGATING'
                  ? 'bg-[#911D23] text-white font-medium'
                  : 'bg-white text-[#525259] hover:text-[#151517] border border-[#DCDCD8]'
              }`}
            >
              <span>Under Review</span>
              <span className={`px-1.5 py-0.2 text-[10px] rounded font-mono font-bold ${
                activeTab === 'OPEN_INVESTIGATING' ? 'bg-white/20 text-white' : 'bg-[#FCEBEC] text-[#911D23]'
              }`}>
                {openCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('REFUND_REQUESTS')}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-mono transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'REFUND_REQUESTS'
                  ? 'bg-[#C25E28] text-white font-medium'
                  : 'bg-white text-[#525259] hover:text-[#151517] border border-[#DCDCD8]'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refund Claims</span>
              <span className={`px-1.5 py-0.2 text-[10px] rounded font-mono font-bold ${
                activeTab === 'REFUND_REQUESTS' ? 'bg-white/20 text-white' : 'bg-[#FAF1EB] text-[#C25E28]'
              }`}>
                {pendingRefundsCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('RESOLVED_UPHELD')}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-mono transition-colors whitespace-nowrap ${
                activeTab === 'RESOLVED_UPHELD'
                  ? 'bg-[#1A1A1D] text-white font-medium'
                  : 'bg-white text-[#525259] hover:text-[#151517] border border-[#DCDCD8]'
              }`}
            >
              Upheld ({upheldCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('RESOLVED_REFUNDED_ADJUSTED')}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-mono transition-colors whitespace-nowrap ${
                activeTab === 'RESOLVED_REFUNDED_ADJUSTED'
                  ? 'bg-[#1A1A1D] text-white font-medium'
                  : 'bg-white text-[#525259] hover:text-[#151517] border border-[#DCDCD8]'
              }`}
            >
              Refunded / Adjusted ({refundedCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-[#525259] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference, customer, partner, ticket..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#DCDCD8] rounded-[6px] text-xs font-mono text-[#151517] placeholder:text-[#525259]/60 focus:outline-none focus:border-[#6B1D2F]"
            />
          </div>
        </div>
      </div>

      {/* 4. CONTENT AREA: REFUND CLAIMS OR DISPUTES TABLE */}
      {activeTab === 'REFUND_REQUESTS' ? (
        <div className="bg-white rounded-[6px] border border-[#DCDCD8] overflow-hidden">
          <div className="p-3.5 bg-[#FAF1EB]/60 border-b border-[#E2DDD5] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-mono">
              <RotateCcw className="w-4 h-4 text-[#C25E28]" />
              <span className="font-semibold text-[#141413]">
                Customer Refund Claims Queue ({refundClaims.length} records)
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#52524E]">
              Direct settlements processed to customer UPI / Bank under Patna merchant SLA
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#F8F8F7] border-b border-[#DCDCD8] text-[10px] uppercase font-mono text-[#525259]">
                <tr>
                  <th className="px-3.5 py-2.5">Booking Ref</th>
                  <th className="px-3.5 py-2.5">Customer</th>
                  <th className="px-3.5 py-2.5">Provider Venue</th>
                  <th className="px-3.5 py-2.5">Claim Reason &amp; Date</th>
                  <th className="px-3.5 py-2.5">Payout Handle (UPI / A/C)</th>
                  <th className="px-3.5 py-2.5 text-right">Bill Value</th>
                  <th className="px-3.5 py-2.5">Status</th>
                  <th className="px-3.5 py-2.5 text-right">Settlement Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCDCD8]">
                {filteredRefundClaims.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-xs font-mono text-[#525259]">
                      No customer refund claims found in this view.
                    </td>
                  </tr>
                ) : (
                  filteredRefundClaims.map((b) => (
                    <tr key={b.id} className="hover:bg-[#F8F8F7] transition-colors">
                      <td className="px-3.5 py-2.5 font-mono font-bold text-[#141413]">
                        #{b.bookingReference}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <div className="font-medium text-[#151517]">{b.customerName}</div>
                        <div className="text-[10px] font-mono text-[#525259]">{b.customerPhone}</div>
                      </td>
                      <td className="px-3.5 py-2.5 text-[#525259]">
                        <div className="font-medium text-[#151517]">{b.providerName}</div>
                        <div className="text-[10px] font-mono capitalize">{b.category}</div>
                      </td>
                      <td className="px-3.5 py-2.5 text-[#525259] max-w-xs">
                        <div className="line-clamp-2 text-[#151517] font-medium">
                          {b.refundRequest?.reason || b.cancellationReason || 'Direct customer claim'}
                        </div>
                        {b.refundRequest?.requestedAt && (
                          <div className="text-[10px] font-mono text-[#78716C] mt-0.5">
                            {new Date(b.refundRequest.requestedAt).toLocaleString('en-IN', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </div>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5 font-mono text-xs">
                        {b.refundRequest?.upiOrBankRef ? (
                          <span className="font-semibold text-[#C25E28] bg-[#FAF1EB] px-2 py-0.5 rounded border border-[#E2DDD5]">
                            {b.refundRequest.upiOrBankRef}
                          </span>
                        ) : (
                          <span className="text-[#A8A29E] italic">Primary Account</span>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-mono font-bold text-[#151517] tabular-nums">
                        ₹{b.pricing.amountPayableAtVenue.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3.5 py-2.5 whitespace-nowrap">
                        {b.status === 'REFUND_REQUESTED' ? (
                          <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-mono uppercase tracking-wider bg-[#FAF1EB] text-[#C25E28] border border-[#E2DDD5] font-semibold inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C25E28] animate-pulse" />
                            Pending Review
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-mono uppercase tracking-wider bg-[#EAF5EE] text-[#165234] border border-[#C2E4CD] font-semibold inline-flex items-center gap-1">
                            <Check className="w-3 h-3 text-[#165234]" />
                            Settled Refund
                          </span>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                        {b.status === 'REFUND_REQUESTED' ? (
                          <button
                            type="button"
                            disabled={refundActionLoading === b.id}
                            onClick={() => handleApproveRefund(b)}
                            className="px-2.5 py-1 rounded-[4px] bg-[#143D2B] hover:bg-[#0E2C1E] text-white text-xs font-mono font-medium transition-colors cursor-pointer"
                          >
                            {refundActionLoading === b.id ? 'Processing...' : 'Approve & Mark Refunded'}
                          </button>
                        ) : (
                          <span className="text-[11px] font-mono text-[#525259] italic">
                            Disbursed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[6px] border border-[#DCDCD8] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#F8F8F7] border-b border-[#DCDCD8] text-[10px] uppercase font-mono text-[#525259]">
                <tr>
                  <th className="px-3.5 py-2.5">Ticket ID</th>
                  <th className="px-3.5 py-2.5">Booking Ref</th>
                  <th className="px-3.5 py-2.5">Customer</th>
                  <th className="px-3.5 py-2.5">Provider Venue</th>
                  <th className="px-3.5 py-2.5">Complaint Category</th>
                  <th className="px-3.5 py-2.5 text-center">PIN Checked</th>
                  <th className="px-3.5 py-2.5 text-right">Bill Value</th>
                  <th className="px-3.5 py-2.5">Status</th>
                  <th className="px-3.5 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCDCD8]">
                {filteredDisputes.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-xs font-mono text-[#525259]">
                      No escalated disputes found in this filter view.
                    </td>
                  </tr>
                ) : (
                  filteredDisputes.map((disp) => (
                    <tr key={disp.id} className="hover:bg-[#F8F8F7] transition-colors">
                      <td className="px-3.5 py-2.5 font-mono font-bold text-[#6B1D2F]">
                        {disp.id}
                      </td>
                      <td className="px-3.5 py-2.5 font-mono text-[#151517]">
                        #{disp.bookingReference}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <div className="font-medium text-[#151517]">{disp.customerName}</div>
                        <div className="text-[10px] font-mono text-[#525259]">{disp.customerPhone}</div>
                      </td>
                      <td className="px-3.5 py-2.5 text-[#525259]">
                        <div className="font-medium text-[#151517]">{disp.providerName}</div>
                        <div className="text-[10px] font-mono capitalize">{disp.category}</div>
                      </td>
                      <td className="px-3.5 py-2.5 text-[#525259]">
                        <div className="line-clamp-1">{disp.reason}</div>
                      </td>
                      <td className="px-3.5 py-2.5 text-center">
                        {disp.venuePinVerified ? (
                          <span className="font-mono text-[10px] text-[#165234] bg-[#EAF5EE] border border-[#C2E4CD] px-1.5 py-0.2 rounded font-semibold inline-flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" /> Verified
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] text-[#911D23] bg-[#FCEBEC] border border-[#F8D7DA] px-1.5 py-0.2 rounded font-semibold">
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-mono font-bold text-[#151517] tabular-nums">
                        ₹{disp.billAmountInr.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3.5 py-2.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-[4px] text-[10px] font-mono uppercase tracking-wider ${
                            disp.status === 'RESOLVED_UPHELD'
                              ? 'bg-[#EAF5EE] text-[#165234] border border-[#C2E4CD]'
                              : disp.status === 'RESOLVED_REFUNDED' || disp.status === 'RESOLVED_ADJUSTED'
                              ? 'bg-[#FBF2DF] text-[#7C4B06] border border-[#F3DEC9]'
                              : 'bg-[#FCEBEC] text-[#911D23] border border-[#F8D7DA]'
                          }`}
                        >
                          {disp.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => openInspection(disp)}
                          className="px-2.5 py-1 rounded-[4px] bg-[#1A1A1D] hover:bg-[#0B0B0D] text-white text-xs font-mono font-medium transition-colors"
                        >
                          Arbitrate
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. ARBITRATION SLIDE-OVER DRAWER */}
      {selectedDispute && (
        <Drawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={`Arbitration: ${selectedDispute.id}`}
          description={`Customer: ${selectedDispute.customerName} vs. ${selectedDispute.providerName}`}
          size="lg"
        >
          <div className="space-y-5 text-xs text-[#151517] font-sans">
            {actionSuccessMsg && (
              <div className="p-3 rounded-[6px] bg-[#EAF5EE] border border-[#C2E4CD] text-[#165234] text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{actionSuccessMsg}</span>
              </div>
            )}

            {/* Case Particulars */}
            <div className="p-3.5 rounded-[6px] bg-[#F8F8F7] border border-[#DCDCD8] space-y-2">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-[#525259]">Booking Reference:</span>
                <span className="font-bold text-[#6B1D2F]">#{selectedDispute.bookingReference}</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-[#525259]">Billed Amount:</span>
                <span className="font-bold text-[#151517] tabular-nums">
                  ₹{selectedDispute.billAmountInr.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-[#525259]">4-Digit Counter Venue PIN:</span>
                <span className={selectedDispute.venuePinVerified ? 'text-[#165234] font-bold' : 'text-[#911D23] font-bold'}>
                  {selectedDispute.venuePinVerified ? 'VERIFIED AT VENUE CHECK-IN' : 'NOT RECORDED AT VENUE'}
                </span>
              </div>
              <div className="pt-2 border-t border-[#DCDCD8] text-[11px] text-[#525259]">
                <strong className="text-[#151517]">Grievance: </strong>
                {selectedDispute.description}
              </div>
            </div>

            {/* Previous Resolution Note if resolved */}
            {selectedDispute.resolutionNote && (
              <div className="p-3 rounded-[6px] bg-[#EAF5EE] border border-[#C2E4CD] text-[11px] font-mono space-y-1">
                <div className="font-bold text-[#165234]">Arbitration Determination Logged:</div>
                <div className="text-[#151517]">{selectedDispute.resolutionNote}</div>
                {selectedDispute.refundOrAdjustmentInr && (
                  <div className="text-[#165234] font-semibold mt-1">
                    Settled Adjustment Amount: ₹{selectedDispute.refundOrAdjustmentInr.toLocaleString('en-IN')}
                  </div>
                )}
              </div>
            )}

            {/* Arbitration Action Form */}
            <form onSubmit={handleResolve} className="space-y-4 pt-1">
              <div className="font-semibold text-xs font-mono uppercase tracking-wider text-[#151517] border-b border-[#DCDCD8] pb-1">
                Administrative Arbitration Action
              </div>

              <div className="space-y-2">
                <label className="flex items-start gap-2.5 p-2.5 rounded-[6px] border border-[#DCDCD8] bg-white cursor-pointer">
                  <input
                    type="radio"
                    name="disputeAction"
                    checked={resolutionAction === 'UPHOLD_BOOKING'}
                    onChange={() => setResolutionAction('UPHOLD_BOOKING')}
                    className="mt-0.5 accent-[#6B1D2F]"
                  />
                  <div>
                    <div className="font-semibold text-xs text-[#151517]">
                      Uphold Booking (Partner In Accordance)
                    </div>
                    <div className="text-[11px] text-[#525259]">
                      Venue PIN check-in verified; no cash refund granted. Partner keeps payout.
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2.5 rounded-[6px] border border-[#DCDCD8] bg-white cursor-pointer">
                  <input
                    type="radio"
                    name="disputeAction"
                    checked={resolutionAction === 'REFUND_WAIVER'}
                    onChange={() => setResolutionAction('REFUND_WAIVER')}
                    className="mt-0.5 accent-[#6B1D2F]"
                  />
                  <div>
                    <div className="font-semibold text-xs text-[#151517]">
                      Authorize Customer Refund / Waiver
                    </div>
                    <div className="text-[11px] text-[#525259]">
                      Merchant breached SLA or service unfulfilled. Reverse customer charge.
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2.5 rounded-[6px] border border-[#DCDCD8] bg-white cursor-pointer">
                  <input
                    type="radio"
                    name="disputeAction"
                    checked={resolutionAction === 'COMMISSION_ADJUSTMENT'}
                    onChange={() => setResolutionAction('COMMISSION_ADJUSTMENT')}
                    className="mt-0.5 accent-[#6B1D2F]"
                  />
                  <div>
                    <div className="font-semibold text-xs text-[#151517]">
                      Adjust Partner Commission Ledger Entry
                    </div>
                    <div className="text-[11px] text-[#525259]">
                      Waive platform commission fee and adjust merchant payout ledger row.
                    </div>
                  </div>
                </label>
              </div>

              {/* Adjustment amount input if refund or commission adjustment */}
              {(resolutionAction === 'REFUND_WAIVER' || resolutionAction === 'COMMISSION_ADJUSTMENT') && (
                <div className="space-y-1">
                  <label className="block text-[11px] font-mono text-[#525259]">
                    Adjustment Value (INR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={selectedDispute.billAmountInr * 2}
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-mono px-3 py-1.5 rounded-[6px] border border-[#DCDCD8] bg-white text-[#151517] outline-none focus:border-[#6B1D2F]"
                  />
                </div>
              )}

              {/* Statutory Note */}
              <div className="space-y-1">
                <label className="block text-[11px] font-mono font-semibold text-[#151517]">
                  Arbitration Reason / Order Memo (Appended to Immutable DPDP Log) <span className="text-[#911D23]">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="State the factual basis for this determination (e.g. Venue PIN confirmed arrival, restaurant table unavailable, etc.)..."
                  className="w-full text-xs font-mono p-2.5 rounded-[6px] border border-[#DCDCD8] bg-white text-[#151517] outline-none focus:border-[#6B1D2F] resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#DCDCD8]">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="px-3 py-1.5 rounded-[6px] border border-[#DCDCD8] bg-white text-[#525259] hover:bg-[#F2F2F0] text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-[6px] bg-[#6B1D2F] hover:bg-[#521523] disabled:opacity-50 text-white text-xs font-mono font-semibold transition-colors shadow-xs"
                >
                  {isSubmitting ? 'Recording Audit...' : 'Execute Arbitration & Log Audit'}
                </button>
              </div>
            </form>
          </div>
        </Drawer>
      )}
    </div>
  );
}
