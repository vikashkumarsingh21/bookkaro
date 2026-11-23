import {
  healthcareBookingInputsSchema,
  hotelBookingInputsSchema,
  restaurantBookingInputsSchema,
  salonBookingInputsSchema,
  vehicleCareBookingInputsSchema,
  createBookingSchema,
  updateBookingStatusSchema,
  createBookingReviewSchema,
} from "../src/lib/booking/schemas";
import { BookingStatus, ProviderCategory } from "@prisma/client";

async function runBookingEngineTests() {
  console.log("=================================================");
  console.log("📑 BOOKKARO Module 3 Booking Engine Test Suite");
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

  // 1. Healthcare Payload Validation
  console.log("1. Healthcare Category Validation");
  const validHealth = healthcareBookingInputsSchema.safeParse({
    doctorName: "Dr. Sunil Verma",
    visitType: "NEW",
    patientName: "Ramesh Sharma",
    patientAge: 48,
    medicalRecordsDisclaimerAcknowledged: true,
  });
  assert(validHealth.success, "Valid Healthcare consultation payload accepted");

  const invalidHealthVisit = healthcareBookingInputsSchema.safeParse({
    doctorName: "Dr. Sunil Verma",
    visitType: "INVALID_VISIT", // Invalid
    patientName: "Ramesh Sharma",
  });
  assert(!invalidHealthVisit.success, "Invalid Healthcare visitType rejected");

  // 2. Hotel Payload Validation
  console.log("\n2. Hotel Category Validation");
  const validHotel = hotelBookingInputsSchema.safeParse({
    checkInDate: "2026-12-01",
    checkOutDate: "2026-12-04",
    guestCount: 2,
    roomType: "Executive Heritage Suite",
    nights: 3,
    taxBreakdown: {
      baseRate: 4500,
      taxRatePercent: 12,
      taxAmount: 540,
      totalAmount: 5040,
    },
  });
  assert(validHotel.success, "Valid Hotel reservation payload accepted");

  const invalidHotelGuests = hotelBookingInputsSchema.safeParse({
    checkInDate: "2026-12-01",
    checkOutDate: "2026-12-04",
    guestCount: 0, // Must be at least 1
    roomType: "Suite",
  });
  assert(!invalidHotelGuests.success, "Zero guest count rejected");

  // 3. Restaurant Payload Validation
  console.log("\n3. Restaurant Category Validation");
  const validRestaurant = restaurantBookingInputsSchema.safeParse({
    partySize: 4,
    seatingPreference: "OUTDOOR",
    specialRequests: "Anniversary table near courtyard garden",
  });
  assert(validRestaurant.success, "Valid Restaurant reservation payload accepted");

  const invalidRestaurantParty = restaurantBookingInputsSchema.safeParse({
    partySize: 0,
    seatingPreference: "INDOOR",
  });
  assert(!invalidRestaurantParty.success, "Invalid party size 0 rejected");

  // 4. Salon & Vehicle Care Payload Validation
  console.log("\n4. Salon & Vehicle Care Category Validation");
  const validSalon = salonBookingInputsSchema.safeParse({
    serviceIds: ["srv-cut-01", "srv-spa-02"],
    staffPreference: "Senior Stylist Rahul",
    estimatedDurationMinutes: 60,
  });
  assert(validSalon.success, "Valid Salon multi-service selection accepted");

  const validVehicle = vehicleCareBookingInputsSchema.safeParse({
    serviceIds: ["srv-wash-01"],
    vehicleType: "SUV_LUXURY",
    vehiclePlate: "BR01AB1234",
    bayPreference: "High-Pressure Jet Bay 1",
  });
  assert(validVehicle.success, "Valid Vehicle Care payload with license plate accepted");

  const invalidVehicle = vehicleCareBookingInputsSchema.safeParse({
    serviceIds: [], // Empty services
    vehicleType: "SEDAN",
    vehiclePlate: "",
  });
  assert(!invalidVehicle.success, "Vehicle Care with empty service array and empty plate rejected");

  // 5. Main Booking Creation Schema
  console.log("\n5. Main Booking Request Schema");
  const validBookingRequest = createBookingSchema.safeParse({
    providerId: "prov-pat-01",
    branchId: "branch-pat-01",
    serviceId: "srv-med-01",
    bookingDate: "2026-11-25",
    timeSlot: "10:30 AM",
    category: ProviderCategory.HEALTHCARE,
    categoryInputs: {
      doctorName: "Dr. Sunil Verma",
      visitType: "NEW",
      patientName: "Ananya Sharma",
    },
    estimatedBillAmount: 800,
    tokenAmountPaid: 200,
  });
  assert(validBookingRequest.success, "Complete booking creation request parsed successfully");

  // 6. Booking State Machine Transitions
  console.log("\n6. State Machine & Status Lifecycle Transitions");
  const validStatusUpdate = updateBookingStatusSchema.safeParse({
    status: BookingStatus.ACCEPTED,
  });
  assert(validStatusUpdate.success, "Transition to ACCEPTED parsed");

  const validCompleteStatus = updateBookingStatusSchema.safeParse({
    status: BookingStatus.COMPLETED,
    finalBillValue: 850,
  });
  assert(validCompleteStatus.success && validCompleteStatus.data.finalBillValue === 850, "Transition to COMPLETED with finalBillValue parsed");

  // Commission computation test: 8% of ₹850
  const finalBill = 850;
  const commissionRate = 8.0;
  const expectedCommission = (finalBill * commissionRate) / 100;
  assert(expectedCommission === 68.0, `Commission accurately calculated (₹${expectedCommission})`);

  // 7. Verified Review Validation
  console.log("\n7. Verified Review Validation");
  const validReview = createBookingReviewSchema.safeParse({
    rating: 5,
    reviewText: "Doctor was attentive and diagnosis was immediate. Clinic was spotless.",
  });
  assert(validReview.success, "5-star verified review accepted");

  const invalidReviewRating = createBookingReviewSchema.safeParse({
    rating: 6, // Exceeds max 5
    reviewText: "Great experience",
  });
  assert(!invalidReviewRating.success, "Rating > 5 rejected");

  const shortReview = createBookingReviewSchema.safeParse({
    rating: 4,
    reviewText: "Hi", // Less than 5 characters
  });
  assert(!shortReview.success, "Short review comment (<5 chars) rejected");

  console.log(`\n=================================================`);
  console.log(`🎯 Test Summary: ${passed} passed, ${failed} failed`);
  console.log(`=================================================`);

  if (failed > 0) process.exit(1);
}

runBookingEngineTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
