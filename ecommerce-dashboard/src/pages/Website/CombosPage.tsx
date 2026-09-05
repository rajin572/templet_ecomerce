import { useState } from 'react';
import { toast } from 'sonner';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import ReuseSearchInput from "@/Components/ui/CustomUi/ReuseForm/ReuseSearchInput";
import ConfirmModal from "@/Components/ui/CustomUi/Modal/ConfirmModal";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import { Button } from "@/Components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import ComboFormModal from "@/Components/Dashboard/Website/ComboFormModal";
import { DUMMY_PRODUCTS } from "@/data/dummyStore";
import type { ICombo, IComboFormValues } from "@/types";
// import { useGetCombosQuery, useCreateComboMutation, useUpdateComboMutation, useDeleteComboMutation } from "@/redux/features/combo/comboApi";
// import tryCatchWrapper from "@/utils/tryCatchWrapper";

// TODO: wire to useGetCombosQuery once GET /combos exists — this list lives
// in local component state until then, per AGENTS.md §2.8.
const DUMMY_COMBOS: ICombo[] = [
  { _id: "1", name: "মধু ও ঘি কম্বো প্যাক", productIds: ["prod-honey-sundarban", "prod-ghee-cow"], comboPrice: 1850, status: "active", createdAt: "2026-08-12T00:00:00Z" },
  { _id: "2", name: "মশলা কম্বো (৪ পদ)", productIds: ["prod-spice-cinnamon", "prod-spice-cardamom", "prod-spice-turmeric", "prod-spice-chili"], comboPrice: 780, status: "active", createdAt: "2026-08-14T00:00:00Z" },
  { _id: "3", name: "ড্রাই ফ্রুটস কম্বো", productIds: ["prod-dates-ajwa", "prod-nuts-cashew", "prod-nuts-almond"], comboPrice: 3600, status: "inactive", createdAt: "2026-08-16T00:00:00Z" },
];

const CombosPage = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [products] = useState(DUMMY_PRODUCTS);
  const [combos, setCombos] = useState<ICombo[]>(DUMMY_COMBOS);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ICombo | null>(null);
  const [deleting, setDeleting] = useState<ICombo | null>(null);

  const openAddModal = () => { setEditing(null); setModalOpen(true); };
  const openEditModal = (combo: ICombo) => { setEditing(combo); setModalOpen(true); };

  const regularPriceOf = (combo: ICombo) => combo.productIds.reduce((sum, id) => sum + (products.find((p) => p._id === id)?.price ?? 0), 0);
  const productNames = (combo: ICombo) => combo.productIds.map((id) => products.find((p) => p._id === id)?.name ?? "Unknown product").join(", ");

  const handleSave = (values: IComboFormValues) => {
    if (editing) {
      setCombos((prev) => prev.map((c) => (c._id === editing._id ? { ...c, ...values } : c)));
      toast.success("Combo updated");
    } else {
      setCombos((prev) => [...prev, { ...values, _id: `combo-${Date.now()}`, createdAt: new Date().toISOString() }]);
      toast.success("Combo created");
    }
  };

  const handleDelete = () => {
    if (!deleting) return;
    setCombos((prev) => prev.filter((c) => c._id !== deleting._id));
    toast.success("Combo deleted");
    setDeleting(null);
  };

  const filtered = combos.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const columns: Column<ICombo>[] = [
    {
      header: "Combo Name", accessorKey: "name", render: (val, row) => (
        <div>
          <p className="font-bold">{val}</p>
          <p className="text-xs text-secondbase-color max-w-xs truncate">{productNames(row)}</p>
        </div>
      ),
    },
    { header: "Products", accessorKey: "productIds", render: (val) => val.length },
    { header: "Combo Price", accessorKey: "comboPrice", render: (val) => `৳${val}` },
    { header: "Regular Price", accessorKey: "_id", render: (_, row) => <span className="line-through text-secondbase-color">৳{regularPriceOf(row)}</span> },
    { header: "Status", accessorKey: "status", render: (val) => <Tag theme={val === "active" ? "success" : "error"}>{val === "active" ? "Active" : "Inactive"}</Tag> },
    {
      header: "Actions", accessorKey: "_id", render: (_, row) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 bg-blue-50" onClick={() => openEditModal(row)}>
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
      title="Combo Offers"
      description="Bundle products together at a discounted combo price."
      actions={<Button onClick={openAddModal}><Plus className="mr-2 size-4" /> Create Combo</Button>}
    >
      <ReuseSearchInput className="min-w-64" placeholder="Search combos..." setSearch={setSearch} setPage={setCurrentPage} />

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
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

      <ComboFormModal open={modalOpen} onOpenChange={setModalOpen} editing={editing} products={products} onSave={handleSave} />

      <ConfirmModal
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        currentRecord={deleting}
        onConfirm={handleDelete}
        title="Delete this combo?"
        description="It will be removed from the storefront immediately."
        confirmText="Delete"
        variant="danger"
        iconPreset="delete"
      />
    </PageWraper>
  );
};

export default CombosPage;
