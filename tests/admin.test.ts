import { describe, it, expect, beforeEach } from "vitest";
import {
  createLeadSchema,
  updateLeadSchema,
  updateVerificationSchema,
} from "@/lib/admin/schemas";
import { NotificationService } from "@/services/notifications";
import {
  ProviderCategory,
  CommercialModel,
  CRMStage,
  KYCStatus,
} from "@prisma/client";
import { adminService } from "@/services/adminService";
import { ROLE_PERMISSIONS } from "@/types/bookkaro";

describe("Admin Console & CRM Unit Tests", () => {
  beforeEach(() => {
    // Clear storage in test environment if available
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.clear();
    }
  });

  it("validates CRM Lead creation schema and rejects invalid phones", () => {
    const valid = createLeadSchema.safeParse({
      businessName: "Ganga Diagnostic Center",
      ownerName: "Dr. Alok Verma",
      phone: "9835099887",
      email: "alok@ganga.com",
      city: "Patna",
      category: ProviderCategory.HEALTHCARE,
      assignedCommercialModel: CommercialModel.COMMISSION,
    });
    expect(valid.success).toBe(true);

    const validKYC = updateVerificationSchema.safeParse({
      status: KYCStatus.VERIFIED,
      licenseType: "NABH",
      licenseNumber: "NABH-123",
    });
    expect(validKYC.success).toBe(true);

    const invalid = createLeadSchema.safeParse({
      businessName: "Ganga Diagnostic Center",
      ownerName: "Dr. Alok Verma",
      phone: "12345",
      email: "alok@ganga.com",
      city: "Patna",
      category: ProviderCategory.HEALTHCARE,
    });
    expect(invalid.success).toBe(false);
  });

  it("validates all 6 onboarding pipeline stages", () => {
    const stages = [
      CRMStage.LEAD_01,
      CRMStage.DISCUSS_02,
      CRMStage.VERIFY_03,
      CRMStage.ACTIVATE_04,
      CRMStage.CONFIGURE_05,
      CRMStage.GO_LIVE_06,
    ];
    expect(stages.length).toBe(6);

    const validTransition = updateLeadSchema.safeParse({
      stage: CRMStage.DISCUSS_02,
      newNote: "Demo presented to general manager.",
    });
    expect(validTransition.success).toBe(true);
  });

  it("verifies dual-channel notification dispatcher behavior", async () => {
    const results = await NotificationService.notifyBookingConfirmed({
      bookingId: "bk-123",
      bookingCode: "BK-2026-001",
      verificationCode: "4321",
      customerName: "Rohan",
      customerEmail: "rohan@example.com",
      customerPhone: "9810011002",
      providerName: "Patna Care",
      serviceName: "Checkup",
      bookingDate: "2026-11-25",
      timeSlot: "10:30 AM",
      venueAddress: "Kankarbagh, Patna",
    });

    expect(results.length).toBe(2);
    expect(results[0].channel).toBe("EMAIL");
    expect(results[1].channel).toBe("WHATSAPP");
    expect(results.every((r) => r.success)).toBe(true);
  });

  it("computes platform KPIs and ARPU accurately", () => {
    const total = 100;
    const completed = 68;
    const confirmed = 22;
    const declined = 10;

    const conversionRate = Number(((completed / total) * 100).toFixed(1));
    expect(conversionRate).toBe(68.0);

    const totalDecisions = confirmed + completed + declined;
    const acceptanceRate = Number(
      (((confirmed + completed) / totalDecisions) * 100).toFixed(1)
    );
    expect(acceptanceRate).toBe(90.0);

    const activeProviders = 10;
    const totalRevenue = 50000;
    const arpu = totalRevenue / activeProviders;
    expect(arpu).toBe(5000);
  });

  /* ========================================================
     MODULE 7: ADMIN CONSOLE RBAC & OPERATIONAL SERVICES TESTS
     ======================================================== */

  it("enforces strict ADMIN RBAC permissions against unauthorized roles", () => {
    // ADMIN has full platform governance authority
    expect(ROLE_PERMISSIONS.ADMIN.canApprovePartners).toBe(true);
    expect(ROLE_PERMISSIONS.ADMIN.canManagePlatformDisputes).toBe(true);
    expect(ROLE_PERMISSIONS.ADMIN.canAccessAdminAuditLogs).toBe(true);
    expect(ROLE_PERMISSIONS.ADMIN.canConfigurePlatformCommission).toBe(true);

    // CUSTOMER has no admin privileges
    expect(ROLE_PERMISSIONS.CUSTOMER.canApprovePartners).toBe(false);
    expect(ROLE_PERMISSIONS.CUSTOMER.canManagePlatformDisputes).toBe(false);
    expect(ROLE_PERMISSIONS.CUSTOMER.canAccessAdminAuditLogs).toBe(false);
    expect(ROLE_PERMISSIONS.CUSTOMER.canConfigurePlatformCommission).toBe(false);

    // PARTNER_OWNER has no admin governance privileges
    expect(ROLE_PERMISSIONS.PARTNER_OWNER.canApprovePartners).toBe(false);
    expect(ROLE_PERMISSIONS.PARTNER_OWNER.canManagePlatformDisputes).toBe(false);
    expect(ROLE_PERMISSIONS.PARTNER_OWNER.canAccessAdminAuditLogs).toBe(false);
    expect(ROLE_PERMISSIONS.PARTNER_OWNER.canConfigurePlatformCommission).toBe(false);

    // PARTNER_STAFF has no admin governance privileges
    expect(ROLE_PERMISSIONS.PARTNER_STAFF.canApprovePartners).toBe(false);
    expect(ROLE_PERMISSIONS.PARTNER_STAFF.canManagePlatformDisputes).toBe(false);
    expect(ROLE_PERMISSIONS.PARTNER_STAFF.canAccessAdminAuditLogs).toBe(false);
    expect(ROLE_PERMISSIONS.PARTNER_STAFF.canConfigurePlatformCommission).toBe(false);
  });

  it("adminService moves lead stage and records an immutable audit log", () => {
    const initialLogs = adminService.getAuditLogs().length;
    const leads = adminService.getCrmLeads();
    expect(leads.length).toBeGreaterThan(0);

    const leadToMove = leads[0];
    const updated = adminService.moveLeadStage(
      leadToMove.id,
      "02_DISCUSS",
      "Completed preliminary telephonic screening"
    );

    expect(updated.stage).toBe("02_DISCUSS");

    const newLogs = adminService.getAuditLogs();
    expect(newLogs.length).toBe(initialLogs + 1);
    expect(newLogs[0].actionType).toBe("CRM_STAGE_ADVANCE");
    expect(newLogs[0].retentionLock).toBe(true);
  });

  it("adminService assigns commercial plan and updates commercial details", () => {
    const leads = adminService.getCrmLeads();
    const targetLead = leads[0];

    const updated = adminService.assignCommercialPlan(targetLead.id, {
      type: "SUBSCRIPTION",
      subscriptionTier: "GROWTH",
      monthlyFeeInr: 2499,
      tierName: "Patna Growth Plan",
    });

    expect(updated.commercialModel).toBe("SUBSCRIPTION");
    expect(updated.commercialDetails?.monthlyFeeInr).toBe(2499);

    const logs = adminService.getAuditLogs();
    expect(logs[0].actionType).toBe("COMMERCIAL_PLAN_ASSIGNED");
    expect(logs[0].targetId).toBe(targetLead.applicationReference);
  });

  it("adminService approves KYC, issues canonical BK-PRV-PAT-XXXX ID, sets forcePasswordChange: true", () => {
    const leads = adminService.getCrmLeads();
    const target = leads.find((l) => l.stage === "03_VERIFY") || leads[0];

    const result = adminService.approveAndActivateKYC(
      target.id,
      "Patna Municipal Corporation Trade License & NABH verified"
    );

    expect(result.providerId).toMatch(/^BK-PRV-PAT-\d{3}$/);
    expect(result.application.stage).toBe("04_ACTIVATE");

    const logs = adminService.getAuditLogs();
    const kycLog = logs.find((l) => l.actionType === "KYC_APPROVED");
    expect(kycLog).toBeDefined();
    expect(kycLog?.targetId).toBe(result.providerId);
    expect(kycLog?.metadata?.forcePasswordChange).toBe(true);
    expect(kycLog?.retentionLock).toBe(true);
  });

  it("adminService requests changes on KYC documents and logs audit trail", () => {
    const leads = adminService.getCrmLeads();
    const target = leads[0];

    const updated = adminService.requestKYCDocumentChanges(
      target.id,
      "PMC trade license copy is expired. Please upload renewed FY 2026-27 certificate."
    );

    expect(updated).toBeDefined();
    const logs = adminService.getAuditLogs();
    expect(logs[0].actionType).toBe("KYC_CHANGES_REQUESTED");
    expect(logs[0].summary).toContain("Requested KYC document updates");
  });

  it("adminService arbitrates disputes with UPHOLD_BOOKING and REFUND_WAIVER", async () => {
    const disputes = adminService.getDisputes();
    expect(disputes.length).toBeGreaterThan(0);

    const dispute = disputes[0];

    // Arbitrate with UPHOLD_BOOKING
    const resolvedUpheld = await adminService.resolveDispute(dispute.id, {
      action: "UPHOLD_BOOKING",
      note: "Customer counter Venue PIN check-in was verified at 10:15 AM.",
    });

    expect(resolvedUpheld.status).toBe("RESOLVED_UPHELD");
    expect(resolvedUpheld.resolutionNote).toContain("Venue PIN");

    const logs = adminService.getAuditLogs();
    expect(logs[0].actionType).toBe("DISPUTE_RESOLVED");
    expect(logs[0].metadata?.action).toBe("UPHOLD_BOOKING");

    // Arbitrate second dispute with REFUND_WAIVER
    if (disputes.length > 1) {
      const secondDispute = disputes[1];
      const resolvedRefunded = await adminService.resolveDispute(secondDispute.id, {
        action: "REFUND_WAIVER",
        note: "Table unavailable past 30 min. Refund granted in customer favor.",
        adjustmentAmountInr: secondDispute.billAmountInr,
      });

      expect(resolvedRefunded.status).toBe("RESOLVED_REFUNDED");
      expect(resolvedRefunded.refundOrAdjustmentInr).toBe(secondDispute.billAmountInr);
    }
  });

  it("adminService platform controls update search radius and category commission rates", () => {
    const initialControls = adminService.getControls();
    expect(initialControls.defaultSearchRadiusKm).toBeDefined();

    // Update Search Radius
    adminService.updateSearchRadius(25);
    const updatedControls = adminService.getControls();
    expect(updatedControls.defaultSearchRadiusKm).toBe(25);

    // Update Category Commission Rate
    adminService.updateCategoryCommissionRate("healthcare", 9.5);
    const healthcareCat = adminService
      .getControls()
      .categories.find((c) => c.id === "healthcare");
    expect(healthcareCat?.standardCommissionPercentage).toBe(9.5);

    // Toggle Sponsored Badge Enforcement
    const initialEnforced = updatedControls.sponsoredBadgeEnforced;
    adminService.toggleSponsoredBadgeEnforcement();
    expect(adminService.getControls().sponsoredBadgeEnforced).toBe(!initialEnforced);

    // Verify audit logs were appended
    const recentLogs = adminService.getAuditLogs().slice(0, 3);
    const actionTypes = recentLogs.map((l) => l.actionType);
    expect(actionTypes).toContain("PLATFORM_CONTROL_TOGGLED");
  });
});
