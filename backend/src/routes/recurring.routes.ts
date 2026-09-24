import { Router } from 'express';
import { recurringSchema } from '../schemas/recurring.schema.js';
import * as recurring from '../services/recurring.service.js';
import { parse } from '../utils/validation.js';

export const recurringRoutes = Router();

recurringRoutes.get('/', (req, res) => {
  res.json(recurring.list(req.userId));
});

recurringRoutes.post('/', (req, res) => {
  res.status(201).json(recurring.create(req.userId, parse(recurringSchema, req.body)));
});

recurringRoutes.put('/:id', (req, res) => {
  res.json(recurring.update(req.userId, req.params.id, parse(recurringSchema, req.body)));
});

recurringRoutes.delete('/:id', (req, res) => {
  recurring.remove(req.userId, req.params.id);
  res.status(204).end();
});
