import { Schema, model } from 'mongoose';
import { IAuth } from './auth.interface';

const schema = new Schema<IAuth>({
  name: { type: String }
}, { timestamps: true });

export const Auth = model<IAuth>('Auth', schema);
