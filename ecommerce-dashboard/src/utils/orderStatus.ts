import { AttentionPaymentStatus, OrderStatusV1 } from "@/types";

type TagTheme = "error" | "warning" | "success" | "blue" | "purple" | "orange";

const ORDER_STATUS_THEME: Record<OrderStatusV1, TagTheme> = {
  Pending: "blue",
  Confirmed: "purple",
  Processing: "warning",
  Packed: "blue",
  Shipped: "purple",
  Delivered: "success",
  Cancelled: "error",
  Returned: "orange",
};

export const getOrderStatusTheme = (status: OrderStatusV1): TagTheme => ORDER_STATUS_THEME[status];

const PAYMENT_STATUS_THEME: Record<AttentionPaymentStatus, TagTheme> = {
  Pending: "blue",
  "Pending Verification": "orange",
  Verified: "success",
  Failed: "error",
};

export const getPaymentStatusTheme = (status: AttentionPaymentStatus): TagTheme => PAYMENT_STATUS_THEME[status];
