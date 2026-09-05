import { useState } from "react";
import { toast } from "sonner";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import ReuseSearchInput from "@/Components/ui/CustomUi/ReuseForm/ReuseSearchInput";
import ConfirmModal from "@/Components/ui/CustomUi/Modal/ConfirmModal";
import { Button } from "@/Components/ui/button";
import { Switch } from "@/Components/ui/switch";
import BannerFormModal from "@/Components/Dashboard/Website/BannerFormModal";
import type { IBanner, IBannerFormValues } from "@/types";
// import { useGetBannersQuery, useCreateBannerMutation, useUpdateBannerMutation, useToggleBannerActiveMutation, useDeleteBannerMutation } from "@/redux/features/banner/bannerApi";
// import tryCatchWrapper from "@/utils/tryCatchWrapper";

// TODO: wire to useGetBannersQuery once GET /admin/banners exists — this list
// lives in local component state until then, per AGENTS.md §2.8.
const DUMMY_BANNERS: IBanner[] = [
  {
    _id: "1",
    image: "https://placehold.co/400x200/FEF3C7/92400E.png?text=Honey+Banner",
    title: "খাঁটি মধুর বিশেষ অফার",
    subtitle: "সুন্দরবনের সেরা মধু, সরাসরি আপনার দোরগোড়ায়",
    buttonLabel: "কিনুন এখনই",
    destinationUrl: "/collections/offers",
    isActive: true,
    order: 1,
    createdAt: "2026-08-20T10:00:00Z",
  },
  {
    _id: "2",
    image: "https://placehold.co/400x200/DBEAFE/1E3A8A.png?text=Combo+Banner",
    title: "কম্বো প্যাক — একসাথে বেশি সাশ্রয়",
    subtitle: "মধু, ঘি ও মশলার বিশেষ কম্বো",
    buttonLabel: "কম্বো দেখুন",
    destinationUrl: "/collections/combos",
    isActive: true,
    order: 2,
    createdAt: "2026-08-18T10:00:00Z",
  },
  {
    _id: "3",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=200&fit=crop",
    title: "নতুন কালেকশন এসেছে",
    buttonLabel: "দেখুন",
    destinationUrl: "/collections/new-arrivals",
    isActive: false,
    order: 3,
    createdAt: "2026-08-10T10:00:00Z",
  },
];

const BannersPage = () => {
  const [, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [banners, setBanners] = useState<IBanner[]>(DUMMY_BANNERS);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IBanner | null>(null);
  const [deleting, setDeleting] = useState<IBanner | null>(null);

  const openAddModal = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEditModal = (banner: IBanner) => {
    setEditing(banner);
    setModalOpen(true);
  };

  const handleSave = (values: IBannerFormValues, image?: File) => {
    if (editing) {
      setBanners((prev) =>
        prev.map((b) => (b._id === editing._id ? { ...b, ...values, image: image ? URL.createObjectURL(image) : b.image } : b))
      );
      toast.success("Banner updated");
    } else {
      setBanners((prev) => [
        ...prev,
        {
          ...values,
          _id: `banner-${Date.now()}`,
          image: image ? URL.createObjectURL(image) : "https://placehold.co/400x200.png?text=Banner",
          createdAt: new Date().toISOString(),
        },
      ]);
      toast.success("Banner added");
    }
  };

  const handleToggleActive = (banner: IBanner) => {
    setBanners((prev) => prev.map((b) => (b._id === banner._id ? { ...b, isActive: !b.isActive } : b)));
  };

  const handleDelete = () => {
    if (!deleting) return;
    setBanners((prev) => prev.filter((b) => b._id !== deleting._id));
    toast.success("Banner deleted");
    setDeleting(null);
  };

  const columns: Column<IBanner>[] = [
    {
      header: "Order",
      accessorKey: "order",
      width: 80,
      render: (val) => (
        <span className="flex items-center gap-1.5 text-secondbase-color">
          <GripVertical className="size-4" /> {val}
        </span>
      ),
    },
    {
      header: "Banner",
      accessorKey: "image",
      render: (val, row) => <img src={val} alt={row.title} className="w-24 h-12 object-cover rounded-md border border-border" />,
    },
    {
      header: "Title",
      accessorKey: "title",
      render: (val, row) => (
        <div>
          <p className="font-bold">{val}</p>
          <p className="text-xs text-secondbase-color">{row.destinationUrl}</p>
        </div>
      ),
    },
    {
      header: "Active",
      accessorKey: "isActive",
      render: (val, row) => <Switch checked={val} onCheckedChange={() => handleToggleActive(row)} />,
    },
    {
      header: "Actions",
      accessorKey: "_id",
      render: (_, row) => (
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
      title="Banner Management"
      description="Manage the homepage hero slider and promotional banners."
      actions={
        <Button onClick={openAddModal}>
          <Plus className="mr-2 size-4" /> Add Banner
        </Button>
      }
    >
      <ReuseSearchInput className="min-w-64" placeholder="Search banners..." setSearch={setSearch} setPage={setCurrentPage} />

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <ReusableTable
          data={banners}
          columns={columns}
          pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          limit={10}
          total={banners.length}
        />
      </div>

      <BannerFormModal open={modalOpen} onOpenChange={setModalOpen} editing={editing} onSave={handleSave} />

      <ConfirmModal
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        currentRecord={deleting}
        onConfirm={handleDelete}
        title="Delete this banner?"
        description="It will be removed from the storefront immediately."
        confirmText="Delete"
        variant="danger"
        iconPreset="delete"
      />
    </PageWraper>
  );
};

export default BannersPage;
