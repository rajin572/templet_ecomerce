import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import ReusableModal from "@/Components/ui/CustomUi/ReuseableModal";
import { FormInput, FormMultiSelect, FormSwitch } from "@/Components/ui/CustomUi/ReuseForm/Form";
import { Button } from "@/Components/ui/button";
import type { ICombo, IComboFormValues, IProduct } from "@/types";

const comboSchema = z.object({
  name: z.string().min(1, "Combo name is required"),
  productIds: z.array(z.string()).min(2, "Pick at least 2 products for a combo"),
  comboPrice: z.coerce.number().min(0, "Combo price must be 0 or greater"),
  isActive: z.boolean(),
});

type ComboFormInput = z.input<typeof comboSchema>;
type ComboFormOutput = z.output<typeof comboSchema>;

interface ComboFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: ICombo | null;
  products: IProduct[];
  onSave: (values: IComboFormValues) => void;
}

export default function ComboFormModal({ open, onOpenChange, editing, products, onSave }: ComboFormModalProps) {
  const form = useForm<ComboFormInput, unknown, ComboFormOutput>({
    resolver: zodResolver(comboSchema),
    defaultValues: { name: "", productIds: [], comboPrice: 0, isActive: true },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        editing
          ? { name: editing.name, productIds: editing.productIds, comboPrice: editing.comboPrice, isActive: editing.status === "active" }
          : { name: "", productIds: [], comboPrice: 0, isActive: true }
      );
    }
  }, [open, editing, form]);

  const selectedIds = form.watch("productIds") ?? [];
  const regularPrice = useMemo(
    () => selectedIds.reduce((sum, id) => sum + (products.find((p) => p._id === id)?.price ?? 0), 0),
    [selectedIds, products]
  );

  const onSubmit = (values: ComboFormOutput) => {
    const { isActive, ...rest } = values;
    onSave({ ...rest, status: isActive ? "active" : "inactive" });
    onOpenChange(false);
  };

  return (
    <ReusableModal
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Edit Combo" : "Create Combo"}
      description="Bundle two or more products together at a discounted combo price."
      footer={
        <Button type="submit" form="combo-form">
          {editing ? "Save Changes" : "Create Combo"}
        </Button>
      }
    >
      <form id="combo-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormInput control={form.control} name="name" label="Combo Name" placeholder="e.g. মধু ও ঘি কম্বো প্যাক" />

        <FormMultiSelect
          control={form.control}
          name="productIds"
          label="Products in this Combo"
          placeholder="Select products..."
          options={products.map((p) => ({ value: p._id, label: `${p.name} (৳${p.price})` }))}
        />

        <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 text-sm">
          <span className="text-secondbase-color">Regular Price (sum of selected products)</span>
          <span className="font-bold line-through text-secondbase-color">৳{regularPrice}</span>
        </div>

        <FormInput control={form.control} name="comboPrice" label="Combo Price (৳)" type="number" />

        <FormSwitch control={form.control} name="isActive" label="Active on storefront" />
      </form>
    </ReusableModal>
  );
}
