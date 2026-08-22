import { Schema, model } from 'mongoose';
import { IOrder } from './order.interface';

const schema = new Schema<IOrder>({
  name: { type: String }
}, { timestamps: true });

export const Order = model<IOrder>('Order', schema);
