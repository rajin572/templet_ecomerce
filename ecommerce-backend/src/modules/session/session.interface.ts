import { Document, Types } from 'mongoose';

export interface ISession extends Document {
  user: Types.ObjectId;
  refreshTokenHash: string;
  device?: string;
  ip?: string;
  lastUsedAt: Date;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
