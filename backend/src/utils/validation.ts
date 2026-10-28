import type { z } from 'zod';
import { AppError, notFound } from '../errors.js';

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parse<S extends z.ZodType>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AppError(
      400,
      'VALIDATION_ERROR',
      'Dados inválidos',
      result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    );
  }
  return result.data;
}

/** Id inválido na URL = recurso inexistente (404). */
export function idParam(value: string | string[] | undefined): string {
  if (typeof value !== 'string' || !UUID_RE.test(value)) throw notFound();
  return value;
}
