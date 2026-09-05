import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import ReusableModal from "@/Components/ui/CustomUi/ReuseableModal";
import { FormInput } from "@/Components/ui/CustomUi/ReuseForm/Form";
import { Button } from "@/Components/ui/button";
import type { IOrder } from "@/types";

const shipSchema = z.object({
  courierName: z.string().min(1, "Courier name is required"),
  courierTrackingId: z.string().min(1, "Tracking ID is required"),
});

type ShipFormValues = z.infer<typeof shipSchema>;

interface ShipOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: IOrder | null;
  onShip: (orderId: string, courierName: string, courierTrackingId: string) => void;
}

export default function ShipOrderModal({ open, onOpenChange, order, onShip }: ShipOrderModalProps) {
  const form = useForm<ShipFormValues>({
    resolver: zodResolver(shipSchema),
    defaultValues: { courierName: "", courierTrackingId: "" },
  });

  useEffect(() => {
    if (open) form.reset({ courierName: "", courierTrackingId: "" });
  }, [open, order, form]);

  if (!order) return null;

  const onSubmit = (values: ShipFormValues) => {
    onShip(order._id, values.courierName, values.courierTrackingId);
    onOpenChange(false);
  };

  return (
    <ReusableModal
      open={open}
      onOpenChange={onOpenChange}
      title={`Mark ${order.orderId} as Shipped`}
      description="Hand the order to a courier and record its tracking ID."
      footer={<Button type="submit" form="ship-order-form">Mark Shipped</Button>}
    >
      <form id="ship-order-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormInput control={form.control} name="courierName" label="Courier" placeholder="e.g. Pathao Courier" />
        <FormInput control={form.control} name="courierTrackingId" label="Tracking ID" placeholder="e.g. PTH-88213" />
      </form>
    </ReusableModal>
  );
}
