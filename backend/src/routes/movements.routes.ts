import { Router } from 'express';
import {
  createMovementSchema,
  listMovementsQuerySchema,
  scopeQuerySchema,
  updateMovementSchema,
} from '../schemas/movement.schema.js';
import * as movements from '../services/movements.service.js';
import { parse } from '../utils/validation.js';

export const movementsRoutes = Router();

movementsRoutes.get('/', (req, res) => {
  res.json(movements.list(req.userId, parse(listMovementsQuerySchema, req.query)));
});

movementsRoutes.post('/', (req, res) => {
  res.status(201).json(movements.create(req.userId, parse(createMovementSchema, req.body)));
});

movementsRoutes.put('/:id', (req, res) => {
  const { scope } = parse(scopeQuerySchema, req.query);
  res.json(
    movements.update(req.userId, req.params.id, parse(updateMovementSchema, req.body), scope),
  );
});

movementsRoutes.delete('/:id', (req, res) => {
  const { scope } = parse(scopeQuerySchema, req.query);
  movements.remove(req.userId, req.params.id, scope);
  res.status(204).end();
});
