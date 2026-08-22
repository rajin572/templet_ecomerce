import { Schema, model } from 'mongoose';
import { ICustomer } from './customer.interface';

const schema = new Schema<ICustomer>({
  name: { type: String }
}, { timestamps: true });

export const Customer = model<ICustomer>('Customer', schema);
