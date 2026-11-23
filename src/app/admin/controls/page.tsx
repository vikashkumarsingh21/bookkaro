'use client';

import React, { useState, useMemo } from 'react';
import {
  SlidersHorizontal,
  ShieldCheck,
  FileSpreadsheet,
  Download,
  Search,
  MapPin,
  Lock,
  Phone,
  Mail,
  Scale,
  Eye,
  Info,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { useAdminPortal } from '@/context/AdminPortalContext';
import { BookingCategory } from '@/types/bookkaro';

type ControlsTab = 'CATEGORIES_GEO' | 'INDIA_COMPLIANCE' | 'AUDIT_LOGS';

export default function AdminControlsPage() {
  const {
    controls,
    updateSearchRadius,
    toggleCategoryStatus,
    updateCategoryCommissionRate,
    toggleSponsoredBadgeEnforcement,
    toggleLocalityStatus,
    auditLogs,
  } = useAdminPortal();

  const [activeTab, setActiveTab] = useState<ControlsTab>('CATEGORIES_GEO');

  // Commission editing inline state
  const [editingCategory, setEditingCategory] = useState<BookingCategory | null>(null);
  const [editingRate, setEditingRate] = useState<number>(0);

  // Compliance specific toggle states
  const [priorPriceCheckEnabled, setPriorPriceCheckEnabled] = useState(true);
  const [recordedComplaintCopyEnabled, setRecordedComplaintCopyEnabled] = useState(true);

  // Audit Logs filters
  const [auditSearch, setAuditSearch] = useState('');
  const [selectedActionType, setSelectedActionType] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  // Filtered Audit Logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // Role filter
      if (selectedRole !== 'ALL' && log.actorRole !== selectedRole) {
        return false;
      }
      // Action Type filter
      if (selectedActionType !== 'ALL' && log.actionType !== selectedActionType) {
        return false;
      }
      // Search
      if (auditSearch.trim()) {
        const q = auditSearch.toLowerCase();
        const matchesTarget = log.targetId.toLowerCase().includes(q);
        const matchesActor = log.actorName.toLowerCase().includes(q);
        const matchesSummary = log.summary.toLowerCase().includes(q);
        const matchesType = log.actionType.toLowerCase().includes(q);
        if (!matchesTarget && !matchesActor && !matchesSummary && !matchesType) {
          return false;
        }
      }
      return true;
    });
  }, [auditLogs, selectedRole, selectedActionType, auditSearch]);

  // Handle saving commission
  const handleSaveCommission = (catId: BookingCategory) => {
    if (editingRate < 0 || editingRate > 50) {
      alert('Commission percentage must be between 0% and 50%');
      return;
    }
    updateCategoryCommissionRate(catId, Number(editingRate));
    setEditingCategory(null);
  };

  // CSV Export Download
  const handleExportCSV = () => {
    const headers = [
      'Log ID',
      'Timestamp (ISO)',
      'Timestamp (IST)',
      'Actor Role',
      'Actor Name',
      'Action Type',
      'Target ID',
      'Summary',
      'Retention Lock',
    ];

    const rows = filteredLogs.map((log) => [
      `"${log.id}"`,
      `"${log.timestamp}"`,
      `"${new Date(log.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}"`,
      `"${log.actorRole}"`,
      `"${log.actorName.replace(/"/g, '""')}"`,
      `"${log.actionType}"`,
      `"${log.targetId}"`,
      `"${log.summary.replace(/"/g, '""')}"`,
      `"${log.retentionLock ? 'DPDP-1-YR-LOCKED' : 'STANDARD'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bookkaro-patna-audit-log-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // JSON Export Download
  const handleExportJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(filteredLogs, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `bookkaro-patna-audit-log-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-5">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#525259]">
            <span className="w-2 h-2 rounded-full bg-[#165234]" />
            <span>Platform Governance &amp; Compliance</span>
            <span className="text-[#DCDCD8]">•</span>
            <span>Patna Launch Cluster</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#151517] tracking-tight mt-1">
            Platform Controls &amp; Immutable Audit Logs
          </h1>
          <p className="text-xs text-[#525259] mt-0.5">
            Configure category rules, geo search radiuses, India DPDP Act compliance, and review tamper-evident audit trails.
          </p>
        </div>

        {/* DPDP Lock Status Pill */}
        <div className="px-3 py-1.5 bg-white rounded-[6px] border border-[#DCDCD8] flex items-center gap-2 font-mono text-xs">
          <Lock className="w-3.5 h-3.5 text-[#6B1D2F]" />
          <div>
            <div className="text-[9px] uppercase text-[#525259]">DPDP Act 2023 / Rules 2025</div>
            <div className="text-[11px] font-bold text-[#165234] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#165234] animate-pulse" />
              <span>1-Year Immutable Lock Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 border-b border-[#DCDCD8] pb-2.5 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('CATEGORIES_GEO')}
          className={`px-3 py-1.5 rounded-[6px] text-xs font-mono transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'CATEGORIES_GEO'
              ? 'bg-[#1A1A1D] text-white font-medium'
              : 'bg-white text-[#525259] hover:text-[#151517] border border-[#DCDCD8]'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Categories &amp; Geo Radius</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('INDIA_COMPLIANCE')}
          className={`px-3 py-1.5 rounded-[6px] text-xs font-mono transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'INDIA_COMPLIANCE'
              ? 'bg-[#1A1A1D] text-white font-medium'
              : 'bg-white text-[#525259] hover:text-[#151517] border border-[#DCDCD8]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>India Statutory Governance</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('AUDIT_LOGS')}
          className={`px-3 py-1.5 rounded-[6px] text-xs font-mono transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'AUDIT_LOGS'
              ? 'bg-[#1A1A1D] text-white font-medium'
              : 'bg-white text-[#525259] hover:text-[#151517] border border-[#DCDCD8]'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Immutable Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: CATEGORIES & PATNA GEO CONTROLS
          ======================================================== */}
      {activeTab === 'CATEGORIES_GEO' && (
        <div className="space-y-5">
          {/* Default Search Radius Selector */}
          <div className="p-4 bg-white rounded-[6px] border border-[#DCDCD8] space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-semibold text-xs text-[#151517] font-mono uppercase tracking-wider">
                  Default Patna Geofencing &amp; Discovery Radius
                </h2>
                <p className="text-xs text-[#525259] mt-0.5">
                  Determines the default radial perimeter for dual-intent booking searches across Patna pin codes.
                </p>
              </div>
              <div className="text-xs font-mono font-medium text-[#165234] bg-[#EAF5EE] border border-[#C2E4CD] px-2.5 py-0.5 rounded-[4px]">
                Active: {controls.defaultSearchRadiusKm} km Radius
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1 flex-wrap font-mono">
              {[5, 10, 25, 50].map((radius) => {
                const isSelected = controls.defaultSearchRadiusKm === radius;
                return (
                  <button
                    key={radius}
                    type="button"
                    onClick={() => updateSearchRadius(radius)}
                    className={`px-3 py-1.5 rounded-[6px] text-xs transition-colors ${
                      isSelected
                        ? 'bg-[#1A1A1D] text-white font-bold'
                        : 'bg-[#F8F8F7] text-[#525259] hover:text-[#151517] border border-[#DCDCD8]'
                    }`}
                  >
                    {radius} km {radius === 10 ? '(Default Pilot)' : radius === 50 ? '(Outer Corridor)' : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categories & Commission Management */}
          <div className="bg-white rounded-[6px] border border-[#DCDCD8] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#DCDCD8] bg-[#F8F8F7] flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-xs text-[#151517] font-mono uppercase tracking-wider">
                  Marketplace Categories &amp; Standard Commissions
                </h2>
                <p className="text-xs text-[#525259] mt-0.5">
                  Toggle category launch availability and calibrate standard take-rates applied to bookings.
                </p>
              </div>
              <span className="text-[10px] font-mono text-[#525259] uppercase">
                {controls.categories.filter((c) => c.isEnabled).length} of {controls.categories.length} Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="border-b border-[#DCDCD8] text-[10px] uppercase font-mono text-[#525259] bg-white">
                  <tr>
                    <th className="py-2.5 px-3.5">Category</th>
                    <th className="py-2.5 px-3.5">Launch State</th>
                    <th className="py-2.5 px-3.5">Standard Take-Rate</th>
                    <th className="py-2.5 px-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCDCD8]">
                  {controls.categories.map((cat) => {
                    const isEditing = editingCategory === cat.id;
                    return (
                      <tr key={cat.id} className="hover:bg-[#F8F8F7] transition-colors">
                        <td className="py-2.5 px-3.5">
                          <div className="font-semibold text-[#151517]">{cat.name}</div>
                          <div className="text-[10px] font-mono text-[#525259]">{cat.id}</div>
                        </td>

                        <td className="py-2.5 px-3.5">
                          <button
                            type="button"
                            onClick={() => toggleCategoryStatus(cat.id)}
                            className={`px-2.5 py-0.5 rounded-[4px] text-[10px] font-mono font-medium transition-colors inline-flex items-center gap-1.5 ${
                              cat.isEnabled
                                ? 'bg-[#EAF5EE] text-[#165234] border border-[#C2E4CD]'
                                : 'bg-[#FCEBEC] text-[#911D23] border border-[#F8D7DA]'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${cat.isEnabled ? 'bg-[#165234]' : 'bg-[#911D23]'}`}
                            />
                            <span>{cat.isEnabled ? 'Active in Patna' : 'Phase 2 (Paused)'}</span>
                          </button>
                        </td>

                        <td className="py-2.5 px-3.5">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                max="50"
                                value={editingRate}
                                onChange={(e) => setEditingRate(Number(e.target.value))}
                                className="w-16 px-2 py-1 bg-white border border-[#6B1D2F] rounded-[4px] text-xs font-mono text-[#151517] outline-none"
                              />
                              <span className="text-xs font-mono text-[#525259]">%</span>
                            </div>
                          ) : (
                            <div className="font-mono text-xs font-bold text-[#151517] tabular-nums">
                              {cat.standardCommissionPercentage.toFixed(1)}%
                            </div>
                          )}
                        </td>

                        <td className="py-2.5 px-3.5 text-right font-mono">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleSaveCommission(cat.id)}
                                className="px-2 py-1 rounded-[4px] bg-[#165234] text-white text-xs font-mono font-medium"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingCategory(null)}
                                className="px-2 py-1 rounded-[4px] border border-[#DCDCD8] bg-white text-[#525259] text-xs font-mono"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCategory(cat.id);
                                setEditingRate(cat.standardCommissionPercentage);
                              }}
                              className="px-2.5 py-1 rounded-[4px] border border-[#DCDCD8] bg-white hover:bg-[#F2F2F0] text-xs font-mono text-[#151517] transition-colors"
                            >
                              Edit Rate
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Patna Localities Cluster */}
          <div className="bg-white rounded-[6px] border border-[#DCDCD8] p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-semibold text-xs text-[#151517] font-mono uppercase tracking-wider">
                  Patna Municipal Localities &amp; Zones
                </h2>
                <p className="text-xs text-[#525259] mt-0.5">
                  Toggle hyper-local geo-coverage for individual municipal wards and transport corridors.
                </p>
              </div>
              <div className="text-xs font-mono text-[#525259]">
                <strong className="text-[#151517]">
                  {controls.localities.filter((l) => l.isActive).length}
                </strong>{' '}
                of {controls.localities.length} Localities Active
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
              {controls.localities.map((loc) => (
                <div
                  key={loc.name}
                  className={`p-2.5 rounded-[6px] border transition-all ${
                    loc.isActive
                      ? 'bg-white border-[#DCDCD8]'
                      : 'bg-[#F8F8F7] border-[#DCDCD8] opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-xs text-[#151517]">{loc.name}</span>
                    <button
                      type="button"
                      onClick={() => toggleLocalityStatus(loc.name)}
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded transition-colors ${
                        loc.isActive
                          ? 'bg-[#EAF5EE] text-[#165234] border border-[#C2E4CD]'
                          : 'bg-[#F2F2F0] text-[#525259] border border-[#DCDCD8]'
                      }`}
                    >
                      {loc.isActive ? 'Active' : 'Paused'}
                    </button>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-[#525259] mt-1">
                    <MapPin className="w-3 h-3 text-[#525259]/70" />
                    <span>PIN {loc.pincode}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: INDIA MARKETPLACE GOVERNANCE PANEL
          ======================================================== */}
      {activeTab === 'INDIA_COMPLIANCE' && (
        <div className="space-y-5">
          {/* Statutory Grievance Redressal Card */}
          <div className="p-4 bg-white rounded-[6px] border border-[#DCDCD8] space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs font-mono font-medium text-[#165234]">
                  <Scale className="w-3.5 h-3.5 text-[#165234]" />
                  <span>Consumer Protection (E-Commerce) Rules, 2026 Mandate</span>
                </div>
                <h2 className="font-semibold text-sm text-[#151517]">
                  Designated Grievance Redressal Officer
                </h2>
                <p className="text-xs text-[#525259]">
                  Required by Rule 5(2) and 2026 amendments. Prominently published on all marketplace booking confirmations.
                </p>
              </div>

              <div className="px-3 py-1.5 bg-[#F8F8F7] rounded-[6px] border border-[#DCDCD8] text-right shrink-0 font-mono text-xs">
                <div className="text-[10px] text-[#525259] uppercase">Statutory SLAs</div>
                <div className="font-bold text-[#151517] mt-0.5">
                  Ack: <span className="text-[#165234]">48 Hours</span> • Resolution: <span className="text-[#165234]">30 Days</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-[#F8F8F7] rounded-[6px] border border-[#DCDCD8] space-y-1.5 text-xs">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#525259]">
                  Officer Appointee
                </div>
                <div className="font-semibold text-[#151517]">{controls.grievanceOfficer.name}</div>
                <div className="text-[11px] text-[#525259]">{controls.grievanceOfficer.title}</div>
                <div className="pt-1.5 text-xs font-mono text-[#525259] space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-[#6B1D2F]" />
                    <a href={`mailto:${controls.grievanceOfficer.email}`} className="text-[#6B1D2F] font-medium hover:underline">
                      {controls.grievanceOfficer.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-[#6B1D2F]" />
                    <span>{controls.grievanceOfficer.phone}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#F8F8F7] rounded-[6px] border border-[#DCDCD8] space-y-1.5 text-xs">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#525259]">
                  Patna HQ &amp; National Escalation
                </div>
                <p className="text-[11px] text-[#525259] leading-relaxed">
                  {controls.grievanceOfficer.officeAddress}
                </p>
                <div className="pt-1">
                  <div className="text-[10px] font-mono text-[#525259] uppercase mb-1">
                    National Consumer Helpline (Govt. of India)
                  </div>
                  <div className="p-2 rounded-[4px] bg-white border border-[#DCDCD8] text-xs font-mono flex items-center justify-between">
                    <span className="font-bold text-[#151517]">NCH Toll-Free: 1915</span>
                    <a
                      href="https://consumerhelpline.gov.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#6B1D2F] underline"
                    >
                      consumerhelpline.gov.in ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* India Statutory Compliance Controls Grid (2026/2027 mandates) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Control 1: Anti-Dark Pattern Sponsored Labeling */}
            <div className="p-4 bg-white rounded-[6px] border border-[#DCDCD8] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#6B1D2F]" />
                  <h3 className="font-semibold text-xs text-[#151517]">
                    Sponsored Placement Labeling (Rule 4(12))
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={toggleSponsoredBadgeEnforcement}
                  className={`px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-medium transition-colors ${
                    controls.sponsoredBadgeEnforced
                      ? 'bg-[#EAF5EE] text-[#165234] border border-[#C2E4CD]'
                      : 'bg-[#F2F2F0] text-[#525259] border border-[#DCDCD8]'
                  }`}
                >
                  {controls.sponsoredBadgeEnforced ? 'Mandatory ENFORCED' : 'OPTIONAL'}
                </button>
              </div>

              <p className="text-xs text-[#525259] leading-relaxed">
                Mandates that any promoted or paid placement carries an unambiguous, prominent &quot;SPONSORED&quot; badge in accordance with the Central Consumer Protection Authority (CCPA) Dark Patterns Guidelines 2023 and Rule 4(12).
              </p>

              <div className="p-2.5 bg-[#F8F8F7] rounded-[4px] border border-[#DCDCD8] text-[11px] text-[#525259] flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#165234] shrink-0" />
                <span>Zero deceptive ranking: Organic results are strictly sorted by algorithmic merit and distance.</span>
              </div>
            </div>

            {/* Control 2: Ranking Parameters Transparency */}
            <div className="p-4 bg-white rounded-[6px] border border-[#DCDCD8] space-y-2.5">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#165234]" />
                <h3 className="font-semibold text-xs text-[#151517]">
                  Ranking Parameters Disclosure (Rule 5(3)(f))
                </h3>
              </div>

              <p className="text-xs text-[#525259] leading-relaxed">
                Consumer Protection (E-Commerce) Rules require platforms to explain main ranking parameters in descending order of importance in plain language to Patna consumers.
              </p>

              <div className="p-2.5 bg-[#F8F8F7] rounded-[4px] border border-[#DCDCD8] space-y-1 text-xs font-mono text-[#525259]">
                <div className="font-bold text-[#151517] text-[11px]">Descending Parameters:</div>
                <div className="flex items-center justify-between">
                  <span>1. Real-time Slot Availability &amp; Response SLA</span>
                  <span className="font-bold text-[#165234]">35%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>2. Haversine Distance from Consumer Locality</span>
                  <span className="font-bold text-[#165234]">25%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>3. Verified PMC Municipal Licence &amp; KYC</span>
                  <span className="font-bold text-[#165234]">25%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>4. Verified Customer Review Score</span>
                  <span className="font-bold text-[#165234]">15%</span>
                </div>
              </div>
            </div>

            {/* Control 3: Prior-Price Discount Verification & Self-Audit */}
            <div className="p-4 bg-white rounded-[6px] border border-[#DCDCD8] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#525259]" />
                  <h3 className="font-semibold text-xs text-[#151517]">
                    30-Day Prior-Price Discount Check (Rule 4(13))
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPriorPriceCheckEnabled(!priorPriceCheckEnabled)}
                  className={`px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-medium transition-colors ${
                    priorPriceCheckEnabled
                      ? 'bg-[#EAF5EE] text-[#165234] border border-[#C2E4CD]'
                      : 'bg-[#F2F2F0] text-[#525259] border border-[#DCDCD8]'
                  }`}
                >
                  {priorPriceCheckEnabled ? 'ACTIVE' : 'OFF'}
                </button>
              </div>

              <p className="text-xs text-[#525259] leading-relaxed">
                Prevents artificial markup before discount campaigns by enforcing reference to lowest price offered in the preceding 30 days.
              </p>

              <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-[#DCDCD8]">
                <span className="text-[#525259]">Dark Patterns Self-Audit Certificate:</span>
                <span className="font-semibold text-[#165234] bg-[#EAF5EE] px-1.5 py-0.2 rounded border border-[#C2E4CD]">
                  CERT-PAT-2026 VALID
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-[#DCDCD8]">
                <span className="text-[#525259]">Recorded Complaint Copy to Consumer:</span>
                <button
                  type="button"
                  onClick={() => setRecordedComplaintCopyEnabled(!recordedComplaintCopyEnabled)}
                  className={`px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-medium transition-colors ${
                    recordedComplaintCopyEnabled
                      ? 'bg-[#EAF5EE] text-[#165234] border border-[#C2E4CD]'
                      : 'bg-[#F2F2F0] text-[#525259] border border-[#DCDCD8]'
                  }`}
                >
                  {recordedComplaintCopyEnabled ? 'MANDATORY ON' : 'PAUSED'}
                </button>
              </div>
            </div>

            {/* Control 4: DPDP Rules 2025 Readiness & SOP */}
            <div className="p-4 bg-white rounded-[6px] border border-[#DCDCD8] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#6B1D2F]" />
                  <h3 className="font-semibold text-xs text-[#151517]">
                    DPDP Act 2023 / Rules 2025 Readiness
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-medium bg-[#EAF5EE] text-[#165234] border border-[#C2E4CD]">
                  SOP READY
                </span>
              </div>

              <p className="text-xs text-[#525259] leading-relaxed">
                Section 8(7) mandates a minimum 1-year retention of administrative processing and audit trails. Rule 7 specifies 72-hour incident reporting SOP to Data Protection Board.
              </p>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1 border-t border-[#DCDCD8]">
                <div className="p-1.5 bg-[#F8F8F7] rounded border border-[#DCDCD8]">
                  <span className="text-[#525259] block">Notice Version:</span>
                  <span className="font-bold text-[#151517]">DPDP-PAT-v1.4</span>
                </div>
                <div className="p-1.5 bg-[#F8F8F7] rounded border border-[#DCDCD8]">
                  <span className="text-[#525259] block">Breach SOP SLA:</span>
                  <span className="font-bold text-[#165234]">72-Hour Response</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: IMMUTABLE AUDIT LOG TABLE & REAL EXPORT
          ======================================================== */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="space-y-4">
          {/* Controls Bar: Filters & Export Buttons */}
          <div className="p-3 bg-white rounded-[6px] border border-[#DCDCD8] space-y-2.5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-[#525259] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Filter logs by target ID, actor, action, or summary..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#DCDCD8] rounded-[6px] text-xs font-mono text-[#151517] placeholder:text-[#525259]/60 focus:outline-none focus:border-[#6B1D2F]"
                />
              </div>

              {/* Real Export Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 bg-[#1A1A1D] hover:bg-[#0B0B0D] text-white rounded-[6px] text-xs font-mono font-medium transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="px-3 py-1.5 bg-white hover:bg-[#F2F2F0] text-[#151517] border border-[#DCDCD8] rounded-[6px] text-xs font-mono font-medium transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>
              </div>
            </div>

            {/* Pill Filters */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs font-mono">
              <span className="text-[10px] uppercase text-[#525259]">Action:</span>
              {[
                { id: 'ALL', label: 'All Actions' },
                { id: 'KYC_APPROVED', label: 'KYC Approved' },
                { id: 'CRM_STAGE_ADVANCE', label: 'CRM Advance' },
                { id: 'COMMERCIAL_PLAN_ASSIGNED', label: 'Plan Assigned' },
                { id: 'DISPUTE_RESOLVED', label: 'Dispute Resolved' },
                { id: 'COMMISSION_ADJUSTED', label: 'Commission Adjusted' },
                { id: 'PLATFORM_CONTROL_TOGGLED', label: 'Control Toggled' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setSelectedActionType(pill.id)}
                  className={`px-2 py-0.5 rounded-[4px] text-[10px] transition-colors ${
                    selectedActionType === pill.id
                      ? 'bg-[#1A1A1D] text-white font-medium'
                      : 'bg-[#F8F8F7] text-[#525259] hover:text-[#151517] border border-[#DCDCD8]'
                  }`}
                >
                  {pill.label}
                </button>
              ))}

              <div className="h-3 w-[1px] bg-[#DCDCD8] mx-1" />

              <span className="text-[10px] uppercase text-[#525259]">Role:</span>
              {['ALL', 'ADMIN', 'SYSTEM'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`px-2 py-0.5 rounded-[4px] text-[10px] transition-colors ${
                    selectedRole === role
                      ? 'bg-[#1A1A1D] text-white font-medium'
                      : 'bg-[#F8F8F7] text-[#525259] hover:text-[#151517] border border-[#DCDCD8]'
                  }`}
                >
                  {role}
                </button>
              ))}

              {(auditSearch || selectedActionType !== 'ALL' || selectedRole !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setAuditSearch('');
                    setSelectedActionType('ALL');
                    setSelectedRole('ALL');
                  }}
                  className="text-[10px] text-[#6B1D2F] hover:underline font-semibold ml-auto"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white rounded-[6px] border border-[#DCDCD8] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-[#DCDCD8] bg-[#F8F8F7] text-[10px] uppercase text-[#525259]">
                  <tr>
                    <th className="py-2.5 px-3.5">Log ID &amp; IST Time</th>
                    <th className="py-2.5 px-3.5">Action Type</th>
                    <th className="py-2.5 px-3.5">Actor</th>
                    <th className="py-2.5 px-3.5">Target Entity</th>
                    <th className="py-2.5 px-3.5">Audit Summary</th>
                    <th className="py-2.5 px-3.5 text-right">Retention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCDCD8]">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-[#525259]">
                        <FileSpreadsheet className="w-6 h-6 text-[#525259]/40 mx-auto mb-1" />
                        <p className="font-semibold text-xs text-[#151517]">No audit logs match criteria</p>
                        <p className="text-[11px] text-[#525259]">Adjust your search term or action filter</p>
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                      return (
                        <tr key={log.id} className="hover:bg-[#F8F8F7] transition-colors">
                          <td className="py-2.5 px-3.5">
                            <div className="font-bold text-[#151517]">{log.id}</div>
                            <div className="text-[10px] text-[#525259] mt-0.5">
                              {new Date(log.timestamp).toLocaleString('en-IN', {
                                timeZone: 'Asia/Kolkata',
                                dateStyle: 'short',
                                timeStyle: 'medium',
                              })}
                            </div>
                          </td>

                          <td className="py-2.5 px-3.5">
                            <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#F2F2F0] text-[#151517] border border-[#DCDCD8]">
                              {log.actionType}
                            </span>
                          </td>

                          <td className="py-2.5 px-3.5 font-sans">
                            <div className="font-semibold text-xs text-[#151517]">{log.actorName}</div>
                            <span className="inline-block mt-0.5 text-[9px] font-mono px-1 py-0.2 rounded bg-[#F8F8F7] text-[#525259] border border-[#DCDCD8]">
                              {log.actorRole}
                            </span>
                          </td>

                          <td className="py-2.5 px-3.5 font-bold text-[#6B1D2F]">
                            {log.targetId}
                          </td>

                          <td className="py-2.5 px-3.5 max-w-[320px] font-sans">
                            <p className="text-xs text-[#525259] leading-relaxed line-clamp-2" title={log.summary}>
                              {log.summary}
                            </p>
                          </td>

                          <td className="py-2.5 px-3.5 text-right font-mono">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#EAF5EE] text-[#165234] border border-[#C2E4CD]">
                              <Lock className="w-2.5 h-2.5" />
                              <span>1-Yr DPDP</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
