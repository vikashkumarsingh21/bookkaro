'use client';

import React, { useState, useMemo } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  KanbanSquare,
  Table as TableIcon,
  Search,
  DollarSign,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';
import { useAdminPortal } from '@/context/AdminPortalContext';
import { PartnerApplication, PartnerOnboardingStage } from '@/services/partnerOnboardingService';
import { CommercialPlanConfig } from '@/services/adminService';
import { Drawer } from '@/components/ui/Drawer';

export default function AdminCrmPage() {
  const { crmLeads, moveLeadStage, addLeadNote, assignCommercialPlan } = useAdminPortal();

  // View Mode: Kanban vs Table
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSelectedStage, setMobileSelectedStage] = useState<PartnerOnboardingStage>('01_LEAD');

  // Contextual Inspection Drawer State
  const [inspectLead, setInspectLead] = useState<PartnerApplication | null>(null);

  // Note form state inside Drawer
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState<'CALL' | 'DEMO' | 'INTERNAL_NOTE'>('CALL');

  // Commercial Plan form state inside Drawer
  const [planType, setPlanType] = useState<'SUBSCRIPTION' | 'COMMISSION'>('COMMISSION');
  const [subscriptionTier, setSubscriptionTier] = useState<'STARTER' | 'GROWTH' | 'ENTERPRISE'>('GROWTH');
  const [commissionRate, setCommissionRate] = useState<number>(8.0);
  const [planSavedToast, setPlanSavedToast] = useState(false);

  // 6 Defined Onboarding Stages
  const stages: { id: PartnerOnboardingStage; label: string; desc: string }[] = [
    { id: '01_LEAD', label: '01 LEAD', desc: 'Inbound application' },
    { id: '02_DISCUSS', label: '02 DISCUSS', desc: 'Call / demo scheduled' },
    { id: '03_VERIFY', label: '03 VERIFY', desc: 'KYC & inspection' },
    { id: '04_ACTIVATE', label: '04 ACTIVATE', desc: 'Provider ID generated' },
    { id: '05_CONFIGURE', label: '05 CONFIGURE', desc: 'Catalog & hours set' },
    { id: '06_GO_LIVE', label: '06 GO LIVE', desc: 'Live on Patna app' },
  ];

  const stageSequence: PartnerOnboardingStage[] = [
    '01_LEAD',
    '02_DISCUSS',
    '03_VERIFY',
    '04_ACTIVATE',
    '05_CONFIGURE',
    '06_GO_LIVE',
  ];

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return crmLeads.filter((lead) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = lead.brandDisplayName.toLowerCase().includes(q);
        const matchesRef = lead.applicationReference.toLowerCase().includes(q);
        const matchesLoc = lead.locality.toLowerCase().includes(q);
        const matchesCat = lead.category.toLowerCase().includes(q);
        const matchesOwner = lead.ownerName.toLowerCase().includes(q);
        if (!matchesName && !matchesRef && !matchesLoc && !matchesCat && !matchesOwner) return false;
      }
      return true;
    });
  }, [crmLeads, searchQuery]);

  const handleOpenDrawer = (lead: PartnerApplication) => {
    setInspectLead(lead);
    setPlanType(lead.commercialModel || 'COMMISSION');
    setCommissionRate(lead.commercialDetails?.commissionPercentage || 8.0);
    setSubscriptionTier(
      lead.commercialDetails?.monthlyFeeInr === 1499
        ? 'STARTER'
        : lead.commercialDetails?.monthlyFeeInr === 4999
        ? 'ENTERPRISE'
        : 'GROWTH'
    );
    setNoteText('');
    setPlanSavedToast(false);
  };

  const handleAdvanceStage = (leadId: string, currentStage: PartnerOnboardingStage) => {
    const idx = stageSequence.indexOf(currentStage);
    if (idx < stageSequence.length - 1) {
      const nextStage = stageSequence[idx + 1];
      const updated = moveLeadStage(leadId, nextStage);
      if (inspectLead && inspectLead.id === leadId) {
        setInspectLead(updated);
      }
    }
  };

  const handleRegressStage = (leadId: string, currentStage: PartnerOnboardingStage) => {
    const idx = stageSequence.indexOf(currentStage);
    if (idx > 0) {
      const prevStage = stageSequence[idx - 1];
      const updated = moveLeadStage(leadId, prevStage);
      if (inspectLead && inspectLead.id === leadId) {
        setInspectLead(updated);
      }
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectLead || !noteText.trim()) return;

    const updated = addLeadNote(inspectLead.id, noteText.trim(), noteType);
    setInspectLead(updated);
    setNoteText('');
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectLead) return;

    const monthlyFee =
      subscriptionTier === 'STARTER'
        ? 1499
        : subscriptionTier === 'GROWTH'
        ? 2499
        : 4999;

    const planConfig: CommercialPlanConfig =
      planType === 'SUBSCRIPTION'
        ? {
            type: 'SUBSCRIPTION',
            subscriptionTier,
            monthlyFeeInr: monthlyFee,
            tierName: `Fixed ${subscriptionTier} Plan (₹${monthlyFee}/mo, 0% Comm)`,
          }
        : {
            type: 'COMMISSION',
            commissionPercentage: Number(commissionRate),
            tierName: `Standard Pay-Per-Completed-Visit (${commissionRate}%)`,
          };

    const updated = assignCommercialPlan(inspectLead.id, planConfig);
    setInspectLead(updated);
    setPlanSavedToast(true);
    setTimeout(() => setPlanSavedToast(false), 2500);
  };

  return (
    <div className="space-y-5">
      {/* 1. TOP HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#525259]">
            <span className="w-2 h-2 rounded-full bg-[#6B1D2F]" />
            <span>Patna Partner Acquisition &amp; CRM</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#151517] tracking-tight mt-1">
            Sales CRM &amp; Onboarding Pipeline
          </h1>
          <p className="text-xs text-[#525259] mt-0.5">
            Stage-gate merchant progression from inbound lead through KYC compliance to live discovery.
          </p>
        </div>

        {/* View Switcher & Search */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-44 sm:w-56">
            <Search className="w-3.5 h-3.5 text-[#525259] absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Filter leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-mono pl-8 pr-2.5 py-1.5 rounded-[6px] border border-[#DCDCD8] focus:border-[#6B1D2F] outline-none bg-white text-[#151517]"
            />
          </div>

          <div className="flex items-center p-0.5 bg-white border border-[#DCDCD8] rounded-[6px] shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`px-2.5 py-1 rounded-[4px] text-xs font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'kanban'
                  ? 'bg-[#1A1A1D] text-white'
                  : 'text-[#525259] hover:text-[#151517]'
              }`}
              title="Kanban Board View"
            >
              <KanbanSquare className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-[4px] text-xs font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-[#1A1A1D] text-white'
                  : 'text-[#525259] hover:text-[#151517]'
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MOBILE STAGE SELECTOR TABS (Zero horizontal overflow on 360px) */}
      <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {stages.map((stg) => {
          const count = filteredLeads.filter((l) => l.stage === stg.id).length;
          const isSelected = mobileSelectedStage === stg.id;
          return (
            <button
              key={stg.id}
              type="button"
              onClick={() => setMobileSelectedStage(stg.id)}
              className={`
                px-2.5 py-1.5 rounded-[6px] text-xs font-mono whitespace-nowrap transition-all flex items-center gap-1.5
                ${
                  isSelected
                    ? 'bg-[#1A1A1D] text-white'
                    : 'bg-white text-[#525259] border border-[#DCDCD8]'
                }
              `}
            >
              <span>{stg.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded font-mono text-[10px] tabular-nums ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-[#F2F2F0] text-[#525259]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. MAIN PIPELINE VIEW */}
      {viewMode === 'kanban' ? (
        <>
          {/* Desktop 6-Column Kanban */}
          <div className="hidden lg:grid grid-cols-6 gap-3 items-start">
            {stages.map((stg) => {
              const stageLeads = filteredLeads.filter((l) => l.stage === stg.id);
              return (
                <div
                  key={stg.id}
                  className="bg-[#F8F8F7] rounded-[6px] border border-[#DCDCD8] p-2.5 flex flex-col min-h-[460px]"
                >
                  {/* Column Header */}
                  <div className="pb-2 mb-2.5 border-b border-[#DCDCD8] flex items-center justify-between">
                    <div>
                      <div className="font-mono font-semibold text-xs text-[#151517]">
                        {stg.label}
                      </div>
                      <div className="text-[10px] text-[#525259] line-clamp-1">
                        {stg.desc}
                      </div>
                    </div>
                    <span className="w-5 h-5 rounded-[4px] bg-white border border-[#DCDCD8] text-[10px] font-mono font-bold text-[#151517] flex items-center justify-center shrink-0 tabular-nums">
                      {stageLeads.length}
                    </span>
                  </div>

                  {/* Column Cards */}
                  <div className="space-y-2 flex-1">
                    {stageLeads.length === 0 ? (
                      <div className="py-6 text-center text-[10px] font-mono text-[#525259]/60 italic">
                        No partners in queue
                      </div>
                    ) : (
                      stageLeads.map((lead) => (
                        <div
                          key={lead.id}
                          onClick={() => handleOpenDrawer(lead)}
                          className="p-2.5 bg-white rounded-[6px] border border-[#DCDCD8] hover:border-[#6B1D2F] transition-all cursor-pointer space-y-1.5 group shadow-2xs"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono text-[10px] font-bold text-[#6B1D2F]">
                              #{lead.applicationReference}
                            </span>
                            <span className="text-[9px] font-mono uppercase tracking-wider px-1 py-0.2 rounded bg-[#F2F2F0] text-[#525259] border border-[#DCDCD8]">
                              {lead.category.replace('_', ' ')}
                            </span>
                          </div>

                          <div className="font-semibold text-xs text-[#151517] leading-snug group-hover:text-[#6B1D2F] transition-colors truncate">
                            {lead.brandDisplayName}
                          </div>

                          <div className="text-[11px] font-mono text-[#525259] truncate">
                            {lead.locality}, Patna
                          </div>

                          <div className="pt-1.5 border-t border-[#DCDCD8] flex items-center justify-between text-[10px] font-mono">
                            <span className="text-[#525259]">
                              {lead.commercialModel === 'SUBSCRIPTION' ? 'Subscription' : 'Commission'}
                            </span>
                            <span className="text-[#6B1D2F] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-sans font-semibold">
                              <span>Inspect</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Single-Stage View (Selected from Mobile Tabs) */}
          <div className="lg:hidden space-y-2.5">
            {filteredLeads.filter((l) => l.stage === mobileSelectedStage).length === 0 ? (
              <div className="p-6 text-center bg-white rounded-[6px] border border-[#DCDCD8] text-xs font-mono text-[#525259]">
                No applications currently in {mobileSelectedStage}.
              </div>
            ) : (
              filteredLeads
                .filter((l) => l.stage === mobileSelectedStage)
                .map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => handleOpenDrawer(lead)}
                    className="p-3 bg-white rounded-[6px] border border-[#DCDCD8] space-y-1.5 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#6B1D2F]">
                        #{lead.applicationReference}
                      </span>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#F2F2F0] text-[#525259] border border-[#DCDCD8]">
                        {lead.category}
                      </span>
                    </div>
                    <div className="font-semibold text-xs text-[#151517]">
                      {lead.brandDisplayName}
                    </div>
                    <div className="text-[11px] font-mono text-[#525259]">
                      {lead.ownerName} • {lead.locality}, Patna
                    </div>
                    <div className="pt-1.5 border-t border-[#DCDCD8] flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[#525259]">{lead.phone}</span>
                      <span className="font-semibold text-[#6B1D2F]">Inspect Lead →</span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </>
      ) : (
        /* Table View */
        <div className="bg-white rounded-[6px] border border-[#DCDCD8] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F8F7] border-b border-[#DCDCD8] text-[10px] uppercase font-mono text-[#525259]">
                <tr>
                  <th className="px-3.5 py-2.5">Reference #</th>
                  <th className="px-3.5 py-2.5">Business Entity</th>
                  <th className="px-3.5 py-2.5">Category</th>
                  <th className="px-3.5 py-2.5">Locality</th>
                  <th className="px-3.5 py-2.5">Contact</th>
                  <th className="px-3.5 py-2.5">Stage</th>
                  <th className="px-3.5 py-2.5">Commercial Model</th>
                  <th className="px-3.5 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCDCD8]">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[#F8F8F7] transition-colors">
                    <td className="px-3.5 py-2.5 font-mono font-bold text-[#6B1D2F]">
                      #{lead.applicationReference}
                    </td>
                    <td className="px-3.5 py-2.5 font-medium text-[#151517]">
                      <div>{lead.brandDisplayName}</div>
                      <div className="text-[10px] font-normal text-[#525259]">{lead.businessLegalName}</div>
                    </td>
                    <td className="px-3.5 py-2.5 capitalize text-[#525259] font-mono">
                      {lead.category.replace('_', ' ')}
                    </td>
                    <td className="px-3.5 py-2.5 text-[#525259] font-mono">
                      {lead.locality} ({lead.pincode})
                    </td>
                    <td className="px-3.5 py-2.5 text-[#525259]">
                      <div>{lead.ownerName}</div>
                      <div className="text-[10px] font-mono text-[#525259]/80">{lead.phone}</div>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-medium uppercase tracking-wider bg-[#F2F2F0] text-[#151517] border border-[#DCDCD8]">
                        {lead.stage.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-[#525259] font-mono">
                      {lead.commercialModel === 'SUBSCRIPTION' ? (
                        <span className="font-semibold text-[#165234]">
                          Subscription (₹{lead.commercialDetails?.monthlyFeeInr || 2499}/mo)
                        </span>
                      ) : (
                        <span className="font-semibold text-[#7C4B06]">
                          Commission ({lead.commercialDetails?.commissionPercentage || 8}%)
                        </span>
                      )}
                    </td>
                    <td className="px-3.5 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenDrawer(lead)}
                        className="px-2.5 py-1 rounded-[4px] border border-[#DCDCD8] bg-white text-[#151517] hover:bg-[#F2F2F0] text-xs font-mono font-medium transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. CONTEXTUAL INSPECTION DRAWER */}
      {inspectLead && (
        <Drawer
          isOpen={!!inspectLead}
          onClose={() => setInspectLead(null)}
          title={inspectLead.brandDisplayName}
          description={`Application #${inspectLead.applicationReference} • ${inspectLead.locality}, Patna`}
          size="lg"
        >
          <div className="space-y-5 text-xs text-[#151517] font-sans">
            {/* Quick Status Bar & Stage Navigation */}
            <div className="p-3.5 rounded-[6px] bg-[#F8F8F7] border border-[#DCDCD8] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#525259]">
                  Current Pipeline Stage
                </span>
                <span className="font-mono text-xs font-bold text-[#6B1D2F] bg-white px-2 py-0.5 rounded-[4px] border border-[#DCDCD8]">
                  {inspectLead.stage.replace('_', ' ')}
                </span>
              </div>

              {/* Stage Advance / Regress Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={stageSequence.indexOf(inspectLead.stage) === 0}
                  onClick={() => handleRegressStage(inspectLead.id, inspectLead.stage)}
                  className="flex-1 py-1.5 px-3 rounded-[6px] border border-[#DCDCD8] bg-white hover:bg-[#F2F2F0] disabled:opacity-40 disabled:pointer-events-none text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[#525259]" />
                  <span>Previous Stage</span>
                </button>

                <button
                  type="button"
                  disabled={stageSequence.indexOf(inspectLead.stage) === stageSequence.length - 1}
                  onClick={() => handleAdvanceStage(inspectLead.id, inspectLead.stage)}
                  className="flex-1 py-1.5 px-3 rounded-[6px] bg-[#6B1D2F] hover:bg-[#521523] disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Advance Stage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Application & Merchant Particulars */}
            <div className="space-y-3">
              <div className="font-semibold text-xs text-[#151517] border-b border-[#DCDCD8] pb-1 font-mono uppercase tracking-wider">
                Registration Particulars
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-[4px] bg-[#F8F8F7] border border-[#DCDCD8]">
                  <span className="text-[10px] font-mono text-[#525259] block">Legal Entity Name:</span>
                  <span className="font-medium text-[#151517]">{inspectLead.businessLegalName}</span>
                </div>
                <div className="p-2.5 rounded-[4px] bg-[#F8F8F7] border border-[#DCDCD8]">
                  <span className="text-[10px] font-mono text-[#525259] block">Signatory / Owner:</span>
                  <span className="font-medium text-[#151517]">{inspectLead.ownerName}</span>
                </div>
                <div className="p-2.5 rounded-[4px] bg-[#F8F8F7] border border-[#DCDCD8]">
                  <span className="text-[10px] font-mono text-[#525259] block">Phone &amp; WhatsApp:</span>
                  <span className="font-mono text-[#151517]">{inspectLead.phone}</span>
                </div>
                <div className="p-2.5 rounded-[4px] bg-[#F8F8F7] border border-[#DCDCD8]">
                  <span className="text-[10px] font-mono text-[#525259] block">Business Email:</span>
                  <span className="font-mono text-[#151517] truncate block">{inspectLead.email}</span>
                </div>
                <div className="p-2.5 rounded-[4px] bg-[#F8F8F7] border border-[#DCDCD8] col-span-2">
                  <span className="text-[10px] font-mono text-[#525259] block">Venue Address:</span>
                  <span className="font-medium text-[#151517]">
                    {inspectLead.streetAddress}, {inspectLead.locality}, Patna - {inspectLead.pincode}
                  </span>
                </div>
              </div>
            </div>

            {/* Commercial Plan Assignment */}
            <form onSubmit={handleSavePlan} className="space-y-3 p-3.5 rounded-[6px] bg-[#F8F8F7] border border-[#DCDCD8]">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-xs text-[#151517] flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#6B1D2F]" />
                  <span>Assign Commercial Terms</span>
                </div>
                {planSavedToast && (
                  <span className="text-[10px] font-mono text-[#165234] bg-[#EAF5EE] border border-[#C2E4CD] px-1.5 py-0.2 rounded font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Plan Saved
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 p-2 rounded-[4px] bg-white border border-[#DCDCD8] cursor-pointer">
                  <input
                    type="radio"
                    name="planType"
                    checked={planType === 'COMMISSION'}
                    onChange={() => setPlanType('COMMISSION')}
                    className="accent-[#6B1D2F]"
                  />
                  <div>
                    <div className="font-medium text-xs">Pay-Per-Booking</div>
                    <div className="text-[10px] font-mono text-[#525259]">Commission %</div>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-[4px] bg-white border border-[#DCDCD8] cursor-pointer">
                  <input
                    type="radio"
                    name="planType"
                    checked={planType === 'SUBSCRIPTION'}
                    onChange={() => setPlanType('SUBSCRIPTION')}
                    className="accent-[#6B1D2F]"
                  />
                  <div>
                    <div className="font-medium text-xs">Monthly Subscription</div>
                    <div className="text-[10px] font-mono text-[#525259]">₹2,499 / mo fixed</div>
                  </div>
                </label>
              </div>

              {planType === 'COMMISSION' ? (
                <div className="space-y-1">
                  <label className="block text-[11px] font-mono text-[#525259]">
                    Marketplace Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="3"
                    max="25"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 8.0)}
                    className="w-full text-xs font-mono px-3 py-1.5 rounded-[4px] border border-[#DCDCD8] bg-white text-[#151517] outline-none focus:border-[#6B1D2F]"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="block text-[11px] font-mono text-[#525259]">
                    Subscription Tier
                  </label>
                  <select
                    value={subscriptionTier}
                    onChange={(e) => setSubscriptionTier(e.target.value as 'STARTER' | 'GROWTH' | 'ENTERPRISE')}
                    className="w-full text-xs font-mono px-3 py-1.5 rounded-[4px] border border-[#DCDCD8] bg-white text-[#151517] outline-none focus:border-[#6B1D2F]"
                  >
                    <option value="STARTER">Starter Tier — ₹1,499 / month</option>
                    <option value="GROWTH">Growth Tier — ₹2,499 / month (Recommended)</option>
                    <option value="ENTERPRISE">Enterprise Multi-Bay — ₹4,999 / month</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-1.5 rounded-[4px] bg-[#1A1A1D] hover:bg-[#0B0B0D] text-white text-xs font-mono font-medium transition-colors"
              >
                Update Terms &amp; Record Audit Log
              </button>
            </form>

            {/* Activity Notes Log */}
            <div className="space-y-3">
              <div className="font-semibold text-xs text-[#151517] border-b border-[#DCDCD8] pb-1 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#525259]" />
                <span>Operator Activity Notes</span>
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-2">
                <div className="flex gap-2">
                  <select
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value as 'CALL' | 'DEMO' | 'INTERNAL_NOTE')}
                    className="text-xs font-mono px-2.5 py-1.5 rounded-[4px] border border-[#DCDCD8] bg-white text-[#151517] outline-none"
                  >
                    <option value="CALL">Call Log</option>
                    <option value="DEMO">Demo Note</option>
                    <option value="INTERNAL_NOTE">Internal Memo</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Log conversation with partner..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="flex-1 text-xs font-mono px-3 py-1.5 rounded-[4px] border border-[#DCDCD8] bg-white text-[#151517] outline-none focus:border-[#6B1D2F]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-[4px] bg-[#1A1A1D] hover:bg-[#0B0B0D] text-white text-xs font-mono font-medium shrink-0"
                  >
                    Add
                  </button>
                </div>
              </form>

              {/* Notes Stream */}
              <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-[#DCDCD8]">
                {!inspectLead.reviewerNotes ? (
                  <div className="text-[11px] font-mono text-[#525259]/60 italic py-2">
                    No operator notes recorded yet.
                  </div>
                ) : (
                  inspectLead.reviewerNotes.split(' | ').filter(Boolean).map((noteStr: string, idx: number) => (
                    <div key={idx} className="pt-2 space-y-0.5">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="font-semibold text-[#151517]">Admin Desk</span>
                        <span className="text-[#525259]">Note #{idx + 1}</span>
                      </div>
                      <div className="text-xs font-mono text-[#525259]">{noteStr}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
}
