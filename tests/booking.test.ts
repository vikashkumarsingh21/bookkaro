import { describe, it, expect } from "vitest";
import {
  healthcareBookingInputsSchema,
  hotelBookingInputsSchema,
  restaurantBookingInputsSchema,
  salonBookingInputsSchema,
  vehicleCareBookingInputsSchema,
  createBookingSchema,
  updateBookingStatusSchema,
  createBookingReviewSchema,
} from "@/lib/booking/schemas";
import { BookingStatus, ProviderCategory } from "@prisma/client";

describe("Booking Engine & Category Validations", () => {
  it("validates Healthcare appointment inputs with disclaimer acknowledgment", () => {
    const valid = healthcareBookingInputsSchema.safeParse({
      doctorName: "Dr. Sunil Verma",
      visitType: "NEW",
      patientName: "Ramesh Sharma",
      patientAge: 48,
      medicalRecordsDisclaimerAcknowledged: true,
    });
    expect(valid.success).toBe(true);

    const invalid = healthcareBookingInputsSchema.safeParse({
      doctorName: "Dr. Sunil Verma",
      visitType: "UNKNOWN",
    });
    expect(invalid.success).toBe(false);
  });

  it("validates full booking creation request schema", () => {
    const valid = createBookingSchema.safeParse({
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
    expect(valid.success).toBe(true);
  });

  it("validates Hotel reservation dates, rooms, and transparent tax breakdowns", () => {
    const valid = hotelBookingInputsSchema.safeParse({
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
    expect(valid.success).toBe(true);

    const zeroGuests = hotelBookingInputsSchema.safeParse({
      checkInDate: "2026-12-01",
      checkOutDate: "2026-12-04",
      guestCount: 0,
      roomType: "Suite",
    });
    expect(zeroGuests.success).toBe(false);
  });

  it("validates Restaurant party size and seating preferences", () => {
    const valid = restaurantBookingInputsSchema.safeParse({
      partySize: 4,
      seatingPreference: "OUTDOOR",
      specialRequests: "Table with garden view",
    });
    expect(valid.success).toBe(true);

    const invalid = restaurantBookingInputsSchema.safeParse({
      partySize: 0,
    });
    expect(invalid.success).toBe(false);
  });

  it("validates full booking creation request schema", () => {
    const valid = createBookingSchema.safeParse({
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
    expect(valid.success).toBe(true);
  });

  it("validates Salon and Vehicle Care service selections", () => {
    const salon = salonBookingInputsSchema.safeParse({
      serviceIds: ["srv-cut-01", "srv-spa-02"],
      staffPreference: "Senior Stylist Rahul",
      estimatedDurationMinutes: 60,
    });
    expect(salon.success).toBe(true);

    const vehicle = vehicleCareBookingInputsSchema.safeParse({
      serviceIds: ["srv-wash-01"],
      vehicleType: "SUV_LUXURY",
      vehiclePlate: "BR01AB1234",
      bayPreference: "High-Pressure Jet Bay 1",
    });
    expect(vehicle.success).toBe(true);
  });

  it("validates Booking status lifecycle updates", () => {
    const accepted = updateBookingStatusSchema.safeParse({
      status: BookingStatus.ACCEPTED,
    });
    expect(accepted.success).toBe(true);

    const completed = updateBookingStatusSchema.safeParse({
      status: BookingStatus.COMPLETED,
      finalBillValue: 1250,
    });
    expect(completed.success).toBe(true);
    if (completed.success) {
      expect(completed.data.finalBillValue).toBe(1250);
    }
  });

  it("validates verified review ratings from 1 to 5 stars", () => {
    const validReview = createBookingReviewSchema.safeParse({
      rating: 5,
      reviewText: "Excellent clinical care and prompt consultation.",
    });
    expect(validReview.success).toBe(true);

    const outOfBounds = createBookingReviewSchema.safeParse({
      rating: 6,
      reviewText: "Great service",
    });
    expect(outOfBounds.success).toBe(false);
  });

  describe("Reactive Client Booking Store", () => {
    it("enforces that newly created bookings strictly start as REQUESTED with Booking ID and 4-digit Venue PIN", async () => {
      const { bookingService } = await import("@/services/bookingService");

      const created = await bookingService.createBookingRequest({
        customerId: "test-cust-1",
        customerName: "Sanjay Kumar",
        customerPhone: "+91 98350 99881",
        customerEmail: "sanjay@gmail.com",
        providerId: "prov-pat-01",
        providerName: "Patliputra Pediatric Clinic",
        providerAddress: "Fraser Road, Patna",
        category: "healthcare",
        serviceId: "s-1",
        serviceName: "OPD Consultation",
        scheduledDate: "2026-11-22",
        scheduledSlot: { startTime: "10:00 AM", endTime: "10:30 AM" },
        paxOrUnits: 1,
        pricing: {
          basePrice: 600,
          taxesAndGst: 0,
          platformFee: 0,
          discountAmount: 0,
          totalAmount: 600,
          tokenPaidOnline: 0,
          amountPayableAtVenue: 600,
          currency: "INR",
        },
        paymentStatus: "PENDING",
      });

      expect(created.status).toBe("REQUESTED");
      expect(created.bookingReference).toMatch(/^BK-PAT-\d{4}$/);
      expect(created.checkInPin).toMatch(/^\d{4}$/);

      // Immediately appears in customer bookings store
      const allCustomerBookings = bookingService.getAllBookings();
      expect(allCustomerBookings.some((b) => b.bookingReference === created.bookingReference)).toBe(true);

      // Immediately appears in portal bookings store
      const allPortalBookings = bookingService.getPortalBookings();
      expect(allPortalBookings.some((p) => p.bookingReference === created.bookingReference)).toBe(true);
    });

    it("transitions booking status reactively across customer and portal stores", async () => {
      const { bookingService } = await import("@/services/bookingService");
      const bookings = bookingService.getAllBookings();
      const first = bookings[0];

      const updated = await bookingService.updateBookingStatus(
        first.id,
        "CONFIRMED",
        "PROVIDER",
        "Provider accepted slot on roster"
      );

      expect(updated.status).toBe("CONFIRMED");
      const latest = bookingService.getAllBookings().find((b) => b.id === first.id);
      expect(latest?.status).toBe("CONFIRMED");
    });

    it("enforces state machine guards for cancellation", async () => {
      const { bookingService } = await import("@/services/bookingService");
      const created = await bookingService.createBookingRequest({
        customerId: "test-cust-cancel",
        customerName: "Rahul Sharma",
        customerPhone: "+91 98350 11223",
        customerEmail: "rahul@gmail.com",
        providerId: "prov-pat-01",
        providerName: "DM Cardiology Clinic",
        providerAddress: "Kankarbagh, Patna",
        category: "healthcare",
        serviceId: "s-1",
        serviceName: "Consultation",
        scheduledDate: "2026-11-25",
        scheduledSlot: { startTime: "11:00 AM", endTime: "11:30 AM" },
        paxOrUnits: 1,
        pricing: {
          basePrice: 900,
          taxesAndGst: 0,
          platformFee: 0,
          discountAmount: 0,
          totalAmount: 900,
          tokenPaidOnline: 0,
          amountPayableAtVenue: 900,
          currency: "INR",
        },
        paymentStatus: "PENDING",
      });

      // Valid: cancelling a REQUESTED booking
      const cancelled = await bookingService.cancelBooking(created.id, "Sudden personal conflict");
      expect(cancelled.status).toBe("CANCELLED");
      expect(cancelled.cancellationReason).toBe("Sudden personal conflict");

      // Invalid: cancelling an already CANCELLED booking must throw
      await expect(
        bookingService.cancelBooking(created.id, "Attempt cancel again")
      ).rejects.toThrow(/Cannot cancel booking in status/);
    });

    it("enforces dispute creation guards and ticket generation", async () => {
      const { bookingService } = await import("@/services/bookingService");
      const created = await bookingService.createBookingRequest({
        customerId: "test-cust-disp",
        customerName: "Priya Sinha",
        customerPhone: "+91 98350 33445",
        customerEmail: "priya@gmail.com",
        providerId: "prov-pat-02",
        providerName: "Hotel Maurya",
        providerAddress: "Fraser Road, Patna",
        category: "hotels",
        serviceId: "s-2",
        serviceName: "Executive Room",
        scheduledDate: "2026-11-26",
        scheduledSlot: { startTime: "02:00 PM", endTime: "12:00 PM" },
        paxOrUnits: 2,
        pricing: {
          basePrice: 4500,
          taxesAndGst: 540,
          platformFee: 0,
          discountAmount: 0,
          totalAmount: 5040,
          tokenPaidOnline: 0,
          amountPayableAtVenue: 5040,
          currency: "INR",
        },
        paymentStatus: "PENDING",
      });

      // Invalid: cannot dispute a REQUESTED booking
      await expect(
        bookingService.raiseDispute(created.id, {
          ticketId: "DISP-PAT-TEST",
          reason: "Venue not reachable",
          description: "Cannot contact",
        })
      ).rejects.toThrow(/Cannot raise dispute for booking in status: REQUESTED/);

      // Advance to CONFIRMED
      await bookingService.updateBookingStatus(created.id, "CONFIRMED", "PROVIDER");

      // Valid: dispute on CONFIRMED booking
      const disputed = await bookingService.raiseDispute(created.id, {
        ticketId: "DISP-PAT-8899",
        reason: "Partner refused to honor confirmed booking",
        description: "Front desk claimed full occupancy upon arrival.",
      });

      expect(disputed.status).toBe("DISPUTED");
      expect(disputed.dispute?.ticketId).toBe("DISP-PAT-8899");
      expect(disputed.dispute?.status).toBe("OPEN");
    });

    it("enforces verified review gating strictly on COMPLETED bookings", async () => {
      const { bookingService } = await import("@/services/bookingService");
      const created = await bookingService.createBookingRequest({
        customerId: "test-cust-rev",
        customerName: "Amit Kumar",
        customerPhone: "+91 98350 55667",
        customerEmail: "amit@gmail.com",
        providerId: "prov-pat-03",
        providerName: "Patliputra Courtyard Dining",
        providerAddress: "Patliputra Colony, Patna",
        category: "restaurants",
        serviceId: "s-3",
        serviceName: "Dinner Table for 4",
        scheduledDate: "2026-11-20",
        scheduledSlot: { startTime: "08:00 PM", endTime: "10:00 PM" },
        paxOrUnits: 4,
        pricing: {
          basePrice: 1600,
          taxesAndGst: 80,
          platformFee: 0,
          discountAmount: 0,
          totalAmount: 1680,
          tokenPaidOnline: 0,
          amountPayableAtVenue: 1680,
          currency: "INR",
        },
        paymentStatus: "PENDING",
      });

      // Attempt review on REQUESTED booking: must throw
      await expect(
        bookingService.addVerifiedReview(created.id, {
          rating: 5,
          comment: "Great food and prompt service",
          tags: ["Courteous Staff"],
        })
      ).rejects.toThrow(/Reviews can only be submitted for COMPLETED visits/);

      // Advance to COMPLETED
      await bookingService.updateBookingStatus(created.id, "CONFIRMED", "PROVIDER");
      await bookingService.updateBookingStatus(created.id, "COMPLETED", "PROVIDER");

      // Valid: review submission on COMPLETED booking
      const reviewed = await bookingService.addVerifiedReview(created.id, {
        rating: 5,
        comment: "Outstanding Bihari Champaran Handi mutton and warm hospitality.",
        tags: ["Courteous Staff", "Will Book Again in Patna"],
      });

      expect(reviewed.verifiedReview).toBeDefined();
      expect(reviewed.verifiedReview?.rating).toBe(5);
      expect(reviewed.verifiedReview?.tags).toContain("Will Book Again in Patna");

      // Attempt duplicate review on the same booking: must throw
      await expect(
        bookingService.addVerifiedReview(created.id, {
          rating: 4,
          comment: "Trying to submit second review",
          tags: [],
        })
      ).rejects.toThrow(/already been recorded/);
    });

    it("manages Saved Patna Providers reactively", async () => {
      const { savedProvidersService } = await import("@/services/savedProvidersService");

      const testProvider = {
        providerId: "prov-test-pat-99",
        name: "Test Patna Aesthetic Clinic",
        category: "salon" as const,
        subCategory: "Laser Skin & Hair",
        city: "Patna",
        locality: "Boring Road",
        rating: 4.9,
        reviewCount: 150,
        startingPriceInr: 1200,
        image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
      };

      // Initially unsaved
      expect(savedProvidersService.isProviderSaved("prov-test-pat-99")).toBe(false);

      // Toggle to save
      const isSaved = savedProvidersService.toggleSaveProvider(testProvider);
      expect(isSaved).toBe(true);
      expect(savedProvidersService.isProviderSaved("prov-test-pat-99")).toBe(true);

      // Verify in saved list
      const savedList = savedProvidersService.getSavedProviders();
      expect(savedList.some((p) => p.providerId === "prov-test-pat-99")).toBe(true);

      // Remove provider
      savedProvidersService.removeSavedProvider("prov-test-pat-99");
      expect(savedProvidersService.isProviderSaved("prov-test-pat-99")).toBe(false);
    });

    it("executes the full Refund Lifecycle: CANCELLED -> REFUND_REQUESTED -> REFUNDED", async () => {
      const { bookingService } = await import("@/services/bookingService");

      // 1. Create fresh booking
      const created = await bookingService.createBookingRequest({
        customerId: "test-cust-refund",
        customerName: "Saurabh Kumar",
        customerPhone: "+91 98350 99999",
        customerEmail: "saurabh@example.com",
        providerId: "prov-pat-hotels-01",
        providerName: "Hotel Maurya Patna",
        providerAddress: "Fraser Road, Patna",
        category: "hotels",
        serviceId: "srv-deluxe-01",
        serviceName: "Deluxe Heritage Room",
        scheduledDate: "2026-11-28",
        scheduledSlot: { startTime: "02:00 PM", endTime: "03:00 PM" },
        paxOrUnits: 2,
        pricing: {
          basePrice: 4500,
          taxesAndGst: 540,
          platformFee: 0,
          discountAmount: 0,
          totalAmount: 5040,
          tokenPaidOnline: 0,
          amountPayableAtVenue: 5040,
          currency: "INR",
        },
        paymentStatus: "PENDING",
      });

      expect(created.status).toBe("REQUESTED");

      // 2. Cancel the booking
      const cancelled = await bookingService.cancelBooking(
        created.id,
        "Travel plans changed due to flight rescheduling"
      );
      expect(cancelled.status).toBe("CANCELLED");

      // 3. Customer submits refund claim
      const refundClaimed = await bookingService.requestRefund(created.id, {
        reason: "Advance deposit refund requested as per 24h window",
        upiOrBankRef: "saurabh.patna@okhdfcbank",
      });

      expect(refundClaimed.status).toBe("REFUND_REQUESTED");
      expect(refundClaimed.refundRequest).toBeDefined();
      expect(refundClaimed.refundRequest?.reason).toBe(
        "Advance deposit refund requested as per 24h window"
      );
      expect(refundClaimed.refundRequest?.upiOrBankRef).toBe(
        "saurabh.patna@okhdfcbank"
      );
      expect(refundClaimed.refundRequest?.requestedAt).toBeDefined();

      // 4. Admin approves refund
      const refunded = await bookingService.approveRefund(
        created.id,
        "Approved by Grievance Officer; full refund wired to saurabh.patna@okhdfcbank"
      );

      expect(refunded.status).toBe("REFUNDED");
      expect(refunded.refundRequest?.processedAt).toBeDefined();
      expect(refunded.refundRequest?.adminNote).toContain("Approved by Grievance Officer");

      // 5. Verify status history logged transitions
      const statuses = refunded.statusHistory.map((h) => h.status);
      expect(statuses).toContain("REQUESTED");
      expect(statuses).toContain("CANCELLED");
      expect(statuses).toContain("REFUND_REQUESTED");
      expect(statuses).toContain("REFUNDED");
    });

    it("verifies client commission rates (10% Hotels, 5% Dining, 10% Salons) and 3-Tier Subscription Plans", async () => {
      const { partnerOnboardingService, LAUNCH_SUBSCRIPTION_PLANS } = await import(
        "@/services/partnerOnboardingService"
      );

      // Verify category commission math
      expect(partnerOnboardingService.getCategoryCommissionRate("hotels")).toBe(10.0);
      expect(partnerOnboardingService.getCategoryCommissionRate("restaurants")).toBe(5.0);
      expect(partnerOnboardingService.getCategoryCommissionRate("salon")).toBe(10.0);

      // Verify 3 client subscription plans
      expect(LAUNCH_SUBSCRIPTION_PLANS).toHaveLength(3);
      const freePlan = LAUNCH_SUBSCRIPTION_PLANS.find((p) => p.id === "FREE");
      const basicPlan = LAUNCH_SUBSCRIPTION_PLANS.find((p) => p.id === "BASIC");
      const proPlan = LAUNCH_SUBSCRIPTION_PLANS.find((p) => p.id === "BUSINESS_PRO");

      expect(freePlan?.priceInr).toBe(0);
      expect(basicPlan?.priceInr).toBe(499);
      expect(proPlan?.priceInr).toBe(999);
    });
  });
});
