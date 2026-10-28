import { z } from 'zod';
import { monthSchema, optionalFilter, uuid } from './common.js';

export const dashboardQuery = z.object({
  month: monthSchema,
  accountId: optionalFilter(uuid),
});
