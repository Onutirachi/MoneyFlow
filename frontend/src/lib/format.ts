import type { MovementType, PaymentMethod } from '@/types';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const brlCompact = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** 12990 → "R$ 129,90" */
export const formatBRL = (cents: number): string => brl.format(cents / 100);

/** 1250000 → "R$ 12,5 mil" (eixos de gráficos) */
export const formatBRLCompact = (cents: number): string => brlCompact.format(cents / 100);

/** "2026-09-23" → "23/09/2026" */
export const formatDate = (date: string): string => {
  const [y, m, d] = date.split('-');
  return `${d}/${m}/${y}`;
};

/** "2026-09-23" → "23 set" */
export const formatDayShort = (date: string): string => {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  return new Date(y, m - 1, d)
    .toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    .replace('.', '');
};

const monthDate = (month: string) => {
  const [y, m] = month.split('-').map(Number) as [number, number];
  return new Date(y, m - 1, 1);
};

/** "2026-09" → "Setembro de 2026" */
export const formatMonth = (month: string): string => {
  const s = monthDate(month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/** "2026-09" → "set/26" */
export const formatMonthShort = (month: string): string =>
  monthDate(month)
    .toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
    .replace('.', '')
    .replace(' de ', '/');

/** 12.345 → "+12,3%" */
export const formatPercent = (value: number): string =>
  `${value > 0 ? '+' : ''}${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;

export const METHOD_LABELS: Record<PaymentMethod, string> = {
  DINHEIRO: 'Dinheiro',
  PIX: 'PIX',
  CREDITO: 'Crédito',
  DEBITO: 'Débito',
};

export const TYPE_LABELS: Record<MovementType, string> = {
  ENTRADA: 'Entrada',
  SAIDA: 'Saída',
};
