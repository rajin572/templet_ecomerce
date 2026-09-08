import { useState } from "react";
import ReusableModal from "@/Components/ui/CustomUi/ReuseableModal";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Button } from "@/Components/ui/button";
import { Search, Undo2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IOrder } from "@/types";

interface AddReturnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Delivered orders that aren't already returned — the only ones eligible. */
  eligibleOrders: IOrder[];
  onSubmit: (orderId: string, reason: string) => void;
}

export default function AddReturnModal({ open, onOpenChange, eligibleOrders, onSubmit }: AddReturnModalProps) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const filtered = eligibleOrders.filter(
    (o) => o.orderId.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const handleClose = (next: boolean) => {
    if (!next) { setSearch(""); setSelectedId(null); setReason(""); }
    onOpenChange(next);
  };

  const handleSubmit = () => {
    if (!selectedId || !reason.trim()) return;
    onSubmit(selectedId, reason.trim());
    handleClose(false);
  };

  return (
    <ReusableModal
      open={open}
      onOpenChange={handleClose}
      title="Add Return"
      description="Pick the delivered order the customer sent back, and why."
      footer={
        <Button onClick={handleSubmit} disabled={!selectedId || !reason.trim()}>
          <Undo2 className="mr-2 size-4" /> Mark as Returned
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search delivered orders by ID or customer..." className="pl-10 border-[#E5E5E5] bg-[#F5F5F5]" />
        </div>

        <div className="max-h-64 overflow-y-auto space-y-1 -mx-1 px-1">
          {filtered.length === 0 && <p className="text-sm text-secondbase-color text-center py-6">No delivered orders match.</p>}
          {filtered.map((order) => (
            <label
              key={order._id}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 border",
                selectedId === order._id ? "border-secondary-color bg-secondary-color/5" : "border-transparent"
              )}
            >
              <input type="radio" name="return-order" checked={selectedId === order._id} onChange={() => setSelectedId(order._id)} className="accent-secondary-color" />
              <div className="flex-1">
                <p className="text-sm font-bold">{order.orderId}</p>
                <p className="text-xs text-secondbase-color">{order.customerName} · ৳{order.total}</p>
              </div>
            </label>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Return Reason</label>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Product arrived damaged, wrong item sent..." className="min-h-20" />
        </div>
      </div>
    </ReusableModal>
  );
}
