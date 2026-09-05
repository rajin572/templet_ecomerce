import type { IMeta } from "./common.type";

export type ReviewStatus = "pending" | "published" | "rejected";

export interface IReview {
  _id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage?: string;
  customerName: string;
  customerPhone?: string;
  rating: number;
  comment: string;
  images?: string[];
  status: ReviewStatus;
  adminReply?: string;
  createdAt: string;
}

export interface IGetReviewsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    data: IReview[];
    meta: IMeta;
  };
}
