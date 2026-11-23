import { z } from 'zod';

export const searchQuerySchema = z.object({
  q: z.string().trim().optional(),
  category: z.enum(['hotels', 'restaurants', 'salon', 'all']).optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  locality: z.string().trim().optional(),
  pincode: z.string().trim().optional(),
  radiusKm: z.coerce.number().min(1).max(50).default(10),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  verifiedOnly: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((val) => val === true || val === 'true')
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type SearchQueryParams = z.infer<typeof searchQuerySchema>;
