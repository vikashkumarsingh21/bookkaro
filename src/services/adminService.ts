import {
  partnerOnboardingService,
  PartnerApplication,
  PartnerOnboardingStage,
} from './partnerOnboardingService';
import { bookingService } from './bookingService';
import { BookingCategory } from '@/types/bookkaro';
import { apiClient } from '@/lib/apiClient';

export type AdminAuditActionType =
  | 'CRM_STAGE_ADVANCE'
  | 'CRM_NOTE_ADDED'
  | 'COMMERCIAL_PLAN_ASSIGNED'
  | 'KYC_APPROVED'
  | 'KYC_CHANGES_REQUESTED'
  | 'DISPUTE_RESOLVED'
  | 'REFUND_APPROVED'
  | 'COMMISSION_ADJUSTED'
  | 'PLATFORM_CONTROL_TOGGLED';

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  actorRole: 'ADMIN' | 'SYSTEM' | 'PARTNER' | 'CUSTOMER';
  actorName: string;
  actionType: AdminAuditActionType;
  targetId: string;
  summary: string;
  metadata?: Record<string, unknown>;
  retentionLock: boolean;
}

export interface ActivityNote {
  id: string;
  author: string;
  timestamp: string;
  text: string;
  type: 'CALL' | 'DEMO' | 'DOC_UPLOAD' | 'INTERNAL_NOTE';
}

export interface CommercialPlanConfig {
  type: 'SUBSCRIPTION' | 'COMMISSION';
  subscriptionTier?: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
  monthlyFeeInr?: number;
  commissionPercentage?: number;
  tierName?: string;
}

export interface PlatformDispute {
  id: string; // e.g. "DISP-PAT-2026-001"
  bookingReference: string;
  bookingId: string;
  customerName: string;
  customerPhone: string;
  providerId: string;
  providerName: string;
  category: BookingCategory;
  reason: string;
  description: string;
  billAmountInr: number;
  filedAt: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED_UPHELD' | 'RESOLVED_REFUNDED' | 'RESOLVED_ADJUSTED';
  resolutionNote?: string;
  refundOrAdjustmentInr?: number;
  venuePinVerified: boolean;
}

export interface PlatformControls {
  defaultSearchRadiusKm: number;
  sponsoredBadgeEnforced: boolean;
  rankingTransparencyEnabled: boolean;
  dpdpAuditLockActive: boolean;
  categories: {
    id: BookingCategory;
    name: string;
    isEnabled: boolean;
    standardCommissionPercentage: number;
  }[];
  localities: {
    name: string;
    pincode: string;
    isActive: boolean;
  }[];
  grievanceOfficer: {
    name: string;
    title: string;
    email: string;
    phone: string;
    officeAddress: string;
    acknowledgementSlaHours: number;
    resolutionSlaDays: number;
    nchHelpline: string;
  };
}

export interface ScorecardMetrics {
  activeVerifiedProviders: number;
  searchToBookConversionPct: number;
  providerAcceptanceRatePct: number;
  completedBookingsMonth: number;
  repeatCustomersPct: number;
  revenuePerProviderInr: number;
  monthlyGmvInr: number;
  netPlatformRevenueInr: number;
}

export interface ExceptionWorkItem {
  id: string;
  type: 'KYC_PENDING' | 'DISPUTE_OPEN' | 'SLA_BREACH';
  title: string;
  subtitle: string;
  urgency: 'HIGH' | 'MEDIUM' | 'NORMAL';
  targetRoute: string;
  createdAt: string;
}

const STORAGE_KEY_ADMIN_OPS = 'bookkaro_patna_admin_ops_v1';

// Initial Patna Marketplace Audit Logs
const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'aud-pat-001',
    timestamp: '2026-11-20T10:15:00+05:30',
    actorRole: 'ADMIN',
    actorName: 'Siddharth Roy (Patna Ops Lead)',
    actionType: 'KYC_APPROVED',
    targetId: 'BK-PRV-PAT-002',
    summary: 'Approved Hotel Maurya trade license and fire safety NOC. Issued Provider ID BK-PRV-PAT-002.',
    metadata: { forcePasswordChange: true, category: 'hotels' },
    retentionLock: true,
  },
  {
    id: 'aud-pat-002',
    timestamp: '2026-11-19T14:40:00+05:30',
    actorRole: 'ADMIN',
    actorName: 'Pooja Kashyap (Verification Desk)',
    actionType: 'CRM_STAGE_ADVANCE',
    targetId: 'APP-PAT-2026-8492',
    summary: 'Advanced Magadh Heart Clinic to 03 VERIFY following telephonic screening.',
    metadata: { previousStage: '02_DISCUSS', nextStage: '03_VERIFY' },
    retentionLock: true,
  },
  {
    id: 'aud-pat-003',
    timestamp: '2026-11-19T11:20:00+05:30',
    actorRole: 'ADMIN',
    actorName: 'Pooja Kashyap (Verification Desk)',
    actionType: 'COMMERCIAL_PLAN_ASSIGNED',
    targetId: 'APP-PAT-2026-3190',
    summary: 'Assigned Flat Monthly Subscription (₹2,499/mo, 0% commission) to Torque Clean Ceramic Lounge.',
    metadata: { commercialModel: 'SUBSCRIPTION', monthlyFee: 2499 },
    retentionLock: true,
  },
  {
    id: 'aud-pat-004',
    timestamp: '2026-11-18T16:05:00+05:30',
    actorRole: 'ADMIN',
    actorName: 'System Governance Auto-Lock',
    actionType: 'PLATFORM_CONTROL_TOGGLED',
    targetId: 'GLOBAL_CONFIG',
    summary: 'Activated India DPDP Act 1-Year Immutable Retention Lock across all Patna transaction audit logs.',
    metadata: { retentionMonths: 12, complianceAct: 'DPDP_ACT_2023' },
    retentionLock: true,
  },
];

// Initial Patna Platform Disputes
const INITIAL_DISPUTES: PlatformDispute[] = [
  {
    id: 'DISP-PAT-2026-001',
    bookingReference: 'BK-PAT-2026-8812',
    bookingId: 'bk-cust-001',
    customerName: 'Vikramaditya Sengupta',
    customerPhone: '+91 98450 12345',
    providerId: 'prov-pat-01',
    providerName: 'Dr. Arvind Verma – DM Cardiology Clinic',
    category: 'healthcare',
    reason: 'Billing Discrepancy at Counter',
    description: 'Patient reports counter staff billed ₹1,200 instead of the ₹900 agreed online rate for DM consultation.',
    billAmountInr: 1200,
    filedAt: '2026-11-20T12:00:00+05:30',
    status: 'OPEN',
    venuePinVerified: true,
  },
  {
    id: 'DISP-PAT-2026-002',
    bookingReference: 'BK-PAT-2026-7492',
    bookingId: 'bk-cust-003',
    customerName: 'Ananya Sharma',
    customerPhone: '+91 94310 88219',
    providerId: 'prov-pat-03',
    providerName: 'Bansi Vihar Rooftop Ahuna Handi',
    category: 'restaurants',
    reason: 'Table Unavailable Past Reserved Slot',
    description: 'Family waited 35 minutes past confirmed reservation time due to banquet party overlap.',
    billAmountInr: 2150,
    filedAt: '2026-11-19T21:15:00+05:30',
    status: 'INVESTIGATING',
    venuePinVerified: false,
  },
];

const INITIAL_PLATFORM_CONTROLS: PlatformControls = {
  defaultSearchRadiusKm: 10,
  sponsoredBadgeEnforced: true,
  rankingTransparencyEnabled: true,
  dpdpAuditLockActive: true,
  categories: [
    { id: 'healthcare', name: 'Clinics & Doctors', isEnabled: true, standardCommissionPercentage: 8.0 },
    { id: 'hotels', name: 'Stays & Suites', isEnabled: true, standardCommissionPercentage: 10.0 },
    { id: 'restaurants', name: 'Dining & Cafes', isEnabled: true, standardCommissionPercentage: 5.0 },
    { id: 'salon', name: 'Salons & Spas', isEnabled: true, standardCommissionPercentage: 10.0 },
    { id: 'vehicle_care', name: 'Vehicle Care & Auto', isEnabled: true, standardCommissionPercentage: 8.0 },
  ],
  localities: [
    { name: 'Fraser Road', pincode: '800001', isActive: true },
    { name: 'Boring Road', pincode: '800013', isActive: true },
    { name: 'Kankarbagh', pincode: '800020', isActive: true },
    { name: 'Bailey Road', pincode: '800014', isActive: true },
    { name: 'Rajendra Nagar', pincode: '800016', isActive: true },
    { name: 'Dakbunglow', pincode: '800001', isActive: true },
    { name: 'Ashok Rajpath', pincode: '800004', isActive: true },
    { name: 'Danapur', pincode: '801503', isActive: true },
    { name: 'Patliputra Colony', pincode: '800013', isActive: true },
    { name: 'Lalganj Corridor', pincode: '844121', isActive: true },
  ],
  grievanceOfficer: {
    name: 'Rajeshwar Sinha, Advocate',
    title: 'Designated Grievance & Redressal Officer (Patna Bar)',
    email: 'grievance@bookkaro.in',
    phone: '+91 612 250 9911',
    officeAddress: 'BOOKKARO Operations Center, 3rd Floor, Fraser Road Commercial Complex, Patna, Bihar 800001',
    acknowledgementSlaHours: 48,
    resolutionSlaDays: 30,
    nchHelpline: 'National Consumer Helpline Toll-Free: 1915 (consumerhelpline.gov.in)',
  },
};

// In-memory state with listeners
let auditLogsState: AdminAuditLog[] = [...INITIAL_AUDIT_LOGS];
let disputesState: PlatformDispute[] = [...INITIAL_DISPUTES];
let controlsState: PlatformControls = { ...INITIAL_PLATFORM_CONTROLS };
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // ignore
    }
  });
}

function loadFromStorage() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_OPS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.auditLogs) && parsed.auditLogs.length > 0) {
        auditLogsState = parsed.auditLogs;
      }
      if (Array.isArray(parsed.disputes) && parsed.disputes.length > 0) {
        disputesState = parsed.disputes;
      }
      if (parsed.controls) {
        controlsState = { ...INITIAL_PLATFORM_CONTROLS, ...parsed.controls };
      }
    }
  } catch {
    // fallback to in-memory state
  }
}

function saveToStorage() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      STORAGE_KEY_ADMIN_OPS,
      JSON.stringify({
        auditLogs: auditLogsState,
        disputes: disputesState,
        controls: controlsState,
      })
    );
  } catch {
    // ignore
  }
}

// Initial hydration
loadFromStorage();

export const adminService = {
  /**
   * Subscribe to admin operations updates
   */
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  /**
   * Append an immutable audit log entry (retained under DPDP 1-year policy)
   */
  appendAuditLog(entry: {
    actorRole: 'ADMIN' | 'SYSTEM' | 'PARTNER' | 'CUSTOMER';
    actorName: string;
    actionType: AdminAuditActionType;
    targetId: string;
    summary: string;
    metadata?: Record<string, unknown>;
  }): AdminAuditLog {
    loadFromStorage();

    const newLog: AdminAuditLog = {
      id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      actorRole: entry.actorRole,
      actorName: entry.actorName,
      actionType: entry.actionType,
      targetId: entry.targetId,
      summary: entry.summary,
      metadata: entry.metadata,
      retentionLock: true,
    };

    auditLogsState = [newLog, ...auditLogsState];
    saveToStorage();
    notifyListeners();
    return newLog;
  },

  /**
   * Get all immutable audit logs
   */
  getAuditLogs(): AdminAuditLog[] {
    loadFromStorage();
    return [...auditLogsState];
  },

  /**
   * -------------------------------------------------------------
   * 1. 6-Stage Sales CRM Pipeline
   * -------------------------------------------------------------
   */
  getCrmLeads(): PartnerApplication[] {
    return partnerOnboardingService.getAllApplications();
  },

  /**
   * Advance or change onboarding stage
   */
  moveLeadStage(
    applicationId: string,
    newStage: PartnerOnboardingStage,
    note?: string
  ): PartnerApplication {
    const updated = partnerOnboardingService.advanceStage(
      applicationId,
      newStage,
      'Admin Operations Desk',
      note || `Stage updated to ${newStage}`
    );

    this.appendAuditLog({
      actorRole: 'ADMIN',
      actorName: 'Admin Operations Desk',
      actionType: 'CRM_STAGE_ADVANCE',
      targetId: updated.applicationReference,
      summary: `Advanced ${updated.brandDisplayName} to stage ${newStage}.`,
      metadata: { previousStage: updated.stage, nextStage: newStage, note },
    });

    notifyListeners();
    return updated;
  },

  /**
   * Add timestamped activity note to CRM lead
   */
  addLeadNote(
    applicationId: string,
    noteText: string,
    noteType: 'CALL' | 'DEMO' | 'INTERNAL_NOTE' = 'CALL'
  ): PartnerApplication {
    const apps = partnerOnboardingService.getAllApplications();
    const target = apps.find(
      (a) => a.id === applicationId || a.applicationReference === applicationId
    );
    if (!target) {
      throw new Error(`Application ${applicationId} not found`);
    }

    const updatedNote = `[${noteType}] ${noteText.trim()}`;
    const updated = partnerOnboardingService.updateReviewerNotes(
      target.id,
      target.reviewerNotes ? `${target.reviewerNotes} | ${updatedNote}` : updatedNote
    );

    this.appendAuditLog({
      actorRole: 'ADMIN',
      actorName: 'Admin Operations Desk',
      actionType: 'CRM_NOTE_ADDED',
      targetId: target.applicationReference,
      summary: `Logged note (${noteType}) for ${target.brandDisplayName}.`,
      metadata: { noteType, noteText },
    });

    notifyListeners();
    return updated;
  },

  /**
   * Assign commercial plan (Subscription vs Commission)
   */
  assignCommercialPlan(
    applicationId: string,
    plan: CommercialPlanConfig
  ): PartnerApplication {
    const apps = partnerOnboardingService.getAllApplications();
    const target = apps.find(
      (a) => a.id === applicationId || a.applicationReference === applicationId
    );
    if (!target) {
      throw new Error(`Application ${applicationId} not found`);
    }

    const updatedApp: PartnerApplication = {
      ...target,
      commercialModel: plan.type,
      commercialDetails: {
        commissionPercentage: plan.commissionPercentage,
        monthlyFeeInr: plan.monthlyFeeInr,
        tierName: plan.tierName || (plan.type === 'SUBSCRIPTION' ? 'Fixed Monthly Plan' : 'Standard Commission'),
      },
      updatedAt: new Date().toISOString(),
    };

    // Save into partnerOnboardingService by updating timeline
    partnerOnboardingService.advanceStage(
      target.id,
      target.stage,
      'Admin Operations Desk',
      `Assigned commercial plan: ${plan.type} ${plan.type === 'SUBSCRIPTION' ? `(₹${plan.monthlyFeeInr}/mo)` : `(${plan.commissionPercentage}%)`
      }`
    );

    this.appendAuditLog({
      actorRole: 'ADMIN',
      actorName: 'Admin Operations Desk',
      actionType: 'COMMERCIAL_PLAN_ASSIGNED',
      targetId: target.applicationReference,
      summary: `Assigned commercial contract to ${target.brandDisplayName}: ${plan.type} (${plan.type === 'SUBSCRIPTION' ? `₹${plan.monthlyFeeInr}/mo` : `${plan.commissionPercentage}%`
        }).`,
      metadata: { ...plan } as Record<string, unknown>,
    });

    notifyListeners();
    return updatedApp;
  },

  /**
   * -------------------------------------------------------------
   * 2. Patna KYC Verification Queue
   * -------------------------------------------------------------
   */
  getKYCApplications(): PartnerApplication[] {
    return partnerOnboardingService.getAllApplications();
  },

  /**
   * Approve KYC & Activate Provider
   * Generates canonical Provider ID BK-PRV-PAT-XXXX, sets forcePasswordChange: true
   */
  approveAndActivateKYC(
    applicationId: string,
    inspectorNotes?: string
  ): { providerId: string; application: PartnerApplication } {
    const apps = partnerOnboardingService.getAllApplications();
    const target = apps.find(
      (a) => a.id === applicationId || a.applicationReference === applicationId
    );
    if (!target) {
      throw new Error(`Application ${applicationId} not found`);
    }

    // Generate canonical Provider ID: e.g. BK-PRV-PAT-004
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const canonicalProviderId = `BK-PRV-PAT-${randomSuffix}`;

    // Advance to 04_ACTIVATE or 06_GO_LIVE
    const updated = partnerOnboardingService.advanceStage(
      target.id,
      '04_ACTIVATE',
      'Inspector Siddharth Roy (Patna Verification Desk)',
      inspectorNotes || `KYC Approved. Issued Provider ID: ${canonicalProviderId}. Initial password reset required.`
    );

    // Update document statuses to VERIFIED
    target.documents.forEach((doc) => {
      partnerOnboardingService.updateDocumentStatus(
        target.id,
        doc.id,
        'VERIFIED',
        'Verified against Patna municipal / state records.'
      );
    });

    this.appendAuditLog({
      actorRole: 'ADMIN',
      actorName: 'Inspector Siddharth Roy',
      actionType: 'KYC_APPROVED',
      targetId: canonicalProviderId,
      summary: `Approved KYC documents & activated provider ${target.brandDisplayName} with ID ${canonicalProviderId}.`,
      metadata: {
        applicationReference: target.applicationReference,
        providerId: canonicalProviderId,
        forcePasswordChange: true,
        category: target.category,
        locality: target.locality,
      },
    });

    notifyListeners();
    return { providerId: canonicalProviderId, application: updated };
  },

  /**
   * Request changes on KYC documents
   */
  requestKYCDocumentChanges(
    applicationId: string,
    reason: string,
    docId?: string
  ): PartnerApplication {
    const apps = partnerOnboardingService.getAllApplications();
    const target = apps.find(
      (a) => a.id === applicationId || a.applicationReference === applicationId
    );
    if (!target) {
      throw new Error(`Application ${applicationId} not found`);
    }

    if (docId) {
      partnerOnboardingService.updateDocumentStatus(
        target.id,
        docId,
        'CHANGES_REQUESTED',
        reason
      );
    } else if (target.documents.length > 0) {
      // Mark first pending or last document as changes requested
      const targetDoc = target.documents.find((d) => d.status === 'PENDING') || target.documents[0];
      partnerOnboardingService.updateDocumentStatus(
        target.id,
        targetDoc.id,
        'CHANGES_REQUESTED',
        reason
      );
    }

    this.appendAuditLog({
      actorRole: 'ADMIN',
      actorName: 'Verification Desk',
      actionType: 'KYC_CHANGES_REQUESTED',
      targetId: target.applicationReference,
      summary: `Requested KYC document updates for ${target.brandDisplayName}: ${reason}`,
      metadata: { reason, docId },
    });

    notifyListeners();
    return target;
  },

  /**
   * -------------------------------------------------------------
   * 3. Dispute Escalation Center
   * -------------------------------------------------------------
   */
  getDisputes(): PlatformDispute[] {
    loadFromStorage();
    return [...disputesState];
  },

  /**
   * Resolve an escalated dispute
   */
  async resolveDispute(
    disputeId: string,
    resolution: {
      action: 'UPHOLD_BOOKING' | 'REFUND_WAIVER' | 'COMMISSION_ADJUSTMENT';
      note: string;
      adjustmentAmountInr?: number;
    }
  ): Promise<PlatformDispute> {
    loadFromStorage();
    const index = disputesState.findIndex((d) => d.id === disputeId);
    if (index === -1) {
      throw new Error(`Dispute ${disputeId} not found`);
    }

    const current = disputesState[index];
    const statusMap = {
      UPHOLD_BOOKING: 'RESOLVED_UPHELD' as const,
      REFUND_WAIVER: 'RESOLVED_REFUNDED' as const,
      COMMISSION_ADJUSTMENT: 'RESOLVED_ADJUSTED' as const,
    };

    const updatedDispute: PlatformDispute = {
      ...current,
      status: statusMap[resolution.action],
      resolutionNote: resolution.note,
      refundOrAdjustmentInr: resolution.adjustmentAmountInr,
    };

    disputesState[index] = updatedDispute;

    // Sync with bookingService
    try {
      if (resolution.action === 'REFUND_WAIVER') {
        await bookingService.updateBookingStatus(
          current.bookingId,
          'CANCELLED',
          'ADMIN',
          `Dispute resolved in customer favor: ${resolution.note}`
        );
      } else if (resolution.action === 'UPHOLD_BOOKING') {
        await bookingService.updateBookingStatus(
          current.bookingId,
          'COMPLETED',
          'ADMIN',
          `Dispute upheld in partner favor: ${resolution.note}`
        );
      }
    } catch {
      // Booking state sync fallback
    }

    this.appendAuditLog({
      actorRole: 'ADMIN',
      actorName: 'Dispute Arbitration Desk',
      actionType: 'DISPUTE_RESOLVED',
      targetId: current.id,
      summary: `Arbitrated dispute ${current.id} (${current.bookingReference}): ${resolution.action} – ${resolution.note}`,
      metadata: {
        disputeId: current.id,
        action: resolution.action,
        note: resolution.note,
        adjustmentAmountInr: resolution.adjustmentAmountInr,
      },
    });

    saveToStorage();
    notifyListeners();
    return updatedDispute;
  },

  /**
   * -------------------------------------------------------------
   * 4. Platform Controls & India Compliance Governance
   * -------------------------------------------------------------
   */
  getControls(): PlatformControls {
    loadFromStorage();
    return { ...controlsState };
  },

  updateSearchRadius(radiusKm: number) {
    loadFromStorage();
    controlsState = { ...controlsState, defaultSearchRadiusKm: radiusKm };
    this.appendAuditLog({
      actorRole: 'ADMIN',
      actorName: 'Admin Operations',
      actionType: 'PLATFORM_CONTROL_TOGGLED',
      targetId: 'SEARCH_RADIUS',
      summary: `Updated default Patna search radius to ${radiusKm} km.`,
      metadata: { radiusKm },
    });
    saveToStorage();
    notifyListeners();
  },

  toggleCategoryStatus(categoryId: BookingCategory) {
    loadFromStorage();
    controlsState = {
      ...controlsState,
      categories: controlsState.categories.map((c) =>
        c.id === categoryId ? { ...c, isEnabled: !c.isEnabled } : c
      ),
    };
    const target = controlsState.categories.find((c) => c.id === categoryId);
    this.appendAuditLog({
      actorRole: 'ADMIN',
      actorName: 'Admin Operations',
      actionType: 'PLATFORM_CONTROL_TOGGLED',
      targetId: categoryId,
      summary: `Toggled marketplace category "${target?.name}": ${target?.isEnabled ? 'ENABLED' : 'PAUSED'}.`,
    });
    saveToStorage();
    notifyListeners();
  },

  updateCategoryCommissionRate(categoryId: BookingCategory, percentage: number) {
    loadFromStorage();
    controlsState = {
      ...controlsState,
      categories: controlsState.categories.map((c) =>
        c.id === categoryId ? { ...c, standardCommissionPercentage: percentage } : c
      ),
    };
    this.appendAuditLog({
      actorRole: 'ADMIN',
      actorName: 'Admin Operations',
      actionType: 'COMMISSION_ADJUSTED',
      targetId: categoryId,
      summary: `Adjusted default commission rate for ${categoryId} to ${percentage}%.`,
      metadata: { categoryId, percentage },
    });
    saveToStorage();
    notifyListeners();
  },

  toggleSponsoredBadgeEnforcement() {
    loadFromStorage();
    const nextState = !controlsState.sponsoredBadgeEnforced;
    controlsState = { ...controlsState, sponsoredBadgeEnforced: nextState };
    this.appendAuditLog({
      actorRole: 'ADMIN',
      actorName: 'Compliance Officer',
      actionType: 'PLATFORM_CONTROL_TOGGLED',
      targetId: 'SPONSORED_BADGE_ENFORCEMENT',
      summary: `Toggled mandatory Sponsored badge enforcement: ${nextState ? 'ACTIVE' : 'INACTIVE'}.`,
    });
    saveToStorage();
    notifyListeners();
  },

  toggleLocalityStatus(localityName: string) {
    loadFromStorage();
    controlsState = {
      ...controlsState,
      localities: controlsState.localities.map((loc) =>
        loc.name === localityName ? { ...loc, isActive: !loc.isActive } : loc
      ),
    };
    const target = controlsState.localities.find((l) => l.name === localityName);
    this.appendAuditLog({
      actorRole: 'ADMIN',
      actorName: 'Geo Cluster Lead',
      actionType: 'PLATFORM_CONTROL_TOGGLED',
      targetId: localityName,
      summary: `Toggled Patna locality "${localityName}": ${target?.isActive ? 'ACTIVE' : 'PAUSED'}.`,
    });
    saveToStorage();
    notifyListeners();
  },

  /**
   * -------------------------------------------------------------
   * 5. Scorecard & Actionable Exception Work Queue
   * -------------------------------------------------------------
   */
  getScorecardMetrics(): ScorecardMetrics {
    const apps = partnerOnboardingService.getAllApplications();
    const activeActivatedCount = apps.filter((a) => a.status === 'ACTIVATED').length + 15; // 15 pilot providers

    const allBookings = bookingService.getAllBookings();
    const completedCount = allBookings.filter((b) => b.status === 'COMPLETED').length + 140;

    return {
      activeVerifiedProviders: activeActivatedCount,
      searchToBookConversionPct: 14.8,
      providerAcceptanceRatePct: 92.4,
      completedBookingsMonth: completedCount,
      repeatCustomersPct: 38.6,
      revenuePerProviderInr: 42850,
      monthlyGmvInr: 3240000,
      netPlatformRevenueInr: 259200,
    };
  },

  async getScorecardMetricsRemote(): Promise<ScorecardMetrics> {
    if (process.env.NEXT_PUBLIC_USE_MOCK_API === 'true') {
      return this.getScorecardMetrics();
    }
    try {
      const data = await apiClient.get<ScorecardMetrics>('/admin/scorecard');
      if (data) return data;
    } catch {
      // Fallback to local metrics
    }
    return this.getScorecardMetrics();
  },

  getExceptionWorkQueue(): ExceptionWorkItem[] {
    const items: ExceptionWorkItem[] = [];

    // Pending KYCs
    const apps = partnerOnboardingService.getAllApplications();
    const pendingKycs = apps.filter(
      (a) => a.stage === '03_VERIFY' || a.status === 'UNDER_REVIEW' || a.status === 'PENDING_KYC'
    );
    pendingKycs.forEach((app) => {
      items.push({
        id: `exc-kyc-${app.id}`,
        type: 'KYC_PENDING',
        title: `KYC Audit Required: ${app.brandDisplayName}`,
        subtitle: `${app.locality}, ${app.category.toUpperCase()} • Docs under review (SLA: 24h)`,
        urgency: 'HIGH',
        targetRoute: '/admin/verifications',
        createdAt: app.updatedAt,
      });
    });

    // Open Disputes
    loadFromStorage();
    const openDisputes = disputesState.filter((d) => ['OPEN', 'INVESTIGATING'].includes(d.status));
    openDisputes.forEach((disp) => {
      items.push({
        id: `exc-disp-${disp.id}`,
        type: 'DISPUTE_OPEN',
        title: `Dispute Escalated: #${disp.bookingReference} (${disp.reason})`,
        subtitle: `Customer: ${disp.customerName} • Realized: ₹${disp.billAmountInr}`,
        urgency: 'HIGH',
        targetRoute: '/admin/disputes',
        createdAt: disp.filedAt,
      });
    });

    // Pending Booking SLA (<90s)
    const bookings = bookingService.getAllBookings();
    const pendingBookings = bookings.filter((b) => b.status === 'REQUESTED');
    if (pendingBookings.length > 0) {
      items.push({
        id: 'exc-sla-breach',
        type: 'SLA_BREACH',
        title: `${pendingBookings.length} Slot Requests Awaiting Partner Roster Confirmation`,
        subtitle: 'Patna provider response SLA is 90 seconds. Notification dispatched.',
        urgency: 'MEDIUM',
        targetRoute: '/admin',
        createdAt: new Date().toISOString(),
      });
    }

    return items;
  },
};
