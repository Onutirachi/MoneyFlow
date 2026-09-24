import { randomUUID } from 'node:crypto';
import { db } from '../db/jsonDb.js';
import { badRequest, conflict, notFound } from '../errors.js';
import type { CreateCategoryInput, UpdateCategoryInput } from '../schemas/category.schema.js';
import type { Category, MovementType } from '../types.js';

export type PublicCategory = Omit<Category, 'userId'>;

function present(category: Category): PublicCategory {
  const { userId: _userId, ...rest } = category;
  return rest;
}

export function getOwnedCategory(userId: string, id: string): Category {
  const category = db.data.categories.find((c) => c.id === id && c.userId === userId);
  if (!category) throw notFound('Categoria');
  return category;
}

export function assertCategoryType(category: Category, type: MovementType): void {
  if (category.type !== type) {
    const label = category.type === 'ENTRADA' ? 'entrada' : 'saída';
    throw badRequest('CATEGORY_TYPE_MISMATCH', `A categoria "${category.name}" é de ${label}`);
  }
}

export function list(userId: string, type?: MovementType): PublicCategory[] {
  return db.data.categories
    .filter((c) => c.userId === userId && (!type || c.type === type))
    .sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name, 'pt-BR'))
    .map(present);
}

export function create(userId: string, input: CreateCategoryInput): PublicCategory {
  const category: Category = { id: randomUUID(), userId, ...input };
  db.data.categories.push(category);
  db.save();
  return present(category);
}

export function update(userId: string, id: string, input: UpdateCategoryInput): PublicCategory {
  const category = getOwnedCategory(userId, id);
  Object.assign(category, input);
  db.save();
  return present(category);
}

export function remove(userId: string, id: string): void {
  const category = getOwnedCategory(userId, id);
  const { data } = db;
  const inUse =
    data.movements.some((m) => m.categoryId === id) ||
    data.recurring.some((r) => r.categoryId === id);
  if (inUse) {
    throw conflict('CATEGORY_IN_USE', 'Categoria possui movimentos ou custos fixos vinculados');
  }
  data.categories = data.categories.filter((c) => c !== category);
  db.save();
}
