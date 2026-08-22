import { useState } from 'react';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import { Button } from "@/Components/ui/button";
import { Eye, Download } from "lucide-react";
import ReuseSearchInput from "@/Components/ui/CustomUi/ReuseForm/ReuseSearchInput";

const DUMMY_CUSTOMERS = [
  { _id: "CUST-001", name: "Rahim Uddin", phone: "01711223344", email: "rahim@example.com", orders: 12, spent: 15400, type: "Registered", status: "Active" },
  { _id: "CUST-002", name: "Karim Hassan", phone: "01822334455", email: "karim@example.com", orders: 3, spent: 2850, type: "Guest", status: "Active" },
  { _id: "CUST-003", name: "Salma Begum", phone: "01933445566", email: "salma@example.com", orders: 45, spent: 89200, type: "Registered", status: "Active" },
  { _id: "CUST-004", name: "Jamal Bhuiyan", phone: "01644556677", email: "", orders: 1, spent: 3500, type: "Offline", status: "Active" },
  { _id: "CUST-005", name: "Fraud User", phone: "01555667788", email: "scammer@example.com", orders: 0, spent: 0, type: "Registered", status: "Blocked" },
];

const columns: Column<any>[] = [
  { header: "Customer Name", accessorKey: "name", render: (val, row) => (
      <div className="flex flex-col">
          <span className="font-bold text-base-color">{val}</span>
          <span className="text-xs text-text-muted">{row._id}</span>
      </div>
  ) },
  { header: "Contact", accessorKey: "phone", render: (val, row) => (
      <div className="flex flex-col">
          <span className="text-sm">{val}</span>
          {row.email && <span className="text-xs text-text-muted">{row.email}</span>}
      </div>
  ) },
  { header: "Type", accessorKey: "type", render: (val) => <span className="bg-gray-100 px-2 py-1 rounded text-xs">{val}</span> },
  { header: "Total Orders", accessorKey: "orders", render: (val) => <span className="font-bold">{val}</span> },
  { header: "Total Spent", accessorKey: "spent", render: (val) => `৳${val}` },
  { header: "Status", accessorKey: "status", render: (val) => (
      <Tag theme={val === "Active" ? "success" : "error"}>{val}</Tag>
  )},
  { header: "Action", accessorKey: "_id", render: () => (
      <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10"><Eye className="mr-2 size-4" /> Profile</Button>
  ) },
];

const CustomersPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  return (
    <PageWraper 
      title="Customers" 
      description="Manage customer accounts, view order history and lifetime value."
      actions={<Button variant="outline"><Download className="mr-2 size-4" /> Export CSV</Button>}
    >
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex justify-between items-center">
            <ReuseSearchInput setSearch={setSearch} setPage={setCurrentPage} placeholder="Search by name, phone or email..." className="max-w-md" />
        </div>
        <ReusableTable
          data={DUMMY_CUSTOMERS.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search))}
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

export default CustomersPage;
