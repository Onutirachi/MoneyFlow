import { randomUUID } from 'node:crypto';
import { db } from '../db/jsonDb.js';
import { notFound } from '../errors.js';
import type {
  CreateMovementInput,
  ListMovementsQuery,
  MovementScope,
  UpdateMovementInput,
} from '../schemas/movement.schema.js';
import type { Movement, MovementType, PaymentMethod } from '../types.js';
import { addMonthsToDate, monthOf } from '../utils/date.js';
import { splitInstallments } from '../utils/money.js';
import { assertMethodAllowed, getOwnedAccount } from './accounts.service.js';
import { assertCategoryType, getOwnedCategory } from './categories.service.js';

export type PublicMovement = Omit<Movement, 'userId'>;

export function present(movement: Movement): PublicMovement {
  const { userId: _userId, ...rest } = movement;
  return rest;
}

/** Garante que conta, método e categoria são válidos e do usuário. */
export function validateRefs(
  userId: string,
  refs: { type: MovementType; accountId: string; method: PaymentMethod; categoryId: string },
): void {
  const account = getOwnedAccount(userId, refs.accountId);
  assertMethodAllowed(account, refs.method);
  assertCategoryType(getOwnedCategory(userId, refs.categoryId), refs.type);
}

const INSTALLMENT_SUFFIX = /\s+\d+\/\d+$/;

export const installmentDescription = (base: string, n: number, total: number) =>
  `${base.replace(INSTALLMENT_SUFFIX, '')} ${n}/${total}`;

function getOwnedMovement(userId: string, id: string): Movement {
  const movement = db.data.movements.find((m) => m.id === id && m.userId === userId);
  if (!movement) throw notFound('Movimento');
  return movement;
}

function groupOf(userId: string, movement: Movement, scope: MovementScope): Movement[] {
  if (scope === 'one' || !movement.installmentGroupId) return [movement];
  return db.data.movements.filter(
    (m) => m.userId === userId && m.installmentGroupId === movement.installmentGroupId,
  );
}

export function list(userId: string, query: ListMovementsQuery): PublicMovement[] {
  return db.data.movements
    .filter(
      (m) =>
        m.userId === userId &&
        monthOf(m.date) === query.month &&
        (!query.accountId || m.accountId === query.accountId) &&
        (!query.type || m.type === query.type) &&
        (!query.categoryId || m.categoryId === query.categoryId) &&
        (!query.method || m.method === query.method),
    )
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    .map(present);
}

export function create(userId: string, input: CreateMovementInput): PublicMovement[] {
  validateRefs(userId, input);
  const { installments, ...fields } = input;
  const createdAt = new Date().toISOString();

  const base: Omit<Movement, 'id' | 'amount' | 'date' | 'description'> = {
    userId,
    type: fields.type,
    accountId: fields.accountId,
    method: fields.method,
    categoryId: fields.categoryId,
    installmentGroupId: null,
    installmentNumber: null,
    installmentTotal: null,
    recurringId: null,
    createdAt,
  };

  let movements: Movement[];
  if (installments) {
    const groupId = randomUUID();
    movements = splitInstallments(fields.amount, installments).map((amount, i) => ({
      ...base,
      id: randomUUID(),
      description: installmentDescription(fields.description, i + 1, installments),
      amount,
      date: addMonthsToDate(fields.date, i),
      installmentGroupId: groupId,
      installmentNumber: i + 1,
      installmentTotal: installments,
    }));
  } else {
    movements = [
      {
        ...base,
        id: randomUUID(),
        description: fields.description,
        amount: fields.amount,
        date: fields.date,
      },
    ];
  }

  db.data.movements.push(...movements);
  db.save();
  return movements.map(present);
}

export function update(
  userId: string,
  id: string,
  input: UpdateMovementInput,
  scope: MovementScope,
): PublicMovement[] {
  const movement = getOwnedMovement(userId, id);
  validateRefs(userId, { ...input, type: movement.type });
  const targets = groupOf(userId, movement, scope);

  if (targets.length === 1) {
    Object.assign(movement, input);
  } else {
    // Em grupo: valor e data de cada parcela são preservados (regras-de-negocio.md).
    for (const m of targets) {
      Object.assign(m, {
        description: installmentDescription(
          input.description,
          m.installmentNumber!,
          m.installmentTotal!,
        ),
        accountId: input.accountId,
        method: input.method,
        categoryId: input.categoryId,
      });
    }
  }

  db.save();
  return targets.map(present);
}

export function remove(userId: string, id: string, scope: MovementScope): void {
  const movement = getOwnedMovement(userId, id);
  const targets = new Set(groupOf(userId, movement, scope));
  db.data.movements = db.data.movements.filter((m) => !targets.has(m));
  db.save();
}
