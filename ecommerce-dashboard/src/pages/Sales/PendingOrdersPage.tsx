import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import ReuseSearchInput from "@/Components/ui/CustomUi/ReuseForm/ReuseSearchInput";
import ConfirmModal from "@/Components/ui/CustomUi/Modal/ConfirmModal";
import { Button } from "@/Components/ui/button";
import { CheckCircle2, XCircle, Eye } from "lucide-react";
import OrderDetailSheet from "@/Components/Dashboard/Orders/OrderDetailSheet";
import PaymentStatusCell from "@/Components/Dashboard/Orders/PaymentStatusCell";
import { useOrders, acceptOrder, rejectOrder } from "@/store/orderStore";
import type { IOrder } from "@/types";

// New orders land here first — accept to move them into Running Orders'
// fulfillment pipeline, or reject to cancel before any work starts.
const PendingOrdersPage = () => {
  const orders = useOrders();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<IOrder | null>(null);

  const pending = useMemo(() => orders.filter((o) => o.status === "Pending"), [orders]);
  const viewing = orders.find((o) => o._id === viewingId) ?? null;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return pending.filter((o) => !term || o.orderId.toLowerCase().includes(term) || o.customerName.toLowerCase().includes(term));
  }, [pending, search]);

  const handleAccept = (order: IOrder) => {
    acceptOrder(order._id);
    toast.success(`${order.orderId} accepted — moved to Running Orders`);
  };

  const handleReject = (order: IOrder, reason?: string) => {
    rejectOrder(order._id, reason);
    toast.success(`${order.orderId} rejected`);
    setRejecting(null);
  };

  const columns: Column<IOrder>[] = [
    { header: "Order ID", accessorKey: "orderId", render: (val) => <span className="font-bold text-base-color">{val}</span> },
    { header: "Customer", accessorKey: "customerName", render: (val, row) => (
      <div className="flex flex-col">
        <span>{val}</span>
        <span className="text-xs text-secondbase-color">{row.customerPhone}</span>
      </div>
    ) },
    { header: "Placed", accessorKey: "placedAt", render: (val) => new Date(val).toLocaleString("en-BD", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true }) },
    { header: "Amount", accessorKey: "total", render: (val) => `৳${val}` },
    { header: "Payment", accessorKey: "paymentMethod", render: (_val, row) => <PaymentStatusCell order={row} /> },
    {
      header: "Actions", accessorKey: "_id", render: (_, row) => (
        <div className="flex gap-2">
          <Button size="sm" className="bg-success hover:bg-success/90 text-white" onClick={() => handleAccept(row)}>
            <CheckCircle2 className="mr-1.5 size-4" /> Accept
          </Button>
          <Button size="sm" variant="outline" className="border-error text-error hover:bg-error/5" onClick={() => setRejecting(row)}>
            <XCircle className="mr-1.5 size-4" /> Reject
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 bg-blue-50" onClick={() => setViewingId(row._id)}>
            <Eye className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageWraper title="Pending Orders" description="New orders awaiting confirmation. Accept to start fulfillment, or reject to cancel.">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <ReuseSearchInput setSearch={setSearch} setPage={setCurrentPage} placeholder="Search by Order ID or Customer..." className="max-w-md" />
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

      <ConfirmModal
        open={!!rejecting}
        onCancel={() => setRejecting(null)}
        currentRecord={rejecting}
        onConfirm={handleReject}
        title={`Reject ${rejecting?.orderId ?? "this order"}?`}
        description="The customer will see this order as cancelled."
        confirmText="Reject Order"
        variant="danger"
        iconPreset="decline"
        withReason
        reasonLabel="Rejection reason"
        reasonRequired
      />
    </PageWraper>
  );
};

export default PendingOrdersPage;
