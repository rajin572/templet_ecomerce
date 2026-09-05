// Reuses the storefront's badge/status hexes (ecommerce-website globals.css)
// so a chart color means the same thing on both the admin and customer sides.
export const ORDER_STATUS_COLORS: Record<string, string> = {
  Pending: "#64748B",
  Confirmed: "#3b82f6",
  Processing: "#d97706",
  Packed: "#8b5cf6",
  Shipped: "#ff5014",
  Delivered: "#16a34a",
  Cancelled: "#dc2626",
};

export const PAYMENT_METHOD_COLORS: Record<string, string> = {
  COD: "#1f2937",
  bKash: "#E11471",
  Nagad: "#F37021",
};
