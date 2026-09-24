import { z } from 'zod';

// trim ANTES de validar: z.email().trim() valida primeiro e rejeita espaços de autocompletar
const emailSchema = z.string().trim().toLowerCase().pipe(z.email());

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: emailSchema,
  password: z.string().min(6).max(100),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
