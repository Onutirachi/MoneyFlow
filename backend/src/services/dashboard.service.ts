import { db } from '../db/jsonDb.js';
import type { DashboardQuery } from '../schemas/dashboard.schema.js';
import type { Movement, MovementType, PaymentMethod } from '../types.js';
import { addMonths, monthOf, monthRange } from '../utils/date.js';
import { computeBalance, getOwnedAccount } from './accounts.service.js';
import { ensureMaterialized } from './recurring.service.js';

/** Quantos meses à frente entram em "compromissos futuros". */
const UPCOMING_MONTHS = 3;
const HISTORY_MONTHS = 12;

interface Totals {
  income: number;
  expense: number;
  result: number;
}

interface Composition {
  installments: number;
  recurring: number;
  other: number;
}

export interface Dashboard {
  month: string;
  summary: Totals & {
    previous: Totals;
    variation: { income: number | null; expense: number | null; result: number | null };
  };
  totalBalance: number;
  accounts: { id: string; name: string; color: string; balance: number }[];
  expenseByCategory: { categoryId: string; name: string; color: string; total: number }[];
  incomeByCategory: { categoryId: string; name: string; color: string; total: number }[];
  expenseByAccount: { accountId: string; name: string; color: string; total: number }[];
  expenseByMethod: { method: PaymentMethod; total: number }[];
  history: ({ month: string } & Totals)[];
  upcoming: ({ month: string } & Composition)[];
  upcomingTotal: number;
  composition: Composition;
}

function totalsOf(movements: Movement[]): Totals {
  let income = 0;
  let expense = 0;
  for (const m of movements) {
    if (m.type === 'ENTRADA') income += m.amount;
    else expense += m.amount;
  }
  return { income, expense, result: income - expense };
}

/** Variação percentual com 1 casa; null quando não há base de comparação. */
function variation(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;
}

function compositionOf(expenses: Movement[]): Composition {
  const c: Composition = { installments: 0, recurring: 0, other: 0 };
  for (const m of expenses) {
    if (m.installmentGroupId) c.installments += m.amount;
    else if (m.recurringId) c.recurring += m.amount;
    else c.other += m.amount;
  }
  return c;
}

function sumBy<K extends string>(movements: Movement[], key: (m: Movement) => K): Map<K, number> {
  const map = new Map<K, number>();
  for (const m of movements) map.set(key(m), (map.get(key(m)) ?? 0) + m.amount);
  return map;
}

const byTotalDesc = (a: { total: number }, b: { total: number }) => b.total - a.total;

export function get(userId: string, { month, accountId }: DashboardQuery): Dashboard {
  if (accountId) getOwnedAccount(userId, accountId);
  ensureMaterialized(userId, addMonths(month, UPCOMING_MONTHS));

  const { data } = db;
  const movements = data.movements.filter(
    (m) => m.userId === userId && (!accountId || m.accountId === accountId),
  );

  const byMonth = new Map<string, Movement[]>();
  for (const m of movements) {
    const key = monthOf(m.date);
    const bucket = byMonth.get(key);
    if (bucket) bucket.push(m);
    else byMonth.set(key, [m]);
  }
  const inMonth = (key: string) => byMonth.get(key) ?? [];

  const current = inMonth(month);
  const expenses = current.filter((m) => m.type === 'SAIDA');
  const totals = totalsOf(current);
  const previous = totalsOf(inMonth(addMonths(month, -1)));

  const accounts = data.accounts
    .filter((a) => a.userId === userId && (!accountId || a.id === accountId))
    .map((a) => ({ id: a.id, name: a.name, color: a.color, balance: computeBalance(a) }))
    .sort((a, b) => b.balance - a.balance);
  const accountById = new Map(data.accounts.map((a) => [a.id, a]));
  const categoryById = new Map(data.categories.map((c) => [c.id, c]));

  const byCategory = (type: MovementType) =>
    [
      ...sumBy(
        current.filter((m) => m.type === type),
        (m) => m.categoryId,
      ),
    ]
      .map(([categoryId, total]) => {
        const category = categoryById.get(categoryId);
        return {
          categoryId,
          name: category?.name ?? 'Sem categoria',
          color: category?.color ?? '#64748b',
          total,
        };
      })
      .sort(byTotalDesc);

  const upcoming = monthRange(addMonths(month, 1), addMonths(month, UPCOMING_MONTHS)).map((m) => ({
    month: m,
    ...compositionOf(inMonth(m).filter((mv) => mv.type === 'SAIDA')),
  }));

  return {
    month,
    summary: {
      ...totals,
      previous,
      variation: {
        income: variation(totals.income, previous.income),
        expense: variation(totals.expense, previous.expense),
        result: variation(totals.result, previous.result),
      },
    },
    totalBalance: accounts.reduce((acc, a) => acc + a.balance, 0),
    accounts,
    expenseByCategory: byCategory('SAIDA'),
    incomeByCategory: byCategory('ENTRADA'),
    expenseByAccount: [...sumBy(expenses, (m) => m.accountId)]
      .map(([id, total]) => ({
        accountId: id,
        name: accountById.get(id)?.name ?? 'Conta removida',
        color: accountById.get(id)?.color ?? '#64748b',
        total,
      }))
      .sort(byTotalDesc),
    expenseByMethod: [...sumBy(expenses, (m) => m.method)]
      .map(([method, total]) => ({ method, total }))
      .sort(byTotalDesc),
    history: monthRange(addMonths(month, -(HISTORY_MONTHS - 1)), month).map((m) => ({
      month: m,
      ...totalsOf(inMonth(m)),
    })),
    upcoming,
    upcomingTotal: upcoming.reduce((acc, u) => acc + u.installments + u.recurring + u.other, 0),
    composition: compositionOf(expenses),
  };
}
