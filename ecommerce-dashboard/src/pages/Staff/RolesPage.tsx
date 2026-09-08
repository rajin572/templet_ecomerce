import { useEffect, useState } from "react";
import { toast } from "sonner";
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import ReusableModal from "@/Components/ui/CustomUi/ReuseableModal";
import ConfirmModal from "@/Components/ui/CustomUi/Modal/ConfirmModal";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import { FormInput, FormTextarea } from "@/Components/ui/CustomUi/ReuseForm/Form";
import { FieldGroup } from "@/Components/ui/field";
import { Checkbox } from "@/Components/ui/checkbox";
import { Button } from "@/Components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { DUMMY_ROLES, DUMMY_PERMISSION_CATALOG } from "@/data/dummyStore";
import type { IPermission, IRole } from "@/types";
// import { useGetRolesQuery, useCreateRoleMutation, useUpdateRoleMutation, useDeleteRoleMutation } from "@/redux/features/role/roleApi";
// import tryCatchWrapper from "@/utils/tryCatchWrapper";

// TODO: wire to useGetRolesQuery once GET /roles exists — this list lives in
// local component state until then, per AGENTS.md §2.8.
// FIXME: design-only phase — usePermission() always resolves false with no
// session; gate hardcoded open below (see EmployeesPage.tsx).
const canManage = true;

const roleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
});

type RoleFormValues = z.infer<typeof roleSchema>;

const ALL_PERMISSIONS = Object.values(DUMMY_PERMISSION_CATALOG).flat();

const RolesPage = () => {
  const [roles, setRoles] = useState<IRole[]>(DUMMY_ROLES);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IRole | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IRole | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    form.reset(editing ? { name: editing.name, description: editing.description ?? "" } : { name: "", description: "" });
    setSelectedPermissions(new Set(editing?.permissions.map((p) => p._id) ?? []));
  }, [editing, form]);

  const togglePermission = (id: string) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const onSubmit = (values: RoleFormValues) => {
    const permissions: IPermission[] = ALL_PERMISSIONS.filter((p) => selectedPermissions.has(p._id));

    if (editing) {
      setRoles((prev) => prev.map((r) => (r._id === editing._id ? { ...r, ...(editing.isSystem ? {} : values), description: values.description, permissions } : r)));
      toast.success("Role updated");
    } else {
      setRoles((prev) => [
        ...prev,
        { _id: `role-${Date.now()}`, name: values.name, slug: values.name.toLowerCase().replace(/\s+/g, "_"), description: values.description, permissions, isSystem: false, createdAt: new Date().toISOString() },
      ]);
      toast.success("Role created");
    }
    setModalOpen(false);
  };

  const handleDelete = (row: IRole) => {
    setRoles((prev) => prev.filter((r) => r._id !== row._id));
    toast.success("Role deleted");
    setDeleteTarget(null);
  };

  const columns: Column<IRole>[] = [
    {
      header: "Role", accessorKey: "name", render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-bold">{val}</span>
          <span className="text-xs text-gray-500">{row.slug}</span>
        </div>
      ),
    },
    { header: "Description", accessorKey: "description", render: (val) => (val as string) || <span className="text-gray-400">—</span> },
    { header: "Permissions", accessorKey: "permissions", render: (_val, row) => (row.slug === "super_admin" ? <span className="font-semibold">All</span> : <span className="font-semibold">{row.permissions?.length ?? 0}</span>) },
    { header: "Type", accessorKey: "isSystem", render: (val) => <Tag theme={val ? "blue" : "success"}>{val ? "System" : "Custom"}</Tag> },
    {
      header: "Actions", accessorKey: "_id", render: (_val, row) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" title={row.slug === "super_admin" ? "Super admin cannot be edited" : "Edit"} disabled={!canManage || row.slug === "super_admin"} onClick={() => { setEditing(row); setModalOpen(true); }} className="h-8 w-8 text-orange-500 bg-orange-50">
            <Edit className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" title={row.isSystem ? "System roles cannot be deleted" : "Delete"} disabled={!canManage || row.isSystem} onClick={() => setDeleteTarget(row)} className="h-8 w-8 text-red-500 bg-red-50 disabled:opacity-40">
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageWraper
      title="Roles & Permissions"
      description="Create roles and choose exactly which pages each one can access. System roles are seeded and cannot be deleted."
      actions={canManage ? <Button onClick={() => { setEditing(null); setModalOpen(true); }} className="bg-primary hover:bg-primary-dark text-white"><Plus className="mr-2 size-4" /> Add Role</Button> : undefined}
    >
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <ReusableTable data={roles} columns={columns} />
      </div>

      <ReusableModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? "Edit Role" : "Add Role"}
        description={editing?.isSystem ? "System roles cannot be renamed, but you can still adjust their permissions." : "Name the role and choose which pages it can access."}
        maxWidth="sm:max-w-[600px]"
      >
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <FormInput control={form.control} name="name" label="Role Name" placeholder="Order Manager" disabled={!!editing?.isSystem} />
            <FormTextarea control={form.control} name="description" label="Description" />

            <div>
              <p className="text-sm font-medium mb-2">Page Permissions</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border border-border p-3 max-h-64 overflow-y-auto">
                {Object.entries(DUMMY_PERMISSION_CATALOG).map(([resource, perms]) =>
                  perms.map((perm) => (
                    <label key={perm._id} className="flex items-center gap-2 text-sm cursor-pointer capitalize">
                      <Checkbox checked={selectedPermissions.has(perm._id)} onCheckedChange={() => togglePermission(perm._id)} />
                      {resource.replace(/_/g, " ")}
                    </label>
                  ))
                )}
              </div>
            </div>

            <Button type="submit" variant="secondary" className="w-full">{editing ? "Save Changes" : "Create Role"}</Button>
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
