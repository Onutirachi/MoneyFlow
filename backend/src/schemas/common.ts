import { z } from 'zod';
import { isValidDate } from '../utils/date.js';
import { UUID_RE } from '../utils/validation.js';

export const movementType = z.enum(['ENTRADA', 'SAIDA']);
export const paymentMethod = z.enum(['DINHEIRO', 'PIX', 'CREDITO', 'DEBITO']);
export const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use o formato YYYY-MM');
export const dateSchema = z.string().refine(isValidDate, 'Use uma data válida (YYYY-MM-DD)');
export const uuid = z.string().regex(UUID_RE, 'Identificador inválido');
export const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida (ex.: #2563eb)');
export const cents = z
  .number('Valor inválido')
  .int('O valor deve ser inteiro (centavos)')
  .positive('O valor deve ser maior que zero')
  .max(100_000_000_000, 'O valor máximo é R$ 1 bilhão'); // mesmo limite do MoneyInput do front
export const text = (max = 120) =>
  z
    .string('Campo obrigatório')
    .trim()
    .min(1, 'Campo obrigatório')
    .max(max, `Máximo de ${max} caracteres`);

/** Filtro opcional de query string: "" vira "não informado". */
export const optionalFilter = <S extends z.ZodType>(schema: S) =>
  z.preprocess((v) => (v === '' ? undefined : v), schema.optional());
