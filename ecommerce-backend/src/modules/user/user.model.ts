import { Schema, model } from 'mongoose';
import { IUser } from './user.interface';
import bcrypt from 'bcrypt';
import { config } from '../../app/config';

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, select: false },
    role: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    status: {
      type: String,
      enum: ['active', 'blocked', 'archived'],
      default: 'active',
    },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    avatar: { type: String },
    lastLoginAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function () {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, config.bcryptSaltRounds);
  }
});

export const User = model<IUser>('User', userSchema);
