import { z } from 'zod';
import { colorSchema, paymentMethodSchema } from './common.schema.js';

export const accountSchema = z.object({
  name: z.string().trim().min(1).max(60),
  color: colorSchema,
  /** centavos; pode ser negativo (conta já no vermelho) */
  initialBalance: z.number().int(),
  methods: z
    .array(paymentMethodSchema)
    .min(1, 'Selecione ao menos um método de pagamento')
    .transform((methods) => [...new Set(methods)]),
});

export type AccountInput = z.infer<typeof accountSchema>;
