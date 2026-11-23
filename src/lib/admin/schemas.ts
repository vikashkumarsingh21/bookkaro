import { z } from "zod";
import { indianPhoneRegex } from "@/lib/auth/schemas";
import {
  ProviderCategory,
  CommercialModel,
  SubscriptionPlan,
  CRMStage,
  KYCStatus,
} from "@prisma/client";

export const createLeadSchema = z.object({
  businessName: z.string().trim().min(2, "Business name is required").max(100),
  ownerName: z.string().trim().min(2, "Owner name is required").max(100),
  phone: z.string().trim().regex(indianPhoneRegex, "Valid 10-digit Indian mobile required"),
  email: z.string().trim().toLowerCase().email("Valid email address required"),
  city: z.string().trim().min(2, "City is required"),
  category: z.nativeEnum(ProviderCategory),
  assignedCommercialModel: z.nativeEnum(CommercialModel).optional().default(CommercialModel.COMMISSION),
  proposedCommissionRate: z.number().min(0).max(50).optional().default(8.0),
  planTier: z.nativeEnum(SubscriptionPlan).optional().default(SubscriptionPlan.NONE),
  note: z.string().trim().max(1000).optional(),
});

export const updateLeadSchema = z.object({
  stage: z.nativeEnum(CRMStage).optional(),
  businessName: z.string().trim().min(2).max(100).optional(),
  ownerName: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().regex(indianPhoneRegex).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
  city: z.string().trim().min(2).optional(),
  category: z.nativeEnum(ProviderCategory).optional(),
  assignedCommercialModel: z.nativeEnum(CommercialModel).optional(),
  proposedCommissionRate: z.number().min(0).max(50).optional(),
  planTier: z.nativeEnum(SubscriptionPlan).optional(),
  newNote: z.string().trim().max(1000).optional(),
});

export const updateVerificationSchema = z.object({
  status: z.nativeEnum(KYCStatus),
  reason: z.string().trim().max(500).optional(),
  licenseType: z.string().trim().max(50).optional(),
  licenseNumber: z.string().trim().max(50).optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type UpdateVerificationInput = z.infer<typeof updateVerificationSchema>;
