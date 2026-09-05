import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import ReusableModal from "@/Components/ui/CustomUi/ReuseableModal";
import { FormInput, FormSelect, FormTextarea } from "@/Components/ui/CustomUi/ReuseForm/Form";
import { Button } from "@/Components/ui/button";
import { SelectItem } from "@/Components/ui/select";
import type { IProduct } from "@/types";

const adjustSchema = z.object({
  direction: z.enum(["add", "remove"]),
  quantity: z.coerce.number().int().min(1, "Enter a quantity greater than 0"),
  reason: z.string().min(1, "A reason is required for the stock ledger"),
});

type AdjustFormInput = z.input<typeof adjustSchema>;
type AdjustFormOutput = z.output<typeof adjustSchema>;

interface StockAdjustModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: IProduct | null;
  onAdjust: (productId: string, delta: number, reason: string) => void;
}

export default function StockAdjustModal({ open, onOpenChange, product, onAdjust }: StockAdjustModalProps) {
  const form = useForm<AdjustFormInput, unknown, AdjustFormOutput>({
    resolver: zodResolver(adjustSchema),
    defaultValues: { direction: "add", quantity: 1, reason: "" },
  });

  useEffect(() => {
    if (open) form.reset({ direction: "add", quantity: 1, reason: "" });
  }, [open, product, form]);

  if (!product) return null;

  const onSubmit = (values: AdjustFormOutput) => {
    onAdjust(product._id, values.direction === "add" ? values.quantity : -values.quantity, values.reason);
    onOpenChange(false);
  };

  return (
    <ReusableModal
      open={open}
      onOpenChange={onOpenChange}
      title={`Adjust Stock — ${product.name}`}
      description={`Current available quantity: ${product.stock} ${product.unit}`}
      footer={
        <Button type="submit" form="stock-adjust-form">Apply Adjustment</Button>
      }
    >
      <form id="stock-adjust-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <FormSelect control={form.control} name="direction" label="Adjustment Type" placeholder="Select type">
            <SelectItem value="add">Add Stock (received)</SelectItem>
            <SelectItem value="remove">Remove Stock (damaged/lost)</SelectItem>
          </FormSelect>
          <FormInput control={form.control} name="quantity" label="Quantity" type="number" />
        </div>
        <FormTextarea control={form.control} name="reason" label="Reason" />
      </form>
    </ReusableModal>
  );
}
