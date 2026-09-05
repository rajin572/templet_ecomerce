import type { IApiResponse, IMeta } from "./common.type";

export type ICouponType = "percentage" | "fixed";
export type ICouponStatus = "active" | "inactive" | "expired";

export interface ICoupon {
  _id: string;
  code: string;
  type: ICouponType;
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  startDate: string;
  expiryDate: string;
  status: ICouponStatus;
  createdAt: string;
}

export type IGetCouponListResponse = IApiResponse<{ data: ICoupon[]; meta: IMeta }>;

export interface ICouponFormValues {
  code: string;
  type: ICouponType;
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  startDate: string;
  expiryDate: string;
  status: ICouponStatus;
}
