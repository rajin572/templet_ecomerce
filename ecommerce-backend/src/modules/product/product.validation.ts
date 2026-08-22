import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().optional()
  })
});
