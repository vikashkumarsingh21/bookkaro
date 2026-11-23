import { z } from 'zod';
import { BookingStatus } from '@prisma/client';

export const hotelDetailsSchema = z.object({
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
  guests: z.coerce.number().int().min(1, 'At least 1 guest is required'),
  roomType: z.string().min(1, 'Room type is required'),
  nights: z.coerce.number().int().min(1).optional(),
});

export const restaurantDetailsSchema = z.object({
  partySize: z.coerce.number().int().min(1).max(30, 'Party size cannot exceed 30 guests'),
  seatingPreference: z.string().optional(),
  specialRequest: z.string().max(300, 'Special request note must not exceed 300 characters').optional(),
});

export const salonDetailsSchema = z.object({
  serviceIds: z.array(z.string().min(1)).min(1, 'At least one salon service must be selected'),
  staffPreference: z.string().optional(),
});

export const createBookingSchema = z.object({
  providerId: z.string().uuid({ message: 'Valid providerId UUID is required' }),
  category: z.enum(['hotels', 'restaurants', 'salon'], {
    errorMap: () => ({ message: 'Category must be one of: hotels, restaurants, salon' }),
  }),
  slotDate: z
    .string({ required_error: 'Slot date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  slotTime: z.string({ required_error: 'Slot time is required' }).min(1),
  estimatedAmountInr: z.coerce.number().min(0, 'Estimated amount cannot be negative'),
  categoryDetails: z.record(z.unknown()),
  customerNotes: z.string().max(500).optional(),
});

export const cancelBookingSchema = z.object({
  reason: z.string().max(300, 'Cancellation reason must not exceed 300 characters').optional(),
});

export const disputeBookingSchema = z.object({
  reason: z.string().min(5, 'Dispute reason must be at least 5 characters').max(500),
  details: z.string().max(1000).optional(),
});

export const refundRequestSchema = z.object({
  reason: z.string().min(5, 'Refund reason is required').max(500),
  refundAccountDetails: z.string().min(5, 'UPI ID or Bank Details are required').max(300),
});

export const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5, 'Rating must be an integer between 1 and 5'),
  comment: z.string().min(5, 'Review comment must be at least 5 characters long').max(1000),
  tags: z.array(z.string().trim()).default([]),
});

export const declineBookingSchema = z.object({
  reason: z.string().min(3, 'Decline reason must be at least 3 characters long').max(300),
});

export const completeBookingSchema = z.object({
  venuePin: z
    .string({ required_error: 'Venue PIN is required' })
    .regex(/^\d{4}$/, 'Venue PIN must be exactly 4 digits'),
  finalBillInr: z.coerce.number().min(0).optional(),
});

export const myBookingsQuerySchema = z.object({
  status: z.nativeEnum(BookingStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const partnerBookingsQuerySchema = z.object({
  status: z.nativeEnum(BookingStatus).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type DisputeBookingInput = z.infer<typeof disputeBookingSchema>;
export type RefundRequestInput = z.infer<typeof refundRequestSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type DeclineBookingInput = z.infer<typeof declineBookingSchema>;
export type CompleteBookingInput = z.infer<typeof completeBookingSchema>;
