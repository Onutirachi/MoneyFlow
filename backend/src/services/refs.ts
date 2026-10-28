import { badRequest, notFound } from '../errors.js';
import { one, query, pool, type Db } from '../db/pool.js';
import type { MovementType, PaymentMethod } from '../types.js';

/** Confere conta (do usuário), método aceito pela conta e categoria do mesmo tipo. */
export async function assertRefs(
  userId: string,
  ref: { accountId: string; method: PaymentMethod; categoryId: string; type: MovementType },
  db: Db = pool,
): Promise<void> {
  const account = one(
    await query<{ methods: string[] }>(
      'SELECT methods FROM accounts WHERE id = $1 AND user_id = $2',
      [ref.accountId, userId],
      db,
    ),
  );
  if (!account) throw notFound('Conta não encontrada');

  const category = one(
    await query<{ type: MovementType }>(
      'SELECT type FROM categories WHERE id = $1 AND user_id = $2',
      [ref.categoryId, userId],
      db,
    ),
  );
  if (!category) throw notFound('Categoria não encontrada');

  if (!account.methods.includes(ref.method)) {
    throw badRequest('METHOD_NOT_ALLOWED', 'Método de pagamento não cadastrado nesta conta');
  }
  if (category.type !== ref.type) {
    throw badRequest('CATEGORY_TYPE_MISMATCH', 'Categoria de tipo diferente do movimento');
  }
}
