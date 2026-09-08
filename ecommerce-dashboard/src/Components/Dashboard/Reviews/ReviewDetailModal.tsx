import { useEffect, useState } from "react";
import ReusableModal from "@/Components/ui/CustomUi/ReuseableModal";
import ReuseRating from "@/Components/ui/CustomUi/ReuseRating";
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import type { IReview } from "@/types";

interface ReviewDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  review: IReview | null;
  onReply: (id: string, reply: string) => void;
}

export default function ReviewDetailModal({ open, onOpenChange, review, onReply }: ReviewDetailModalProps) {
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
        <Button className="ml-auto" onClick={() => onReply(review._id, reply)}>Save Reply</Button>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <img src={review.productImage} alt={review.productName} className="size-14 rounded-lg border border-border object-cover" />
          <div>
            <p className="font-bold">{review.productName}</p>
            <p className="text-xs text-secondbase-color">Order {review.orderId}</p>
          </div>
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
