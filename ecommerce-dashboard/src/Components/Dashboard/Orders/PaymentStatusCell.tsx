import { toast } from "sonner";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import { getPaymentStatusTheme } from "@/utils/orderStatus";
import { verifyPayment, failPayment } from "@/store/orderStore";
import type { IOrder } from "@/types";

/** Payment method + status, with quick Verify/Failed actions for manual
 * bKash/Nagad transfers still awaiting verification against the wallet statement. */
export default function PaymentStatusCell({ order }: { order: IOrder }) {
  const handleVerify = (e: React.MouseEvent) => {
    e.stopPropagation();
    verifyPayment(order._id);
    toast.success(`${order.orderId} payment verified`);
  };

  const handleFail = (e: React.MouseEvent) => {
    e.stopPropagation();
    failPayment(order._id);
    toast.success(`${order.orderId} payment marked failed`);
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col">
        <span>{order.paymentMethod}</span>
        <Tag theme={getPaymentStatusTheme(order.paymentStatus)} className="mt-0.5 w-fit">{order.paymentStatus}</Tag>
      </div>
      {order.paymentStatus === "Pending Verification" && (
        <div className="flex gap-2">
          <button type="button" onClick={handleVerify} className="text-[11px] font-semibold text-success hover:underline">
            Verify
          </button>
          <button type="button" onClick={handleFail} className="text-[11px] font-semibold text-error hover:underline">
            Mark Failed
          </button>
        </div>
      )}
    </div>
  );
}
