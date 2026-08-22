import { Schema, model, Document } from 'mongoose';

export interface IOtp extends Document {
  emailOrPhone: string;
  code: string;
  type: 'signup' | 'forgot' | 'order_confirm';
  expiresAt: Date;
  attempts: number;
  consumedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    emailOrPhone: { type: String, required: true },
    code: { type: String, required: true },
    type: { type: String, enum: ['signup', 'forgot', 'order_confirm'], required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    consumedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = model<IOtp>('Otp', otpSchema);
