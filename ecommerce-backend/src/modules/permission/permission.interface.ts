import { Document } from 'mongoose';

export interface IPermission extends Document {
  name: string;
  action: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
