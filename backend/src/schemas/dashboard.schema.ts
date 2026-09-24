import { z } from 'zod';
import { idSchema, monthSchema } from './common.schema.js';

export const dashboardQuerySchema = z.object({
  month: monthSchema,
  accountId: idSchema.optional(),
});

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;
