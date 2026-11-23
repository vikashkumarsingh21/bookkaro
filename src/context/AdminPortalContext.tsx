'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  adminService,
  AdminAuditLog,
  PlatformDispute,
  PlatformControls,
  ScorecardMetrics,
  ExceptionWorkItem,
  CommercialPlanConfig,
} from '@/services/adminService';
import { PartnerApplication, PartnerOnboardingStage } from '@/services/partnerOnboardingService';
import { BookingCategory } from '@/types/bookkaro';

interface AdminPortalContextType {
  scorecard: ScorecardMetrics;
  exceptionQueue: ExceptionWorkItem[];
  crmLeads: PartnerApplication[];
  moveLeadStage: (
    applicationId: string,
    newStage: PartnerOnboardingStage,
    note?: string
  ) => PartnerApplication;
  addLeadNote: (
    applicationId: string,
    noteText: string,
    noteType?: 'CALL' | 'DEMO' | 'INTERNAL_NOTE'
  ) => PartnerApplication;
  assignCommercialPlan: (
    applicationId: string,
    plan: CommercialPlanConfig
  ) => PartnerApplication;
  verifications: PartnerApplication[];
  pendingVerificationsCount: number;
  approveAndActivateKYC: (
    applicationId: string,
    inspectorNotes?: string
  ) => { providerId: string; application: PartnerApplication };
  requestKYCDocumentChanges: (
    applicationId: string,
    reason: string,
    docId?: string
  ) => PartnerApplication;
  disputes: PlatformDispute[];
  openDisputesCount: number;
  resolveDispute: (
    disputeId: string,
    resolution: {
      action: 'UPHOLD_BOOKING' | 'REFUND_WAIVER' | 'COMMISSION_ADJUSTMENT';
      note: string;
      adjustmentAmountInr?: number;
    }
  ) => Promise<PlatformDispute>;
  controls: PlatformControls;
  updateSearchRadius: (radiusKm: number) => void;
  toggleCategoryStatus: (categoryId: BookingCategory) => void;
  updateCategoryCommissionRate: (categoryId: BookingCategory, percentage: number) => void;
  toggleSponsoredBadgeEnforcement: () => void;
  toggleLocalityStatus: (localityName: string) => void;
  auditLogs: AdminAuditLog[];
}

const AdminPortalContext = createContext<AdminPortalContextType | undefined>(undefined);

export const AdminPortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [crmLeads, setCrmLeads] = useState<PartnerApplication[]>(() => adminService.getCrmLeads());
  const [disputes, setDisputes] = useState<PlatformDispute[]>(() => adminService.getDisputes());
  const [controls, setControls] = useState<PlatformControls>(() => adminService.getControls());
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(() => adminService.getAuditLogs());
  const [scorecard, setScorecard] = useState<ScorecardMetrics>(() => adminService.getScorecardMetrics());
  const [exceptionQueue, setExceptionQueue] = useState<ExceptionWorkItem[]>(() => adminService.getExceptionWorkQueue());

  const syncState = useCallback(() => {
    setCrmLeads(adminService.getCrmLeads());
    setDisputes(adminService.getDisputes());
    setControls(adminService.getControls());
    setAuditLogs(adminService.getAuditLogs());
    setScorecard(adminService.getScorecardMetrics());
    setExceptionQueue(adminService.getExceptionWorkQueue());
  }, []);

  useEffect(() => {
    return adminService.subscribe(syncState);
  }, [syncState]);

  const verifications = useMemo(() => crmLeads, [crmLeads]);

  const pendingVerificationsCount = useMemo(() => {
    return crmLeads.filter(
      (a) => a.stage === '03_VERIFY' || a.status === 'UNDER_REVIEW' || a.status === 'PENDING_KYC'
    ).length;
  }, [crmLeads]);

  const openDisputesCount = useMemo(() => {
    return disputes.filter((d) => ['OPEN', 'INVESTIGATING'].includes(d.status)).length;
  }, [disputes]);

  const moveLeadStage = (
    applicationId: string,
    newStage: PartnerOnboardingStage,
    note?: string
  ) => {
    const res = adminService.moveLeadStage(applicationId, newStage, note);
    syncState();
    return res;
  };

  const addLeadNote = (
    applicationId: string,
    noteText: string,
    noteType?: 'CALL' | 'DEMO' | 'INTERNAL_NOTE'
  ) => {
    const res = adminService.addLeadNote(applicationId, noteText, noteType);
    syncState();
    return res;
  };

  const assignCommercialPlan = (applicationId: string, plan: CommercialPlanConfig) => {
    const res = adminService.assignCommercialPlan(applicationId, plan);
    syncState();
    return res;
  };

  const approveAndActivateKYC = (applicationId: string, inspectorNotes?: string) => {
    const res = adminService.approveAndActivateKYC(applicationId, inspectorNotes);
    syncState();
    return res;
  };

  const requestKYCDocumentChanges = (applicationId: string, reason: string, docId?: string) => {
    const res = adminService.requestKYCDocumentChanges(applicationId, reason, docId);
    syncState();
    return res;
  };

  const resolveDispute = async (
    disputeId: string,
    resolution: {
      action: 'UPHOLD_BOOKING' | 'REFUND_WAIVER' | 'COMMISSION_ADJUSTMENT';
      note: string;
      adjustmentAmountInr?: number;
    }
  ) => {
    const res = await adminService.resolveDispute(disputeId, resolution);
    syncState();
    return res;
  };

  const updateSearchRadius = (radiusKm: number) => {
    adminService.updateSearchRadius(radiusKm);
    syncState();
  };

  const toggleCategoryStatus = (categoryId: BookingCategory) => {
    adminService.toggleCategoryStatus(categoryId);
    syncState();
  };

  const updateCategoryCommissionRate = (categoryId: BookingCategory, percentage: number) => {
    adminService.updateCategoryCommissionRate(categoryId, percentage);
    syncState();
  };

  const toggleSponsoredBadgeEnforcement = () => {
    adminService.toggleSponsoredBadgeEnforcement();
    syncState();
  };

  const toggleLocalityStatus = (localityName: string) => {
    adminService.toggleLocalityStatus(localityName);
    syncState();
  };

  return (
    <AdminPortalContext.Provider
      value={{
        scorecard,
        exceptionQueue,
        crmLeads,
        moveLeadStage,
        addLeadNote,
        assignCommercialPlan,
        verifications,
        pendingVerificationsCount,
        approveAndActivateKYC,
        requestKYCDocumentChanges,
        disputes,
        openDisputesCount,
        resolveDispute,
        controls,
        updateSearchRadius,
        toggleCategoryStatus,
        updateCategoryCommissionRate,
        toggleSponsoredBadgeEnforcement,
        toggleLocalityStatus,
        auditLogs,
      }}
    >
      {children}
    </AdminPortalContext.Provider>
  );
};

export const useAdminPortal = (): AdminPortalContextType => {
  const context = useContext(AdminPortalContext);
  if (!context) {
    throw new Error('useAdminPortal must be used within an AdminPortalProvider');
  }
  return context;
};
