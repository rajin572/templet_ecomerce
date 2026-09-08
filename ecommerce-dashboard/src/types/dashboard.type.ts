export interface IDashboardStats {
  salesToday: number;
  pendingOrders: number;
  pendingPaymentVerification: number;
  lowStockItems: number;
}

export interface ISalesTrendPoint {
  date: string;
  Revenue: number;
}

export type OrderStatusV1 =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Packed"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Returned";

export interface IOrdersByStatusItem {
  category: OrderStatusV1;
  percentage: number;
}

export type PaymentMethodV1 = "COD" | "bKash" | "Nagad";

export interface IPaymentMethodSplitItem {
  category: PaymentMethodV1;
  percentage: number;
}

export interface ITopSellingProduct {
  _id: string;
  name: string;
  unitsSold: number;
}

export type AttentionPaymentStatus =
  | "Pending"
  | "Pending Verification"
  | "Verified"
  | "Failed";

export interface IAttentionOrder {
  _id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  total: number;
  status: OrderStatusV1;
  paymentMethod: PaymentMethodV1;
  paymentStatus: AttentionPaymentStatus;
  placedAt: string;
}

export interface IDashboardOverviewData {
  stats: IDashboardStats;
  salesTrend: ISalesTrendPoint[];
  ordersByStatus: IOrdersByStatusItem[];
  paymentMethodSplit: IPaymentMethodSplitItem[];
  topSellingProducts: ITopSellingProduct[];
  attentionOrders: IAttentionOrder[];
}

export interface IGetDashboardOverviewResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IDashboardOverviewData;
}
