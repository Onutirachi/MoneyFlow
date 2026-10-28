import type { PoolClient } from 'pg';
import { notFound } from '../errors.js';
import { execute, must, one, query, withTx, type Db } from '../db/pool.js';
import { insertMovement } from '../db/movements.js';
import { dateInMonth, monthRange, todayISO } from '../utils/date.js';
import { assertRefs } from './refs.js';
import type { MovementType, PaymentMethod, RecurringCost } from '../types.js';

type RecurringRow = {
  id: string;
  description: string;
  amount: number;
  type: MovementType;
  account_id: string;
  method: PaymentMethod;
  category_id: string;
  day_of_month: number;
  start_month: string;
  end_month: string | null;
  active: boolean;
  materialized_months: string[];
};

const COLS =
  'id, description, amount, type, account_id, method, category_id, day_of_month, start_month, end_month, active, materialized_months';

const toRecurring = (r: RecurringRow): RecurringCost => ({
  id: r.id,
  description: r.description,
  amount: r.amount,
  type: r.type,
  accountId: r.account_id,
  method: r.method,
  categoryId: r.category_id,
  dayOfMonth: r.day_of_month,
  startMonth: r.start_month,
  endMonth: r.end_month,
  active: r.active,
  materializedMonths: r.materialized_months,
});

/**
 * Materialização preguiçosa e idempotente: gera os movimentos reais dos custos fixos
 * ativos, de start_month até `targetMonth`, pulando meses já em materialized_months.
 */
export async function materialize(
  userId: string,
  targetMonth: string,
  db: PoolClient,
  recurringId?: string,
): Promise<void> {
  const rows = await query<RecurringRow>(
    `SELECT ${COLS} FROM recurring_costs
      WHERE user_id = $1 AND active AND start_month <= $2
        AND ($3::uuid IS NULL OR id = $3)
      ORDER BY id
      FOR UPDATE`,
    [userId, targetMonth, recurringId ?? null],
    db,
  );
  for (const r of rows) {
    const last = r.end_month !== null && r.end_month < targetMonth ? r.end_month : targetMonth;
    const done = new Set(r.materialized_months);
    const pending = monthRange(r.start_month, last).filter((m) => !done.has(m));
    if (pending.length === 0) continue;
    for (const month of pending) {
      await insertMovement(db, {
        userId,
        type: r.type,
        description: r.description,
        amount: r.amount,
        date: dateInMonth(month, r.day_of_month),
        accountId: r.account_id,
        method: r.method,
        categoryId: r.category_id,
        recurringId: r.id,
      });
    }
    await execute(
      'UPDATE recurring_costs SET materialized_months = $2 WHERE id = $1',
      [r.id, [...r.materialized_months, ...pending].sort()],
      db,
    );
  }
}

export async function ensureMaterialized(userId: string, targetMonth: string): Promise<void> {
  await withTx((c) => materialize(userId, targetMonth, c));
}

export async function list(userId: string): Promise<RecurringCost[]> {
  const rows = await query<RecurringRow>(
    `SELECT ${COLS} FROM recurring_costs WHERE user_id = $1 ORDER BY day_of_month, description`,
    [userId],
  );
  return rows.map(toRecurring);
}

export interface RecurringInput {
  description: string;
  amount: number;
  type: MovementType;
  accountId: string;
  method: PaymentMethod;
  categoryId: string;
  dayOfMonth: number;
  startMonth: string;
  endMonth: string | null;
  active: boolean;
}

export async function create(userId: string, input: RecurringInput): Promise<RecurringCost> {
  await assertRefs(userId, input);
  const row = must(
    await query<RecurringRow>(
      `INSERT INTO recurring_costs
         (user_id, description, amount, type, account_id, method, category_id,
          day_of_month, start_month, end_month, active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING ${COLS}`,
      [
        userId,
        input.description,
        input.amount,
        input.type,
        input.accountId,
        input.method,
        input.categoryId,
        input.dayOfMonth,
        input.startMonth,
        input.endMonth,
        input.active,
      ],
    ),
  );
  return toRecurring(row);
}

async function lockOwn(db: Db, userId: string, id: string): Promise<RecurringRow> {
  const row = one(
    await query<RecurringRow>(
      `SELECT ${COLS} FROM recurring_costs WHERE id = $1 AND user_id = $2 FOR UPDATE`,
      [id, userId],
      db,
    ),
  );
  if (!row) throw notFound('Custo fixo não encontrado');
  return row;
}

/** Edição vale daqui pra frente: descarta ocorrências futuras e regenera se continuar ativo. */
export async function update(
  userId: string,
  id: string,
  input: RecurringInput,
): Promise<RecurringCost> {
  await assertRefs(userId, input);
  return withTx(async (c) => {
    const current = await lockOwn(c, userId, id);
    const today = todayISO();

    // ADR 0006: ocorrências futuras saem e seus meses são liberados para regenerar;
    // meses com data até hoje continuam marcados (mesmo se a ocorrência foi excluída à mão).
    await execute(
      'DELETE FROM movements WHERE recurring_id = $1 AND date > $2::date',
      [id, today],
      c,
    );
    const stillDone = current.materialized_months.filter(
      (month) => dateInMonth(month, current.day_of_month) <= today,
    );

    await execute(
      `UPDATE recurring_costs
          SET description = $2, amount = $3, type = $4, account_id = $5, method = $6,
              category_id = $7, day_of_month = $8, start_month = $9, end_month = $10,
              active = $11, materialized_months = $12
        WHERE id = $1`,
      [
        id,
        input.description,
        input.amount,
        input.type,
        input.accountId,
        input.method,
        input.categoryId,
        input.dayOfMonth,
        input.startMonth,
        input.endMonth,
        input.active,
        stillDone,
      ],
      c,
    );

    const farthest = [...current.materialized_months].sort().at(-1);
    if (input.active && farthest) await materialize(userId, farthest, c, id);

    return toRecurring(
      must(await query<RecurringRow>(`SELECT ${COLS} FROM recurring_costs WHERE id = $1`, [id], c)),
    );
  });
}

export async function remove(userId: string, id: string): Promise<void> {
  await withTx(async (c) => {
    await lockOwn(c, userId, id);
    await execute(
      'DELETE FROM movements WHERE recurring_id = $1 AND date > $2::date',
      [id, todayISO()],
      c,
    );
    // as ocorrências passadas ficam com recurring_id = NULL (ON DELETE SET NULL)
    await execute('DELETE FROM recurring_costs WHERE id = $1', [id], c);
  });
}
