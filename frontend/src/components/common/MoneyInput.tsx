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

const MAX_CENTS = 100_000_000_000; // R$ 1 bilhão, mesmo limite da API

/**
 * Campo monetário estilo "caixa registradora": o usuário digita só números e o valor
 * preenche da direita para a esquerda (1 → 0,01; 1234 → 12,34). Entrega centavos (ADR 0002).
 * Dígitos e Backspace sempre agem no final do número, não importa onde está o cursor.
 */
export function MoneyInput({ value, onChange, allowNegative, ...props }: Props) {
  const negative = value < 0;
  const abs = Math.abs(value);
  const sign = (cents: number) => (negative ? -cents : cents);

  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
        R$
      </span>
      <Input
        {...props}
        inputMode="numeric"
        className="pl-9 text-right tabular-nums"
        value={`${negative ? '-' : ''}${format(abs)}`}
        onFocus={(e) => {
          const el = e.currentTarget;
          requestAnimationFrame(() => el.setSelectionRange(el.value.length, el.value.length));
          props.onFocus?.(e);
        }}
        onKeyDown={(e) => {
          props.onKeyDown?.(e);
          if (e.ctrlKey || e.metaKey || e.altKey) return;
          if (/^\d$/.test(e.key)) {
            e.preventDefault();
            const next = abs * 10 + Number(e.key);
            if (next <= MAX_CENTS) onChange(sign(next));
          } else if (e.key === 'Backspace' || e.key === 'Delete') {
            e.preventDefault();
            onChange(sign(Math.floor(abs / 10)));
          } else if (e.key === '-' && allowNegative) {
            e.preventDefault();
            onChange(-value);
          }
        }}
        // fallback para colar e teclados virtuais que não emitem keydown com a tecla
        onChange={(e) => {
          const raw = e.target.value;
          const digits = raw.replace(/\D/g, '').slice(0, 12);
          const cents = Math.min(Number(digits || '0'), MAX_CENTS);
          const isNegative = allowNegative && raw.includes('-');
          onChange(isNegative ? -cents : cents);
        }}
      />
    </div>
  );
}
