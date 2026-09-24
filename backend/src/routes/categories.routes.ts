import { Router } from 'express';
import {
  createCategorySchema,
  listCategoriesQuerySchema,
  updateCategorySchema,
} from '../schemas/category.schema.js';
import * as categories from '../services/categories.service.js';
import { parse } from '../utils/validation.js';

export const categoriesRoutes = Router();

categoriesRoutes.get('/', (req, res) => {
  const { type } = parse(listCategoriesQuerySchema, req.query);
  res.json(categories.list(req.userId, type));
});

categoriesRoutes.post('/', (req, res) => {
  res.status(201).json(categories.create(req.userId, parse(createCategorySchema, req.body)));
});

categoriesRoutes.put('/:id', (req, res) => {
  res.json(categories.update(req.userId, req.params.id, parse(updateCategorySchema, req.body)));
});

categoriesRoutes.delete('/:id', (req, res) => {
  categories.remove(req.userId, req.params.id);
  res.status(204).end();
});
