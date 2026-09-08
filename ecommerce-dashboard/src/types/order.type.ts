import type { IApiResponse, IMeta } from "./common.type";

export type IOrderStatus =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Packed"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Returned";

export type IOrderSource = "Website" | "Facebook" | "WhatsApp" | "Phone" | "Offline";
export type IOrderPaymentMethod = "COD" | "bKash" | "Nagad";
export type IOrderPaymentStatus = "Pending" | "Pending Verification" | "Verified" | "Failed";
export type IOrderRefundStatus = "pending" | "refunded";

export interface IOrderItem {
  productId: string;
  name: string;
  image?: string;
  unit: string;
  price: number;
  quantity: number;
}

export interface IOrderStatusEvent {
  status: IOrderStatus;
  note?: string;
  at: string;
}

export interface IOrder {
  _id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  source: IOrderSource;
  items: IOrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: IOrderPaymentMethod;
  paymentStatus: IOrderPaymentStatus;
  transactionId?: string;
  status: IOrderStatus;
  courierName?: string;
  courierTrackingId?: string;
  /** Only set once an order reaches "Returned". */
  refundStatus?: IOrderRefundStatus;
  statusHistory: IOrderStatusEvent[];
  placedAt: string;
}

export type IGetOrderListResponse = IApiResponse<{ data: IOrder[]; meta: IMeta }>;
