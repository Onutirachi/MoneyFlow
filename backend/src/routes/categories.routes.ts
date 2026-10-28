import { Router } from 'express';
import {
  createCategorySchema,
  listCategoriesQuery,
  updateCategorySchema,
} from '../schemas/categories.schema.js';
import * as service from '../services/categories.service.js';
import { idParam, parse } from '../utils/validation.js';

const router = Router();

router.get('/', async (req, res) => {
  const { type } = parse(listCategoriesQuery, req.query);
  res.json(await service.list(req.userId, type));
});
router.post('/', async (req, res) => {
  res.status(201).json(await service.create(req.userId, parse(createCategorySchema, req.body)));
});
router.put('/:id', async (req, res) => {
  res.json(
    await service.update(req.userId, idParam(req.params.id), parse(updateCategorySchema, req.body)),
  );
});
router.delete('/:id', async (req, res) => {
  await service.remove(req.userId, idParam(req.params.id));
  res.status(204).end();
});

export default router;
