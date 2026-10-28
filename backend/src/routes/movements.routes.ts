import { Router } from 'express';
import {
  createMovementSchema,
  listMovementsQuery,
  scopeQuery,
  updateMovementSchema,
} from '../schemas/movements.schema.js';
import * as service from '../services/movements.service.js';
import { idParam, parse } from '../utils/validation.js';

const router = Router();

router.get('/', async (req, res) => {
  res.json(await service.list(req.userId, parse(listMovementsQuery, req.query)));
});
router.post('/', async (req, res) => {
  res.status(201).json(await service.create(req.userId, parse(createMovementSchema, req.body)));
});
router.put('/:id', async (req, res) => {
  const { scope } = parse(scopeQuery, req.query);
  res.json(
    await service.update(
      req.userId,
      idParam(req.params.id),
      scope,
      parse(updateMovementSchema, req.body),
    ),
  );
});
router.delete('/:id', async (req, res) => {
  const { scope } = parse(scopeQuery, req.query);
  await service.remove(req.userId, idParam(req.params.id), scope);
  res.status(204).end();
});

export default router;
