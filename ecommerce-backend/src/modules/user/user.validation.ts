import { z } from 'zod';

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    avatar: z.string().optional(),
  }),
});

export const UserValidation = {
  updateProfileSchema,
};
