import { z } from "zod";
import { indianPhoneRegex, passwordComplexityRegex } from "@/lib/auth/schemas";
import { ProviderCategory } from "@prisma/client";

export const updateProviderProfileSchema = z.object({
  businessName: z.string().trim().min(2).max(100).optional(),
  legalName: z.string().trim().min(2).max(150).optional(),
  contactPhone: z.string().trim().regex(indianPhoneRegex, "Enter a valid 10-digit Indian phone number").optional(),
  contactEmail: z.string().trim().email().optional(),
  website: z.string().trim().url().optional().or(z.literal("")),
  bio: z.string().trim().max(2000).optional(),
  cancellationPolicy: z.string().trim().max(1000).optional(),
  operatingHours: z.record(z.string(), z.unknown()).optional(),
  mainBranch: z
    .object({
      name: z.string().optional(),
      addressLine: z.string().optional(),
      locality: z.string().optional(),
      city: z.string().optional(),
      pincode: z.string().optional(),
      phone: z.string().optional(),
      operatingHours: z.record(z.string(), z.unknown()).optional(),
    })
    .optional(),
});

export const createProviderServiceSchema = z.object({
  name: z.string().trim().min(2, "Service name must be at least 2 characters").max(100),
  description: z.string().trim().max(1000).optional(),
  durationMinutes: z.number().int().min(5, "Duration must be at least 5 minutes").max(720),
  basePrice: z.number().positive("Base price must be greater than 0"),
  category: z.nativeEnum(ProviderCategory).optional(),
  categoryMetadata: z.record(z.string(), z.unknown()).optional().default({}),
  branchId: z.string().optional(),
});

export const updateProviderServiceSchema = z.object({
  id: z.string().min(1, "Service ID is required"),
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().max(1000).optional(),
  durationMinutes: z.number().int().min(5).max(720).optional(),
  basePrice: z.number().positive().optional(),
  categoryMetadata: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().optional(),
  branchId: z.string().nullable().optional(),
});

export const deleteProviderServiceSchema = z.object({
  id: z.string().min(1, "Service ID is required"),
});

export const createProviderStaffSchema = z.object({
  email: z.string().trim().toLowerCase().email("Valid email address required"),
  phone: z.string().trim().regex(indianPhoneRegex, "Valid 10-digit Indian mobile required"),
  firstName: z.string().trim().min(2).max(50),
  lastName: z.string().trim().min(1).max(50),
  temporaryPassword: z
    .string()
    .min(8)
    .regex(passwordComplexityRegex, "Password must include upper, lower, and digit")
    .optional(),
  branchId: z.string().optional(),
});

export type UpdateProviderProfileInput = z.infer<typeof updateProviderProfileSchema>;
export type CreateProviderServiceInput = z.infer<typeof createProviderServiceSchema>;
export type UpdateProviderServiceInput = z.infer<typeof updateProviderServiceSchema>;
export type CreateProviderStaffInput = z.infer<typeof createProviderStaffSchema>;
