import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import ReuseSearchInput from "@/Components/ui/CustomUi/ReuseForm/ReuseSearchInput";
import ReuseFilterSelect from "@/Components/ui/CustomUi/ReuseForm/ReuseFilterSelect";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import { Button } from "@/Components/ui/button";
import { BadgeCheck, Eye, Plus } from "lucide-react";
import OrderDetailSheet from "@/Components/Dashboard/Orders/OrderDetailSheet";
import AddReturnModal from "@/Components/Dashboard/Orders/AddReturnModal";
import { useOrders, markRefunded, returnOrder } from "@/store/orderStore";
import type { IOrder } from "@/types";

// Orders land here once marked "Returned" — either self-service via "Add
// Return" below, or from a Delivered order's own detail drawer. Refunds are
// tracked separately from the order status so a return stays visible until
// money actually moves.
const ReturnsPage = () => {
  const orders = useOrders();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [refundFilter, setRefundFilter] = useState("");
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [addingReturn, setAddingReturn] = useState(false);

  const returned = useMemo(() => orders.filter((o) => o.status === "Returned"), [orders]);
  const deliveredOrders = useMemo(() => orders.filter((o) => o.status === "Delivered"), [orders]);
  const viewing = orders.find((o) => o._id === viewingId) ?? null;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return returned.filter((o) => {
      const matchesTerm = !term || o.orderId.toLowerCase().includes(term) || o.customerName.toLowerCase().includes(term);
      const matchesRefund = !refundFilter || o.refundStatus === refundFilter;
      return matchesTerm && matchesRefund;
    });
  }, [returned, search, refundFilter]);

  const returnReason = (order: IOrder) => order.statusHistory.filter((e) => e.status === "Returned").slice(-1)[0]?.note ?? "—";

  const handleMarkRefunded = (order: IOrder) => {
    markRefunded(order._id);
    toast.success(`${order.orderId} marked as refunded`);
  };

  const handleAddReturn = (orderId: string, reason: string) => {
    returnOrder(orderId, reason);
    const order = orders.find((o) => o._id === orderId);
    toast.success(`${order?.orderId ?? "Order"} marked as returned`);
  };

  const columns: Column<IOrder>[] = [
    { header: "Order ID", accessorKey: "orderId", render: (val) => <span className="font-bold text-base-color">{val}</span> },
    {
      header: "Customer", accessorKey: "customerName", render: (val, row) => (
        <div className="flex flex-col">
          <span>{val}</span>
          <span className="text-xs text-secondbase-color">{row.customerPhone}</span>
        </div>
      ),
    },
    { header: "Amount", accessorKey: "total", render: (val) => `৳${val}` },
    { header: "Return Reason", accessorKey: "_id", width: 260, render: (_val, row) => <span className="text-sm line-clamp-2">{returnReason(row)}</span> },
    {
      header: "Refund", accessorKey: "refundStatus", render: (val) => (
        <Tag theme={val === "refunded" ? "success" : "warning"} className="capitalize">{val ?? "pending"}</Tag>
      ),
    },
    {
      header: "Actions", accessorKey: "_id", render: (_, row) => (
        <div className="flex gap-2">
          {row.refundStatus === "pending" && (
            <Button size="sm" onClick={() => handleMarkRefunded(row)}>
              <BadgeCheck className="mr-1.5 size-4" /> Mark Refunded
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 bg-blue-50" onClick={() => setViewingId(row._id)}>
            <Eye className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageWraper
      title="Returns"
      description="Orders the customer sent back after delivery, and whether the refund has gone out yet."
      actions={
        <Button onClick={() => setAddingReturn(true)}>
          <Plus className="mr-2 size-4" /> Add Return
        </Button>
      }
    >
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <ReuseSearchInput setSearch={setSearch} setPage={setCurrentPage} placeholder="Search by Order ID or Customer..." className="flex-1 max-w-md" />
          <ReuseFilterSelect
            value={refundFilter}
            onChange={(val) => { setRefundFilter(val); setCurrentPage(1); }}
            placeholder="All Refund Status"
            allowClear
            onClear={() => setRefundFilter("")}
            options={[{ label: "Pending", value: "pending" }, { label: "Refunded", value: "refunded" }]}
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
      <AddReturnModal open={addingReturn} onOpenChange={setAddingReturn} eligibleOrders={deliveredOrders} onSubmit={handleAddReturn} />
    </PageWraper>
  );
};

export default ReturnsPage;
