/**
 * Ticks "redondos" para eixos em centavos (0 / R$ 1 mil / R$ 2 mil ...), sempre incluindo o zero.
 * Uso: const t = niceTicks(values); <YAxis ticks={t} domain={[t[0], t.at(-1)]} />
 */
export function niceTicks(values: number[], count = 5): number[] {
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const span = max - min || 100_00;
  const raw = span / (count - 1);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v));
  return ticks;
}
