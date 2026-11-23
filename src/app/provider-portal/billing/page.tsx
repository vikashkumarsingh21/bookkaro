'use client';

import React, { useState, useMemo } from 'react';
import {
  Download,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { useProviderPortal } from '@/context/ProviderPortalContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function ProviderPortalBillingPage() {
  const { currentWorkspace } = useWorkspace();
  const isStaff = currentWorkspace === 'PARTNER_STAFF';

  const {
    activeMerchant,
    subscriptionData,
    commissionLedger,
  } = useProviderPortal();

  // Commercial Model View Toggle (Model A vs Model B)
  const [selectedModelView, setSelectedModelView] = useState<'both' | 'commission' | 'subscription'>('both');
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  // Commission Totals
  const ledgerTotals = useMemo(() => {
    const totalGmv = commissionLedger.reduce((sum, item) => sum + item.finalBillValueInr, 0);
    const totalPlatformFee = commissionLedger.reduce((sum, item) => sum + item.platformFeePayableInr, 0);
    const totalNetPayout = commissionLedger.reduce((sum, item) => sum + item.netMerchantPayoutInr, 0);

    return {
      totalGmv,
      totalPlatformFee,
      totalNetPayout,
      count: commissionLedger.length,
    };
  }, [commissionLedger]);

  // Real CSV Export
  const handleExportCsv = () => {
    const headers = [
      'Booking ID',
      'Booking Reference',
      'Guest Name',
      'Service Rendered',
      'Completed Date',
      'Final Bill Value (INR)',
      'Commission %',
      'Platform Fee Payable (INR)',
      'Net Merchant Payout (INR)',
      'Settlement Status',
      'Bank UTR Number',
    ];

    const rows = commissionLedger.map((row) => [
      `"${row.bookingId}"`,
      `"${row.bookingReference}"`,
      `"${row.customerName.replace(/"/g, '""')}"`,
      `"${row.serviceCompleted.replace(/"/g, '""')}"`,
      `"${row.completedDate}"`,
      row.finalBillValueInr,
      row.commissionPercentage,
      row.platformFeePayableInr,
      row.netMerchantPayoutInr,
      `"${row.payoutStatus}"`,
      `"${row.utrNumber || 'PENDING_BATCH'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `BOOKKARO_Patna_Commercial_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadToast('Commercial Ledger exported to CSV statement successfully.');
    setTimeout(() => setDownloadToast(null), 3500);
  };

  // Real Receipt Download
  const handleDownloadInvoice = (invoiceNumber: string) => {
    const content = `BOOKKARO TAX INVOICE & SUBSCRIPTION RECEIPT
=====================================================
Invoice Reference: ${invoiceNumber}
Issued By: BOOKKARO Hospitality Pvt Ltd - Patna Marketplace
Merchant Legal Entity: ${activeMerchant.legalBusinessName}
GSTIN: ${activeMerchant.gstin}
Branch Locality: ${activeMerchant.locality}, ${activeMerchant.city}
Date of Issue: ${new Date().toLocaleDateString('en-IN')}
Status: PAID VIA HDFC NETBANKING
-----------------------------------------------------
Item: BOOKKARO Merchant Growth Tier (Monthly)
Base Rate: INR 3,999.00
CGST (9%): INR 360.00
SGST (9%): INR 360.00
Total Taxable Amount Paid: INR 4,719.00
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${invoiceNumber}_Tax_Receipt.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadToast(`Tax receipt for ${invoiceNumber} downloaded.`);
    setTimeout(() => setDownloadToast(null), 3000);
  };

  // If role is PARTNER_STAFF, render owner access guard
  if (isStaff) {
    return (
      <div className="py-12 max-w-2xl mx-auto space-y-6">
        <div className="p-8 rounded-[10px] bg-white border border-[#E5DDD2] text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-lg bg-[#FAF1EB] border border-[#F3DEC9] flex items-center justify-center text-[#9C421C] mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#9C421C]">
              Role Access Boundary
            </div>
            <h1 className="font-[var(--font-partner-display)] font-bold text-2xl text-[#141413] tracking-tight mt-1">
              Restricted to Partner Owner
            </h1>
            <p className="text-xs sm:text-sm text-[#52524E] mt-2 max-w-md mx-auto leading-relaxed">
              Your active session is running with <strong>PARTNER_STAFF</strong> privileges. Front-desk staff accounts cannot view commercial financial ledgers, commission deductions, or beneficiary bank settlement records.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#F6F3EE] border border-[#E5DDD2] text-xs text-[#52524E] text-left space-y-1.5">
            <div className="font-bold text-[#141413]">Owner-Only Commercial Capabilities:</div>
            <ul className="list-disc list-inside space-y-1 text-[11px]">
              <li>Auditing gross merchandise value (GMV) and commission percentages</li>
              <li>Reviewing beneficiary bank account settlements and daily UTR logs</li>
              <li>Exporting CSV revenue statements and downloading GST tax invoices</li>
            </ul>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <Button
              href="/provider-portal/bookings"
              variant="outline"
              className="bg-[#9C421C] text-white hover:bg-[#7F3516] border-none font-bold text-xs min-h-[44px] px-5 rounded-lg shadow-xs"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Go to Incoming Queue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#52524E]">
            <span className="w-2 h-2 rounded-full bg-[#21503A]" />
            <span>Commercial Contracts &amp; Settlements (Owner Mode)</span>
          </div>
          <h1 className="font-[var(--font-partner-display)] font-bold text-2xl sm:text-3xl text-[#141413] tracking-tight mt-1">
            Billing &amp; Commercial Ledger
          </h1>
          <p className="text-xs sm:text-sm text-[#52524E] mt-0.5">
            Transparent revenue tracking supporting both flat subscription tiers and transaction-based commission auditability.
          </p>
        </div>

        {/* View Filter Pill (44px min-h) */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E5DDD2] rounded-lg self-start sm:self-auto min-h-[44px]">
          {[
            { id: 'both' as const, label: 'All Models' },
            { id: 'commission' as const, label: 'Model B: Commission' },
            { id: 'subscription' as const, label: 'Model A: Subscription' },
          ].map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setSelectedModelView(v.id)}
              className={`
                px-3 py-2 rounded-md text-xs font-bold transition-all min-h-[36px]
                ${selectedModelView === v.id
                  ? 'bg-[#241D18] text-[#F6F2EB] shadow-xs'
                  : 'text-[#52524E] hover:text-[#141413]'
                }
              `}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {downloadToast && (
        <div className="p-3.5 rounded-lg bg-[#EBF1ED] border border-[#CFDFD5] text-[#21503A] text-xs font-bold flex items-center justify-between animate-in fade-in duration-150 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#21503A]" />
            <span>{downloadToast}</span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white">
            Export Complete
          </span>
        </div>
      )}

      {/* 2. BANK SETTLEMENT STRIP (Deep Roasted Walnut Surface) */}
      <div className="p-5 rounded-[10px] bg-[#241D18] text-[#F6F2EB] border border-[#382E27] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="text-[10px] uppercase font-bold tracking-widest text-[#E0824E]">
            Beneficiary Payout Bank Account
          </div>
          <div className="font-[var(--font-partner-display)] font-bold text-lg text-[#F6F2EB]">
            HDFC Bank Current A/c ••••••••9012 (IFSC: HDFC0000249)
          </div>
          <div className="text-xs text-[#C4B9AD]">
            Account Holder: {activeMerchant.legalBusinessName} • Verified via Patna NPCI Penny Drop
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="text-left md:text-right">
            <span className="text-[10px] uppercase font-bold text-[#C4B9AD] block leading-none">
              Daily Settlement Cycle
            </span>
            <span className="font-[var(--font-partner-display)] font-bold text-lg text-[#F6F2EB]">
              T+1 Business Day
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleDownloadInvoice('INV-BK-2026-TAX-NOV')}
            className="bg-[#2E2520] hover:bg-[#382E27] text-[#F6F2EB] border border-[#3E332B] font-bold text-xs min-h-[44px] px-4 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#E0824E]" />
            <span>Download GST Statement</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. MODEL A: MONTHLY SUBSCRIPTION TIER */}
      {/* ========================================================= */}
      {(selectedModelView === 'both' || selectedModelView === 'subscription') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#9C421C]" />
              <h2 className="font-[var(--font-partner-display)] font-bold text-lg text-[#141413]">
                Revenue Model A: Flat Monthly Subscription
              </h2>
            </div>
            <Badge variant="terracotta-subtle" size="sm">
              0% Transaction Commission Option
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Active Subscription Plan Card */}
            <div className="p-6 rounded-[10px] bg-white border border-[#E5DDD2] space-y-4 lg:col-span-1 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#52524E]">
                  Active Plan Tier
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF1ED] text-[#21503A] border border-[#CFDFD5]">
                  Active
                </span>
              </div>

              <div>
                <h3 className="font-[var(--font-partner-display)] font-bold text-xl text-[#141413]">
                  {subscriptionData.tierName}
                </h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-[var(--font-partner-display)] font-bold text-3xl text-[#21503A] tabular-nums">
                    ₹{subscriptionData.monthlyFeeInr.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-[#52524E]">/ month + GST</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-[#52524E] pt-2 border-t border-[#E5DDD2]">
                <div className="flex justify-between">
                  <span>Billing Renewal:</span>
                  <strong className="text-[#141413]">{subscriptionData.nextRenewalDate}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Venue Wings:</span>
                  <strong className="text-[#141413]">
                    {subscriptionData.activeBranches} of {subscriptionData.branchLimit} active
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Staff Counter Seats:</span>
                  <strong className="text-[#141413]">
                    {subscriptionData.activeStaffSeats} of {subscriptionData.staffSeatsLimit} active
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Included Monthly Bookings:</span>
                  <strong className="text-[#141413]">
                    {subscriptionData.currentBookingsUsed} of {subscriptionData.bookingLimit}
                  </strong>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#F6F3EE] border border-[#E5DDD2] text-[11px] text-[#52524E]">
                Payment method: <strong>{subscriptionData.billingCycle}</strong>
              </div>
            </div>

            {/* Invoices History Table */}
            <div className="p-6 rounded-[10px] bg-white border border-[#E5DDD2] lg:col-span-2 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-[var(--font-partner-display)] font-bold text-sm text-[#141413]">
                    Subscription Invoices &amp; Tax Receipts
                  </h3>
                  <p className="text-xs text-[#52524E]">
                    Compliant tax invoices with GSTIN and state tax breakup for input credit
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F6F3EE] border-b border-[#E5DDD2] text-[10px] uppercase font-bold text-[#52524E]">
                    <tr>
                      <th className="px-4 py-2.5">Invoice #</th>
                      <th className="px-4 py-2.5">Billing Date</th>
                      <th className="px-4 py-2.5">Base Rate</th>
                      <th className="px-4 py-2.5">GST 18%</th>
                      <th className="px-4 py-2.5">Total Paid</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5DDD2]">
                    {subscriptionData.invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-[#F6F3EE]/50 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-[#21503A]">
                          {inv.invoiceNumber}
                        </td>
                        <td className="px-4 py-3 text-[#52524E]">{inv.date}</td>
                        <td className="px-4 py-3 tabular-nums">₹{inv.amountInr.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-[#52524E] tabular-nums">₹{inv.gstInr.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 font-bold text-[#141413] tabular-nums">
                          ₹{inv.totalInr.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-bold text-[#21503A] bg-[#EBF1ED] px-2 py-0.5 rounded-full border border-[#CFDFD5]">
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDownloadInvoice(inv.invoiceNumber)}
                            className="text-xs font-bold text-[#9C421C] hover:underline inline-flex items-center gap-1"
                          >
                            <Download className="w-3 h-3 text-[#9C421C]" />
                            <span>Receipt</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. MODEL B: COMMISSION AUDIT LEDGER */}
      {/* ========================================================= */}
      {(selectedModelView === 'both' || selectedModelView === 'commission') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#21503A]" />
                <h2 className="font-[var(--font-partner-display)] font-bold text-lg text-[#141413]">
                  Revenue Model B: Transaction Commission Ledger
                </h2>
              </div>
              <p className="text-xs text-[#52524E] mt-0.5">
                Audit trail tracking: Booking ID → Final Counter Bill (INR) → Commission % → Platform Fee → Net Merchant Payout
              </p>
            </div>

            <Button
              variant="outline"
              className="bg-[#9C421C] text-white hover:bg-[#7F3516] border-none font-bold text-xs min-h-[44px] px-5 rounded-lg shadow-xs"
              onClick={handleExportCsv}
              leftIcon={<FileSpreadsheet className="w-4 h-4" />}
            >
              Export Statement (CSV)
            </Button>
          </div>

          {/* Ledger Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-[10px] bg-white border border-[#E5DDD2] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#52524E] block">
                Total Realized GMV (Ledger Sample)
              </span>
              <div className="font-[var(--font-partner-display)] font-bold text-2xl text-[#141413] tabular-nums mt-1">
                ₹{ledgerTotals.totalGmv.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="p-4 rounded-[10px] bg-white border border-[#E5DDD2] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#9C421C] block">
                Total Platform Fees Deducted (8.0%)
              </span>
              <div className="font-[var(--font-partner-display)] font-bold text-2xl text-[#9C421C] tabular-nums mt-1">
                ₹{ledgerTotals.totalPlatformFee.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="p-4 rounded-[10px] bg-[#EBF1ED] border border-[#CFDFD5] shadow-xs">
              <span className="text-[10px] uppercase font-bold text-[#21503A] block">
                Net Merchant Disbursed Payout
              </span>
              <div className="font-[var(--font-partner-display)] font-bold text-2xl text-[#21503A] tabular-nums mt-1">
                ₹{ledgerTotals.totalNetPayout.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Commission Transactions Table */}
          <div className="bg-white rounded-[10px] border border-[#E5DDD2] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F6F3EE] border-b border-[#E5DDD2] text-[10px] uppercase font-bold text-[#52524E]">
                  <tr>
                    <th className="px-4 py-3">Booking ID</th>
                    <th className="px-4 py-3">Guest</th>
                    <th className="px-4 py-3">Service Rendered</th>
                    <th className="px-4 py-3">Completed Date</th>
                    <th className="px-4 py-3 text-right">Final Bill (INR)</th>
                    <th className="px-4 py-3 text-center">Comm %</th>
                    <th className="px-4 py-3 text-right">Payable Fee</th>
                    <th className="px-4 py-3 text-right">Net Payout</th>
                    <th className="px-4 py-3 text-center">Settlement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DDD2]">
                  {commissionLedger.map((row) => (
                    <tr key={row.bookingId} className="hover:bg-[#F6F3EE]/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#9C421C]">
                        #{row.bookingReference}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#141413]">
                        {row.customerName}
                      </td>
                      <td className="px-4 py-3 text-[#52524E] max-w-[180px] truncate">
                        {row.serviceCompleted}
                      </td>
                      <td className="px-4 py-3 text-[#52524E] whitespace-nowrap">
                        {row.completedDate}
                      </td>
                      <td className="px-4 py-3 font-bold text-[#141413] text-right tabular-nums">
                        ₹{row.finalBillValueInr.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-[#52524E]">
                        {row.commissionPercentage}%
                      </td>
                      <td className="px-4 py-3 font-bold text-[#9C421C] text-right tabular-nums">
                        ₹{row.platformFeePayableInr.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 font-[var(--font-partner-display)] font-bold text-[#21503A] text-right tabular-nums">
                        ₹{row.netMerchantPayoutInr.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {row.payoutStatus === 'SETTLED' ? (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-[#21503A] bg-[#EBF1ED] px-2 py-0.5 rounded-full border border-[#CFDFD5]"
                            title={row.utrNumber ? `Bank UTR: ${row.utrNumber}` : undefined}
                          >
                            <CheckCircle2 className="w-3 h-3 text-[#21503A]" />
                            <span>Settled</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#9C421C] bg-[#FAF1EB] px-2 py-0.5 rounded-full border border-[#F3DEC9]">
                            <Clock className="w-3 h-3 text-[#9C421C]" />
                            <span>Pending T+1</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
