import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import ReusableModal from "@/Components/ui/CustomUi/ReuseableModal";
import { FormInput, FormSelect, FormSwitch } from "@/Components/ui/CustomUi/ReuseForm/Form";
import { Button } from "@/Components/ui/button";
import { SelectItem } from "@/Components/ui/select";
import type { ICoupon, ICouponFormValues } from "@/types";

const toDateInput = (iso: string) => iso.slice(0, 10);

const couponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").transform((v) => v.toUpperCase()),
  type: z.enum(["percentage", "fixed"]),
  value: z.coerce.number().min(1, "Value must be greater than 0"),
  minOrderAmount: z.coerce.number().min(0, "Must be 0 or greater").optional(),
  maxDiscount: z.coerce.number().min(0, "Must be 0 or greater").optional(),
  usageLimit: z.coerce.number().int().min(1, "Must be at least 1").optional(),
  startDate: z.string().min(1, "Start date is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  isActive: z.boolean(),
});

type CouponFormInput = z.input<typeof couponSchema>;
type CouponFormOutput = z.output<typeof couponSchema>;

interface CouponFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: ICoupon | null;
  onSave: (values: ICouponFormValues) => void;
}

const emptyValues: CouponFormInput = {
  code: "", type: "percentage", value: 10, minOrderAmount: undefined, maxDiscount: undefined, usageLimit: undefined,
  startDate: new Date().toISOString().slice(0, 10), expiryDate: new Date().toISOString().slice(0, 10), isActive: true,
};

export default function CouponFormModal({ open, onOpenChange, editing, onSave }: CouponFormModalProps) {
  const form = useForm<CouponFormInput, unknown, CouponFormOutput>({
    resolver: zodResolver(couponSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (open) {
      form.reset(
        editing
          ? {
            code: editing.code, type: editing.type, value: editing.value,
            minOrderAmount: editing.minOrderAmount, maxDiscount: editing.maxDiscount, usageLimit: editing.usageLimit,
            startDate: toDateInput(editing.startDate), expiryDate: toDateInput(editing.expiryDate),
            isActive: editing.status !== "inactive",
          }
          : emptyValues
      );
    }
  }, [open, editing, form]);

  const type = form.watch("type");

  const onSubmit = (values: CouponFormOutput) => {
    const { isActive, startDate, expiryDate, ...rest } = values;
    const isExpired = new Date(expiryDate) < new Date(new Date().toDateString());
    onSave({
      ...rest,
      startDate: new Date(startDate).toISOString(),
      expiryDate: new Date(expiryDate).toISOString(),
      status: isExpired ? "expired" : isActive ? "active" : "inactive",
    });
    onOpenChange(false);
  };

  return (
    <ReusableModal
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Edit Coupon" : "Create Coupon"}
      description="Discount coupons customers can apply at checkout."
      footer={
        <Button type="submit" form="coupon-form">
          {editing ? "Save Changes" : "Create Coupon"}
        </Button>
      }
    >
      <form id="coupon-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <FormInput control={form.control} name="code" label="Coupon Code" placeholder="e.g. WELCOME10" inputClassName="uppercase" />
          <FormSelect control={form.control} name="type" label="Discount Type" placeholder="Select type">
            <SelectItem value="percentage">Percentage (%)</SelectItem>
            <SelectItem value="fixed">Fixed Amount (৳)</SelectItem>
          </FormSelect>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput control={form.control} name="value" label={type === "percentage" ? "Discount (%)" : "Discount Amount (৳)"} type="number" />
          {type === "percentage" && <FormInput control={form.control} name="maxDiscount" label="Max Discount Cap (optional, ৳)" type="number" />}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput control={form.control} name="minOrderAmount" label="Minimum Order Amount (optional, ৳)" type="number" />
          <FormInput control={form.control} name="usageLimit" label="Usage Limit (optional)" type="number" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormInput control={form.control} name="startDate" label="Start Date" type="date" />
          <FormInput control={form.control} name="expiryDate" label="Expiry Date" type="date" />
        </div>

        <FormSwitch control={form.control} name="isActive" label="Active (customers can use this code)" />
      </form>
    </ReusableModal>
  );
}
