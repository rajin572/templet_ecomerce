import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import ReuseSearchInput from "@/Components/ui/CustomUi/ReuseForm/ReuseSearchInput";
import ReuseFilterSelect from "@/Components/ui/CustomUi/ReuseForm/ReuseFilterSelect";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import { Button } from "@/Components/ui/button";
import { Eye, X } from "lucide-react";
import OrderDetailSheet from "@/Components/Dashboard/Orders/OrderDetailSheet";
import PaymentStatusCell from "@/Components/Dashboard/Orders/PaymentStatusCell";
import { getOrderStatusTheme } from "@/utils/orderStatus";
import { useOrders } from "@/store/orderStore";
import type { IOrder } from "@/types";
// import { useGetOrdersQuery } from "@/redux/features/order/orderApi";

// TODO: wire to useGetOrdersQuery once GET /orders exists — reads the shared
// in-memory order store (src/store/orderStore.ts) until then.
const OrdersPage = () => {
  const location = useLocation();
  const navState = location.state as { searchOrderId?: string } | null;

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState(navState?.searchOrderId ?? "");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const orders = useOrders();
  const [viewingId, setViewingId] = useState<string | null>(null);
  const viewing = orders.find((o) => o._id === viewingId) ?? null;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesTerm = !term || o.orderId.toLowerCase().includes(term) || o.customerName.toLowerCase().includes(term);
      const matchesStatus = !statusFilter || o.status === statusFilter;
      const matchesPayment = !paymentFilter || o.paymentMethod === paymentFilter;
      return matchesTerm && matchesStatus && matchesPayment;
    });
  }, [orders, search, statusFilter, paymentFilter]);

  const columns: Column<IOrder>[] = [
    { header: "Order ID", accessorKey: "orderId", render: (val) => <span className="font-bold text-base-color">{val}</span> },
    { header: "Customer", accessorKey: "customerName" },
    { header: "Date", accessorKey: "placedAt", render: (val) => new Date(val).toLocaleString("en-BD", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true }) },
    { header: "Amount", accessorKey: "total", render: (val) => `৳${val}` },
    { header: "Source", accessorKey: "source", render: (val) => <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-semibold">{val}</span> },
    { header: "Payment", accessorKey: "paymentMethod", render: (_val, row) => <PaymentStatusCell order={row} /> },
    { header: "Status", accessorKey: "status", render: (val) => <Tag theme={getOrderStatusTheme(val)}>{val}</Tag> },
    {
      header: "Action", accessorKey: "_id", render: (_, row) => (
        <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 hover:text-primary" onClick={() => setViewingId(row._id)}>
          <Eye className="mr-2 size-4" /> View
        </Button>
      ),
    },
  ];

  return (
    <PageWraper title="Orders" description="View and manage all customer orders across all channels.">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <ReuseSearchInput
            setSearch={setSearch}
            setPage={setCurrentPage}
            defaultValue={navState?.searchOrderId}
            placeholder="Search by Order ID or Customer..."
            className="flex-1 max-w-md"
          />
          <ReuseFilterSelect
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
            placeholder="All Statuses"
            allowClear
            onClear={() => setStatusFilter("")}
            options={["Pending", "Confirmed", "Processing", "Packed", "Shipped", "Delivered", "Cancelled", "Returned"].map((s) => ({ label: s, value: s }))}
          />
          <ReuseFilterSelect
            value={paymentFilter}
            onChange={(val) => { setPaymentFilter(val); setCurrentPage(1); }}
            placeholder="All Payment Methods"
            allowClear
            onClear={() => setPaymentFilter("")}
            options={["COD", "bKash", "Nagad"].map((s) => ({ label: s, value: s }))}
          />
          {(statusFilter || paymentFilter) && (
            <Button variant="ghost" size="sm" onClick={() => { setStatusFilter(""); setPaymentFilter(""); }} className="text-secondbase-color">
              <X className="mr-1 size-3.5" /> Clear filters
            </Button>
          )}
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
    </PageWraper>
  );
};

export default OrdersPage;
