import { z } from 'zod';
import { hexColor, movementType, optionalFilter, text } from './common.js';

export const listCategoriesQuery = z.object({ type: optionalFilter(movementType) });
export const createCategorySchema = z.object({
  name: text(40),
  type: movementType,
  color: hexColor,
});
export const updateCategorySchema = z.object({ name: text(40), color: hexColor });
