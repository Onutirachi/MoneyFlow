import { z } from 'zod';
import { MOVEMENT_TYPES, PAYMENT_METHODS } from '../types.js';
import { isValidDate } from '../utils/date.js';

export const colorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Cor deve estar no formato #RRGGBB');
export const movementTypeSchema = z.enum(MOVEMENT_TYPES);
export const paymentMethodSchema = z.enum(PAYMENT_METHODS);
/** Centavos, inteiro positivo (até R$ 1 bilhão) */
export const amountSchema = z.number().int().positive().max(100_000_000_000);
export const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Mês deve ser YYYY-MM');
export const dateSchema = z.string().refine(isValidDate, 'Data deve ser YYYY-MM-DD válida');
export const idSchema = z.string().min(1);
