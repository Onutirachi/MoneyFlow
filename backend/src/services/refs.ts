import type { MovementType, PaymentMethod } from '../types.js';
import { assertMethodAllowed, getOwnedAccount } from './accounts.service.js';
import { assertCategoryType, getOwnedCategory } from './categories.service.js';

/**
 * Garante que conta e categoria existem e são do usuário, que o método está
 * cadastrado na conta e que a categoria é do mesmo tipo do lançamento.
 * Usado por movimentos e custos fixos.
 */
export function validateRefs(
  userId: string,
  refs: { type: MovementType; accountId: string; method: PaymentMethod; categoryId: string },
): void {
  const account = getOwnedAccount(userId, refs.accountId);
  assertMethodAllowed(account, refs.method);
  assertCategoryType(getOwnedCategory(userId, refs.categoryId), refs.type);
}
