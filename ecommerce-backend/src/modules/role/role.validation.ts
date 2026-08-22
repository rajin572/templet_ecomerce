import { z } from 'zod';

const createRoleZodSchema = z.object({
  body: z.object({
    name: z.string({ message: 'Name is required' }),
    description: z.string().optional(),
    permissions: z.array(z.string()).optional(),
  }),
});

const updateRoleZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    permissions: z.array(z.string()).optional(),
  }),
});

export const RoleValidation = {
  createRoleZodSchema,
  updateRoleZodSchema,
};
