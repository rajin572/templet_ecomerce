import ReusableSheet from "@/Components/ui/CustomUi/ReuseableSheet";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import { getOrderStatusTheme } from "@/utils/orderStatus";
import { useOrders } from "@/store/orderStore";
import type { ICustomer } from "@/types";

interface CustomerProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: ICustomer | null;
}

export default function CustomerProfileSheet({ open, onOpenChange, customer }: CustomerProfileSheetProps) {
  const allOrders = useOrders();
  if (!customer) return null;

  const orders = allOrders.filter((o) => o.customerPhone === customer.phone);

  return (
    <ReusableSheet open={open} onOpenChange={onOpenChange} title={customer.name} description={`Customer since ${new Date(customer.joinedAt).toLocaleDateString()}`} width="sm:max-w-lg">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Tag theme={customer.status === "Active" ? "success" : "error"}>{customer.status}</Tag>
          <Tag theme="blue">{customer.type}</Tag>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-secondbase-color">Phone</p>
            <p className="text-sm font-medium">{customer.phone}</p>
          </div>
          <div>
            <p className="text-xs text-secondbase-color">Email</p>
            <p className="text-sm font-medium">{customer.email || "—"}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-secondbase-color">Address</p>
            <p className="text-sm font-medium">{customer.address || "—"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-secondbase-color">Total Orders</p>
            <p className="text-xl font-bold">{customer.orders}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-secondbase-color">Lifetime Spend</p>
            <p className="text-xl font-bold text-secondary-color">৳{customer.spent}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-bold mb-2">Order History</p>
          {orders.length === 0 ? (
            <p className="text-sm text-secondbase-color">No orders placed yet.</p>
          ) : (
            <div className="space-y-2">
              {orders.map((o) => (
                <div key={o._id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <p className="text-sm font-bold">{o.orderId}</p>
                    <p className="text-xs text-secondbase-color">{new Date(o.placedAt).toLocaleDateString()} · ৳{o.total}</p>
                  </div>
                  <Tag theme={getOrderStatusTheme(o.status)}>{o.status}</Tag>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ReusableSheet>
  );
}
