import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import ReuseSearchInput from "@/Components/ui/CustomUi/ReuseForm/ReuseSearchInput";
import ReuseRating from "@/Components/ui/CustomUi/ReuseRating";
import ConfirmModal from "@/Components/ui/CustomUi/Modal/ConfirmModal";
import { Button } from "@/Components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import ReviewDetailModal from "@/Components/Dashboard/Reviews/ReviewDetailModal";
import { DUMMY_REVIEWS } from "@/data/dummyStore";
import type { IReview } from "@/types";
// import { useGetReviewsQuery, useReplyToReviewMutation, useDeleteReviewMutation } from "@/redux/features/review/reviewApi";
// import tryCatchWrapper from "@/utils/tryCatchWrapper";

// TODO: wire to useGetReviewsQuery once GET /reviews exists — this list lives
// in local component state until then, per AGENTS.md §2.8. Reviews go live
// immediately on submission — there is no approval queue.
const ReviewsPage = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [reviews, setReviews] = useState<IReview[]>(DUMMY_REVIEWS);

  const [viewing, setViewing] = useState<IReview | null>(null);
  const [deleting, setDeleting] = useState<IReview | null>(null);

  const handleReply = (id: string, reply: string) => {
    setReviews((prev) => prev.map((r) => (r._id === id ? { ...r, adminReply: reply || undefined } : r)));
    setViewing(null);
    toast.success("Reply saved");
  };

  const handleDelete = () => {
    if (!deleting) return;
    setReviews((prev) => prev.filter((r) => r._id !== deleting._id));
    toast.success("Review deleted");
    setDeleting(null);
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return reviews.filter(
      (r) => !term || r.productName.toLowerCase().includes(term) || r.customerName.toLowerCase().includes(term) || r.orderId.toLowerCase().includes(term)
    );
  }, [reviews, search]);

  const columns: Column<IReview>[] = [
    {
      header: "Product", accessorKey: "productName", width: 220, render: (val, row) => (
        <div className="flex items-center gap-3">
          <img src={row.productImage} alt={val} className="size-10 rounded-md border border-border object-cover" />
          <span className="font-medium">{val}</span>
        </div>
      ),
    },
    {
      header: "Order", accessorKey: "orderId", render: (val) => (
        <button
          type="button"
          onClick={() => navigate("/admin/orders", { state: { searchOrderId: val } })}
          className="text-xs font-semibold bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full"
        >
          {val}
        </button>
      ),
    },
    {
      header: "Customer", accessorKey: "customerName", render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-medium">{val}</span>
          {row.customerPhone && <span className="text-xs text-secondbase-color">{row.customerPhone}</span>}
        </div>
      ),
    },
    { header: "Rating", accessorKey: "rating", render: (val) => <ReuseRating value={val} canChange={false} size={14} /> },
    { header: "Comment", accessorKey: "comment", width: 280, render: (val) => <span className="line-clamp-2 text-sm">{val}</span> },
    {
      header: "Actions", accessorKey: "_id", render: (_, row) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 bg-blue-50" onClick={() => setViewing(row)}>
            <Eye className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 bg-red-50" onClick={() => setDeleting(row)}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageWraper title="Reviews" description="Customer reviews, tied to the product and order they were left on. Reviews are visible on the storefront as soon as they're submitted.">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <ReuseSearchInput setSearch={setSearch} setPage={setCurrentPage} placeholder="Search by product, customer or order ID..." className="max-w-md" />
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

      <ReviewDetailModal open={!!viewing} onOpenChange={(o) => !o && setViewing(null)} review={viewing} onReply={handleReply} />

      <ConfirmModal
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        currentRecord={deleting}
        onConfirm={handleDelete}
        title="Delete this review?"
        description="It will be removed from the storefront immediately."
        confirmText="Delete"
        variant="danger"
        iconPreset="delete"
      />
    </PageWraper>
  );
};

export default ReviewsPage;
