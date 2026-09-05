import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import ReusableModal from "@/Components/ui/CustomUi/ReuseableModal";
import { FormInput, FormTextarea, FormSelect, FormUpload } from "@/Components/ui/CustomUi/ReuseForm/Form";
import { FieldGroup, FieldLabel } from "@/Components/ui/field";
import { Button } from "@/Components/ui/button";
import { SelectGroup, SelectItem, SelectLabel } from "@/Components/ui/select";
import type { FileWithPreview } from "@/Components/ui/CustomUi/ReuseForm/FileUpload";
import type { ICategory, IProduct, IProductFormValues } from "@/types";

const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9ঀ-৿]+/g, "-").replace(/^-+|-+$/g, "");

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  sku: z.string().min(1, "SKU is required"),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be 0 or greater"),
  comparePrice: z.coerce.number().min(0, "Must be 0 or greater").optional(),
  stock: z.coerce.number().int().min(0, "Stock must be 0 or greater"),
  unit: z.string().min(1, "Unit is required (e.g. 500g)"),
  status: z.enum(["published", "draft"]),
  images: z.custom<FileWithPreview[]>().optional(),
});

type ProductFormInput = z.input<typeof productSchema>;
type ProductFormOutput = z.output<typeof productSchema>;

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: IProduct | null;
  categories: ICategory[];
  /** Pre-selects a category when creating a product from a category row's "Add Product" action. */
  presetCategoryId?: string | null;
  onSave: (values: IProductFormValues, image?: File) => void;
}

const emptyValues = (categoryId = ""): ProductFormInput => ({
  name: "", slug: "", sku: "", categoryId, description: "", price: 0, comparePrice: undefined, stock: 0, unit: "", status: "draft", images: [],
});

export default function ProductFormModal({ open, onOpenChange, editing, categories, presetCategoryId, onSave }: ProductFormModalProps) {
  const form = useForm<ProductFormInput, unknown, ProductFormOutput>({
    resolver: zodResolver(productSchema),
    defaultValues: emptyValues(),
  });

  useEffect(() => {
    if (open) {
      form.reset(
        editing
          ? {
            name: editing.name,
            slug: editing.slug,
            sku: editing.sku,
            categoryId: editing.categoryId,
            description: editing.description ?? "",
            price: editing.price,
            comparePrice: editing.comparePrice,
            stock: editing.stock,
            unit: editing.unit,
            status: editing.status,
            images: [],
          }
          : emptyValues(presetCategoryId ?? "")
      );
    }
  }, [open, editing, presetCategoryId, form]);

  // Auto-derive the slug while creating a new product; once a product exists,
  // editing its name must never silently change a live product URL.
  const nameValue = form.watch("name");
  useEffect(() => {
    if (!editing) form.setValue("slug", slugify(nameValue ?? ""));
  }, [nameValue, editing, form]);

  const onSubmit = (values: ProductFormOutput) => {
    const { images, ...rest } = values;
    onSave(rest, images?.[0]?.file);
    onOpenChange(false);
  };

  const topLevel = categories.filter((c) => c.parentId === null);

  return (
    <ReusableModal
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Edit Product" : "Add Product"}
      description="Products can belong directly to a category, or to one of its sub-categories."
      maxWidth="sm:max-w-[700px]"
      footer={
        <Button type="submit" form="product-form">
          {editing ? "Save Changes" : "Add Product"}
        </Button>
      }
    >
      <form id="product-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FieldGroup>
          {editing?.images?.[0] && (
            <div>
              <FieldLabel className="text-sm font-medium mb-1.5">Current Image</FieldLabel>
              <img src={editing.images[0]} alt={editing.name} className="w-24 h-24 object-cover rounded-lg border border-border" />
            </div>
          )}

          <FormUpload control={form.control} name="images" label={editing ? "Replace Image (optional)" : "Product Image"} maxFiles={4} />

          <div className="grid grid-cols-2 gap-4">
            <FormInput control={form.control} name="name" label="Product Name" placeholder="e.g. Premium Sundarbans Honey" />
            <FormInput control={form.control} name="slug" label="Slug" placeholder="e.g. premium-sundarbans-honey" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput control={form.control} name="sku" label="SKU" placeholder="e.g. HONEY-01" />
            <FormSelect control={form.control} name="categoryId" label="Category" placeholder="Select a category or sub-category">
              {topLevel.map((cat) => {
                const children = categories.filter((c) => c.parentId === cat._id);
                return (
                  <SelectGroup key={cat._id}>
                    <SelectLabel>{cat.name}</SelectLabel>
                    <SelectItem value={cat._id}>{cat.name} (General)</SelectItem>
                    {children.map((child) => (
                      <SelectItem key={child._id} value={child._id}>— {child.name}</SelectItem>
                    ))}
                  </SelectGroup>
                );
              })}
            </FormSelect>
          </div>

          <FormTextarea control={form.control} name="description" label="Description (optional)" />

          <div className="grid grid-cols-3 gap-4">
            <FormInput control={form.control} name="price" label="Price (৳)" type="number" />
            <FormInput control={form.control} name="comparePrice" label="Compare Price (optional)" type="number" />
            <FormInput control={form.control} name="unit" label="Unit" placeholder="e.g. 500g" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput control={form.control} name="stock" label="Stock Quantity" type="number" />
            <FormSelect control={form.control} name="status" label="Status" placeholder="Select status">
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </FormSelect>
          </div>
        </FieldGroup>
      </form>
    </ReusableModal>
  );
}
