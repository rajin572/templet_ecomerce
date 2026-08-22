import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string({ message: 'Category name is required' }),
    parent: z.string().optional().nullable(),
    image: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(['Active', 'Inactive']).optional(),
    sortOrder: z.number().optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().optional(),
    parent: z.string().optional().nullable(),
    image: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(['Active', 'Inactive']).optional(),
    sortOrder: z.number().optional(),
  }),
});
