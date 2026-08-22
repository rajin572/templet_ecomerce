import { Document, Types } from 'mongoose';

export interface IRole extends Document {
  name: string;
  slug: string;
  description?: string;
  permissions: Types.ObjectId[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}
