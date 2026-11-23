import { describe, it, expect } from "vitest";
import {
  updateProviderProfileSchema,
  createProviderServiceSchema,
  createProviderStaffSchema,
} from "@/lib/provider/schemas";
import { CommercialModel, SubscriptionPlan, LedgerStatus } from "@prisma/client";
import { ROLE_PERMISSIONS } from "@/types/bookkaro";
import { bookingService } from "@/services/bookingService";

describe("Provider Workspace & Ledger Unit Tests", () => {
  it("validates provider profile update with Indian phone format", () => {
    const valid = updateProviderProfileSchema.safeParse({
      businessName: "Patna Premier Care",
      contactPhone: "9835012345",
      contactEmail: "care@patnapremier.in",
      bio: "Leading medical diagnostic center in Patna.",
    });
    expect(valid.success).toBe(true);

    const invalid = updateProviderProfileSchema.safeParse({
      contactPhone: "123",
    });
    expect(invalid.success).toBe(false);
  });

  it("validates service catalog item creation and rejects negative prices", () => {
    const valid = createProviderServiceSchema.safeParse({
      name: "Standard Full Body Health Panel",
      description: "64 clinical tests including lipid and thyroid",
      durationMinutes: 45,
      basePrice: 1499,
    });
    expect(valid.success).toBe(true);

    const negativePrice = createProviderServiceSchema.safeParse({
      name: "Consult",
      durationMinutes: 30,
      basePrice: -100,
    });
    expect(negativePrice.success).toBe(false);
  });

  it("calculates commercial commission accurately", () => {
    const finalBill = 1500;
    const commissionRate = 8.0; // 8%
    const commission = (finalBill * commissionRate) / 100;
    const netPayout = finalBill - commission;

    expect(commission).toBe(120);
    expect(netPayout).toBe(1380);
  });

  it("validates staff member provisioning schema", () => {
    const valid = createProviderStaffSchema.safeParse({
      firstName: "Rahul",
      lastName: "Kumar",
      email: "rahul@patnapremier.in",
      phone: "9835055555",
      temporaryPassword: "StaffPassword@123",
    });
    expect(valid.success).toBe(true);
  });

  it("supports dual commercial models and ledger statuses", () => {
    expect(CommercialModel.COMMISSION).toBe("COMMISSION");
    expect(CommercialModel.SUBSCRIPTION).toBe("SUBSCRIPTION");
    expect(SubscriptionPlan.STARTER).toBe("STARTER");
    expect(LedgerStatus.PENDING).toBe("PENDING");
  });

  it("enforces RBAC permissions between PARTNER_OWNER and PARTNER_STAFF", () => {
    const ownerPerms = ROLE_PERMISSIONS.PARTNER_OWNER;
    const staffPerms = ROLE_PERMISSIONS.PARTNER_STAFF;

    // Both can handle front desk operations
    expect(ownerPerms.canAcceptOrDeclineBookings).toBe(true);
    expect(staffPerms.canAcceptOrDeclineBookings).toBe(true);
    expect(ownerPerms.canVerifyCustomerPin).toBe(true);
    expect(staffPerms.canVerifyCustomerPin).toBe(true);
    expect(ownerPerms.canCompleteBookings).toBe(true);
    expect(staffPerms.canCompleteBookings).toBe(true);

    // Only OWNER can view financial ledgers, edit catalog services, and manage staff
    expect(ownerPerms.canViewCommercialLedger).toBe(true);
    expect(staffPerms.canViewCommercialLedger).toBe(false);

    expect(ownerPerms.canManageServicesAndSlots).toBe(true);
    expect(staffPerms.canManageServicesAndSlots).toBe(false);

    expect(ownerPerms.canManageStaffRoles).toBe(true);
    expect(staffPerms.canManageStaffRoles).toBe(false);
  });

  it("verifies 4-digit Venue PIN and transitions booking to COMPLETED with ledger entry", async () => {
    // Create a new booking request in bookingService
    const newBooking = await bookingService.createBookingRequest({
      customerId: "cust-test-101",
      customerName: "Patna Test Patient",
      customerPhone: "+91 94310 11111",
      customerEmail: "patient@patna.in",
      providerId: "prov-pat-01",
      providerName: "Patliputra Pediatric Clinic",
      providerAddress: "Fraser Road, Patna",
      category: "healthcare",
      serviceId: "s-101",
      serviceName: "Pediatric Consultation",
      checkInPin: "9988",
      scheduledDate: "2026-11-25",
      scheduledSlot: { startTime: "10:00 AM", endTime: "10:30 AM" },
      paxOrUnits: 1,
      pricing: {
        basePrice: 800,
        taxesAndGst: 0,
        platformFee: 0,
        discountAmount: 0,
        totalAmount: 800,
        tokenPaidOnline: 0,
        amountPayableAtVenue: 800,
        currency: "INR",
      },
      paymentStatus: "PENDING",
    });

    expect(newBooking.status).toBe("REQUESTED");
    expect(newBooking.checkInPin).toBe("9988");

    // Partner accepts the booking
    const confirmed = await bookingService.acceptBooking(newBooking.id);
    expect(confirmed.status).toBe("CONFIRMED");

    // Attempt completion with incorrect PIN should reject
    await expect(
      bookingService.completeBookingWithPin(newBooking.id, "0000", 800)
    ).rejects.toThrow(/Invalid 4-digit Venue PIN code/);

    // Complete with correct PIN
    const { booking: completedBooking, ledgerEntry } =
      await bookingService.completeBookingWithPin(newBooking.id, "9988", 1000);

    expect(completedBooking.status).toBe("COMPLETED");
    expect(completedBooking.pricing.amountPayableAtVenue).toBe(1000);

    // Verify ledger entry
    expect(ledgerEntry.finalBillValueInr).toBe(1000);
    expect(ledgerEntry.commissionPercentage).toBe(8.0);
    expect(ledgerEntry.platformFeePayableInr).toBe(80);
    expect(ledgerEntry.netMerchantPayoutInr).toBe(920);

    // Verify presence in ledger list
    const ledger = bookingService.getCommissionLedger();
    const found = ledger.find((r) => r.bookingId === newBooking.id);
    expect(found).toBeDefined();
    expect(found?.netMerchantPayoutInr).toBe(920);
  });
});
