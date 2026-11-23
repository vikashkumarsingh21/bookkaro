'use client';

import React from 'react';
import Link from 'next/link';
import {
  Hourglass,
  CalendarCheck,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Clock,
  ShieldCheck,
  KeyRound,
  Users,
  BedDouble,
  UtensilsCrossed,
  Sparkles,
} from 'lucide-react';
import { useProviderPortal } from '@/context/ProviderPortalContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BookingStatusBadge } from '@/components/dashboard/BookingStatusBadge';

export default function ProviderPortalOverviewPage() {
  const {
    activeMerchant,
    bookings,
    pendingCount,
    todayConfirmedCount,
    completedThisMonthCount,
    netEarningsInr,
    acceptBooking,
  } = useProviderPortal();

  const { currentWorkspace, setWorkspace } = useWorkspace();
  const isStaff = currentWorkspace === 'PARTNER_STAFF';

  // Count check-ins completed today
  const todayCompletedCount = bookings.filter((b) => b.status === 'COMPLETED').length;

  // Upcoming confirmed slots or pending requests for today
  const todayRoster = bookings.filter((b) => ['CONFIRMED', 'REQUESTED'].includes(b.status));

  return (
    <div className="space-y-6">
      {/* 1. TOP TITLE & MERCHANT WELCOME */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#52524E]">
            <span className="w-2 h-2 rounded-full bg-[#21503A]" />
            <span>Patna Front-Desk Operations Command</span>
            <span className="text-[#E5DDD2]">•</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                isStaff
                  ? 'bg-[#EFEAE2] text-[#52524E] border border-[#E5DDD2]'
                  : 'bg-[#9C421C] text-white'
              }`}
            >
              {isStaff ? 'Staff Counter View' : 'Owner Executive View'}
            </span>
          </div>
          <h1 className="font-[var(--font-partner-display)] font-bold text-2xl sm:text-3xl text-[#141413] tracking-tight mt-1">
            {activeMerchant.name}
          </h1>
          <p className="text-xs sm:text-sm text-[#52524E] mt-0.5">
            {activeMerchant.legalBusinessName} • {activeMerchant.locality}, {activeMerchant.city}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            href="/provider-portal/bookings"
            variant="outline"
            className="bg-[#9C421C] text-white hover:bg-[#7F3516] border-none font-bold text-xs min-h-[44px] px-5 rounded-lg shadow-xs"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Open Triage Queue ({pendingCount})
          </Button>
        </div>
      </div>

      {/* Staff mode notification banner */}
      {isStaff && (
        <div className="p-4 rounded-[10px] bg-[#EFEAE2] border border-[#E5DDD2] flex items-center justify-between gap-3 text-xs text-[#52524E]">
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-[#9C421C] shrink-0" />
            <span>
              <strong className="text-[#141413]">Front-Desk Staff Roster Mode:</strong> Focused on daily guest arrivals &amp; 4-digit Venue PIN counter verification. Financial revenue ledgers and banking records are restricted.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setWorkspace('PARTNER_OWNER')}
            className="text-[11px] font-bold text-[#9C421C] hover:underline shrink-0"
          >
            Switch to Owner
          </button>
        </div>
      )}

      {/* 2. KEY KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Pending Requests */}
        <div className="p-5 rounded-[10px] bg-white border border-[#E5DDD2] hover:border-[#9C421C]/40 transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#52524E]">
              Pending Requests
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF1EB] border border-[#F3DEC9] flex items-center justify-center text-[#9C421C]">
              <Hourglass className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-[var(--font-partner-display)] font-bold text-3xl text-[#9C421C] tabular-nums">
              {pendingCount}
            </span>
            <span className="text-[11px] font-bold text-[#9C421C] uppercase tracking-wider">
              {pendingCount > 0 ? '<90s SLA' : 'Cleared'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[#52524E]">
            Awaiting front-desk triage under Patna hospitality SLA
          </div>
        </div>

        {/* KPI 2: Today's Confirmed Slots */}
        <div className="p-5 rounded-[10px] bg-white border border-[#E5DDD2] hover:border-[#21503A]/40 transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#52524E]">
              Today Confirmed
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#EBF1ED] border border-[#CFDFD5] flex items-center justify-center text-[#21503A]">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-[var(--font-partner-display)] font-bold text-3xl text-[#21503A] tabular-nums">
              {todayConfirmedCount}
            </span>
            <span className="text-[11px] font-bold text-[#21503A] uppercase tracking-wider">
              Live Roster
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[#52524E]">
            Expected arrivals at venue today (tokens locked)
          </div>
        </div>

        {/* KPI 3: Completed This Month */}
        <div className="p-5 rounded-[10px] bg-white border border-[#E5DDD2] transition-all shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#52524E]">
              Completed Month
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F6F3EE] border border-[#E5DDD2] flex items-center justify-center text-[#21503A]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-[var(--font-partner-display)] font-bold text-3xl text-[#141413] tabular-nums">
              {completedThisMonthCount}
            </span>
            <span className="text-[11px] font-bold text-[#21503A]">
              +18.4% MoM
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[#52524E]">
            Fulfilled visits across all Patna suites &amp; tables
          </div>
        </div>

        {/* KPI 4: Role-Guarded Metric */}
        {isStaff ? (
          <div className="p-5 rounded-[10px] bg-white border border-[#E5DDD2] transition-all shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#52524E]">
                Today Check-Ins
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#EBF1ED] border border-[#CFDFD5] flex items-center justify-center text-[#21503A]">
                <KeyRound className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-[var(--font-partner-display)] font-bold text-3xl text-[#21503A] tabular-nums">
                {todayCompletedCount}
              </span>
              <span className="text-[11px] font-bold text-[#21503A] uppercase tracking-wider">
                Verified
              </span>
            </div>
            <div className="mt-2 text-[11px] text-[#52524E]">
              4-digit Venue PINs validated at front counter
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-[10px] bg-white border border-[#E5DDD2] transition-all shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#52524E]">
                Net Disbursed
              </span>
              <div className="w-8 h-8 rounded-lg bg-[#EBF1ED] border border-[#CFDFD5] flex items-center justify-center text-[#21503A]">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-[var(--font-partner-display)] font-bold text-2xl sm:text-3xl text-[#21503A] tabular-nums">
                ₹{netEarningsInr.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-[#52524E]">
              Settled to Bank A/c • Cycle: T+1 Daily
            </div>
          </div>
        )}
      </div>

      {/* 3. QUICK ACTION OPERATIONAL ALERTS */}
      <div className="space-y-3">
        {pendingCount > 0 && (
          <div className="p-4 rounded-[10px] bg-[#FCEFE8] border border-[#F3DEC9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#9C421C] text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="font-[var(--font-partner-display)] font-bold text-sm text-[#943D18]">
                  {pendingCount} incoming guest reservations require front-desk confirmation
                </div>
                <div className="text-xs text-[#52524E] mt-0.5">
                  Guests in {activeMerchant.city} receive instant SMS/WhatsApp updates once confirmed under Patna &lt;90s SLA.
                </div>
              </div>
            </div>
            <Button
              href="/provider-portal/bookings"
              variant="outline"
              className="bg-[#9C421C] text-white hover:bg-[#7F3516] border-none font-bold text-xs min-h-[44px] px-5 rounded-lg shrink-0"
            >
              Review Requests
            </Button>
          </div>
        )}

        <div className="p-4 rounded-[10px] bg-white border border-[#E5DDD2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#EBF1ED] text-[#21503A] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-[#141413]">
                Merchant Compliance &amp; Verification Shield Active
              </div>
              <div className="text-[#52524E]">
                GSTIN: {activeMerchant.gstin} • License: {activeMerchant.complianceNumber} ({activeMerchant.complianceType})
              </div>
            </div>
          </div>
          <Badge variant="forest-subtle" size="sm">
            {activeMerchant.verificationBadge}
          </Badge>
        </div>
      </div>

      {/* 4. TODAY'S LIVE ROSTER & APPOINTMENT STREAM */}
      <div className="bg-white rounded-[10px] border border-[#E5DDD2] overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-[#E5DDD2] flex items-center justify-between">
          <div>
            <h2 className="font-[var(--font-partner-display)] font-bold text-base text-[#141413]">
              Today&apos;s Operational Roster
            </h2>
            <p className="text-xs text-[#52524E] mt-0.5">
              Live front-desk queue of guest arrivals and reserved suites/tables
            </p>
          </div>
          <Link
            href="/provider-portal/bookings"
            className="text-xs font-bold text-[#9C421C] hover:underline flex items-center gap-1"
          >
            <span>View Full Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-[#E5DDD2]">
          {todayRoster.length === 0 ? (
            <div className="p-10 text-center text-xs text-[#52524E]">
              No active slots currently scheduled for today.
            </div>
          ) : (
            todayRoster.map((booking) => (
              <div
                key={booking.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F6F3EE]/50 transition-colors"
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-[#F6F3EE] border border-[#E5DDD2] flex items-center justify-center text-[#21503A] font-mono font-bold text-xs shrink-0">
                    <Clock className="w-4 h-4 text-[#21503A]" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-[#52524E]">
                        #{booking.bookingReference}
                      </span>
                      <BookingStatusBadge status={booking.status} size="sm" />
                      <span className="text-[11px] font-bold text-[#21503A] bg-[#EBF1ED] px-2 py-0.5 rounded">
                        {booking.scheduledTime}
                      </span>
                    </div>

                    <div className="font-[var(--font-partner-display)] font-bold text-sm text-[#141413] truncate">
                      {booking.customerName}
                    </div>

                    <div className="text-xs text-[#52524E] truncate">
                      {booking.serviceName}
                    </div>

                    {/* Hospitality Parameters */}
                    <div className="text-[11px] font-medium text-[#52524E] flex items-center gap-1.5 flex-wrap">
                      {booking.categoryDetails.roomType && (
                        <span className="inline-flex items-center gap-1">
                          <BedDouble className="w-3 h-3 text-[#9C421C]" />
                          <span>{booking.categoryDetails.roomType} ({booking.categoryDetails.nights || 1} nights, {booking.categoryDetails.guestCount || 2} guests)</span>
                        </span>
                      )}
                      {booking.categoryDetails.partySize && (
                        <span className="inline-flex items-center gap-1">
                          <UtensilsCrossed className="w-3 h-3 text-[#9C421C]" />
                          <span>Party of {booking.categoryDetails.partySize} ({booking.categoryDetails.seatingArea || 'Dining Room'})</span>
                        </span>
                      )}
                      {booking.categoryDetails.visitType && (
                        <span className="inline-flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#9C421C]" />
                          <span>{booking.categoryDetails.visitType}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Action with min-h-[44px] touch comfort */}
                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5DDD2]">
                  {booking.status === 'REQUESTED' ? (
                    <Button
                      variant="outline"
                      className="bg-[#21503A] text-white hover:bg-[#1A402E] border-none font-bold text-xs min-h-[44px] px-5 rounded-lg shadow-xs"
                      onClick={() => acceptBooking(booking.id)}
                    >
                      Accept &amp; Confirm
                    </Button>
                  ) : (
                    <Button
                      href="/provider-portal/bookings"
                      variant="outline"
                      className="bg-[#9C421C] text-white hover:bg-[#7F3516] border-none font-bold text-xs min-h-[44px] px-5 rounded-lg shadow-xs"
                      leftIcon={<KeyRound className="w-4 h-4" />}
                    >
                      Verify PIN at Counter
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
