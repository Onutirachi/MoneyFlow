import { z } from 'zod';
import {
  amountSchema,
  idSchema,
  monthSchema,
  movementTypeSchema,
  paymentMethodSchema,
} from './common.schema.js';

export const recurringSchema = z
  .object({
    description: z.string().trim().min(1).max(100),
    amount: amountSchema,
    type: movementTypeSchema,
    accountId: idSchema,
    method: paymentMethodSchema,
    categoryId: idSchema,
    dayOfMonth: z.number().int().min(1).max(31),
    startMonth: monthSchema,
    endMonth: monthSchema.nullable().default(null),
    active: z.boolean().default(true),
  })
  .refine((r) => !r.endMonth || r.endMonth >= r.startMonth, {
    message: 'Mês final deve ser igual ou posterior ao mês inicial',
    path: ['endMonth'],
  });

export type RecurringInput = z.infer<typeof recurringSchema>;
