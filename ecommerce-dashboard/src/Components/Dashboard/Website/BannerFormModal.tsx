import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import ReusableModal from "@/Components/ui/CustomUi/ReuseableModal";
import { FormInput, FormTextarea, FormSwitch, FormUpload } from "@/Components/ui/CustomUi/ReuseForm/Form";
import { FieldGroup, FieldLabel } from "@/Components/ui/field";
import { Button } from "@/Components/ui/button";
import type { FileWithPreview } from "@/Components/ui/CustomUi/ReuseForm/FileUpload";
import type { IBanner, IBannerFormValues } from "@/types";

const bannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  buttonLabel: z.string().optional(),
  destinationUrl: z.string().min(1, "Destination URL is required"),
  isActive: z.boolean(),
  order: z.coerce.number().int().min(0, "Order must be 0 or greater"),
  images: z.custom<FileWithPreview[]>().optional(),
});

type BannerFormInput = z.input<typeof bannerSchema>;
type BannerFormOutput = z.output<typeof bannerSchema>;

interface BannerFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: IBanner | null;
  onSave: (values: IBannerFormValues, image?: File) => void;
}

const BannerFormModal = ({ open, onOpenChange, editing, onSave }: BannerFormModalProps) => {
  const form = useForm<BannerFormInput, unknown, BannerFormOutput>({
    resolver: zodResolver(bannerSchema),
    defaultValues: { title: "", subtitle: "", buttonLabel: "", destinationUrl: "", isActive: true, order: 0, images: [] },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        editing
          ? {
            title: editing.title,
            subtitle: editing.subtitle ?? "",
            buttonLabel: editing.buttonLabel ?? "",
            destinationUrl: editing.destinationUrl,
            isActive: editing.isActive,
            order: editing.order,
            images: [],
          }
          : { title: "", subtitle: "", buttonLabel: "", destinationUrl: "", isActive: true, order: 0, images: [] }
      );
    }
  }, [open, editing, form]);

  const onSubmit = (values: BannerFormOutput) => {
    const { images, ...rest } = values;
    onSave(rest, images?.[0]?.file);
    onOpenChange(false);
  };

  return (
    <ReusableModal
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Edit Banner" : "Add New Banner"}
      description="Shown in the homepage hero slider and promotional banner slot."
      footer={
        <Button type="submit" form="banner-form">
          {editing ? "Save Changes" : "Add Banner"}
        </Button>
      }
    >
      <form id="banner-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FieldGroup>
          {editing && (
            <div>
              <FieldLabel className="text-sm font-medium mb-1.5">Current Image</FieldLabel>
              <img src={editing.image} alt={editing.title} className="w-full max-w-xs h-32 object-cover rounded-lg border border-border" />
            </div>
          )}

          <FormUpload
            control={form.control}
            name="images"
            label={editing ? "Replace Image (optional)" : "Banner Image"}
            maxFiles={1}
          />

          <FormInput control={form.control} name="title" label="Title" placeholder="e.g. Summer Spice Festival" />
          <FormTextarea control={form.control} name="subtitle" label="Subtitle / Text (optional)" />

          <div className="grid grid-cols-2 gap-4">
            <FormInput control={form.control} name="buttonLabel" label="Button Label (optional)" placeholder="Shop Now" />
            <FormInput control={form.control} name="order" label="Display Order" type="number" />
          </div>

          <FormInput
            control={form.control}
            name="destinationUrl"
            label="Destination URL"
            placeholder="/collections/offers or https://..."
          />

          <FormSwitch control={form.control} name="isActive" label="Active on storefront" />
        </FieldGroup>
      </form>
    </ReusableModal>
  );
};

export default BannerFormModal;
