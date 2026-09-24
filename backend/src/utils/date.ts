// Utilitários de data. Datas: 'YYYY-MM-DD'; meses: 'YYYY-MM'. Sem fuso: tudo é data local.

const pad = (n: number) => String(n).padStart(2, '0');

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const currentMonth = (): string => todayISO().slice(0, 7);

export const monthOf = (date: string): string => date.slice(0, 7);

function parseMonth(month: string): [number, number] {
  const [y, m] = month.split('-').map(Number);
  return [y!, m!];
}

export function addMonths(month: string, n: number): string {
  const [y, m] = parseMonth(month);
  const index = y * 12 + (m - 1) + n;
  return `${Math.floor(index / 12)}-${pad((index % 12) + 1)}`;
}

export function daysInMonth(month: string): number {
  const [y, m] = parseMonth(month);
  return new Date(y, m, 0).getDate();
}

/** Data no mês com o dia limitado ao último dia do mês (31 em fevereiro → 28/29). */
export function dateInMonth(month: string, day: number): string {
  return `${month}-${pad(Math.min(day, daysInMonth(month)))}`;
}

/** Soma meses a uma data preservando o dia original quando possível. */
export function addMonthsToDate(date: string, n: number): string {
  const day = Number(date.slice(8, 10));
  return dateInMonth(addMonths(monthOf(date), n), day);
}

/** Lista inclusiva de meses entre `from` e `to`. */
export function monthRange(from: string, to: string): string[] {
  const months: string[] = [];
  for (let m = from; m <= to; m = addMonths(m, 1)) months.push(m);
  return months;
}

export function isValidDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const day = Number(date.slice(8, 10));
  const month = Number(date.slice(5, 7));
  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(date.slice(0, 7));
}
