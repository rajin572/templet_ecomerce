import { useState } from 'react';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import { Button } from "@/Components/ui/button";
import { Eye, Filter } from "lucide-react";
import ReuseSearchInput from "@/Components/ui/CustomUi/ReuseForm/ReuseSearchInput";

const DUMMY_ORDERS = [
  { _id: "ORD-10052", customer: "Rahim Uddin", date: "2026-08-19 10:30 AM", amount: 2450, source: "Website", payment: "bKash", status: "Pending" },
  { _id: "ORD-10051", customer: "Karim Hassan", date: "2026-08-18 04:15 PM", amount: 850, source: "Facebook", payment: "COD", status: "Processing" },
  { _id: "ORD-10050", customer: "Salma Begum", date: "2026-08-18 11:20 AM", amount: 1200, source: "WhatsApp", payment: "Nagad", status: "Shipped" },
  { _id: "ORD-10049", customer: "Jamal Bhuiyan", date: "2026-08-17 09:45 AM", amount: 3500, source: "Website", payment: "Card", status: "Delivered" },
  { _id: "ORD-10048", customer: "Farzana Yasmin", date: "2026-08-17 08:10 AM", amount: 560, source: "Phone", payment: "COD", status: "Cancelled" },
];

const columns: Column<any>[] = [
  { header: "Order ID", accessorKey: "_id", render: (val) => <span className="font-bold text-base-color">{val}</span> },
  { header: "Customer", accessorKey: "customer" },
  { header: "Date", accessorKey: "date" },
  { header: "Amount", accessorKey: "amount", render: (val) => `৳${val}` },
  { header: "Source", accessorKey: "source", render: (val) => (
      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-semibold">{val}</span>
  )},
  { header: "Payment", accessorKey: "payment" },
  { header: "Status", accessorKey: "status", render: (val) => {
      let theme: any = "warning";
      if(val === "Delivered") theme = "success";
      if(val === "Shipped" || val === "Processing") theme = "blue";
      if(val === "Cancelled") theme = "error";
      return <Tag theme={theme}>{val}</Tag>
  }},
  { header: "Action", accessorKey: "_id", render: () => (
      <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10"><Eye className="mr-2 size-4" /> View</Button>
  ) },
];

const OrdersPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  return (
    <PageWraper 
      title="Orders" 
      description="View and manage all customer orders across all channels."
    >
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex gap-4 items-center">
            <ReuseSearchInput setSearch={setSearch} setPage={setCurrentPage} placeholder="Search by Order ID or Customer..." className="flex-1 max-w-md" />
            <Button variant="outline" className="border-border text-text-secondary"><Filter className="mr-2 size-4" /> Filter</Button>
        </div>
        <ReusableTable
          data={DUMMY_ORDERS.filter(o => o._id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase()))}
          columns={columns}
          pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          limit={10}
          total={5}
        />
      </div>
    </PageWraper>
  );
};

export default OrdersPage;
