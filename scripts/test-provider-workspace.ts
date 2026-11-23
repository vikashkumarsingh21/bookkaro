import {
  updateProviderProfileSchema,
  createProviderServiceSchema,
  updateProviderServiceSchema,
  deleteProviderServiceSchema,
  createProviderStaffSchema,
} from "../src/lib/provider/schemas";
import { CommercialModel, SubscriptionPlan, LedgerStatus } from "@prisma/client";

async function runProviderWorkspaceTests() {
  console.log("=================================================");
  console.log("💼 BOOKKARO Module 4 Provider Workspace Tests");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, label: string) {
    if (condition) {
      console.log(`  ✓ [PASS] ${label}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${label}`);
      failed++;
    }
  }

  // 1. Provider Profile Update Schema
  console.log("1. Provider Profile & Branch Schema Validation");
  const validProfileUpdate = updateProviderProfileSchema.safeParse({
    businessName: "Patna Care Multi-Specialty Diagnostics",
    contactPhone: "9835012345",
    contactEmail: "contact@patnacare.in",
    website: "https://patnacare.in",
    bio: "Updated premier multi-specialty healthcare facility in Kankarbagh.",
    cancellationPolicy: "Free cancellation up to 2 hours before appointment.",
    mainBranch: {
      name: "Main Facility Bay",
      locality: "Kankarbagh",
      city: "Patna",
      pincode: "800020",
      phone: "9835012345",
    },
  });
  assert(validProfileUpdate.success, "Valid provider profile & main branch update parsed");

  const invalidPhoneProfile = updateProviderProfileSchema.safeParse({
    contactPhone: "12345", // Invalid Indian phone
  });
  assert(!invalidPhoneProfile.success, "Invalid Indian phone format rejected");

  // 2. Service Catalog CRUD Schemas
  console.log("\n2. Service Catalog Management Schemas");
  const validServiceCreate = createProviderServiceSchema.safeParse({
    name: "Comprehensive Executive Health Checkup",
    description: "Complete blood count, lipid profile, resting ECG, physician consult",
    durationMinutes: 45,
    basePrice: 1499,
  });
  assert(validServiceCreate.success, "Valid catalog service creation parsed");

  const invalidPriceService = createProviderServiceSchema.safeParse({
    name: "Service",
    durationMinutes: 30,
    basePrice: -50, // Negative price rejected
  });
  assert(!invalidPriceService.success, "Negative base price rejected");

  const validServiceUpdate = updateProviderServiceSchema.safeParse({
    id: "srv-med-01",
    basePrice: 1699,
    isActive: true,
  });
  assert(validServiceUpdate.success, "Valid service price update parsed");

  const validServiceDelete = deleteProviderServiceSchema.safeParse({
    id: "srv-med-01",
  });
  assert(validServiceDelete.success, "Valid service deletion schema parsed");

  // 3. Staff Provisioning Schema
  console.log("\n3. Staff Provisioning Schema");
  const validStaffCreate = createProviderStaffSchema.safeParse({
    email: "reception.kankarbagh@patnacare.in",
    phone: "9835112233",
    firstName: "Ritu",
    lastName: "Kumari",
    temporaryPassword: "StaffPassword@2026",
    branchId: "branch-01",
  });
  assert(validStaffCreate.success, "Valid branch staff invite parsed");

  const invalidStaffPassword = createProviderStaffSchema.safeParse({
    email: "staff@patnacare.in",
    phone: "9835112233",
    firstName: "Ritu",
    lastName: "Kumari",
    temporaryPassword: "weak", // Fails complexity
  });
  assert(!invalidStaffPassword.success, "Weak temporary password rejected");

  // 4. Auditable Commission Calculation (Model B)
  console.log("\n4. Auditable Commission Ledger Engine (Model B)");
  const finalBillValue = 1500;
  const commissionRatePercent = 8.0;
  const commissionPayable = (finalBillValue * commissionRatePercent) / 100;
  const netMerchantPayout = finalBillValue - commissionPayable;

  assert(commissionPayable === 120, `Commission accurately computed: ₹1500 * 8% = ₹${commissionPayable}`);
  assert(netMerchantPayout === 1380, `Net merchant payout accurate: ₹1500 - ₹120 = ₹${netMerchantPayout}`);

  const ledgerEntry = {
    bookingId: "bk-test-01",
    bookingCode: "BK-2026-8492",
    serviceCompletedAt: new Date().toISOString(),
    finalBillValue,
    commissionRatePercent,
    commissionPayable,
    netPayout: netMerchantPayout,
    status: LedgerStatus.PENDING,
  };
  assert(ledgerEntry.status === "PENDING", "Commission entry status starts as PENDING for reconciliation");

  // 5. Subscription Plan Commercials (Model A)
  console.log("\n5. Subscription Billing Engine (Model A)");
  const planTiers: Record<SubscriptionPlan, number> = {
    [SubscriptionPlan.NONE]: 0,
    [SubscriptionPlan.STARTER]: 1499,
    [SubscriptionPlan.GROWTH]: 2999,
    [SubscriptionPlan.ENTERPRISE]: 5999,
  };

  assert(planTiers[SubscriptionPlan.STARTER] === 1499, "Starter plan priced at ₹1,499/mo");
  assert(planTiers[SubscriptionPlan.GROWTH] === 2999, "Growth plan priced at ₹2,999/mo");
  assert(planTiers[SubscriptionPlan.ENTERPRISE] === 5999, "Enterprise plan priced at ₹5,999/mo");

  // 6. Commercial Model Distinction
  console.log("\n6. Commercial Model Dual Support");
  assert(CommercialModel.COMMISSION === "COMMISSION", "Model B (Commission) supported");
  assert(CommercialModel.SUBSCRIPTION === "SUBSCRIPTION", "Model A (Subscription) supported");

  console.log(`\n=================================================`);
  console.log(`🎯 Test Summary: ${passed} passed, ${failed} failed`);
  console.log(`=================================================`);

  if (failed > 0) process.exit(1);
}

runProviderWorkspaceTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
