import { useEffect, useState } from "react";
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import ReusableModal from "@/Components/ui/CustomUi/ReuseableModal";
import ConfirmModal from "@/Components/ui/CustomUi/Modal/ConfirmModal";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import SpinLoader from "@/Components/ui/CustomUi/SpinLoader";
import { FormInput, FormTextarea } from "@/Components/ui/CustomUi/ReuseForm/Form";
import { FieldGroup } from "@/Components/ui/field";
import { Button } from "@/Components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} from "@/redux/features/role/roleApi";
import { usePermission } from "@/hooks/usePermission";
import tryCatchWrapper from "@/utils/tryCatchWrapper";
import type { IRole } from "@/types";

const roleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
});

type RoleFormValues = z.infer<typeof roleSchema>;

const RolesPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IRole | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IRole | null>(null);

  const canManage = usePermission("staff.manage_roles");

  const { data, isFetching } = useGetRolesQuery();
  const roles = data?.data ?? [];

  const [createRole] = useCreateRoleMutation();
  const [updateRole] = useUpdateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    form.reset(
      editing
        ? { name: editing.name, description: editing.description ?? "" }
        : { name: "", description: "" }
    );
  }, [editing, form]);

  const onSubmit = async (values: RoleFormValues) => {
    const res = editing
      ? await tryCatchWrapper(
          updateRole,
          // System roles reject a name change, so only the description is sent.
          {
            params: { id: editing._id },
            body: editing.isSystem ? { description: values.description } : values,
          },
          { toastLoadingMessage: "Saving role..." }
        )
      : await tryCatchWrapper(createRole, { body: values }, { toastLoadingMessage: "Creating role..." });

    if (res?.success) setModalOpen(false);
  };

  const handleDelete = async (row: IRole) => {
    await tryCatchWrapper(
      deleteRole,
      { params: { id: row._id } },
      { toastLoadingMessage: "Deleting role..." }
    );
    setDeleteTarget(null);
  };

  const columns: Column<IRole>[] = [
    {
      header: "Role",
      accessorKey: "name",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-bold">{val}</span>
          <span className="text-xs text-gray-500">{row.slug}</span>
        </div>
      ),
    },
    {
      header: "Description",
      accessorKey: "description",
      render: (val) => (val as string) || <span className="text-gray-400">—</span>,
    },
    {
      header: "Permissions",
      accessorKey: "permissions",
      render: (_val, row) => (
        <span className="font-semibold">{row.permissions?.length ?? 0}</span>
      ),
    },
    {
      header: "Type",
      accessorKey: "isSystem",
      render: (val) => (
        <Tag theme={val ? "blue" : "success"}>{val ? "System" : "Custom"}</Tag>
      ),
    },
    {
      header: "Actions",
      accessorKey: "_id",
      render: (_val, row) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            title={row.slug === "super_admin" ? "Super admin cannot be edited" : "Edit"}
            disabled={!canManage || row.slug === "super_admin"}
            onClick={() => {
              setEditing(row);
              setModalOpen(true);
            }}
            className="h-8 w-8 text-orange-500 bg-orange-50"
          >
            <Edit className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title={row.isSystem ? "System roles cannot be deleted" : "Delete"}
            disabled={!canManage || row.isSystem}
            onClick={() => setDeleteTarget(row)}
            className="h-8 w-8 text-red-500 bg-red-50 disabled:opacity-40"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageWraper
      title="Roles"
      description="Create and manage roles. System roles are seeded and cannot be deleted."
      actions={
        canManage ? (
          <Button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="bg-primary hover:bg-primary-dark text-white"
          >
            <Plus className="mr-2 size-4" /> Add Role
          </Button>
        ) : undefined
      }
    >
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        {isFetching ? (
          <div className="py-20 flex justify-center">
            <SpinLoader />
          </div>
        ) : (
          <ReusableTable data={roles} columns={columns} />
        )}
      </div>

      <ReusableModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? "Edit Role" : "Add Role"}
        description={
          editing?.isSystem
            ? "System roles cannot be renamed — only the description can change here. Edit permissions on the Permissions page."
            : "Name the role, then assign its permissions on the Permissions page."
        }
      >
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <FormInput
              control={form.control}
              name="name"
              label="Role Name"
              placeholder="Order Manager"
              disabled={!!editing?.isSystem}
            />
            <FormTextarea
              control={form.control}
              name="description"
              label="Description"
            />
            <Button type="submit" variant="secondary" className="w-full">
              {editing ? "Save Changes" : "Create Role"}
            </Button>
          </FieldGroup>
        </form>
      </ReusableModal>

      <ConfirmModal
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        currentRecord={deleteTarget}
        onConfirm={handleDelete}
        title="Delete role"
        description={`Delete the "${deleteTarget?.name}" role. Staff assigned to it will need a new role.`}
        confirmText="Delete"
        variant="danger"
        iconPreset="delete"
      />
    </PageWraper>
  );
};

export default RolesPage;
