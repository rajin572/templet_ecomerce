import { useState } from 'react';
import { toast } from 'sonner';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import { Button } from "@/Components/ui/button";
import { Eye, Download } from "lucide-react";
import ReuseSearchInput from "@/Components/ui/CustomUi/ReuseForm/ReuseSearchInput";
import CustomerProfileSheet from "@/Components/Dashboard/Customers/CustomerProfileSheet";
import { DUMMY_CUSTOMERS } from "@/data/dummyStore";
import type { ICustomer } from "@/types";
// import { useGetCustomersQuery } from "@/redux/features/customer/customerApi";

// TODO: wire to useGetCustomersQuery once GET /customers exists — this list
// lives in local component state until then, per AGENTS.md §2.8.
const CustomersPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [customers] = useState<ICustomer[]>(DUMMY_CUSTOMERS);
  const [viewing, setViewing] = useState<ICustomer | null>(null);

  const columns: Column<ICustomer>[] = [
    {
      header: "Customer Name", accessorKey: "name", render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-base-color">{val}</span>
          <span className="text-xs text-text-muted">{row._id}</span>
        </div>
      ),
    },
    {
      header: "Contact", accessorKey: "phone", render: (val, row) => (
        <div className="flex flex-col">
          <span className="text-sm">{val}</span>
          {row.email && <span className="text-xs text-text-muted">{row.email}</span>}
        </div>
      ),
    },
    { header: "Type", accessorKey: "type", render: (val) => <span className="bg-gray-100 px-2 py-1 rounded text-xs">{val}</span> },
    { header: "Total Orders", accessorKey: "orders", render: (val) => <span className="font-bold">{val}</span> },
    { header: "Total Spent", accessorKey: "spent", render: (val) => `৳${val}` },
    { header: "Status", accessorKey: "status", render: (val) => <Tag theme={val === "Active" ? "success" : "error"}>{val}</Tag> },
    {
      header: "Action", accessorKey: "_id", render: (_, row) => (
        <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 hover:text-primary" onClick={() => setViewing(row)}>
          <Eye className="mr-2 size-4" /> Profile
        </Button>
      ),
    },
  ];

  const filtered = customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));

  return (
    <PageWraper
      title="Customers"
      description="Manage customer accounts, view order history and lifetime value."
      actions={<Button variant="outline" onClick={() => toast.info("CSV export will be available once reporting is wired to the API.")}><Download className="mr-2 size-4" /> Export CSV</Button>}
    >
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex justify-between items-center">
          <ReuseSearchInput setSearch={setSearch} setPage={setCurrentPage} placeholder="Search by name, phone or email..." className="max-w-md" />
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

      <CustomerProfileSheet open={!!viewing} onOpenChange={(o) => !o && setViewing(null)} customer={viewing} />
    </PageWraper>
  );
};

export default CustomersPage;
