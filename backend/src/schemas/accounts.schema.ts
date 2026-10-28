import { z } from 'zod';
import { hexColor, paymentMethod, text } from './common.js';

export const accountSchema = z.object({
  name: text(60),
  color: hexColor,
  initialBalance: z.number('Saldo inválido').int('O saldo deve ser inteiro (centavos)'),
  methods: z
    .array(paymentMethod)
    .min(1, 'Informe ao menos um método')
    .transform((m) => [...new Set(m)]),
});
