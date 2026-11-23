import { z } from 'zod';
import { LedgerStatus, SubscriptionTier } from '@prisma/client';

export const ledgerQuerySchema = z.object({
  status: z.nativeEnum(LedgerStatus).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be YYYY-MM-DD').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be YYYY-MM-DD').optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const upgradeSubscriptionSchema = z.object({
  targetTier: z.nativeEnum(SubscriptionTier, {
    errorMap: () => ({ message: 'targetTier must be one of: FREE, BASIC, BUSINESS_PRO' }),
  }),
});

export type LedgerQueryParams = z.infer<typeof ledgerQuerySchema>;
export type UpgradeSubscriptionInput = z.infer<typeof upgradeSubscriptionSchema>;
