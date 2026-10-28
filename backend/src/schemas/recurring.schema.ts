import { z } from 'zod';
import { cents, monthSchema, movementType, paymentMethod, text, uuid } from './common.js';

export const recurringSchema = z
  .object({
    description: text(100),
    amount: cents,
    type: movementType,
    accountId: uuid,
    method: paymentMethod,
    categoryId: uuid,
    dayOfMonth: z.number().int().min(1, 'Dia de 1 a 31').max(31, 'Dia de 1 a 31'),
    startMonth: monthSchema,
    endMonth: monthSchema.nullish().transform((v) => v ?? null),
    active: z.boolean().default(true),
  })
  .refine((v) => v.endMonth === null || v.endMonth >= v.startMonth, {
    message: 'O mês final não pode ser anterior ao inicial',
    path: ['endMonth'],
  });
