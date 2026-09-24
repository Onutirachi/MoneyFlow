import { randomUUID } from 'node:crypto';
import { db } from '../db/jsonDb.js';
import { notFound } from '../errors.js';
import type { RecurringInput } from '../schemas/recurring.schema.js';
import type { Movement, RecurringCost } from '../types.js';
import { dateInMonth, monthRange, todayISO } from '../utils/date.js';
import { validateRefs } from './refs.js';

export type PublicRecurring = Omit<RecurringCost, 'userId'>;

function present(recurring: RecurringCost): PublicRecurring {
  const { userId: _userId, ...rest } = recurring;
  return rest;
}

function getOwnedRecurring(userId: string, id: string): RecurringCost {
  const recurring = db.data.recurring.find((r) => r.id === id && r.userId === userId);
  if (!recurring) throw notFound('Custo fixo');
  return recurring;
}

/**
 * Gera os movimentos de cada custo fixo ativo do usuário, do `startMonth` até `untilMonth`
 * (limitado por `endMonth`). Idempotente: meses em `materializedMonths` nunca são gerados
 * de novo, nem se a ocorrência tiver sido excluída (ADR 0004).
 */
export function ensureMaterialized(userId: string, untilMonth: string): void {
  const { data } = db;
  const createdAt = new Date().toISOString();
  let changed = false;

  for (const r of data.recurring) {
    if (r.userId !== userId || !r.active) continue;
    const last = r.endMonth && r.endMonth < untilMonth ? r.endMonth : untilMonth;
    if (last < r.startMonth) continue;

    const done = new Set(r.materializedMonths);
    for (const month of monthRange(r.startMonth, last)) {
      if (done.has(month)) continue;
      const movement: Movement = {
        id: randomUUID(),
        userId,
        type: r.type,
        description: r.description,
        amount: r.amount,
        date: dateInMonth(month, r.dayOfMonth),
        accountId: r.accountId,
        method: r.method,
        categoryId: r.categoryId,
        installmentGroupId: null,
        installmentNumber: null,
        installmentTotal: null,
        recurringId: r.id,
        createdAt,
      };
      data.movements.push(movement);
      r.materializedMonths.push(month);
      changed = true;
    }
  }

  if (changed) db.save();
}

export function list(userId: string): PublicRecurring[] {
  return db.data.recurring
    .filter((r) => r.userId === userId)
    .sort((a, b) => a.dayOfMonth - b.dayOfMonth || a.description.localeCompare(b.description))
    .map(present);
}

export function create(userId: string, input: RecurringInput): PublicRecurring {
  validateRefs(userId, input);
  const recurring: RecurringCost = {
    id: randomUUID(),
    userId,
    ...input,
    materializedMonths: [],
    createdAt: new Date().toISOString(),
  };
  db.data.recurring.push(recurring);
  db.save();
  return present(recurring);
}

/**
 * Descarta as ocorrências futuras (data > hoje) já geradas, liberando esses meses para serem
 * regenerados com os dados atuais. Passado e hoje ficam intactos (ADR 0006).
 */
function dropFutureOccurrences(recurring: RecurringCost, today = todayISO()): void {
  const { data } = db;
  data.movements = data.movements.filter(
    (m) => !(m.recurringId === recurring.id && m.date > today),
  );
  recurring.materializedMonths = recurring.materializedMonths.filter(
    (month) => dateInMonth(month, recurring.dayOfMonth) <= today,
  );
}

/** Edição vale para o futuro: ocorrências futuras são regeneradas; as passadas ficam como estão. */
export function update(userId: string, id: string, input: RecurringInput): PublicRecurring {
  const recurring = getOwnedRecurring(userId, id);
  validateRefs(userId, input);
  dropFutureOccurrences(recurring);
  Object.assign(recurring, input);
  db.save();
  return present(recurring);
}

/** Exclui o custo fixo: ocorrências futuras somem; as passadas permanecem, desvinculadas. */
export function remove(userId: string, id: string): void {
  const recurring = getOwnedRecurring(userId, id);
  dropFutureOccurrences(recurring);
  const { data } = db;
  for (const m of data.movements) {
    if (m.recurringId === id) m.recurringId = null;
  }
  data.recurring = data.recurring.filter((r) => r !== recurring);
  db.save();
}
