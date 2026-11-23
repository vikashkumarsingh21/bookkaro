import { z } from 'zod';

export const createApplicationSchema = z.object({
  brandName: z.string({ required_error: 'Brand name is required' }).trim().min(2),
  legalName: z.string({ required_error: 'Legal entity name is required' }).trim().min(2),
  category: z.enum(['hotels', 'restaurants', 'salon'], {
    errorMap: () => ({ message: 'Category must be one of: hotels, restaurants, salon' }),
  }),
  locality: z.string({ required_error: 'Patna locality is required' }).trim().min(2),
  pincode: z
    .string({ required_error: '6-digit PIN code is required' })
    .regex(/^[1-9]\d{5}$/, 'Must be a valid 6-digit Indian PIN code'),
  address: z.string({ required_error: 'Complete venue address is required' }).trim().min(5),
  contactName: z.string({ required_error: 'Contact person name is required' }).trim().min(2),
  contactEmail: z.string({ required_error: 'Contact email is required' }).trim().email(),
  contactPhone: z
    .string({ required_error: 'Contact phone is required' })
    .regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number'),
  commercialPlan: z
    .enum(['FREE', 'BASIC', 'BUSINESS_PRO', 'COMMISSION_STANDARD'])
    .default('COMMISSION_STANDARD'),
  documents: z
    .object({
      panNumber: z.string().optional(),
      gstin: z.string().optional(),
      ownerIdUrl: z.string().optional(),
      tradeLicenceUrl: z.string().optional(),
      businessPhotos: z.array(z.string()).optional(),
      bankPassbookUrl: z.string().optional(),
    })
    .optional(),
  notes: z.string().max(500).optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
