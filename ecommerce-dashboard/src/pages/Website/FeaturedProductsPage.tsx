import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import { Button } from "@/Components/ui/button";
import { ArrowUp, ArrowDown, Plus, X } from "lucide-react";
import ProductPickerModal from "@/Components/Dashboard/Website/ProductPickerModal";
import { DUMMY_PRODUCTS } from "@/data/dummyStore";
import type { IProduct } from "@/types";

// TODO: this is a manual placement list feeding /collections/featured-products
// and the homepage featured row — order here maps 1:1 to display order.
const INITIAL_FEATURED_IDS = ["prod-honey-sundarban", "prod-ghee-cow", "prod-spice-turmeric"];

const FeaturedProductsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [featuredIds, setFeaturedIds] = useState<string[]>(INITIAL_FEATURED_IDS);
  const [pickerOpen, setPickerOpen] = useState(false);

  const rows = useMemo(
    () => featuredIds.map((id, index) => ({ product: DUMMY_PRODUCTS.find((p) => p._id === id) as IProduct, order: index + 1 })).filter((r) => r.product),
    [featuredIds]
  );

  const availableProducts = DUMMY_PRODUCTS.filter((p) => !featuredIds.includes(p._id));

  const handleAdd = (ids: string[]) => {
    setFeaturedIds((prev) => [...prev, ...ids]);
    toast.success(`${ids.length} product${ids.length === 1 ? "" : "s"} added to Featured`);
  };

  const handleRemove = (id: string) => {
    setFeaturedIds((prev) => prev.filter((x) => x !== id));
    toast.success("Removed from Featured");
  };

  const move = (index: number, direction: -1 | 1) => {
    setFeaturedIds((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const columns: Column<{ product: IProduct; order: number }>[] = [
    {
      header: "Order", accessorKey: "order", width: 100, render: (val, _row, index) => (
        <div className="flex items-center gap-1">
          <span className="w-4 text-secondbase-color">{val}</span>
          <div className="flex flex-col">
            <button type="button" disabled={index === 0} onClick={() => move(index, -1)} className="disabled:opacity-25 text-secondbase-color hover:text-base-color">
              <ArrowUp className="size-3.5" />
            </button>
            <button type="button" disabled={index === rows.length - 1} onClick={() => move(index, 1)} className="disabled:opacity-25 text-secondbase-color hover:text-base-color">
              <ArrowDown className="size-3.5" />
            </button>
          </div>
        </div>
      ),
    },
    {
      header: "Product", accessorKey: "product", render: (val: IProduct) => (
        <div className="flex items-center gap-3">
          <img src={val.images[0]} alt={val.name} className="size-10 rounded-md border border-border object-cover" />
          <div>
            <p className="font-medium">{val.name}</p>
            <p className="text-xs text-secondbase-color">৳{val.price}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Actions", accessorKey: "product", render: (val: IProduct) => (
        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 bg-red-50" onClick={() => handleRemove(val._id)}>
          <X className="size-4" />
        </Button>
      ),
    },
  ];

  return (
    <PageWraper
      title="Featured Products"
      description="Manually curated products shown in the homepage featured row and /collections/featured-products."
      actions={<Button onClick={() => setPickerOpen(true)}><Plus className="mr-2 size-4" /> Add Product</Button>}
    >
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <ReusableTable
          data={rows}
          columns={columns}
          pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          limit={10}
          total={rows.length}
        />
      </div>

      <ProductPickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        title="Add to Featured Products"
        description="Select one or more products to show in the featured row."
        availableProducts={availableProducts}
        onAdd={handleAdd}
      />
    </PageWraper>
  );
};

export default FeaturedProductsPage;
