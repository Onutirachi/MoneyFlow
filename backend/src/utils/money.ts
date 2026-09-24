/**
 * Divide um total (centavos) em `n` parcelas inteiras. A sobra vai para a 1ª parcela,
 * garantindo que a soma seja exatamente o total (ADR 0002, ADR 0005).
 */
export function splitInstallments(total: number, n: number): number[] {
  const base = Math.floor(total / n);
  const remainder = total - base * n;
  return Array.from({ length: n }, (_, i) => (i === 0 ? base + remainder : base));
}

export const sum = (values: number[]): number => values.reduce((acc, v) => acc + v, 0);
