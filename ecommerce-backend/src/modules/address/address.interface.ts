import { Document, Types } from 'mongoose';

export interface IAddress extends Document {
  user: Types.ObjectId;
  label: string;
  name: string;
  phone: string;
  district: string;
  thana: string;
  area?: string;
  street: string;
  postcode?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
