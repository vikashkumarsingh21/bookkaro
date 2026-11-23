import { z } from "zod";
import { BookingStatus, ProviderCategory } from "@prisma/client";

// -------------------------------------------------------------
// Category-Specific Payload Schemas
// -------------------------------------------------------------

export const healthcareBookingInputsSchema = z.object({
  doctorName: z.string().trim().min(2, "Doctor name is required"),
  doctorId: z.string().optional(),
  department: z.string().optional(),
  visitType: z.enum(["NEW", "FOLLOWUP"], {
    message: "Visit type must be NEW or FOLLOWUP",
  }),
  patientName: z.string().trim().min(2, "Patient name is required"),
  patientAge: z.number().int().min(0).max(120).optional(),
  // Strict Privacy: Reject any clinical diagnoses, medical records, or prescriptions
  medicalRecordsDisclaimerAcknowledged: z.boolean().default(true),
});

export const hotelBookingInputsSchema = z.object({
  checkInDate: z.string().min(1, "Check-in date is required"),
  checkOutDate: z.string().min(1, "Check-out date is required"),
  guestCount: z.number().int().min(1, "At least 1 guest required").max(20),
  roomType: z.string().trim().min(2, "Room type is required"),
  nights: z.number().int().min(1, "Minimum 1 night required").optional(),
  taxBreakdown: z
    .object({
      baseRate: z.number(),
      taxRatePercent: z.number(),
      taxAmount: z.number(),
      totalAmount: z.number(),
    })
    .optional(),
});

export const restaurantBookingInputsSchema = z.object({
  partySize: z.number().int().min(1, "Party size must be at least 1").max(50),
  seatingPreference: z.enum(["INDOOR", "OUTDOOR", "PRIVATE", "ANY"]).default("ANY"),
  specialRequests: z.string().max(200).optional(),
  occasion: z.string().max(50).optional(),
});

export const salonBookingInputsSchema = z.object({
  serviceIds: z.array(z.string()).min(1, "At least one service must be selected"),
  staffPreference: z.string().optional(),
  estimatedDurationMinutes: z.number().int().min(15).optional(),
  selectedAddons: z.array(z.string()).optional(),
});

export const vehicleCareBookingInputsSchema = z.object({
  serviceIds: z.array(z.string()).min(1, "At least one service package required"),
  vehicleType: z.enum(["TWO_WHEELER", "HATCHBACK", "SEDAN", "SUV_LUXURY"]),
  vehiclePlate: z.string().trim().min(4, "Vehicle plate registration number is required").max(15),
  bayPreference: z.string().optional(),
  selectedAddons: z.array(z.string()).optional(),
});

// -------------------------------------------------------------
// Main Booking Creation Schema
// -------------------------------------------------------------

export const createBookingSchema = z.object({
  providerId: z.string().min(1, "Provider ID is required"),
  branchId: z.string().min(1, "Branch ID is required"),
  serviceId: z.string().min(1, "Service ID is required"),
  bookingDate: z.string().min(1, "Booking date is required"), // YYYY-MM-DD or ISO
  timeSlot: z.string().min(1, "Time slot is required"), // e.g. "10:30 AM"
  category: z.nativeEnum(ProviderCategory),
  categoryInputs: z.record(z.string(), z.unknown()),
  estimatedBillAmount: z.number().positive("Estimated bill amount must be greater than 0"),
  tokenAmountPaid: z.number().nonnegative().optional().default(0),
});

// -------------------------------------------------------------
// Booking Status Transition Schema
// -------------------------------------------------------------

export const updateBookingStatusSchema = z.object({
  status: z.nativeEnum(BookingStatus),
  reason: z.string().trim().max(500).optional(),
  finalBillValue: z.number().positive("Final bill value must be positive").optional(),
  disputeReason: z.string().trim().max(1000).optional(),
});

// -------------------------------------------------------------
// Booking Review Schema
// -------------------------------------------------------------

export const createBookingReviewSchema = z.object({
  rating: z.number().int().min(1, "Minimum rating is 1 star").max(5, "Maximum rating is 5 stars"),
  reviewText: z
    .string()
    .trim()
    .min(5, "Review comment must be at least 5 characters")
    .max(2000, "Review cannot exceed 2000 characters"),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type CreateBookingReviewInput = z.infer<typeof createBookingReviewSchema>;
