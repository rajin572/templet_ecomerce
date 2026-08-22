import { z } from 'zod';

export const createStaffSchema = z.object({
  body: z.object({
    name: z.string().optional()
  })
});
