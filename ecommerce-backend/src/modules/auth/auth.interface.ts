import { Document } from 'mongoose';

export interface IAuth extends Document {
  name?: string;
}
