import { conflict, notFound } from '../errors.js';
import { execute, must, one, query } from '../db/pool.js';
import { currentMonth, todayISO } from '../utils/date.js';
import { ensureMaterialized } from './recurring.service.js';
import type { Account, PaymentMethod } from '../types.js';

type AccountRow = {
  id: string;
  name: string;
  color: string;
  initial_balance: number;
  methods: PaymentMethod[];
  balance: number;
};

// saldo = saldo inicial + entradas - saídas com data <= hoje
const SELECT_WITH_BALANCE = `
  SELECT a.id, a.name, a.color, a.initial_balance, a.methods,
         (a.initial_balance + COALESCE(
            SUM(CASE m.type WHEN 'ENTRADA' THEN m.amount ELSE -m.amount END)
              FILTER (WHERE m.date <= $2::date), 0))::bigint AS balance
    FROM accounts a
    LEFT JOIN movements m ON m.account_id = a.id
   WHERE a.user_id = $1`;

const toAccount = (r: AccountRow): Account => ({
  id: r.id,
  name: r.name,
  color: r.color,
  initialBalance: r.initial_balance,
  methods: r.methods,
  balance: r.balance,
});

export async function list(userId: string): Promise<Account[]> {
  await ensureMaterialized(userId, currentMonth()); // saldo precisa dos custos fixos já gerados
  const rows = await query<AccountRow>(`${SELECT_WITH_BALANCE} GROUP BY a.id ORDER BY a.name`, [
    userId,
    todayISO(),
  ]);
  return rows.map(toAccount);
}

async function get(userId: string, id: string): Promise<Account> {
  await ensureMaterialized(userId, currentMonth());
  const row = one(
    await query<AccountRow>(`${SELECT_WITH_BALANCE} AND a.id = $3 GROUP BY a.id`, [
      userId,
      todayISO(),
      id,
    ]),
  );
  if (!row) throw notFound('Conta não encontrada');
  return toAccount(row);
}

interface AccountInput {
  name: string;
  color: string;
  initialBalance: number;
  methods: PaymentMethod[];
}

export async function create(userId: string, input: AccountInput): Promise<Account> {
  const row = must(
    await query<{ id: string }>(
      `INSERT INTO accounts (user_id, name, color, initial_balance, methods)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [userId, input.name, input.color, input.initialBalance, input.methods],
    ),
  );
  return get(userId, row.id);
}

export async function update(userId: string, id: string, input: AccountInput): Promise<Account> {
  const n = await execute(
    `UPDATE accounts SET name = $3, color = $4, initial_balance = $5, methods = $6
      WHERE id = $1 AND user_id = $2`,
    [id, userId, input.name, input.color, input.initialBalance, input.methods],
  );
  if (n === 0) throw notFound('Conta não encontrada');
  return get(userId, id);
}

export async function remove(userId: string, id: string): Promise<void> {
  await get(userId, id); // 404 se não for do usuário
  const used = await query(
    `SELECT 1 FROM movements WHERE account_id = $1
     UNION ALL SELECT 1 FROM recurring_costs WHERE account_id = $1 LIMIT 1`,
    [id],
  );
  if (used.length > 0) {
    throw conflict('ACCOUNT_IN_USE', 'Conta possui movimentos ou custos fixos');
  }
  await execute('DELETE FROM accounts WHERE id = $1 AND user_id = $2', [id, userId]);
}

export { get as getAccount };
