import { z } from 'zod';

export const createFinanceSchema = z.object({
  body: z.object({
    name: z.string().optional()
  })
});
