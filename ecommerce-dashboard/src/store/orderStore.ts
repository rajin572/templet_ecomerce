import { useSyncExternalStore } from "react";
import { DUMMY_ORDERS } from "@/data/dummyStore";
import type { IOrder, IOrderStatus } from "@/types";

// A tiny external store (same useSyncExternalStore pattern as useUserData.ts)
// so Orders / Pending Orders / Running Orders / Track Order / Customer
// profile all read and mutate the same in-memory order list instead of each
// page keeping its own disconnected copy. Swap this out for RTK Query once
// real order endpoints exist — the page components only see `useOrders()`
// and the action functions below.
let orders: IOrder[] = DUMMY_ORDERS.map((o) => ({
  ...o,
  items: [...o.items],
  statusHistory: [...o.statusHistory],
}));

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => orders;

export const useOrders = (): IOrder[] => useSyncExternalStore(subscribe, getSnapshot);

const setStatus = (orderId: string, status: IOrderStatus, note?: string) => {
  orders = orders.map((o) =>
    o._id === orderId
      ? { ...o, status, statusHistory: [...o.statusHistory, { status, note, at: new Date().toISOString() }] }
      : o
  );
  emit();
};

export const acceptOrder = (orderId: string) => setStatus(orderId, "Confirmed", "Accepted by admin");

export const rejectOrder = (orderId: string, reason?: string) =>
  setStatus(orderId, "Cancelled", reason ? `Rejected — ${reason}` : "Rejected by admin");

export const cancelOrder = (orderId: string, reason?: string) =>
  setStatus(orderId, "Cancelled", reason ? `Cancelled — ${reason}` : "Cancelled by admin");

export const advanceOrder = (orderId: string, nextStatus: IOrderStatus, note?: string) => {
  // Cash on Delivery is collected at the door, so reaching Delivered is the
  // moment a COD payment is actually confirmed — no separate manual step.
  if (nextStatus === "Delivered") {
    orders = orders.map((o) =>
      o._id === orderId && o.paymentMethod === "COD" && o.paymentStatus === "Pending"
        ? { ...o, paymentStatus: "Verified" }
        : o
    );
  }
  setStatus(orderId, nextStatus, note ?? (nextStatus === "Delivered" ? "COD collected on delivery" : undefined));
};

export const shipOrder = (orderId: string, courierName: string, courierTrackingId: string) => {
  orders = orders.map((o) => (o._id === orderId ? { ...o, courierName, courierTrackingId } : o));
  setStatus(orderId, "Shipped", `Handed to ${courierName} — ${courierTrackingId}`);
};

export const NEXT_STATUS: Partial<Record<IOrderStatus, IOrderStatus>> = {
  Confirmed: "Processing",
  Processing: "Packed",
  Packed: "Shipped",
  Shipped: "Delivered",
};

/** Verify or fail a manual bKash/Nagad transfer against the wallet statement. */
export const verifyPayment = (orderId: string) => {
  orders = orders.map((o) => (o._id === orderId ? { ...o, paymentStatus: "Verified" } : o));
  emit();
};

export const failPayment = (orderId: string) => {
  orders = orders.map((o) => (o._id === orderId ? { ...o, paymentStatus: "Failed" } : o));
  emit();
};

/** Only reachable from Delivered — the customer sent the product back after receiving it. */
export const returnOrder = (orderId: string, reason: string) => {
  orders = orders.map((o) => (o._id === orderId ? { ...o, refundStatus: "pending" as const } : o));
  setStatus(orderId, "Returned", reason);
};

export const markRefunded = (orderId: string) => {
  orders = orders.map((o) => (o._id === orderId ? { ...o, refundStatus: "refunded" } : o));
  emit();
};
