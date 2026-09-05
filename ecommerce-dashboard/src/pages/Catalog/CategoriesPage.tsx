import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import ReuseSearchInput from "@/Components/ui/CustomUi/ReuseForm/ReuseSearchInput";
import ConfirmModal from "@/Components/ui/CustomUi/Modal/ConfirmModal";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import { Button } from "@/Components/ui/button";
import { Plus, Edit, Trash2, FolderPlus, PackagePlus, ChevronDown, ChevronRight, Folder, CornerDownRight } from "lucide-react";
import CategoryFormModal from "@/Components/Dashboard/Website/CategoryFormModal";
import { DUMMY_CATEGORIES, DUMMY_PRODUCTS } from "@/data/dummyStore";
import type { ICategory, ICategoryFormValues } from "@/types";
// import { useGetCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation } from "@/redux/features/category/categoryApi";
// import tryCatchWrapper from "@/utils/tryCatchWrapper";

// TODO: wire to useGetCategoriesQuery once GET /categories exists — this list
// lives in local component state until then, per AGENTS.md §2.8.
type Row = ICategory & { depth: number; hasChildren: boolean };

const CategoriesPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<ICategory[]>(DUMMY_CATEGORIES);
  const [products] = useState(DUMMY_PRODUCTS);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(categories.filter((c) => c.parentId === null).map((c) => c._id)));

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ICategory | null>(null);
  const [presetParentId, setPresetParentId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<ICategory | null>(null);

  const productCount = (categoryId: string) => products.filter((p) => p.categoryId === categoryId).length;

  const openAddModal = () => {
    setEditing(null);
    setPresetParentId(null);
    setModalOpen(true);
  };

  const openAddSubcategoryModal = (parent: ICategory) => {
    setEditing(null);
    setPresetParentId(parent._id);
    setModalOpen(true);
  };

  const openEditModal = (category: ICategory) => {
    setEditing(category);
    setPresetParentId(null);
    setModalOpen(true);
  };

  const goAddProduct = (category: ICategory) => {
    navigate("/admin/products", { state: { openCreateFor: category._id } });
  };

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSave = (values: ICategoryFormValues, image?: File) => {
    if (editing) {
      setCategories((prev) =>
        prev.map((c) => (c._id === editing._id ? { ...c, ...values, image: image ? URL.createObjectURL(image) : c.image } : c))
      );
      toast.success("Category updated");
    } else {
      const _id = `cat-${Date.now()}`;
      setCategories((prev) => [
        ...prev,
        { ...values, _id, image: image ? URL.createObjectURL(image) : undefined, createdAt: new Date().toISOString() },
      ]);
      if (values.parentId) setExpanded((prev) => new Set(prev).add(values.parentId as string));
      toast.success(values.parentId ? "Sub-category created" : "Category created");
    }
  };

  const handleDelete = () => {
    if (!deleting) return;
    setCategories((prev) => prev.filter((c) => c._id !== deleting._id && c.parentId !== deleting._id));
    toast.success("Category deleted");
    setDeleting(null);
  };

  const rows = useMemo<Row[]>(() => {
    const term = search.trim().toLowerCase();
    const roots = categories
      .filter((c) => c.parentId === null)
      .filter((c) => !term || c.name.toLowerCase().includes(term) || categories.some((s) => s.parentId === c._id && s.name.toLowerCase().includes(term)))
      .sort((a, b) => a.order - b.order);

    const result: Row[] = [];
    for (const root of roots) {
      const children = categories
        .filter((c) => c.parentId === root._id)
        .filter((c) => !term || c.name.toLowerCase().includes(term) || root.name.toLowerCase().includes(term))
        .sort((a, b) => a.order - b.order);
      result.push({ ...root, depth: 0, hasChildren: children.length > 0 });
      if (expanded.has(root._id) || term) {
        for (const child of children) result.push({ ...child, depth: 1, hasChildren: false });
      }
    }
    return result;
  }, [categories, expanded, search]);

  const columns: Column<Row>[] = [
    {
      header: "Category Name",
      accessorKey: "name",
      width: 300,
      render: (val, row) => (
        <div className="flex items-center gap-1.5" style={{ paddingLeft: row.depth * 24 }}>
          {row.depth === 0 && row.hasChildren ? (
            <button type="button" onClick={() => toggleExpanded(row._id)} className="text-secondbase-color hover:text-base-color">
              {expanded.has(row._id) ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
            </button>
          ) : row.depth === 0 ? (
            <span className="w-4" />
          ) : (
            <CornerDownRight className="size-3.5 text-secondbase-color" />
          )}
          {row.depth === 0 ? <Folder className="size-4 text-secondary-color" /> : null}
          <span className={row.depth === 0 ? "font-bold" : "font-medium text-sm"}>{val}</span>
        </div>
      ),
    },
    { header: "Slug", accessorKey: "slug", render: (val) => <span className="text-secondbase-color">/{val}</span> },
    {
      header: "Products",
      accessorKey: "_id",
      render: (_, row) => {
        const count = productCount(row._id);
        return (
          <button
            type="button"
            onClick={() => navigate("/admin/products", { state: { filterCategoryId: row._id } })}
            className="text-xs font-semibold bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full"
          >
            {count} product{count === 1 ? "" : "s"}
          </button>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      render: (val) => <Tag theme={val === "active" ? "success" : "error"}>{val === "active" ? "Active" : "Inactive"}</Tag>,
    },
    {
      header: "Actions",
      accessorKey: "_id",
      render: (_, row) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary-color bg-secondary-color/10" title="Add product here" onClick={() => goAddProduct(row)}>
            <PackagePlus className="size-4" />
          </Button>
          {row.depth === 0 && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-purple-600 bg-purple-50" title="Add sub-category" onClick={() => openAddSubcategoryModal(row)}>
              <FolderPlus className="size-4" />
            </Button>
          )}
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
      title="Categories"
      description="Organize products into categories and sub-categories. Products can be added directly under a category or under one of its sub-categories."
      actions={
        <Button onClick={openAddModal}>
          <Plus className="mr-2 size-4" /> Create Category
        </Button>
      }
    >
      <ReuseSearchInput className="min-w-64" placeholder="Search categories or sub-categories..." setSearch={setSearch} setPage={setCurrentPage} />

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <ReusableTable
          data={rows}
          columns={columns}
          pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          limit={20}
          total={rows.length}
        />
      </div>

      <CategoryFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editing={editing}
        presetParentId={presetParentId}
        parentOptions={categories.filter((c) => c.parentId === null)}
        onSave={handleSave}
      />

      <ConfirmModal
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        currentRecord={deleting}
        onConfirm={handleDelete}
        title="Delete this category?"
        description="Its sub-categories will be removed too. Existing products keep their historical data."
        confirmText="Delete"
        variant="danger"
        iconPreset="delete"
      />
    </PageWraper>
  );
};

export default CategoriesPage;
