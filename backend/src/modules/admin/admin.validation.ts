import { z } from 'zod';
import { ApplicationStage, KycStatus } from '@prisma/client';

export const updateCrmStageSchema = z.object({
  stage: z.nativeEnum(ApplicationStage).optional(),
  kycStatus: z.nativeEnum(KycStatus).optional(),
  assignedPlan: z.enum(['FREE', 'BASIC', 'BUSINESS_PRO', 'COMMISSION_STANDARD']).optional(),
  note: z.string().max(500).optional(),
});

export const requestChangesSchema = z.object({
  reason: z.string({ required_error: 'Reason is required' }).min(5, 'Reason must be at least 5 characters'),
  missingDocuments: z.array(z.string()).optional(),
});

export const resolveDisputeSchema = z.object({
  resolution: z.enum(['UPHELD', 'WAIVED', 'REFUNDED'], {
    errorMap: () => ({ message: 'Resolution must be one of: UPHELD, WAIVED, REFUNDED' }),
  }),
  resolutionNotes: z.string({ required_error: 'Resolution notes are required' }).min(5),
});

export const crmQuerySchema = z.object({
  stage: z.nativeEnum(ApplicationStage).optional(),
  kycStatus: z.nativeEnum(KycStatus).optional(),
  q: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const auditLogsQuerySchema = z.object({
  actionType: z.string().optional(),
  actorRole: z.string().optional(),
  targetId: z.string().optional(),
  format: z.enum(['json', 'csv']).default('json'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export type UpdateCrmStageInput = z.infer<typeof updateCrmStageSchema>;
export type RequestChangesInput = z.infer<typeof requestChangesSchema>;
export type ResolveDisputeInput = z.infer<typeof resolveDisputeSchema>;
export type CrmQueryParams = z.infer<typeof crmQuerySchema>;
export type AuditLogsQueryParams = z.infer<typeof auditLogsQuerySchema>;
