import { Schema, model } from 'mongoose';
import { IRole } from './role.interface';

const roleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    permissions: [{ type: Schema.Types.ObjectId, ref: 'Permission' }],
    isSystem: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const Role = model<IRole>('Role', roleSchema);
