import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import ReuseSearchInput from "@/Components/ui/CustomUi/ReuseForm/ReuseSearchInput";
import ReuseFilterSelect from "@/Components/ui/CustomUi/ReuseForm/ReuseFilterSelect";
import ConfirmModal from "@/Components/ui/CustomUi/Modal/ConfirmModal";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import { Button } from "@/Components/ui/button";
import { Plus, Edit, Trash2, X } from "lucide-react";
import ProductFormModal from "@/Components/Dashboard/Website/ProductFormModal";
import { DUMMY_CATEGORIES, DUMMY_PRODUCTS } from "@/data/dummyStore";
import type { IProduct, IProductFormValues } from "@/types";
// import { useGetProductsQuery, useCreateProductMutation, useUpdateProductMutation, useDeleteProductMutation } from "@/redux/features/product/productApi";
// import tryCatchWrapper from "@/utils/tryCatchWrapper";

// TODO: wire to useGetProductsQuery once GET /products exists — this list
// lives in local component state until then, per AGENTS.md §2.8.
const ProductsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state as { openCreateFor?: string; filterCategoryId?: string } | null;

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>(navState?.filterCategoryId ?? "");
  const [categories] = useState(DUMMY_CATEGORIES);
  const [products, setProducts] = useState<IProduct[]>(DUMMY_PRODUCTS);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IProduct | null>(null);
  const [presetCategoryId, setPresetCategoryId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<IProduct | null>(null);

  // Arrived from Categories page "Add Product" — open the create modal
  // pre-scoped to that category, then clear the nav state so a refresh/back
  // doesn't keep reopening it.
  useEffect(() => {
    if (navState?.openCreateFor) {
      setEditing(null);
      setPresetCategoryId(navState.openCreateFor);
      setModalOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categoryLabel = (categoryId: string) => {
    const cat = categories.find((c) => c._id === categoryId);
    if (!cat) return "—";
    if (!cat.parentId) return cat.name;
    const parent = categories.find((c) => c._id === cat.parentId);
    return parent ? `${parent.name} / ${cat.name}` : cat.name;
  };

  const openAddModal = () => {
    setEditing(null);
    setPresetCategoryId(null);
    setModalOpen(true);
  };

  const openEditModal = (product: IProduct) => {
    setEditing(product);
    setPresetCategoryId(null);
    setModalOpen(true);
  };

  const handleSave = (values: IProductFormValues, image?: File) => {
    if (editing) {
      setProducts((prev) =>
        prev.map((p) => (p._id === editing._id ? { ...p, ...values, images: image ? [URL.createObjectURL(image)] : p.images } : p))
      );
      toast.success("Product updated");
    } else {
      setProducts((prev) => [
        ...prev,
        {
          ...values,
          _id: `prod-${Date.now()}`,
          images: image ? [URL.createObjectURL(image)] : ["https://placehold.co/80x80.png?text=Product"],
          createdAt: new Date().toISOString(),
        },
      ]);
      toast.success("Product added");
    }
  };

  const handleDelete = () => {
    if (!deleting) return;
    setProducts((prev) => prev.filter((p) => p._id !== deleting._id));
    toast.success("Product deleted");
    setDeleting(null);
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesTerm = !term || p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term);
      const matchesCategory = !categoryFilter || p.categoryId === categoryFilter;
      return matchesTerm && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const columns: Column<IProduct>[] = [
    {
      header: "Product Name", accessorKey: "name", width: 260, render: (val, row) => (
        <div className="flex items-center gap-3">
          <img src={row.images[0]} alt={val} className="size-10 rounded-md border border-border object-cover" />
          <div className="flex flex-col">
            <span className="font-bold">{val}</span>
            <span className="text-xs text-secondbase-color">{row.unit}</span>
          </div>
        </div>
      ),
    },
    { header: "SKU", accessorKey: "sku" },
    { header: "Category", accessorKey: "categoryId", render: (val) => categoryLabel(val) },
    {
      header: "Price", accessorKey: "price", render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-bold">৳{val}</span>
          {!!row.comparePrice && row.comparePrice > val && <span className="text-xs text-secondbase-color line-through">৳{row.comparePrice}</span>}
        </div>
      ),
    },
    {
      header: "Stock", accessorKey: "stock", render: (val) => (
        <span className={val > 0 ? (val < 20 ? "text-warning font-bold" : "text-success font-bold") : "text-error font-bold"}>{val}</span>
      ),
    },
    {
      header: "Status", accessorKey: "status", render: (val, row) => {
        if (row.stock === 0) return <Tag theme="error">Out of Stock</Tag>;
        return <Tag theme={val === "published" ? "success" : "warning"}>{val === "published" ? "Published" : "Draft"}</Tag>;
      },
    },
    {
      header: "Actions", accessorKey: "_id", render: (_, row) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 bg-blue-50" onClick={() => openEditModal(row)}>
            <Edit className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 bg-red-50" onClick={() => setDeleting(row)}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageWraper
      title="Products"
      description="Manage your product catalog, pricing, and inventory."
      actions={<Button onClick={openAddModal}><Plus className="mr-2 size-4" /> Add Product</Button>}
    >
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <ReuseSearchInput setSearch={setSearch} setPage={setCurrentPage} placeholder="Search products by name or SKU..." className="max-w-md" />
          <div className="flex items-center gap-2">
            <ReuseFilterSelect
              value={categoryFilter}
              onChange={(val) => { setCategoryFilter(val); setCurrentPage(1); }}
              placeholder="All Categories"
              options={categories.map((c) => ({ label: c.parentId ? `— ${c.name}` : c.name, value: c._id }))}
            />
            {categoryFilter && (
              <Button variant="ghost" size="sm" onClick={() => setCategoryFilter("")} className="text-secondbase-color">
                <X className="mr-1 size-3.5" /> Clear
              </Button>
            )}
          </div>
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

      <ProductFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editing={editing}
        categories={categories}
        presetCategoryId={presetCategoryId}
        onSave={handleSave}
      />

      <ConfirmModal
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        currentRecord={deleting}
        onConfirm={handleDelete}
        title="Delete this product?"
        description="It will be removed from the storefront immediately."
        confirmText="Delete"
        variant="danger"
        iconPreset="delete"
      />
    </PageWraper>
  );
};

export default ProductsPage;
