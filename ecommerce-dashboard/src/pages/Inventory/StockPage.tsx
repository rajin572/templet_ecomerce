import { useState } from 'react';
import { toast } from 'sonner';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import { Button } from "@/Components/ui/button";
import { ArrowRightLeft, FileDown } from "lucide-react";
import ReuseSearchInput from "@/Components/ui/CustomUi/ReuseForm/ReuseSearchInput";
import StockAdjustModal from "@/Components/Dashboard/Inventory/StockAdjustModal";
import { DUMMY_PRODUCTS } from "@/data/dummyStore";
import type { IProduct } from "@/types";
// import { useGetStockLevelsQuery, useAdjustStockMutation } from "@/redux/features/inventory/inventoryApi";

// TODO: wire to useGetStockLevelsQuery once GET /inventory/stock exists —
// this reads the shared product catalog's stock field locally until then.
const StockPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<IProduct[]>(DUMMY_PRODUCTS);
  const [adjusting, setAdjusting] = useState<IProduct | null>(null);

  const handleAdjust = (productId: string, delta: number, reason: string) => {
    setProducts((prev) => prev.map((p) => (p._id === productId ? { ...p, stock: Math.max(0, p.stock + delta) } : p)));
    toast.success(`Stock ${delta > 0 ? "increased" : "decreased"} by ${Math.abs(delta)} — ${reason}`);
  };

  const columns: Column<IProduct>[] = [
    {
      header: "Product / SKU", accessorKey: "name", render: (val, row) => (
        <div className="flex items-center gap-3">
          <img src={row.images[0]} alt={val} className="size-9 rounded-md border border-border object-cover" />
          <div className="flex flex-col">
            <span className="font-bold">{val}</span>
            <span className="text-xs text-gray-500">{row.sku}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Available Qty", accessorKey: "stock", render: (val, row) => (
        <span className={val > 0 ? (val < 20 ? "text-warning font-bold" : "text-success font-bold") : "text-error font-bold"}>
          {val} {row.unit}
        </span>
      ),
    },
    {
      header: "Status", accessorKey: "stock", render: (val) => {
        const theme = val === 0 ? "error" : val < 20 ? "warning" : "success";
        const label = val === 0 ? "Out of Stock" : val < 20 ? "Low Stock" : "In Stock";
        return <Tag theme={theme}>{label}</Tag>;
      },
    },
    {
      header: "Action", accessorKey: "_id", render: (_, row) => (
        <Button variant="outline" size="sm" className="text-primary border-primary" onClick={() => setAdjusting(row)}>
          <ArrowRightLeft className="mr-2 size-3" /> Adjust
        </Button>
      ),
    },
  ];

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

  return (
    <PageWraper
      title="Inventory Stock"
      description="Monitor real-time inventory levels and record manual stock adjustments."
      actions={<Button variant="outline" onClick={() => toast.info("Export will be available once reporting is wired to the API.")}><FileDown className="mr-2 size-4" /> Export Report</Button>}
    >
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex justify-between items-center">
          <ReuseSearchInput setSearch={setSearch} setPage={setCurrentPage} placeholder="Search by SKU or Product Name..." className="max-w-md" />
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

      <StockAdjustModal open={!!adjusting} onOpenChange={(o) => !o && setAdjusting(null)} product={adjusting} onAdjust={handleAdjust} />
    </PageWraper>
  );
};

export default StockPage;
