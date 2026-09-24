/**
 * Mesma regra de backend/src/utils/money.ts: parcelas inteiras em centavos, sobra na 1ª.
 * Usada só para a prévia no formulário — quem gera as parcelas de verdade é o backend.
 */
export function splitInstallments(total: number, n: number): number[] {
  if (n < 1 || total <= 0) return [];
  const base = Math.floor(total / n);
  const remainder = total - base * n;
  return Array.from({ length: n }, (_, i) => (i === 0 ? base + remainder : base));
}
