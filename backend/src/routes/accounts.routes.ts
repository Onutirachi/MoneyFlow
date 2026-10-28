import { Router } from 'express';
import { accountSchema } from '../schemas/accounts.schema.js';
import * as service from '../services/accounts.service.js';
import { idParam, parse } from '../utils/validation.js';

const router = Router();

router.get('/', async (req, res) => {
  res.json(await service.list(req.userId));
});
router.post('/', async (req, res) => {
  res.status(201).json(await service.create(req.userId, parse(accountSchema, req.body)));
});
router.put('/:id', async (req, res) => {
  res.json(
    await service.update(req.userId, idParam(req.params.id), parse(accountSchema, req.body)),
  );
});
router.delete('/:id', async (req, res) => {
  await service.remove(req.userId, idParam(req.params.id));
  res.status(204).end();
});

export default router;
