import { Schema, model } from 'mongoose';
import { ISession } from './session.interface';

const sessionSchema = new Schema<ISession>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    refreshTokenHash: { type: String, required: true },
    device: { type: String },
    ip: { type: String },
    lastUsedAt: { type: Date, default: Date.now },
    revokedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const Session = model<ISession>('Session', sessionSchema);
