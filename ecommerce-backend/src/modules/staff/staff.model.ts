import { Schema, model } from 'mongoose';
import { IStaff } from './staff.interface';

const schema = new Schema<IStaff>({
  name: { type: String }
}, { timestamps: true });

export const Staff = model<IStaff>('Staff', schema);
