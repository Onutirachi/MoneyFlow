import { randomUUID } from 'node:crypto';
import { notFound } from '../errors.js';
import { execute, one, query, withTx } from '../db/pool.js';
import { insertMovement, MOVEMENT_COLS, toMovement, type MovementRow } from '../db/movements.js';
import { addMonths, addMonthsToDate, monthStart } from '../utils/date.js';
import { splitInstallments } from '../utils/money.js';
import { assertRefs } from './refs.js';
import { ensureMaterialized } from './recurring.service.js';
import type { Movement, MovementType, PaymentMethod } from '../types.js';

const INSTALLMENT_SUFFIX = /\s+\d+\/\d+$/;

/** "Notebook" ou "Notebook 3/10" → "Notebook i/n" (o front envia a descrição atual da parcela). */
export const installmentDescription = (base: string, i: number, n: number): string =>
  `${base.replace(INSTALLMENT_SUFFIX, '')} ${i}/${n}`;

export interface ListFilters {
  month: string;
  accountId?: string | undefined;
  type?: MovementType | undefined;
  categoryId?: string | undefined;
  method?: PaymentMethod | undefined;
}

export async function list(userId: string, f: ListFilters): Promise<Movement[]> {
  await ensureMaterialized(userId, f.month);

  const params: unknown[] = [userId, monthStart(f.month), monthStart(addMonths(f.month, 1))];
  const where = ['user_id = $1', 'date >= $2::date', 'date < $3::date'];
  const add = (column: string, value: string | undefined) => {
    if (value === undefined) return;
    params.push(value);
    where.push(`${column} = $${params.length}`);
  };
  add('account_id', f.accountId);
  add('type', f.type);
  add('category_id', f.categoryId);
  add('method', f.method);

  const rows = await query<MovementRow>(
    `SELECT ${MOVEMENT_COLS} FROM movements WHERE ${where.join(' AND ')}
      ORDER BY date DESC, created_at DESC, installment_number`,
    params,
  );
  return rows.map(toMovement);
}

export interface CreateInput {
  type: MovementType;
  description: string;
  amount: number;
  date: string;
  accountId: string;
  method: PaymentMethod;
  categoryId: string;
  installments?: number | undefined;
}

export async function create(userId: string, input: CreateInput): Promise<Movement[]> {
  await assertRefs(userId, input);
  const base = {
    userId,
    type: input.type,
    accountId: input.accountId,
    method: input.method,
    categoryId: input.categoryId,
  };

  return withTx(async (c) => {
    const n = input.installments;
    if (!n) {
      return [
        await insertMovement(c, {
          ...base,
          description: input.description,
          amount: input.amount,
          date: input.date,
        }),
      ];
    }
    const groupId = randomUUID();
    const amounts = splitInstallments(input.amount, n);
    const out: Movement[] = [];
    for (let i = 0; i < n; i++) {
      out.push(
        await insertMovement(c, {
          ...base,
          description: installmentDescription(input.description, i + 1, n),
          amount: amounts[i] ?? 0,
          date: addMonthsToDate(input.date, i),
          installmentGroupId: groupId,
          installmentNumber: i + 1,
          installmentTotal: n,
        }),
      );
    }
    return out;
  });
}

export interface UpdateInput {
  description: string;
  amount: number;
  date: string;
  accountId: string;
  method: PaymentMethod;
  categoryId: string;
}

async function findOwn(userId: string, id: string): Promise<MovementRow> {
  const row = one(
    await query<MovementRow>(
      `SELECT ${MOVEMENT_COLS} FROM movements WHERE id = $1 AND user_id = $2`,
      [id, userId],
    ),
  );
  if (!row) throw notFound('Movimento não encontrado');
  return row;
}

export async function update(
  userId: string,
  id: string,
  scope: 'one' | 'group',
  input: UpdateInput,
): Promise<Movement[]> {
  const current = await findOwn(userId, id);
  await assertRefs(userId, { ...input, type: current.type });

  if (scope === 'group' && current.installment_group_id) {
    // valor e data são ignorados; o sufixo i/n é reaplicado sobre a descrição base
    const base = input.description.replace(INSTALLMENT_SUFFIX, '');
    const rows = await query<MovementRow>(
      `UPDATE movements
          SET description = $3::text || ' ' || installment_number || '/' || installment_total,
              account_id = $4, method = $5, category_id = $6
        WHERE installment_group_id = $1 AND user_id = $2
        RETURNING ${MOVEMENT_COLS}`,
      [current.installment_group_id, userId, base, input.accountId, input.method, input.categoryId],
    );
    return rows
      .sort((a, b) => (a.installment_number ?? 0) - (b.installment_number ?? 0))
      .map(toMovement);
  }

  const rows = await query<MovementRow>(
    `UPDATE movements
        SET description = $3, amount = $4, date = $5, account_id = $6, method = $7, category_id = $8
      WHERE id = $1 AND user_id = $2
      RETURNING ${MOVEMENT_COLS}`,
    [
      id,
      userId,
      input.description,
      input.amount,
      input.date,
      input.accountId,
      input.method,
      input.categoryId,
    ],
  );
  return rows.map(toMovement);
}

export async function remove(userId: string, id: string, scope: 'one' | 'group'): Promise<void> {
  const current = await findOwn(userId, id);
  if (scope === 'group' && current.installment_group_id) {
    await execute('DELETE FROM movements WHERE installment_group_id = $1 AND user_id = $2', [
      current.installment_group_id,
      userId,
    ]);
    return;
  }
  await execute('DELETE FROM movements WHERE id = $1 AND user_id = $2', [id, userId]);
}
