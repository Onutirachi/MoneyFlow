import { Router } from 'express';
import { accountSchema } from '../schemas/account.schema.js';
import * as accounts from '../services/accounts.service.js';
import { parse } from '../utils/validation.js';

export const accountsRoutes = Router();

accountsRoutes.get('/', (req, res) => {
  res.json(accounts.list(req.userId));
});

accountsRoutes.post('/', (req, res) => {
  res.status(201).json(accounts.create(req.userId, parse(accountSchema, req.body)));
});

accountsRoutes.put('/:id', (req, res) => {
  res.json(accounts.update(req.userId, req.params.id, parse(accountSchema, req.body)));
});

accountsRoutes.delete('/:id', (req, res) => {
  accounts.remove(req.userId, req.params.id);
  res.status(204).end();
});
