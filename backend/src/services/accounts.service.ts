import { randomUUID } from 'node:crypto';
import { db } from '../db/jsonDb.js';
import { badRequest, conflict, notFound } from '../errors.js';
import type { AccountInput } from '../schemas/account.schema.js';
import type { Account, Movement, PaymentMethod } from '../types.js';
import { todayISO } from '../utils/date.js';

export type AccountWithBalance = Omit<Account, 'userId'> & { balance: number };

export const signedAmount = (m: Movement): number => (m.type === 'ENTRADA' ? m.amount : -m.amount);

/** Saldo até hoje: movimentos futuros (previstos) não entram. */
export function computeBalance(account: Account, today = todayISO()): number {
  return db.data.movements
    .filter((m) => m.accountId === account.id && m.date <= today)
    .reduce((acc, m) => acc + signedAmount(m), account.initialBalance);
}

function present(account: Account): AccountWithBalance {
  const { userId: _userId, ...rest } = account;
  return { ...rest, balance: computeBalance(account) };
}

export function getOwnedAccount(userId: string, id: string): Account {
  const account = db.data.accounts.find((a) => a.id === id && a.userId === userId);
  if (!account) throw notFound('Conta');
  return account;
}

export function assertMethodAllowed(account: Account, method: PaymentMethod): void {
  if (!account.methods.includes(method)) {
    throw badRequest(
      'METHOD_NOT_ALLOWED',
      `O método ${method} não está cadastrado na conta "${account.name}"`,
    );
  }
}

export function list(userId: string): AccountWithBalance[] {
  return db.data.accounts
    .filter((a) => a.userId === userId)
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    .map(present);
}

export function create(userId: string, input: AccountInput): AccountWithBalance {
  const account: Account = {
    id: randomUUID(),
    userId,
    ...input,
    createdAt: new Date().toISOString(),
  };
  db.data.accounts.push(account);
  db.save();
  return present(account);
}

export function update(userId: string, id: string, input: AccountInput): AccountWithBalance {
  const account = getOwnedAccount(userId, id);
  Object.assign(account, input);
  db.save();
  return present(account);
}

export function remove(userId: string, id: string): void {
  const account = getOwnedAccount(userId, id);
  const { data } = db;
  const inUse =
    data.movements.some((m) => m.accountId === id) ||
    data.recurring.some((r) => r.accountId === id);
  if (inUse) {
    throw conflict('ACCOUNT_IN_USE', 'Conta possui movimentos ou custos fixos vinculados');
  }
  data.accounts = data.accounts.filter((a) => a !== account);
  db.save();
}
