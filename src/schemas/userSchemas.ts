import { z } from 'zod'

export const updateUserSchema = z
  .object({
    name: z.string().min(1).max(50).optional(),
    role: z.enum(['user', 'admin']).optional(),
  })
  .refine((v) => v.name !== undefined || v.role !== undefined, {
    message: 'At least one field must be provided',
  })
