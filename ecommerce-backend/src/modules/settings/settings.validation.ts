import { z } from 'zod';

export const createSettingsSchema = z.object({
  body: z.object({
    name: z.string().optional()
  })
});
