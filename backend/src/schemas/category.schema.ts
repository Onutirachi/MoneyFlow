import { z } from 'zod';
import { colorSchema, movementTypeSchema } from './common.schema.js';

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(40),
  type: movementTypeSchema,
  color: colorSchema,
});

export const updateCategorySchema = createCategorySchema.omit({ type: true });

export const listCategoriesQuerySchema = z.object({ type: movementTypeSchema.optional() });

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
