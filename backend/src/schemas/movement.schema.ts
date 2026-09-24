import { z } from 'zod';
import {
  amountSchema,
  dateSchema,
  idSchema,
  monthSchema,
  movementTypeSchema,
  paymentMethodSchema,
} from './common.schema.js';

const baseFields = {
  description: z.string().trim().min(1).max(100),
  amount: amountSchema,
  date: dateSchema,
  accountId: idSchema,
  method: paymentMethodSchema,
  categoryId: idSchema,
};

export const createMovementSchema = z.object({
  type: movementTypeSchema,
  ...baseFields,
  /** Quando presente, `amount` é o valor TOTAL e são geradas N parcelas (ADR 0005). */
  installments: z.number().int().min(2).max(72).optional(),
});

export const updateMovementSchema = z.object(baseFields);

export const scopeQuerySchema = z.object({
  scope: z.enum(['one', 'group']).default('one'),
});

export const listMovementsQuerySchema = z.object({
  month: monthSchema,
  accountId: idSchema.optional(),
  type: movementTypeSchema.optional(),
  categoryId: idSchema.optional(),
  method: paymentMethodSchema.optional(),
});

export type CreateMovementInput = z.infer<typeof createMovementSchema>;
export type UpdateMovementInput = z.infer<typeof updateMovementSchema>;
export type MovementScope = z.infer<typeof scopeQuerySchema>['scope'];
export type ListMovementsQuery = z.infer<typeof listMovementsQuerySchema>;
