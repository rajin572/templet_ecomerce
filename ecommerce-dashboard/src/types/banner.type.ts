import type { IApiResponse, IMeta } from "./common.type";

export interface IBanner {
  _id: string;
  image: string;
  title: string;
  subtitle?: string;
  buttonLabel?: string;
  destinationUrl: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export type IGetBannerListResponse = IApiResponse<{ data: IBanner[]; meta: IMeta }>;

export interface IBannerFormValues {
  title: string;
  subtitle?: string;
  buttonLabel?: string;
  destinationUrl: string;
  isActive: boolean;
  order: number;
}
