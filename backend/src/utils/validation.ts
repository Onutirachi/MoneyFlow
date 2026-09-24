import { z } from 'zod';

// Mensagens de validação do zod em português.
z.config(z.locales.ptBR());

/** Valida `input` com o schema; ZodError é convertido em 400 pelo errorHandler. */
export function parse<S extends z.ZodType>(schema: S, input: unknown): z.infer<S> {
  return schema.parse(input);
}
