import { useEffect, useState } from "react";
import ReusableModal from "@/Components/ui/CustomUi/ReuseableModal";
import ReuseRating from "@/Components/ui/CustomUi/ReuseRating";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import { CheckCircle2, XCircle } from "lucide-react";
import type { IReview, ReviewStatus } from "@/types";

const STATUS_THEME: Record<ReviewStatus, "success" | "warning" | "error"> = {
  published: "success",
  pending: "warning",
  rejected: "error",
};

interface ReviewDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: IReview | null;
  onModerate: (id: string, status: ReviewStatus) => void;
  onReply: (id: string, reply: string) => void;
}

export default function ReviewDetailModal({ open, onOpenChange, review, onModerate, onReply }: ReviewDetailModalProps) {
  const [reply, setReply] = useState("");

  useEffect(() => {
    if (open) setReply(review?.adminReply ?? "");
  }, [open, review]);

  if (!review) return null;

  return (
    <ReusableModal
      open={open}
      onOpenChange={onOpenChange}
      title="Review Details"
      description="Verified purchase — linked to the order the product was delivered on."
      footer={
        <div className="flex gap-2 w-full">
          {review.status !== "published" && (
            <Button variant="outline" className="border-success text-success" onClick={() => onModerate(review._id, "published")}>
              <CheckCircle2 className="mr-2 size-4" /> Approve
            </Button>
          )}
          {review.status !== "rejected" && (
            <Button variant="outline" className="border-error text-error" onClick={() => onModerate(review._id, "rejected")}>
              <XCircle className="mr-2 size-4" /> Reject
            </Button>
          )}
          <Button className="ml-auto" onClick={() => onReply(review._id, reply)}>Save Reply</Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <img src={review.productImage} alt={review.productName} className="size-14 rounded-lg border border-border object-cover" />
          <div>
            <p className="font-bold">{review.productName}</p>
            <p className="text-xs text-secondbase-color">Order {review.orderId}</p>
          </div>
          <Tag theme={STATUS_THEME[review.status]} className="ml-auto capitalize">{review.status}</Tag>
        </div>

        <div className="flex items-center justify-between border-t border-b border-border py-3">
          <div>
            <p className="font-medium">{review.customerName}</p>
            {review.customerPhone && <p className="text-xs text-secondbase-color">{review.customerPhone}</p>}
          </div>
          <ReuseRating value={review.rating} canChange={false} size={18} showValue />
        </div>

        <div>
          <p className="text-sm font-medium mb-1.5">Customer Comment</p>
          <p className="text-sm text-base-color bg-gray-50 rounded-lg p-3">{review.comment}</p>
        </div>

        <div>
          <p className="text-sm font-medium mb-1.5">Admin Reply (shown publicly under the review)</p>
          <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Thank the customer or address their feedback..." className="min-h-20" />
        </div>
      </div>
    </ReusableModal>
  );
}
