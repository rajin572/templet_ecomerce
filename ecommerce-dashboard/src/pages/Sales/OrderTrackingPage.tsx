import { useMemo, useState } from 'react';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Search, PackageSearch, Phone, MapPin, Truck } from "lucide-react";
import OrderTimeline from "@/Components/Dashboard/Orders/OrderTimeline";
import { getOrderStatusTheme, getPaymentStatusTheme } from "@/utils/orderStatus";
import { useOrders } from "@/store/orderStore";

// TODO: wire to a GET /orders/track?query= endpoint once it exists — this
// searches the shared in-memory order store (src/store/orderStore.ts) until then.
const OrderTrackingPage = () => {
  const orders = useOrders();
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const matches = useMemo(() => {
    const term = submitted.trim().toLowerCase();
    if (!term) return [];
    return orders.filter((o) => o.orderId.toLowerCase().includes(term) || o.customerPhone.includes(term));
  }, [orders, submitted]);

  const handleSearch = () => {
    setSubmitted(query);
    setSelectedId(null);
  };

  const selected = matches.find((o) => o._id === selectedId) ?? null;
  const activeOrder = selected ?? (matches.length === 1 ? matches[0] : null);

  return (
    <PageWraper title="Track Order" description="Look up any order by its Order ID or customer phone number to see its live delivery status.">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex gap-3 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. ORD-10050 or 01933445566"
              className="pl-10 py-5 border-[#E5E5E5] bg-[#F5F5F5]"
            />
          </div>
          <Button onClick={handleSearch}>Track</Button>
        </div>
      </div>

      {submitted && matches.length === 0 && (
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center gap-2">
          <PackageSearch className="size-10 text-gray-300" />
          <p className="font-medium">No order found for "{submitted}"</p>
          <p className="text-sm text-secondbase-color">Check the Order ID or phone number and try again.</p>
        </div>
      )}

      {matches.length > 1 && !selected && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-2">
          <p className="text-sm font-medium text-secondbase-color mb-2">{matches.length} orders found — select one to track:</p>
          {matches.map((o) => (
            <button
              key={o._id}
              onClick={() => setSelectedId(o._id)}
              className="w-full flex items-center justify-between gap-3 p-3 rounded-lg border border-border hover:bg-gray-50 text-left"
            >
              <div>
                <p className="font-bold">{o.orderId}</p>
                <p className="text-xs text-secondbase-color">{o.customerName} · ৳{o.total}</p>
              </div>
              <Tag theme={getOrderStatusTheme(o.status)}>{o.status}</Tag>
            </button>
          ))}
        </div>
      )}

      {activeOrder && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 h-fit">
            <div>
              <p className="text-xs text-secondbase-color">Order</p>
              <p className="text-lg font-bold">{activeOrder.orderId}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Tag theme={getOrderStatusTheme(activeOrder.status)}>{activeOrder.status}</Tag>
              <Tag theme={getPaymentStatusTheme(activeOrder.paymentStatus)}>{`${activeOrder.paymentMethod} · ${activeOrder.paymentStatus}`}</Tag>
            </div>
            <div className="border-t border-border pt-4 space-y-2 text-sm">
              <p className="flex items-center gap-2 text-secondbase-color"><Phone className="size-4" /> {activeOrder.customerPhone}</p>
              <p className="flex items-center gap-2 text-secondbase-color"><MapPin className="size-4 shrink-0" /> {activeOrder.customerAddress}</p>
              {activeOrder.courierName && (
                <p className="flex items-center gap-2 text-secondbase-color"><Truck className="size-4" /> {activeOrder.courierName} · {activeOrder.courierTrackingId}</p>
              )}
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-sm font-bold mb-2">Items</p>
              <div className="space-y-2">
                {activeOrder.items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-2 text-sm">
                    {item.image && <img src={item.image} alt={item.name} className="size-8 rounded-md border border-border object-cover" />}
                    <span className="flex-1">{item.name} × {item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-sm pt-3 mt-2 border-t border-border">
                <span>Total</span><span className="text-secondary-color">৳{activeOrder.total}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm font-bold mb-4">Delivery Timeline</p>
            <OrderTimeline order={activeOrder} />
          </div>
        </div>
      )}
    </PageWraper>
  );
};

export default OrderTrackingPage;
