import { Schema, model } from 'mongoose';
import { IPermission } from './permission.interface';

const permissionSchema = new Schema<IPermission>(
  {
    name: { type: String, required: true },
    action: { type: String, required: true, unique: true },
    description: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Permission = model<IPermission>('Permission', permissionSchema);
