import { useState } from 'react';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import { Button } from "@/Components/ui/button";
import { ArrowRightLeft, FileDown } from "lucide-react";
import ReuseSearchInput from "@/Components/ui/CustomUi/ReuseForm/ReuseSearchInput";

const DUMMY_STOCK = [
  { _id: "1", name: "Premium Sundarbans Honey", sku: "HONEY-01", warehouse: "Main Warehouse", qty: 120, status: "In Stock" },
  { _id: "2", name: "Organic Mustard Oil", sku: "OIL-02", warehouse: "Main Warehouse", qty: 45, status: "Low Stock" },
  { _id: "3", name: "Deshi Ghee (Cow)", sku: "GHEE-01", warehouse: "Dhaka Hub", qty: 0, status: "Out of Stock" },
  { _id: "4", name: "Turmeric Powder", sku: "SPICE-01", warehouse: "Main Warehouse", qty: 250, status: "In Stock" },
];

const columns: Column<any>[] = [
  { header: "Product / SKU", accessorKey: "name", render: (val, row) => (
      <div className="flex flex-col">
          <span className="font-bold">{val}</span>
          <span className="text-xs text-gray-500">{row.sku}</span>
      </div>
  ) },
  { header: "Warehouse", accessorKey: "warehouse" },
  { header: "Available Qty", accessorKey: "qty", render: (val) => (
    <span className={val > 0 ? (val < 50 ? "text-warning font-bold" : "text-success font-bold") : "text-error font-bold"}>
        {val} Units
    </span>
  )},
  { header: "Status", accessorKey: "status", render: (val) => {
      let theme: any = "warning";
      if(val === "In Stock") theme = "success";
      if(val === "Out of Stock") theme = "error";
      return <Tag theme={theme}>{val}</Tag>
  }},
  { header: "Action", accessorKey: "_id", render: () => (
      <Button variant="outline" size="sm" className="text-primary border-primary"><ArrowRightLeft className="mr-2 size-3" /> Adjust</Button>
  ) },
];

const StockPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  return (
    <PageWraper 
      title="Inventory Stock" 
      description="Monitor real-time inventory levels across all warehouses."
      actions={<Button variant="outline"><FileDown className="mr-2 size-4" /> Export Report</Button>}
    >
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex justify-between items-center">
            <ReuseSearchInput setSearch={setSearch} setPage={setCurrentPage} placeholder="Search by SKU or Product Name..." className="max-w-md" />
        </div>
        <ReusableTable
          data={DUMMY_STOCK.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))}
          columns={columns}
          pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          limit={10}
          total={4}
        />
      </div>
    </PageWraper>
  );
};

export default StockPage;
