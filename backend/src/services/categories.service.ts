import { conflict, notFound } from '../errors.js';
import { execute, must, query } from '../db/pool.js';
import type { Category, MovementType } from '../types.js';

type CategoryRow = { id: string; name: string; type: MovementType; color: string };

export async function list(userId: string, type?: MovementType): Promise<Category[]> {
  return query<CategoryRow>(
    `SELECT id, name, type, color FROM categories
      WHERE user_id = $1 AND ($2::text IS NULL OR type = $2)
      ORDER BY type, name`,
    [userId, type ?? null],
  );
}

export async function create(
  userId: string,
  input: { name: string; type: MovementType; color: string },
): Promise<Category> {
  return must(
    await query<CategoryRow>(
      `INSERT INTO categories (user_id, name, type, color) VALUES ($1, $2, $3, $4)
       RETURNING id, name, type, color`,
      [userId, input.name, input.type, input.color],
    ),
  );
}

export async function update(
  userId: string,
  id: string,
  input: { name: string; color: string },
): Promise<Category> {
  const rows = await query<CategoryRow>(
    `UPDATE categories SET name = $3, color = $4 WHERE id = $1 AND user_id = $2
     RETURNING id, name, type, color`,
    [id, userId, input.name, input.color],
  );
  const row = rows[0];
  if (!row) throw notFound('Categoria não encontrada');
  return row;
}

export async function remove(userId: string, id: string): Promise<void> {
  const exists = await query('SELECT 1 FROM categories WHERE id = $1 AND user_id = $2', [
    id,
    userId,
  ]);
  if (exists.length === 0) throw notFound('Categoria não encontrada');
  const used = await query(
    `SELECT 1 FROM movements WHERE category_id = $1
     UNION ALL SELECT 1 FROM recurring_costs WHERE category_id = $1 LIMIT 1`,
    [id],
  );
  if (used.length > 0) {
    throw conflict('CATEGORY_IN_USE', 'Categoria possui movimentos ou custos fixos');
  }
  await execute('DELETE FROM categories WHERE id = $1 AND user_id = $2', [id, userId]);
}
