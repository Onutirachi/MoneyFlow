import { z } from 'zod';
import { text } from './common.js';

const email = z.string().trim().toLowerCase().pipe(z.email('E-mail inválido'));

export const registerSchema = z.object({
  name: text(80).min(2, 'Informe ao menos 2 caracteres'),
  email,
  password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres').max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, 'Informe o e-mail'),
  password: z.string().min(1, 'Informe a senha'),
});
