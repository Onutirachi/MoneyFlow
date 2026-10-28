import { query, must, type Db } from './pool.js';
import type { Movement, MovementType, PaymentMethod } from '../types.js';

export interface MovementRow {
  id: string;
  type: MovementType;
  description: string;
  amount: number;
  date: string;
  account_id: string;
  method: PaymentMethod;
  category_id: string;
  installment_group_id: string | null;
  installment_number: number | null;
  installment_total: number | null;
  recurring_id: string | null;
  created_at: Date;
}

export const MOVEMENT_COLS =
  'id, type, description, amount, date, account_id, method, category_id, installment_group_id, installment_number, installment_total, recurring_id, created_at';

export function toMovement(r: MovementRow): Movement {
  return {
    id: r.id,
    type: r.type,
    description: r.description,
    amount: r.amount,
    date: r.date,
    accountId: r.account_id,
    method: r.method,
    categoryId: r.category_id,
    installmentGroupId: r.installment_group_id,
    installmentNumber: r.installment_number,
    installmentTotal: r.installment_total,
    recurringId: r.recurring_id,
    createdAt: r.created_at.toISOString(),
  };
}

export interface NewMovement {
  userId: string;
  type: MovementType;
  description: string;
  amount: number;
  date: string;
  accountId: string;
  method: PaymentMethod;
  categoryId: string;
  installmentGroupId?: string;
  installmentNumber?: number;
  installmentTotal?: number;
  recurringId?: string;
}

export async function insertMovement(db: Db, m: NewMovement): Promise<Movement> {
  const rows = await query<MovementRow>(
    `INSERT INTO movements
       (user_id, type, description, amount, date, account_id, method, category_id,
        installment_group_id, installment_number, installment_total, recurring_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING ${MOVEMENT_COLS}`,
    [
      m.userId,
      m.type,
      m.description,
      m.amount,
      m.date,
      m.accountId,
      m.method,
      m.categoryId,
      m.installmentGroupId ?? null,
      m.installmentNumber ?? null,
      m.installmentTotal ?? null,
      m.recurringId ?? null,
    ],
    db,
  );
  return toMovement(must(rows));
}
