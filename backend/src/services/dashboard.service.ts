import { query } from '../db/pool.js';
import { addMonths, monthRange, monthStart } from '../utils/date.js';
import { ensureMaterialized } from './recurring.service.js';
import * as accountsService from './accounts.service.js';
import type { Dashboard, MovementType } from '../types.js';

const pct = (cur: number, prev: number): number | null =>
  prev === 0 ? null : Math.round(((cur - prev) / Math.abs(prev)) * 1000) / 10;

const ZERO = { income: 0, expense: 0 };

type Origin = { month: string; installments: number; recurring: number; other: number };

export async function getDashboard(
  userId: string,
  input: { month: string; accountId?: string | undefined },
): Promise<Dashboard> {
  const { month } = input;
  const accountId = input.accountId ?? null;
  if (accountId) await accountsService.getAccount(userId, accountId); // 404 se não for do usuário

  await ensureMaterialized(userId, addMonths(month, 3));

  const from = monthStart(month);
  const to = monthStart(addMonths(month, 1));
  const firstHistory = addMonths(month, -11);
  const filter = `m.user_id = $1 AND ($2::uuid IS NULL OR m.account_id = $2)`;

  const byCategory = (type: MovementType) =>
    query<{ categoryId: string; name: string; color: string; total: number }>(
      `SELECT c.id AS "categoryId", c.name, c.color, SUM(m.amount)::bigint AS total
         FROM movements m JOIN categories c ON c.id = m.category_id
        WHERE ${filter} AND m.type = '${type}' AND m.date >= $3::date AND m.date < $4::date
        GROUP BY c.id ORDER BY total DESC`,
      [userId, accountId, from, to],
    );

  const [
    accounts,
    history,
    expenseByCategory,
    incomeByCategory,
    expenseByAccount,
    expenseByMethod,
    origin,
  ] = await Promise.all([
    accountsService.list(userId),
    query<{ month: string; income: number; expense: number }>(
      `SELECT to_char(m.date, 'YYYY-MM') AS month,
                COALESCE(SUM(m.amount) FILTER (WHERE m.type = 'ENTRADA'), 0)::bigint AS income,
                COALESCE(SUM(m.amount) FILTER (WHERE m.type = 'SAIDA'), 0)::bigint AS expense
           FROM movements m
          WHERE ${filter} AND m.date >= $3::date AND m.date < $4::date
          GROUP BY 1`,
      [userId, accountId, monthStart(firstHistory), to],
    ),
    byCategory('SAIDA'),
    byCategory('ENTRADA'),
    query<{ accountId: string; name: string; color: string; total: number }>(
      `SELECT a.id AS "accountId", a.name, a.color, SUM(m.amount)::bigint AS total
           FROM movements m JOIN accounts a ON a.id = m.account_id
          WHERE ${filter} AND m.type = 'SAIDA' AND m.date >= $3::date AND m.date < $4::date
          GROUP BY a.id ORDER BY total DESC`,
      [userId, accountId, from, to],
    ),
    query<{ method: Dashboard['expenseByMethod'][number]['method']; total: number }>(
      `SELECT m.method, SUM(m.amount)::bigint AS total
           FROM movements m
          WHERE ${filter} AND m.type = 'SAIDA' AND m.date >= $3::date AND m.date < $4::date
          GROUP BY m.method ORDER BY total DESC`,
      [userId, accountId, from, to],
    ),
    query<Origin>(
      `SELECT to_char(m.date, 'YYYY-MM') AS month,
                COALESCE(SUM(m.amount) FILTER (WHERE m.installment_group_id IS NOT NULL), 0)::bigint AS installments,
                COALESCE(SUM(m.amount) FILTER (WHERE m.recurring_id IS NOT NULL), 0)::bigint AS recurring,
                COALESCE(SUM(m.amount) FILTER (WHERE m.installment_group_id IS NULL AND m.recurring_id IS NULL), 0)::bigint AS other
           FROM movements m
          WHERE ${filter} AND m.type = 'SAIDA' AND m.date >= $3::date AND m.date < $4::date
          GROUP BY 1`,
      [userId, accountId, from, monthStart(addMonths(month, 4))],
    ),
  ]);

  const shown = (accountId ? accounts.filter((a) => a.id === accountId) : accounts).sort(
    (a, b) => b.balance - a.balance,
  );

  const byMonth = new Map(history.map((r) => [r.month, r]));
  const hist = monthRange(firstHistory, month).map((m) => {
    const { income, expense } = byMonth.get(m) ?? ZERO;
    return { month: m, income, expense, result: income - expense };
  });
  const cur = hist[hist.length - 1] ?? { month, ...ZERO, result: 0 };
  const prev = hist[hist.length - 2] ?? { month, ...ZERO, result: 0 };

  const originOf = (m: string): Origin =>
    origin.find((o) => o.month === m) ?? { month: m, installments: 0, recurring: 0, other: 0 };
  const upcoming = [1, 2, 3].map((i) => originOf(addMonths(month, i)));
  const { installments, recurring, other } = originOf(month);

  return {
    month,
    summary: {
      income: cur.income,
      expense: cur.expense,
      result: cur.result,
      previous: { income: prev.income, expense: prev.expense, result: prev.result },
      variation: {
        income: pct(cur.income, prev.income),
        expense: pct(cur.expense, prev.expense),
        result: pct(cur.result, prev.result),
      },
    },
    totalBalance: shown.reduce((sum, a) => sum + a.balance, 0),
    accounts: shown.map((a) => ({ id: a.id, name: a.name, color: a.color, balance: a.balance })),
    expenseByCategory,
    incomeByCategory,
    expenseByAccount,
    expenseByMethod,
    history: hist,
    upcoming,
    upcomingTotal: upcoming.reduce((sum, u) => sum + u.installments + u.recurring + u.other, 0),
    composition: { installments, recurring, other },
  };
}
