import { Schema, model } from 'mongoose';
import { IFinance } from './finance.interface';

const schema = new Schema<IFinance>({
  name: { type: String }
}, { timestamps: true });

export const Finance = model<IFinance>('Finance', schema);
