import { useState } from 'react';
import { toast } from 'sonner';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import ReuseSearchInput from "@/Components/ui/CustomUi/ReuseForm/ReuseSearchInput";
import ConfirmModal from "@/Components/ui/CustomUi/Modal/ConfirmModal";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import { Button } from "@/Components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import CouponFormModal from "@/Components/Dashboard/Marketing/CouponFormModal";
import { DUMMY_COUPONS } from "@/data/dummyStore";
import type { ICoupon, ICouponFormValues, ICouponStatus } from "@/types";
// import { useGetCouponsQuery, useCreateCouponMutation, useUpdateCouponMutation, useDeleteCouponMutation } from "@/redux/features/coupon/couponApi";
// import tryCatchWrapper from "@/utils/tryCatchWrapper";

// TODO: wire to useGetCouponsQuery once GET /coupons exists — this list lives
// in local component state until then, per AGENTS.md §2.8.
const STATUS_THEME: Record<ICouponStatus, "success" | "warning" | "error"> = {
  active: "success",
  inactive: "warning",
  expired: "error",
};

const CouponsPage = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [coupons, setCoupons] = useState<ICoupon[]>(DUMMY_COUPONS);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ICoupon | null>(null);
  const [deleting, setDeleting] = useState<ICoupon | null>(null);

  const openAddModal = () => { setEditing(null); setModalOpen(true); };
  const openEditModal = (coupon: ICoupon) => { setEditing(coupon); setModalOpen(true); };

  const handleSave = (values: ICouponFormValues) => {
    if (editing) {
      setCoupons((prev) => prev.map((c) => (c._id === editing._id ? { ...c, ...values } : c)));
      toast.success("Coupon updated");
    } else {
      setCoupons((prev) => [...prev, { ...values, _id: `cpn-${Date.now()}`, usedCount: 0, createdAt: new Date().toISOString() }]);
      toast.success("Coupon created");
    }
  };

  const handleDelete = () => {
    if (!deleting) return;
    setCoupons((prev) => prev.filter((c) => c._id !== deleting._id));
    toast.success("Coupon deleted");
    setDeleting(null);
  };

  const filtered = coupons.filter((c) => c.code.toLowerCase().includes(search.toLowerCase()));

  const columns: Column<ICoupon>[] = [
    { header: "Code", accessorKey: "code", render: (val) => <span className="font-mono font-bold">{val}</span> },
    { header: "Discount", accessorKey: "value", render: (val, row) => (row.type === "percentage" ? `${val}%` : `৳${val}`) },
    { header: "Min. Order", accessorKey: "minOrderAmount", render: (val) => (val ? `৳${val}` : "—") },
    { header: "Usage", accessorKey: "usedCount", render: (val, row) => `${val}${row.usageLimit ? ` / ${row.usageLimit}` : ""}` },
    { header: "Expires", accessorKey: "expiryDate", render: (val) => new Date(val).toLocaleDateString() },
    { header: "Status", accessorKey: "status", render: (val) => <Tag theme={STATUS_THEME[val as ICouponStatus]} className="capitalize">{val}</Tag> },
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
      title="Coupons"
      description="Create and manage discount coupons customers can apply at checkout."
      actions={<Button onClick={openAddModal}><Plus className="mr-2 size-4" /> Create Coupon</Button>}
    >
      <ReuseSearchInput className="min-w-64" placeholder="Search by coupon code..." setSearch={setSearch} setPage={setCurrentPage} />

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

      <CouponFormModal open={modalOpen} onOpenChange={setModalOpen} editing={editing} onSave={handleSave} />

      <ConfirmModal
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        currentRecord={deleting}
        onConfirm={handleDelete}
        title="Delete this coupon?"
        description="Customers will no longer be able to apply this code."
        confirmText="Delete"
        variant="danger"
        iconPreset="delete"
      />
    </PageWraper>
  );
};

export default CouponsPage;
