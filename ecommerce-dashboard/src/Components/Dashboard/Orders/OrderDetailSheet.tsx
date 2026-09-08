import { useState } from "react";
import { toast } from "sonner";
import ReusableSheet from "@/Components/ui/CustomUi/ReuseableSheet";
import ConfirmModal from "@/Components/ui/CustomUi/Modal/ConfirmModal";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import { Button } from "@/Components/ui/button";
import { CheckCircle2, XCircle, Undo2, BadgeCheck } from "lucide-react";
import OrderTimeline from "./OrderTimeline";
import { getOrderStatusTheme, getPaymentStatusTheme } from "@/utils/orderStatus";
import { verifyPayment, failPayment, returnOrder, markRefunded } from "@/store/orderStore";
import type { IOrder } from "@/types";

interface OrderDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: IOrder | null;
}

export default function OrderDetailSheet({ open, onOpenChange, order }: OrderDetailSheetProps) {
  const [returning, setReturning] = useState(false);
  if (!order) return null;

  const handleVerifyPayment = () => {
    verifyPayment(order._id);
    toast.success(`${order.orderId} payment verified`);
  };

  const handleFailPayment = () => {
    failPayment(order._id);
    toast.success(`${order.orderId} payment marked failed`);
  };

  const handleReturn = (_record: IOrder, reason?: string) => {
    if (!reason) return;
    returnOrder(order._id, reason);
    toast.success(`${order.orderId} marked as returned`);
    setReturning(false);
  };

  const handleMarkRefunded = () => {
    markRefunded(order._id);
    toast.success(`${order.orderId} marked as refunded`);
  };

  const returnedNote = order.statusHistory.filter((e) => e.status === "Returned").slice(-1)[0]?.note;

  return (
    <ReusableSheet open={open} onOpenChange={onOpenChange} title={order.orderId} description={`Placed ${new Date(order.placedAt).toLocaleString()} via ${order.source}`} width="sm:max-w-lg">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Tag theme={getOrderStatusTheme(order.status)}>{order.status}</Tag>
          <Tag theme={getPaymentStatusTheme(order.paymentStatus)}>{`${order.paymentMethod} · ${order.paymentStatus}`}</Tag>
        </div>

        <div>
          <p className="text-sm font-bold mb-1.5">Customer</p>
          <p className="text-sm">{order.customerName}</p>
          <p className="text-sm text-secondbase-color">{order.customerPhone}</p>
          <p className="text-sm text-secondbase-color">{order.customerAddress}</p>
        </div>

        {order.transactionId && (
          <div>
            <p className="text-sm font-bold mb-1.5">Payment Reference</p>
            <p className="text-sm text-secondbase-color">Transaction ID: <span className="font-mono text-base-color">{order.transactionId}</span></p>
          </div>
        )}

        {order.paymentStatus === "Pending Verification" && (
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 flex items-center justify-between gap-3">
            <p className="text-xs text-orange-800">Verify this transfer against the {order.paymentMethod} wallet statement.</p>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" className="bg-success hover:bg-success/90 text-white" onClick={handleVerifyPayment}>
                <CheckCircle2 className="mr-1.5 size-4" /> Verify
              </Button>
              <Button size="sm" variant="outline" className="border-error text-error hover:bg-error/5" onClick={handleFailPayment}>
                <XCircle className="mr-1.5 size-4" /> Failed
              </Button>
            </div>
          </div>
        )}

        {order.courierName && (
          <div>
            <p className="text-sm font-bold mb-1.5">Courier</p>
            <p className="text-sm text-secondbase-color">{order.courierName} · Tracking ID <span className="font-mono text-base-color">{order.courierTrackingId}</span></p>
          </div>
        )}

        <div>
          <p className="text-sm font-bold mb-2">Items</p>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3">
                {item.image && <img src={item.image} alt={item.name} className="size-10 rounded-md border border-border object-cover" />}
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-secondbase-color">{item.unit} × {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold">৳{item.price * item.quantity}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-3 space-y-1.5 text-sm">
          <div className="flex justify-between text-secondbase-color"><span>Subtotal</span><span>৳{order.subtotal}</span></div>
          <div className="flex justify-between text-secondbase-color"><span>Delivery Fee</span><span>৳{order.deliveryFee}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-error"><span>Discount</span><span>- ৳{order.discount}</span></div>}
          <div className="flex justify-between font-bold text-base pt-1.5 border-t border-border"><span>Total</span><span className="text-secondary-color">৳{order.total}</span></div>
        </div>

        {order.status === "Delivered" && (
          <div className="rounded-lg border border-border p-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Customer returned this order?</p>
              <p className="text-xs text-secondbase-color">Only available once an order has been delivered.</p>
            </div>
            <Button size="sm" variant="outline" className="border-orange-400 text-orange-600 hover:bg-orange-50 shrink-0" onClick={() => setReturning(true)}>
              <Undo2 className="mr-1.5 size-4" /> Mark as Returned
            </Button>
          </div>
        )}

        {order.status === "Returned" && (
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 space-y-2">
            <p className="text-sm font-bold text-purple-900">Return</p>
            {returnedNote && <p className="text-xs text-purple-800">{returnedNote}</p>}
            <div className="flex items-center justify-between pt-1">
              <Tag theme={order.refundStatus === "refunded" ? "success" : "warning"} className="capitalize">
                {`Refund ${order.refundStatus ?? "pending"}`}
              </Tag>
              {order.refundStatus === "pending" && (
                <Button size="sm" onClick={handleMarkRefunded}>
                  <BadgeCheck className="mr-1.5 size-4" /> Mark Refunded
                </Button>
              )}
            </div>
          </div>
        )}

        <div>
          <p className="text-sm font-bold mb-3">Order Tracking</p>
          <OrderTimeline order={order} />
        </div>
      </div>

      <ConfirmModal
        open={returning}
        onCancel={() => setReturning(false)}
        currentRecord={order}
        onConfirm={handleReturn}
        title={`Mark ${order.orderId} as returned?`}
        description="The order moves out of Delivered and a refund is tracked as pending."
        confirmText="Mark as Returned"
        variant="warning"
        withReason
        reasonLabel="Return reason"
        reasonRequired
      />
    </ReusableSheet>
  );
}
