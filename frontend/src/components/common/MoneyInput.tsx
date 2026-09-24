import type { ComponentProps } from 'react';
import { Input } from '@/components/ui/input';

const format = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type Props = Omit<ComponentProps<typeof Input>, 'value' | 'onChange' | 'type'> & {
  /** centavos */
  value: number;
  onChange: (cents: number) => void;
  /** permite valores negativos (ex.: saldo inicial) */
  allowNegative?: boolean;
};

/**
 * Campo monetário estilo "caixa registradora": o usuário digita só números e o valor
 * preenche da direita para a esquerda (1 → 0,01; 1234 → 12,34). Entrega centavos (ADR 0002).
 */
export function MoneyInput({ value, onChange, allowNegative, ...props }: Props) {
  const negative = value < 0;

  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
        R$
      </span>
      <Input
        {...props}
        inputMode="numeric"
        className="pl-9 text-right tabular-nums"
        value={`${negative ? '-' : ''}${format(Math.abs(value))}`}
        onChange={(e) => {
          const raw = e.target.value;
          const digits = raw.replace(/\D/g, '').slice(0, 13);
          const cents = Number(digits || '0');
          const isNegative = allowNegative && raw.includes('-');
          onChange(isNegative ? -cents : cents);
        }}
      />
    </div>
  );
}
