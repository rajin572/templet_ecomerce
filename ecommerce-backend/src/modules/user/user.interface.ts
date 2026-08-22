import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: Types.ObjectId;
  status: 'active' | 'blocked' | 'archived';
  emailVerified: boolean;
  phoneVerified: boolean;
  avatar?: string;
  lastLoginAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
