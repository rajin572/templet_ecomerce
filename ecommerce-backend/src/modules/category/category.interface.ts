import { Document, Types } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  parent?: Types.ObjectId | null;
  image?: string;
  description?: string;
  status: 'Active' | 'Inactive';
  sortOrder?: number;
  seo?: {
    title?: string;
    description?: string;
  };
}
