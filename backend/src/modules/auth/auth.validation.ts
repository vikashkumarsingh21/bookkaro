import { z } from 'zod';
import { Role } from '@prisma/client';

export const registerSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email address format')
    .toLowerCase(),
  phone: z
    .string({ required_error: 'Mobile phone number is required' })
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Phone must be a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9)'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters long')
    .max(72, 'Password must not exceed 72 characters'),
  role: z
    .nativeEnum(Role, { invalid_type_error: 'Role must be CUSTOMER or PARTNER_OWNER' })
    .optional()
    .default(Role.CUSTOMER)
    .refine((val) => val === Role.CUSTOMER || val === Role.PARTNER_OWNER, {
      message: 'Direct self-registration is only allowed for CUSTOMER or PARTNER_OWNER roles',
    }),
});

export const loginSchema = z.object({
  emailOrPhone: z
    .string({ required_error: 'Email or phone number is required' })
    .trim()
    .min(3, 'Email or phone must be at least 3 characters'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password cannot be empty'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
