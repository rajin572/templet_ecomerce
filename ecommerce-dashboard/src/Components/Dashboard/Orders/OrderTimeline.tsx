import { Check, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IOrder, IOrderStatus } from "@/types";

const STEPS: IOrderStatus[] = ["Pending", "Confirmed", "Processing", "Packed", "Shipped", "Delivered"];

const formatAt = (iso: string) =>
  new Date(iso).toLocaleString("en-BD", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true });

export default function OrderTimeline({ order }: { order: IOrder }) {
  if (order.status === "Cancelled") {
    const cancelEvent = order.statusHistory.find((e) => e.status === "Cancelled");
    return (
      <div className="rounded-lg border border-error/30 bg-red-50 p-4">
        <p className="font-semibold text-error flex items-center gap-2">
          <XCircle className="size-4" /> Order Cancelled
        </p>
        {cancelEvent?.note && <p className="text-sm text-secondbase-color mt-1">{cancelEvent.note}</p>}
        {cancelEvent && <p className="text-xs text-secondbase-color mt-1">{formatAt(cancelEvent.at)}</p>}
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(order.status);

  return (
    <div>
      {STEPS.map((step, i) => {
        const event = order.statusHistory.find((e) => e.status === step);
        const done = i <= currentIndex;
        const isLast = i === STEPS.length - 1;
        return (
          <div key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "size-7 shrink-0 rounded-full flex items-center justify-center border-2",
                  done ? "bg-secondary-color border-secondary-color text-white" : "border-gray-300 text-gray-300"
                )}
              >
                <Check className="size-3.5" />
              </div>
              {!isLast && <div className={cn("w-0.5 flex-1 min-h-8", i < currentIndex ? "bg-secondary-color" : "bg-gray-200")} />}
            </div>
            <div className={cn("pb-7", isLast && "pb-0")}>
              <p className={cn("font-semibold text-sm", done ? "text-base-color" : "text-gray-400")}>{step}</p>
              {event ? (
                <>
                  <p className="text-xs text-secondbase-color">{formatAt(event.at)}</p>
                  {event.note && <p className="text-xs text-secondbase-color mt-0.5">{event.note}</p>}
                </>
              ) : (
                <p className="text-xs text-gray-400">Pending</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
