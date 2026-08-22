import { IMeta } from "./common.type";

export type ReviewStatus = "published" | "flagged";

export interface IReview {
  _id: string;
  reviewCode: string;
  reviewerName: string;
  listingName: string;
  ownerName: string;
  rating: number;
  comment: string;
  date: string;
  helpfulCount: number;
  status: ReviewStatus;
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
