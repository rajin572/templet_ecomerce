import ReusableSheet from "@/Components/ui/CustomUi/ReuseableSheet";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import OrderTimeline from "./OrderTimeline";
import { getOrderStatusTheme, getPaymentStatusTheme } from "@/utils/orderStatus";
import type { IOrder } from "@/types";

interface OrderDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: IOrder | null;
}

export default function OrderDetailSheet({ open, onOpenChange, order }: OrderDetailSheetProps) {
  if (!order) return null;

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

        <div>
          <p className="text-sm font-bold mb-3">Order Tracking</p>
          <OrderTimeline order={order} />
        </div>
      </div>
    </ReusableSheet>
  );
}
