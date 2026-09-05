import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import ReuseSearchInput from "@/Components/ui/CustomUi/ReuseForm/ReuseSearchInput";
import ReuseFilterSelect from "@/Components/ui/CustomUi/ReuseForm/ReuseFilterSelect";
import ConfirmModal from "@/Components/ui/CustomUi/Modal/ConfirmModal";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import { Button } from "@/Components/ui/button";
import { ArrowRight, Ban, Eye } from "lucide-react";
import OrderDetailSheet from "@/Components/Dashboard/Orders/OrderDetailSheet";
import ShipOrderModal from "@/Components/Dashboard/Orders/ShipOrderModal";
import { getOrderStatusTheme, getPaymentStatusTheme } from "@/utils/orderStatus";
import { useOrders, advanceOrder, shipOrder, cancelOrder, NEXT_STATUS } from "@/store/orderStore";
import type { IOrder, IOrderStatus } from "@/types";

const RUNNING_STATUSES: IOrderStatus[] = ["Confirmed", "Processing", "Packed", "Shipped"];

// Accepted orders live here until they're Delivered (or Cancelled mid-flow) —
// each row can be advanced one stage at a time through the fulfillment
// pipeline: Confirmed -> Processing -> Packed -> Shipped -> Delivered.
const RunningOrdersPage = () => {
  const orders = useOrders();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [shipping, setShipping] = useState<IOrder | null>(null);
  const [cancelling, setCancelling] = useState<IOrder | null>(null);

  const running = useMemo(() => orders.filter((o) => RUNNING_STATUSES.includes(o.status)), [orders]);
  const viewing = orders.find((o) => o._id === viewingId) ?? null;
  const shippingOrder = shipping ? orders.find((o) => o._id === shipping._id) ?? null : null;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return running.filter((o) => {
      const matchesTerm = !term || o.orderId.toLowerCase().includes(term) || o.customerName.toLowerCase().includes(term);
      const matchesStatus = !statusFilter || o.status === statusFilter;
      return matchesTerm && matchesStatus;
    });
  }, [running, search, statusFilter]);

  const handleAdvance = (order: IOrder) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    if (next === "Shipped") { setShipping(order); return; }
    advanceOrder(order._id, next);
    toast.success(`${order.orderId} moved to ${next}`);
  };

  const handleShip = (orderId: string, courierName: string, courierTrackingId: string) => {
    shipOrder(orderId, courierName, courierTrackingId);
    toast.success("Order marked as Shipped");
  };

  const handleCancel = (order: IOrder, reason?: string) => {
    cancelOrder(order._id, reason);
    toast.success(`${order.orderId} cancelled`);
    setCancelling(null);
  };

  const columns: Column<IOrder>[] = [
    { header: "Order ID", accessorKey: "orderId", render: (val) => <span className="font-bold text-base-color">{val}</span> },
    { header: "Customer", accessorKey: "customerName", render: (val, row) => (
      <div className="flex flex-col">
        <span>{val}</span>
        <span className="text-xs text-secondbase-color">{row.customerPhone}</span>
      </div>
    ) },
    { header: "Amount", accessorKey: "total", render: (val) => `৳${val}` },
    { header: "Payment", accessorKey: "paymentMethod", render: (val, row) => (
      <div className="flex flex-col">
        <span>{val}</span>
        <Tag theme={getPaymentStatusTheme(row.paymentStatus)} className="mt-0.5 w-fit">{row.paymentStatus}</Tag>
      </div>
    ) },
    { header: "Status", accessorKey: "status", render: (val) => <Tag theme={getOrderStatusTheme(val)}>{val}</Tag> },
    {
      header: "Actions", accessorKey: "_id", render: (_, row) => {
        const next = NEXT_STATUS[row.status];
        return (
          <div className="flex gap-2">
            {next && (
              <Button size="sm" onClick={() => handleAdvance(row)}>
                <ArrowRight className="mr-1.5 size-4" /> {next === "Shipped" ? "Mark Shipped" : `Mark ${next}`}
              </Button>
            )}
            <Button size="sm" variant="outline" className="border-error text-error hover:bg-error/5" onClick={() => setCancelling(row)}>
              <Ban className="mr-1.5 size-4" /> Cancel
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 bg-blue-50" onClick={() => setViewingId(row._id)}>
              <Eye className="size-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <PageWraper title="Running Orders" description="Accepted orders moving through confirmation, processing, packing and shipping.">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <ReuseSearchInput setSearch={setSearch} setPage={setCurrentPage} placeholder="Search by Order ID or Customer..." className="flex-1 max-w-md" />
          <ReuseFilterSelect
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
            placeholder="All Stages"
            allowClear
            onClear={() => setStatusFilter("")}
            options={RUNNING_STATUSES.map((s) => ({ label: s, value: s }))}
          />
        </div>
        <ReusableTable
          data={filtered}
          columns={columns}
          pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          limit={10}
          total={filtered.length}
        />
      </div>

      <OrderDetailSheet open={!!viewing} onOpenChange={(o) => !o && setViewingId(null)} order={viewing} />
      <ShipOrderModal open={!!shipping} onOpenChange={(o) => !o && setShipping(null)} order={shippingOrder} onShip={handleShip} />

      <ConfirmModal
        open={!!cancelling}
        onCancel={() => setCancelling(null)}
        currentRecord={cancelling}
        onConfirm={handleCancel}
        title={`Cancel ${cancelling?.orderId ?? "this order"}?`}
        description="The customer will see this order as cancelled."
        confirmText="Cancel Order"
        variant="danger"
        iconPreset="cancel"
        withReason
        reasonLabel="Cancellation reason"
        reasonRequired
      />
    </PageWraper>
  );
};

export default RunningOrdersPage;
