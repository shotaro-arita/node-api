import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(50),
  password: z.string().min(8).max(200),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(200),
})
