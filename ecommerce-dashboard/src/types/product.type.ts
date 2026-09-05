import type { IApiResponse, IMeta } from "./common.type";

export type IProductStatus = "published" | "draft";

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  images: string[];
  description?: string;
  price: number;
  comparePrice?: number;
  stock: number;
  unit: string;
  status: IProductStatus;
  createdAt: string;
}

export type IGetProductListResponse = IApiResponse<{ data: IProduct[]; meta: IMeta }>;

export interface IProductFormValues {
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  description?: string;
  price: number;
  comparePrice?: number;
  stock: number;
  unit: string;
  status: IProductStatus;
}
