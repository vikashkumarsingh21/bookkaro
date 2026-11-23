'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  CheckCircle2,
  CalendarCheck,
  Building2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  IndianRupee,
  Clock,
  KanbanSquare,
} from 'lucide-react';
import { useAdminPortal } from '@/context/AdminPortalContext';

export default function AdminOverviewPage() {
  const {
    scorecard,
    exceptionQueue,
    crmLeads,
    pendingVerificationsCount,
  } = useAdminPortal();

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER & PILOT SUMMARY */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#525259]">
            <span className="w-2 h-2 rounded-full bg-[#165234]" />
            <span>Patna Operational Oversight</span>
            <span className="text-[#DCDCD8]">•</span>
            <span className="text-[#165234] bg-[#EAF5EE] border border-[#C2E4CD] px-1.5 py-0.2 rounded font-medium">
              Phase 1.0 Live
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#151517] tracking-tight mt-1">
            Marketplace Scorecard &amp; Exceptions
          </h1>
          <p className="text-xs text-[#525259] mt-0.5">
            Operational liquidity, merchant onboarding throughput, consumer SLA compliance, and prioritized exception triage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/crm"
            className="px-3 py-1.5 rounded-[6px] border border-[#DCDCD8] bg-white text-[#151517] hover:bg-[#F2F2F0] text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <KanbanSquare className="w-3.5 h-3.5 text-[#525259]" />
            <span>Pipeline ({crmLeads.length})</span>
          </Link>
          <Link
            href="/admin/verifications"
            className="px-3 py-1.5 rounded-[6px] bg-[#6B1D2F] hover:bg-[#521523] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span>KYC Desk ({pendingVerificationsCount})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. SIX PILOT SCORECARD KPI CARDS (Architectural Graphite, 6px radius, tabular-nums) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI 1: Active Verified Providers */}
        <div className="p-3.5 rounded-[6px] bg-white border border-[#DCDCD8] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#525259]">
              Verified Partners
            </span>
            <Building2 className="w-3.5 h-3.5 text-[#525259]" />
          </div>
          <div className="font-mono font-bold text-2xl text-[#151517] tabular-nums">
            {scorecard.activeVerifiedProviders}
          </div>
          <div className="text-[10px] font-mono text-[#165234] font-medium flex items-center gap-1">
            <span>●</span> Patna Roster
          </div>
        </div>

        {/* KPI 2: Search-to-Book Conversion */}
        <div className="p-3.5 rounded-[6px] bg-white border border-[#DCDCD8] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#525259]">
              Search Conversion
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-[#165234]" />
          </div>
          <div className="font-mono font-bold text-2xl text-[#165234] tabular-nums">
            {scorecard.searchToBookConversionPct}%
          </div>
          <div className="text-[10px] font-mono text-[#525259]">
            Discovery intent
          </div>
        </div>

        {/* KPI 3: Provider Acceptance Rate */}
        <div className="p-3.5 rounded-[6px] bg-white border border-[#DCDCD8] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#525259]">
              Acceptance Rate
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#165234]" />
          </div>
          <div className="font-mono font-bold text-2xl text-[#151517] tabular-nums">
            {scorecard.providerAcceptanceRatePct}%
          </div>
          <div className="text-[10px] font-mono text-[#165234] font-medium">
            &lt;90s SLA compliance
          </div>
        </div>

        {/* KPI 4: Completed Bookings */}
        <div className="p-3.5 rounded-[6px] bg-white border border-[#DCDCD8] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#525259]">
              Completed Visits
            </span>
            <CalendarCheck className="w-3.5 h-3.5 text-[#525259]" />
          </div>
          <div className="font-mono font-bold text-2xl text-[#151517] tabular-nums">
            {scorecard.completedBookingsMonth.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] font-mono text-[#525259]">
            Venue PIN verified
          </div>
        </div>

        {/* KPI 5: Repeat Customers */}
        <div className="p-3.5 rounded-[6px] bg-white border border-[#DCDCD8] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#525259]">
              Repeat Customers
            </span>
            <RotateCcw className="w-3.5 h-3.5 text-[#525259]" />
          </div>
          <div className="font-mono font-bold text-2xl text-[#151517] tabular-nums">
            {scorecard.repeatCustomersPct}%
          </div>
          <div className="text-[10px] font-mono text-[#165234]">
            30-day cohort
          </div>
        </div>

        {/* KPI 6: Revenue per Provider (ARPU) */}
        <div className="p-3.5 rounded-[6px] bg-white border border-[#DCDCD8] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#525259]">
              Rev / Provider
            </span>
            <IndianRupee className="w-3.5 h-3.5 text-[#525259]" />
          </div>
          <div className="font-mono font-bold text-xl text-[#151517] tabular-nums">
            ₹{scorecard.revenuePerProviderInr.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] font-mono text-[#525259]">
            Monthly GMV
          </div>
        </div>
      </div>

      {/* 3. EXCEPTION WORK QUEUE (Ramp/Brex Style Oversight) */}
      <div className="bg-white rounded-[6px] border border-[#DCDCD8] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#DCDCD8] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#F8F8F7]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#7C4B06]" />
              <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#151517]">
                Actionable Exception Queue ({exceptionQueue.length})
              </h2>
            </div>
            <p className="text-[11px] text-[#525259] mt-0.5">
              Work items requiring administrator intervention, manual KYC inspection, or dispute arbitration.
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#FBF2DF] text-[#7C4B06] border border-[#F3DEC9]">
              Priority Triage
            </span>
          </div>
        </div>

        <div className="divide-y divide-[#DCDCD8]">
          {exceptionQueue.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#525259] space-y-1">
              <CheckCircle2 className="w-6 h-6 text-[#165234] mx-auto" />
              <div className="font-medium text-[#151517] mt-1">All exception queues are clear</div>
              <div className="text-[11px]">No pending KYC approvals, open disputes, or SLA breaches in Patna.</div>
            </div>
          ) : (
            exceptionQueue.map((item) => (
              <div
                key={item.id}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F8F8F7] transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    className={`w-8 h-8 rounded-[4px] flex items-center justify-center font-bold text-xs shrink-0 border ${
                      item.type === 'KYC_PENDING'
                        ? 'bg-[#FBF2DF] border-[#F3DEC9] text-[#7C4B06]'
                        : item.type === 'DISPUTE_OPEN'
                        ? 'bg-[#FCEBEC] border-[#F8D7DA] text-[#911D23]'
                        : 'bg-[#F2F2F0] border-[#DCDCD8] text-[#525259]'
                    }`}
                  >
                    {item.type === 'KYC_PENDING' && <ShieldCheck className="w-4 h-4" />}
                    {item.type === 'DISPUTE_OPEN' && <AlertTriangle className="w-4 h-4" />}
                    {item.type === 'SLA_BREACH' && <Clock className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs text-[#151517]">
                        {item.title}
                      </span>
                      <span
                        className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded border ${
                          item.urgency === 'HIGH'
                            ? 'bg-[#FCEBEC] text-[#911D23] border-[#F8D7DA]'
                            : 'bg-[#F2F2F0] text-[#525259] border-[#DCDCD8]'
                        }`}
                      >
                        {item.urgency} Priority
                      </span>
                    </div>
                    <div className="text-xs font-mono text-[#525259]">
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <Link
                    href={item.targetRoute}
                    className={`
                      px-3 py-1.5 rounded-[4px] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors
                      ${
                        item.urgency === 'HIGH'
                          ? 'bg-[#6B1D2F] hover:bg-[#521523] text-white'
                          : 'bg-white border border-[#DCDCD8] text-[#151517] hover:bg-[#F2F2F0]'
                      }
                    `}
                  >
                    <span>Resolve</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. PATNA MARKETPLACE CLUSTERS & COMPLIANCE STATUS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Patna Clusters */}
        <div className="p-4 rounded-[6px] bg-white border border-[#DCDCD8] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-[#151517]">
              Patna Launch Municipal Clusters
            </span>
            <span className="font-mono text-[10px] text-[#165234] bg-[#EAF5EE] border border-[#C2E4CD] px-1.5 py-0.2 rounded">
              10 Hubs Active
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-[4px] bg-[#F8F8F7] border border-[#DCDCD8]">
              <strong className="text-[#151517] block text-xs font-sans">Boring Road (800013)</strong>
              <span className="text-[11px] text-[#525259]">West Patna • Salons &amp; Cafes</span>
            </div>
            <div className="p-2.5 rounded-[4px] bg-[#F8F8F7] border border-[#DCDCD8]">
              <strong className="text-[#151517] block text-xs font-sans">Fraser Road (800001)</strong>
              <span className="text-[11px] text-[#525259]">Central Hub • Heritage Stays</span>
            </div>
            <div className="p-2.5 rounded-[4px] bg-[#F8F8F7] border border-[#DCDCD8]">
              <strong className="text-[#151517] block text-xs font-sans">Kankarbagh (800020)</strong>
              <span className="text-[11px] text-[#525259]">South-East Patna Sector</span>
            </div>
            <div className="p-2.5 rounded-[4px] bg-[#F8F8F7] border border-[#DCDCD8]">
              <strong className="text-[#151517] block text-xs font-sans">Bailey Road (800014)</strong>
              <span className="text-[11px] text-[#525259]">Boutique Suites &amp; Dining</span>
            </div>
          </div>
        </div>

        {/* Regulatory Governance */}
        <div className="p-4 rounded-[6px] bg-white border border-[#DCDCD8] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-[#151517]">
              Statutory India Compliance &amp; DPDP Lock
            </span>
            <span className="font-mono text-[10px] text-[#165234] bg-[#EAF5EE] border border-[#C2E4CD] px-1.5 py-0.2 rounded">
              Enforced
            </span>
          </div>
          <div className="space-y-1.5 text-xs text-[#525259]">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#165234] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#151517]">Grievance Redressal Officer (Patna):</strong> Adv. Rajeshwar Sinha • 48h acknowledgement SLA active.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#165234] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#151517]">E-Commerce Consumer Rules (2020/2026):</strong> Mandatory seller entity, GSTIN, and PMC trade licence verified.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#165234] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#151517]">Immutable Audit Log:</strong> DPDP 1-Year Retention Lock active across all administrative actions.
              </span>
            </div>
          </div>
          <div className="pt-1">
            <Link
              href="/admin/controls"
              className="text-xs font-semibold text-[#6B1D2F] hover:underline flex items-center gap-1"
            >
              <span>Platform Governance Controls &amp; DPDP Settings</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
