'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Eye,
  Check,
  FileText,
} from 'lucide-react';
import { useAdminPortal } from '@/context/AdminPortalContext';
import { PartnerApplication } from '@/services/partnerOnboardingService';
import { Drawer } from '@/components/ui/Drawer';
import { Modal } from '@/components/ui/Modal';

export default function AdminVerificationsPage() {
  const {
    verifications,
    approveAndActivateKYC,
    requestKYCDocumentChanges,
    pendingVerificationsCount,
  } = useAdminPortal();

  // Tab filter
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'CHANGES_REQUESTED' | 'ACTIVATED'>('ALL');

  // Inspection Drawer state
  const [inspectApp, setInspectApp] = useState<PartnerApplication | null>(null);

  // Request Changes Modal state
  const [changeDocTarget, setChangeDocTarget] = useState<{ appId: string; docId?: string; docTitle?: string } | null>(null);
  const [changeReason, setChangeReason] = useState('Document copy is illegible or missing official seal');
  const [customChangeReason, setCustomChangeReason] = useState('');

  // Approval Success banner
  const [approvedResult, setApprovedResult] = useState<{ providerId: string; name: string } | null>(null);

  // Filtered List
  const filteredApps = useMemo(() => {
    return verifications.filter((v) => {
      if (statusFilter === 'ALL') return true;
      if (statusFilter === 'PENDING') return v.status === 'UNDER_REVIEW' || v.status === 'PENDING_KYC';
      if (statusFilter === 'CHANGES_REQUESTED') return v.status === 'CHANGES_REQUESTED';
      if (statusFilter === 'ACTIVATED') return v.status === 'ACTIVATED' || v.status === 'VERIFIED';
      return true;
    });
  }, [verifications, statusFilter]);

  // Handle Approve
  const handleApprove = (appId: string) => {
    const res = approveAndActivateKYC(appId, 'Authorized by Patna Urban Operations Inspection Desk');
    setApprovedResult({
      providerId: res.providerId,
      name: res.application.brandDisplayName,
    });
    setInspectApp(null);
    setTimeout(() => setApprovedResult(null), 5000);
  };

  // Handle Request Changes
  const handleConfirmChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeDocTarget) return;

    const reason =
      changeReason === 'Other' && customChangeReason.trim()
        ? customChangeReason.trim()
        : changeReason;

    requestKYCDocumentChanges(changeDocTarget.appId, reason, changeDocTarget.docId);

    setChangeDocTarget(null);
    setCustomChangeReason('');
    if (inspectApp && inspectApp.id === changeDocTarget.appId) {
      setInspectApp(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#525259]">
            <span className="w-2 h-2 rounded-full bg-[#6B1D2F]" />
            <span>Patna Legal &amp; Compliance Desk</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#151517] tracking-tight mt-1">
            KYC Verification &amp; Licensing Queue
          </h1>
          <p className="text-xs text-[#525259] mt-0.5">
            Audit Patna Municipal Corporation (PMC) trade licences, Bihar Shops Act certificates, and authorize canonical Provider IDs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-[6px] bg-[#FBF2DF] text-[#7C4B06] border border-[#F3DEC9]">
            {pendingVerificationsCount} Awaiting Review
          </span>
        </div>
      </div>

      {approvedResult && (
        <div className="p-3.5 rounded-[6px] bg-[#EAF5EE] border border-[#C2E4CD] text-[#165234] text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in duration-100">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#165234] shrink-0" />
            <div>
              <span className="font-bold">KYC Approved &amp; Provider Activated: </span>
              Issued ID <strong className="font-bold">{approvedResult.providerId}</strong> to {approvedResult.name}.
              Reset flag: <code className="bg-white px-1 py-0.2 rounded border border-[#C2E4CD]">forcePasswordChange: true</code>.
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white border border-[#C2E4CD] text-[#165234] shrink-0">
            Audit Log Appended
          </span>
        </div>
      )}

      {/* 2. TAB FILTER STRIP */}
      <div className="flex items-center gap-1.5 border-b border-[#DCDCD8] pb-2.5 overflow-x-auto scrollbar-none">
        {[
          { id: 'ALL' as const, label: `All (${verifications.length})` },
          { id: 'PENDING' as const, label: `Pending Review (${pendingVerificationsCount})` },
          { id: 'CHANGES_REQUESTED' as const, label: `Changes Requested (${verifications.filter((v) => v.status === 'CHANGES_REQUESTED').length})` },
          { id: 'ACTIVATED' as const, label: `Activated & Live (${verifications.filter((v) => v.status === 'ACTIVATED').length})` },
        ].map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`
                px-3 py-1.5 rounded-[6px] text-xs font-mono transition-colors whitespace-nowrap
                ${
                  isActive
                    ? 'bg-[#1A1A1D] text-white font-medium'
                    : 'bg-white text-[#525259] hover:text-[#151517] border border-[#DCDCD8]'
                }
              `}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. DENSE KYC TABLE */}
      <div className="bg-white rounded-[6px] border border-[#DCDCD8] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#F8F8F7] border-b border-[#DCDCD8] text-[10px] uppercase font-mono text-[#525259]">
              <tr>
                <th className="px-3.5 py-2.5">Application Ref</th>
                <th className="px-3.5 py-2.5">Venue &amp; Category</th>
                <th className="px-3.5 py-2.5">Patna Locality</th>
                <th className="px-3.5 py-2.5">Owner Contact</th>
                <th className="px-3.5 py-2.5 text-center">Docs</th>
                <th className="px-3.5 py-2.5">Commercial Model</th>
                <th className="px-3.5 py-2.5">Status</th>
                <th className="px-3.5 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDCD8]">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs font-mono text-[#525259]">
                    No applications match the selected status filter.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-[#F8F8F7] transition-colors">
                    <td className="px-3.5 py-2.5 font-mono font-bold text-[#6B1D2F]">
                      #{app.applicationReference}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <div className="font-semibold text-[#151517]">{app.brandDisplayName}</div>
                      <div className="text-[10px] text-[#525259] capitalize font-mono">
                        {app.category.replace('_', ' ')} • {app.businessLegalName}
                      </div>
                    </td>
                    <td className="px-3.5 py-2.5 text-[#525259] font-mono">
                      <div>{app.locality}</div>
                      <div className="text-[10px] text-[#525259]/80">{app.pincode}</div>
                    </td>
                    <td className="px-3.5 py-2.5 text-[#525259]">
                      <div>{app.ownerName}</div>
                      <div className="text-[10px] font-mono text-[#525259]/80">{app.phone}</div>
                    </td>
                    <td className="px-3.5 py-2.5 text-center">
                      <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-[#F2F2F0] border border-[#DCDCD8] text-[#151517]">
                        {app.documents.length}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 font-mono text-[11px] text-[#525259]">
                      {app.commercialModel === 'SUBSCRIPTION' ? 'Subscription (0%)' : 'Commission (8%)'}
                    </td>
                    <td className="px-3.5 py-2.5 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-[4px] text-[10px] font-mono uppercase tracking-wider ${
                          app.status === 'ACTIVATED' || app.status === 'VERIFIED'
                            ? 'bg-[#EAF5EE] text-[#165234] border border-[#C2E4CD]'
                            : app.status === 'CHANGES_REQUESTED'
                            ? 'bg-[#FCEBEC] text-[#911D23] border border-[#F8D7DA]'
                            : 'bg-[#FBF2DF] text-[#7C4B06] border border-[#F3DEC9]'
                        }`}
                      >
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => setInspectApp(app)}
                        className="px-2.5 py-1 rounded-[4px] bg-[#1A1A1D] hover:bg-[#0B0B0D] text-white text-xs font-mono font-medium inline-flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect KYC</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. SLIDE-OVER KYC INSPECTION DRAWER */}
      {inspectApp && (
        <Drawer
          isOpen={!!inspectApp}
          onClose={() => setInspectApp(null)}
          title={`KYC Inspection: ${inspectApp.brandDisplayName}`}
          description={`Application #${inspectApp.applicationReference} • ${inspectApp.locality}, Patna`}
          size="lg"
        >
          <div className="space-y-5 text-xs text-[#151517] font-sans">
            {/* Quick Status Bar */}
            <div className="p-3.5 rounded-[6px] bg-[#F8F8F7] border border-[#DCDCD8] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#525259] block">
                  Current Verification State
                </span>
                <span className="font-mono font-bold text-xs text-[#151517]">
                  {inspectApp.status.replace('_', ' ')} (Stage: {inspectApp.stage.replace('_', ' ')})
                </span>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white border border-[#DCDCD8] text-[#525259]">
                SLA: {inspectApp.expectedSlaHours}h Window
              </span>
            </div>

            {/* Document Checklist & Audit */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-[#DCDCD8] pb-1">
                <span className="font-semibold text-xs text-[#151517] flex items-center gap-1.5 font-mono uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#165234]" />
                  <span>Patna Statutory Compliance Documents ({inspectApp.documents.length})</span>
                </span>
                <span className="text-[10px] font-mono text-[#525259]">Audit documents below</span>
              </div>

              <div className="space-y-2">
                {inspectApp.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-[6px] bg-white border border-[#DCDCD8] space-y-1.5 hover:border-[#6B1D2F] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-xs text-[#151517] flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#525259]" />
                          <span>{doc.title}</span>
                        </div>
                        <div className="text-[11px] font-mono text-[#525259] mt-0.5">
                          {doc.fileName} ({doc.fileSize}) • Uploaded {new Date(doc.uploadedAt).toLocaleDateString('en-IN')}
                        </div>
                      </div>

                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-mono uppercase tracking-wider shrink-0 ${
                          doc.status === 'VERIFIED'
                            ? 'bg-[#EAF5EE] text-[#165234] border border-[#C2E4CD]'
                            : doc.status === 'CHANGES_REQUESTED'
                            ? 'bg-[#FCEBEC] text-[#911D23] border border-[#F8D7DA]'
                            : 'bg-[#FBF2DF] text-[#7C4B06] border border-[#F3DEC9]'
                        }`}
                      >
                        {doc.status.replace('_', ' ')}
                      </span>
                    </div>

                    {doc.note && (
                      <div className="p-2 rounded-[4px] bg-[#F8F8F7] border border-[#DCDCD8] text-[11px] font-mono text-[#525259]">
                        <strong>Remark:</strong> {doc.note}
                      </div>
                    )}

                    <div className="pt-1.5 border-t border-[#DCDCD8] flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#525259]">
                        Validated against Bihar State PMC record
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setChangeDocTarget({
                            appId: inspectApp.id,
                            docId: doc.id,
                            docTitle: doc.title,
                          })
                        }
                        className="text-[11px] font-mono text-[#911D23] hover:underline"
                      >
                        Request Changes →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="p-3.5 rounded-[6px] bg-[#F8F8F7] border border-[#DCDCD8] space-y-2.5">
              <div className="font-semibold text-xs text-[#151517] font-mono uppercase tracking-wider">
                Governance Determination
              </div>
              <div className="text-[11px] text-[#525259] leading-relaxed">
                Approving KYC generates canonical Provider ID <code className="font-mono text-[#165234]">BK-PRV-PAT-XXXX</code>, sets <code className="font-mono">forcePasswordChange: true</code>, moves stage to 04 ACTIVATE / 06 GO LIVE, and logs an immutable audit trail.
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setChangeDocTarget({
                      appId: inspectApp.id,
                      docTitle: 'General KYC Application Documents',
                    })
                  }
                  className="flex-1 py-1.5 px-3 rounded-[6px] border border-[#DCDCD8] bg-white hover:bg-[#F2F2F0] text-[#911D23] text-xs font-mono font-medium transition-colors"
                >
                  Request Changes
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(inspectApp.id)}
                  className="flex-1 py-1.5 px-3 rounded-[6px] bg-[#6B1D2F] hover:bg-[#521523] text-white text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve &amp; Activate Provider</span>
                </button>
              </div>
            </div>
          </div>
        </Drawer>
      )}

      {/* 5. REQUEST CHANGES MODAL */}
      {changeDocTarget && (
        <Modal
          isOpen={!!changeDocTarget}
          onClose={() => setChangeDocTarget(null)}
          title="Request Document Changes"
          description={`Logged for ${changeDocTarget.docTitle || 'KYC Documents'}`}
          maxWidth="sm"
        >
          <form onSubmit={handleConfirmChanges} className="space-y-3.5 pt-1 font-sans">
            <div className="p-2.5 rounded-[6px] bg-[#FBF2DF] border border-[#F3DEC9] text-xs font-mono text-[#7C4B06]">
              Merchant will be notified on their tracking dashboard to re-upload the revised certificate.
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-mono font-semibold text-[#151517]">
                Deficiency Reason <span className="text-[#911D23]">*</span>
              </label>
              <select
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                className="w-full text-xs font-mono p-2 rounded-[6px] border border-[#DCDCD8] focus:border-[#6B1D2F] outline-none text-[#151517] bg-white"
              >
                <option value="Document copy is illegible or missing official seal">
                  Document copy is illegible or missing official seal
                </option>
                <option value="Business legal entity name mismatch with PAN/GSTIN">
                  Business legal entity name mismatch with PAN/GSTIN
                </option>
                <option value="Municipal trade licence has expired or pending renewal">
                  Municipal trade licence has expired or pending renewal
                </option>
                <option value="Category license (FSSAI/Fire NOC/Shops Act) incomplete for venue">
                  Category license (FSSAI/Fire NOC/Shops Act) incomplete for venue
                </option>
                <option value="Other">Other Specific Requirement</option>
              </select>
            </div>

            {changeReason === 'Other' && (
              <div className="space-y-1">
                <label className="block text-xs font-mono font-semibold text-[#151517]">
                  Specific Change Instructions <span className="text-[#911D23]">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={customChangeReason}
                  onChange={(e) => setCustomChangeReason(e.target.value)}
                  placeholder="Detail what the merchant needs to provide..."
                  className="w-full text-xs font-mono p-2 rounded-[6px] border border-[#DCDCD8] focus:border-[#6B1D2F] outline-none text-[#151517] bg-white resize-none"
                />
              </div>
            )}

            <div className="pt-2 border-t border-[#DCDCD8] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setChangeDocTarget(null)}
                className="px-3 py-1.5 rounded-[6px] border border-[#DCDCD8] bg-white text-[#525259] hover:bg-[#F2F2F0] text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-[6px] bg-[#911D23] hover:bg-[#78171C] text-white text-xs font-mono font-medium"
              >
                Submit Change Request
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
