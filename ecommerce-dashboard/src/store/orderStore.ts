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

export const advanceOrder = (orderId: string, nextStatus: IOrderStatus, note?: string) => setStatus(orderId, nextStatus, note);

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
