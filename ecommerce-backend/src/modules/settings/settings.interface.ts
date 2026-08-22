import { Document } from 'mongoose';

export interface ISettings extends Document {
  name?: string;
}
