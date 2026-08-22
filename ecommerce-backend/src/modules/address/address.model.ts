import { Schema, model } from 'mongoose';
import { IAddress } from './address.interface';

const addressSchema = new Schema<IAddress>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    label: { type: String, required: true }, // e.g., 'Home', 'Office'
    name: { type: String, required: true },
    phone: { type: String, required: true },
    district: { type: String, required: true },
    thana: { type: String, required: true },
    area: { type: String },
    street: { type: String, required: true },
    postcode: { type: String },
    isDefault: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const Address = model<IAddress>('Address', addressSchema);
