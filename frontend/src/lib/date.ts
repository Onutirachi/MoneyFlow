// Datas 'YYYY-MM-DD' e meses 'YYYY-MM', sem fuso (datas locais). Mesmo comportamento de backend/src/utils/date.ts.

const pad = (n: number) => String(n).padStart(2, '0');

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const currentMonth = (): string => todayISO().slice(0, 7);

export function addMonths(month: string, n: number): string {
  const [y, m] = month.split('-').map(Number) as [number, number];
  const index = y * 12 + (m - 1) + n;
  return `${Math.floor(index / 12)}-${pad((index % 12) + 1)}`;
}

export function daysInMonth(month: string): number {
  const [y, m] = month.split('-').map(Number) as [number, number];
  return new Date(y, m, 0).getDate();
}

export function addMonthsToDate(date: string, n: number): string {
  const day = Number(date.slice(8, 10));
  const month = addMonths(date.slice(0, 7), n);
  return `${month}-${pad(Math.min(day, daysInMonth(month)))}`;
}

export const isValidMonth = (value: string | null): value is string =>
  !!value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);

/** Data padrão para um novo lançamento no mês visualizado: hoje, se for o mês atual; senão dia 1. */
export const defaultDateForMonth = (month: string): string =>
  month === currentMonth() ? todayISO() : `${month}-01`;
