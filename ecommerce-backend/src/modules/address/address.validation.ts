import { z } from 'zod';

const createAddressSchema = z.object({
  body: z.object({
    label: z.string({ message: 'Label is required' }),
    name: z.string({ message: 'Name is required' }),
    phone: z.string({ message: 'Phone is required' }),
    district: z.string({ message: 'District is required' }),
    thana: z.string({ message: 'Thana is required' }),
    area: z.string().optional(),
    street: z.string({ message: 'Street is required' }),
    postcode: z.string().optional(),
    isDefault: z.boolean().optional(),
  }),
});

const updateAddressSchema = z.object({
  body: z.object({
    label: z.string().optional(),
    name: z.string().optional(),
    phone: z.string().optional(),
    district: z.string().optional(),
    thana: z.string().optional(),
    area: z.string().optional(),
    street: z.string().optional(),
    postcode: z.string().optional(),
    isDefault: z.boolean().optional(),
  }),
});

export const AddressValidation = {
  createAddressSchema,
  updateAddressSchema,
};
