import { z } from 'zod';
import {
  cents,
  dateSchema,
  monthSchema,
  movementType,
  optionalFilter,
  paymentMethod,
  text,
  uuid,
} from './common.js';

export const listMovementsQuery = z.object({
  month: monthSchema,
  accountId: optionalFilter(uuid),
  type: optionalFilter(movementType),
  categoryId: optionalFilter(uuid),
  method: optionalFilter(paymentMethod),
});

export const createMovementSchema = z.object({
  type: movementType,
  description: text(100),
  amount: cents,
  date: dateSchema,
  accountId: uuid,
  method: paymentMethod,
  categoryId: uuid,
  installments: z
    .number()
    .int('Número de parcelas inválido')
    .min(2, 'Mínimo de 2 parcelas')
    .max(72, 'Máximo de 72 parcelas')
    .optional(),
});

export const updateMovementSchema = z.object({
  description: text(100),
  amount: cents,
  date: dateSchema,
  accountId: uuid,
  method: paymentMethod,
  categoryId: uuid,
});

export const scopeQuery = z.object({ scope: z.enum(['one', 'group']).default('one') });
