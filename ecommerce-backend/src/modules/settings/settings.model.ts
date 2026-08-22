import { Schema, model } from 'mongoose';
import { ISettings } from './settings.interface';

const schema = new Schema<ISettings>({
  name: { type: String }
}, { timestamps: true });

export const Settings = model<ISettings>('Settings', schema);
