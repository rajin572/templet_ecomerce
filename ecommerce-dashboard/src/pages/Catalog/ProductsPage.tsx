import { useState } from 'react';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import { Button } from "@/Components/ui/button";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import ReuseSearchInput from "@/Components/ui/CustomUi/ReuseForm/ReuseSearchInput";

const DUMMY_PRODUCTS = [
  { _id: "1", name: "Premium Sundarbans Honey", sku: "HONEY-01", category: "Honey", price: 850, stock: 120, status: "Published" },
  { _id: "2", name: "Organic Mustard Oil", sku: "OIL-02", category: "Oil & Ghee", price: 350, stock: 45, status: "Published" },
  { _id: "3", name: "Deshi Ghee (Cow)", sku: "GHEE-01", category: "Oil & Ghee", price: 1200, stock: 0, status: "Out of Stock" },
  { _id: "4", name: "Turmeric Powder", sku: "SPICE-01", category: "Spices", price: 180, stock: 250, status: "Draft" },
  { _id: "5", name: "Premium Ajwa Dates", sku: "DATE-05", category: "Dates", price: 2200, stock: 15, status: "Published" },
];

const columns: Column<any>[] = [
  { header: "Product Name", accessorKey: "name", width: 250 },
  { header: "SKU", accessorKey: "sku" },
  { header: "Category", accessorKey: "category" },
  { header: "Price", accessorKey: "price", render: (val) => `৳${val}` },
  { header: "Stock", accessorKey: "stock", render: (val) => (
    <span className={val > 0 ? (val < 20 ? "text-warning font-bold" : "text-success font-bold") : "text-error font-bold"}>
        {val}
    </span>
  )},
  { header: "Status", accessorKey: "status", render: (val) => (
    <Tag theme={val === "Published" ? "success" : val === "Draft" ? "warning" : "error"}>{val}</Tag>
  )},
  { header: "Actions", accessorKey: "_id", render: () => (
      <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 bg-blue-50"><Eye className="size-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-500 bg-orange-50"><Edit className="size-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 bg-red-50"><Trash2 className="size-4" /></Button>
      </div>
  ) },
];

const ProductsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  return (
    <PageWraper 
      title="Products" 
      description="Manage your product catalog, pricing, and inventory."
      actions={<Button className="bg-primary hover:bg-primary-dark text-white"><Plus className="mr-2 size-4" /> Add Product</Button>}
    >
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex justify-between items-center">
            <ReuseSearchInput setSearch={setSearch} setPage={setCurrentPage} placeholder="Search products by name or SKU..." className="max-w-md" />
        </div>
        <ReusableTable
          data={DUMMY_PRODUCTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))}
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

export default ProductsPage;
