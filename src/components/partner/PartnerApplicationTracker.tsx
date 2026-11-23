'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Clock,
  MapPin,
  FileText,
  Copy,
  Check,
  Phone,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import {
  partnerOnboardingService,
  PartnerApplication,
  PartnerOnboardingStage,
} from '@/services/partnerOnboardingService';
import { Button } from '@/components/ui/Button';

interface PartnerApplicationTrackerProps {
  initialReference?: string;
  onNavigateToRegister?: () => void;
}

export const PartnerApplicationTracker: React.FC<PartnerApplicationTrackerProps> = ({
  initialReference,
  onNavigateToRegister,
}) => {
  const [searchRef, setSearchRef] = useState(initialReference || '');
  const [activeApplication, setActiveApplication] = useState<PartnerApplication | null>(() => {
    if (initialReference) {
      return partnerOnboardingService.getApplicationByReference(initialReference) || null;
    }
    const all = partnerOnboardingService.getAllApplications();
    return all.length > 0 ? all[0] : null;
  });
  const [recentApplications, setRecentApplications] = useState<PartnerApplication[]>(() => {
    return partnerOnboardingService.getAllApplications();
  });
  const [copied, setCopied] = useState(false);
  const [hasSearched, setHasSearched] = useState(() => Boolean(initialReference));

  useEffect(() => {
    const unsub = partnerOnboardingService.subscribe(() => {
      const all = partnerOnboardingService.getAllApplications();
      setRecentApplications(all);
      if (activeApplication) {
        const refreshed = partnerOnboardingService.getApplicationByReference(
          activeApplication.applicationReference
        );
        if (refreshed) setActiveApplication(refreshed);
      }
    });
    return () => unsub();
  }, [activeApplication]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchRef.trim()) return;

    setHasSearched(true);
    const found = partnerOnboardingService.getApplicationByReference(searchRef);
    setActiveApplication(found || null);
  };

  const handleSelectRecent = (app: PartnerApplication) => {
    setSearchRef(app.applicationReference);
    setActiveApplication(app);
    setHasSearched(true);
  };

  const handleCopy = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 6 Defined Onboarding Stages
  const stages: { id: PartnerOnboardingStage; label: string; desc: string }[] = [
    { id: '01_LEAD', label: '01 Lead', desc: 'Application Received' },
    { id: '02_DISCUSS', label: '02 Discuss', desc: 'Screening & Terms' },
    { id: '03_VERIFY', label: '03 Verify', desc: 'KYC & Premise Inspection' },
    { id: '04_ACTIVATE', label: '04 Activate', desc: 'Merchant ID Issued' },
    { id: '05_CONFIGURE', label: '05 Configure', desc: 'Catalog & Slot Buffers' },
    { id: '06_GO_LIVE', label: '06 Go Live', desc: 'Patna Discovery Live' },
  ];

  const getStageStatus = (stageId: PartnerOnboardingStage) => {
    if (!activeApplication) return 'UPCOMING';
    const hierarchy: Record<PartnerOnboardingStage, number> = {
      '01_LEAD': 1,
      '02_DISCUSS': 2,
      '03_VERIFY': 3,
      '04_ACTIVATE': 4,
      '05_CONFIGURE': 5,
      '06_GO_LIVE': 6,
    };
    const currentRank = hierarchy[activeApplication.stage] || 1;
    const stageRank = hierarchy[stageId] || 1;

    if (currentRank > stageRank) return 'DONE';
    if (currentRank === stageRank) return 'ACTIVE';
    return 'UPCOMING';
  };

  return (
    <div className="space-y-6">
      {/* Search Header Strip */}
      <div className="bg-white rounded-xl border border-[#E2DDD5] p-5 sm:p-6 space-y-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#143D2B]">
            Onboarding Tracking
          </span>
          <h2 className="font-heading text-lg font-bold text-[#141413] mt-0.5">
            Track Patna Partner Application Status
          </h2>
          <p className="text-xs text-[#52524E]">
            Enter your application reference code (e.g. <strong className="text-[#141413] font-mono">APP-PAT-2026-8492</strong>) or choose from recently submitted registrations.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#52524E] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Enter reference ID e.g. APP-PAT-2026-8492"
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value)}
              className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-[#E2DDD5] focus:border-[#143D2B] focus:ring-1 focus:ring-[#143D2B] outline-none font-mono uppercase text-[#141413] bg-white"
            />
          </div>
          <Button type="submit" variant="primary" size="md">
            Track Progress
          </Button>
        </form>

        {/* Recent Applications Quick Pills */}
        {recentApplications.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#52524E] block">
              Recent Patna Applications
            </span>
            <div className="flex flex-wrap gap-2">
              {recentApplications.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => handleSelectRecent(app)}
                  className={`
                    px-2.5 py-1.5 rounded-lg border text-xs text-left transition-colors flex items-center gap-2 cursor-pointer
                    ${
                      activeApplication?.id === app.id
                        ? 'border-[#143D2B] bg-[#EBF2EE] text-[#143D2B] font-semibold'
                        : 'border-[#E2DDD5] bg-[#FAF9F6] text-[#52524E] hover:border-[#141413]'
                    }
                  `}
                >
                  <span className="font-mono text-[11px] font-bold">{app.applicationReference}</span>
                  <span className="text-[#E2DDD5]">•</span>
                  <span className="truncate max-w-[140px]">{app.brandDisplayName}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Tracking Details */}
      {activeApplication ? (
        <div className="space-y-6">
          {/* Status Overview Card */}
          <div className="bg-white rounded-xl border border-[#E2DDD5] p-5 sm:p-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E2DDD5]">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm sm:text-base font-bold text-[#141413] tracking-tight">
                    #{activeApplication.applicationReference}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(activeApplication.applicationReference)}
                    className="p-1 text-[#52524E] hover:text-[#141413] rounded hover:bg-[#F3F1EC] transition-colors cursor-pointer"
                    title="Copy Reference ID"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#143D2B]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <span className="capitalize text-[10px] font-semibold px-2 py-0.5 rounded bg-[#FAF9F6] border border-[#E2DDD5] text-[#52524E]">
                    {activeApplication.category.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="font-heading text-lg font-bold text-[#141413]">
                  {activeApplication.brandDisplayName}
                </h3>
                <div className="text-xs text-[#52524E] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#143D2B] shrink-0" />
                  <span>
                    {activeApplication.locality}, Patna ({activeApplication.pincode}) • {activeApplication.streetAddress}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0 flex items-center gap-2">
                <div
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5
                    ${
                      activeApplication.stage === '06_GO_LIVE'
                        ? 'bg-[#143D2B] text-white border-[#143D2B]'
                        : activeApplication.stage === '04_ACTIVATE' || activeApplication.stage === '05_CONFIGURE'
                        ? 'bg-[#EBF2EE] text-[#143D2B] border-[#C8DBD1]'
                        : activeApplication.stage === '03_VERIFY'
                        ? 'bg-[#EBF2EE] text-[#143D2B] border-[#C8DBD1]'
                        : 'bg-[#FAF1EB] text-[#C25E28] border-[#F3DEC9]'
                    }
                  `}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Stage: {activeApplication.stage.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            {/* 6-Stage Visual Stepper Timeline */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#141413]">
                <span>Onboarding Stage Progression</span>
                <span className="text-[#52524E] text-[11px]">
                  Turnaround SLA: {activeApplication.expectedSlaHours > 0 ? `Within ${activeApplication.expectedSlaHours}h` : 'Completed'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2">
                {stages.map((st) => {
                  const state = getStageStatus(st.id);
                  return (
                    <div
                      key={st.id}
                      className={`
                        p-3 rounded-xl border text-center transition-colors flex flex-col items-center justify-between
                        ${
                          state === 'DONE'
                            ? 'border-[#C8DBD1] bg-[#FAF9F6]'
                            : state === 'ACTIVE'
                            ? 'border-[#143D2B] bg-[#EBF2EE] ring-1 ring-[#143D2B]'
                            : 'border-[#E2DDD5] bg-white opacity-60'
                        }
                      `}
                    >
                      <div
                        className={`
                          w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1.5
                          ${
                            state === 'DONE'
                              ? 'bg-[#143D2B] text-white'
                              : state === 'ACTIVE'
                              ? 'bg-[#143D2B] text-white animate-pulse'
                              : 'bg-[#F3F1EC] text-[#78716C] border border-[#E2DDD5]'
                          }
                        `}
                      >
                        {state === 'DONE' ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '○'}
                      </div>
                      <div
                        className={`text-xs font-bold leading-tight ${
                          state === 'ACTIVE'
                            ? 'text-[#143D2B]'
                            : state === 'DONE'
                            ? 'text-[#141413]'
                            : 'text-[#78716C]'
                        }`}
                      >
                        {st.label}
                      </div>
                      <div className="text-[10px] text-[#52524E] leading-snug mt-1">
                        {st.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reviewer Notes & Inspector Box */}
            <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E2DDD5] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#141413] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#143D2B]" />
                  Patna Verification Inspection Desk
                </span>
                <span className="text-[11px] text-[#52524E] font-medium">
                  {activeApplication.assignedInspector}
                </span>
              </div>
              <p className="text-xs text-[#52524E] leading-relaxed">
                {activeApplication.reviewerNotes}
              </p>
            </div>
          </div>

          {/* KYC Document Checklist Card */}
          <div className="bg-white rounded-xl border border-[#E2DDD5] p-5 sm:p-6 space-y-4">
            <div>
              <h3 className="font-heading text-base font-bold text-[#141413]">
                KYC &amp; Compliance Document Review Status
              </h3>
              <p className="text-xs text-[#52524E]">
                All mandatory legal licences are authenticated by the Patna Operations compliance team.
              </p>
            </div>

            <div className="space-y-2.5">
              {activeApplication.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-xl border border-[#E2DDD5] bg-[#FAF9F6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#E2DDD5] flex items-center justify-center text-[#143D2B] shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#141413]">{doc.title}</div>
                      <div className="text-[11px] text-[#52524E] font-mono">
                        {doc.fileName} • {doc.fileSize}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`
                        px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border
                        ${
                          doc.status === 'VERIFIED'
                            ? 'bg-[#EBF2EE] text-[#143D2B] border-[#C8DBD1]'
                            : doc.status === 'CHANGES_REQUESTED'
                            ? 'bg-[#FDF2F2] text-[#9E2A2B] border-[#F8D7DA]'
                            : 'bg-[#FAF1EB] text-[#C25E28] border-[#F3DEC9]'
                        }
                      `}
                    >
                      {doc.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Audit Log */}
          <div className="bg-white rounded-xl border border-[#E2DDD5] p-5 sm:p-6 space-y-4">
            <h3 className="font-heading text-base font-bold text-[#141413]">
              Application Audit Log
            </h3>

            <div className="relative pl-6 space-y-4 border-l-2 border-[#E2DDD5]">
              {activeApplication.timeline.map((event, idx) => (
                <div key={idx} className="relative space-y-1">
                  <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-[#143D2B] border-2 border-white" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#141413]">{event.title}</span>
                    <span className="text-[11px] text-[#52524E]">
                      {new Date(event.timestamp).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-[#52524E]">{event.description}</p>
                  <div className="text-[10px] text-[#78716C] font-semibold">
                    Actor: {event.actor}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Direct Support & Questions */}
          <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[#E2DDD5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-0.5">
              <div className="font-bold text-[#141413]">Need Assistance with Your Patna Onboarding?</div>
              <div className="text-[#52524E]">
                Contact our Merchant Operations Desk at Fraser Road: <strong className="text-[#141413]">+91 612 238 9012</strong>
              </div>
            </div>
            <a href="tel:+916122389012">
              <Button variant="outline" size="sm" leftIcon={<Phone className="w-3.5 h-3.5 text-[#143D2B]" />}>
                Call Patna Desk
              </Button>
            </a>
          </div>
        </div>
      ) : (
        /* Not Found State */
        hasSearched && (
          <div className="py-12 text-center bg-white rounded-xl border border-[#E2DDD5] p-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#FAF1EB] text-[#C25E28] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#141413]">
              Application Reference Not Found
            </h3>
            <p className="text-xs text-[#52524E] max-w-sm mx-auto">
              No merchant application found matching &quot;{searchRef}&quot;. Please verify the reference code or submit a new partner application.
            </p>
            {onNavigateToRegister && (
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onNavigateToRegister}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Start New Partner Registration
                </Button>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};
