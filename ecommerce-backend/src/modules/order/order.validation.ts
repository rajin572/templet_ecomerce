import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    name: z.string().optional()
  })
});
