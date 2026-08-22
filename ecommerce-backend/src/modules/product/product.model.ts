import { Schema, model } from 'mongoose';
import { IProduct } from './product.interface';

const schema = new Schema<IProduct>({
  name: { type: String }
}, { timestamps: true });

export const Product = model<IProduct>('Product', schema);
