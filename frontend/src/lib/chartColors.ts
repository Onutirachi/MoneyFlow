import type { PaymentMethod } from '@/types';

/**
 * Paleta única dos gráficos (CSS vars definidas em index.css, validadas para claro e escuro).
 * Slots categóricos em ordem fixa — nunca ciclar nem gerar cores novas.
 */
export const SERIES = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--series-4)'];

export const CHART = {
  grid: 'var(--chart-grid)',
  axis: 'var(--chart-axis)',
  muted: 'var(--chart-muted)',
  surface: 'var(--card)',
  pos: 'var(--diverging-pos)',
  neg: 'var(--diverging-neg)',
};

/** Entradas × saídas: identidade fixa em toda a aplicação. */
export const FLOW_COLORS = { income: SERIES[0]!, expense: SERIES[1]! };

/** Origem das saídas: parcelas, custos fixos e gastos avulsos. */
export const ORIGIN_COLORS = {
  installments: SERIES[0]!,
  recurring: SERIES[1]!,
  other: SERIES[2]!,
};

/** A cor segue o método (entidade), nunca a posição no ranking. */
export const METHOD_COLORS: Record<PaymentMethod, string> = {
  DINHEIRO: SERIES[2]!,
  PIX: SERIES[0]!,
  CREDITO: SERIES[1]!,
  DEBITO: SERIES[3]!,
};
