import { useEffect, useState } from "react";
import { toast } from "sonner";
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import ReusableModal from "@/Components/ui/CustomUi/ReuseableModal";
import ConfirmModal from "@/Components/ui/CustomUi/Modal/ConfirmModal";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import ReuseSearchInput from "@/Components/ui/CustomUi/ReuseForm/ReuseSearchInput";
import ReuseFilterSelect from "@/Components/ui/CustomUi/ReuseForm/ReuseFilterSelect";
import { FormInput, FormPassword, FormSelect } from "@/Components/ui/CustomUi/ReuseForm/Form";
import { SelectItem } from "@/Components/ui/select";
import { FieldGroup } from "@/Components/ui/field";
import { Button } from "@/Components/ui/button";
import { Plus, Edit, LogOut, ShieldOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { DUMMY_STAFF, DUMMY_ROLES } from "@/data/dummyStore";
import { formatDate } from "@/utils/dateFormet";
import type { IStaffListItem } from "@/types";
// import { useGetStaffsQuery, useCreateStaffMutation, useUpdateStaffMutation, useUpdateStaffStatusMutation, useForceLogoutStaffMutation } from "@/redux/features/staff/staffApi";
// import tryCatchWrapper from "@/utils/tryCatchWrapper";

// TODO: wire to useGetStaffsQuery once GET /staff exists — this list lives in
// local component state until then, per AGENTS.md §2.8.
// FIXME: design-only phase — usePermission() always resolves false with no
// session, which would hide every action button here. Gates are hardcoded
// open below; restore usePermission("staff.create" / "staff.update") once
// auth is wired (see ProtectedRoute.tsx).
const canCreate = true;
const canUpdate = true;

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "blocked", label: "Blocked" },
];

const staffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  phone: z.string().min(6, "Phone is required"),
  role: z.string().min(1, "Role is required"),
  password: z.string().optional(),
});

type StaffFormValues = z.infer<typeof staffSchema>;

const EmployeesPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [staffs, setStaffs] = useState<IStaffListItem[]>(DUMMY_STAFF);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IStaffListItem | null>(null);
  const [logoutTarget, setLogoutTarget] = useState<IStaffListItem | null>(null);
  const [blockTarget, setBlockTarget] = useState<IStaffListItem | null>(null);

  const roles = DUMMY_ROLES;

  const filtered = staffs.filter((s) => {
    const matchesTerm = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !status || s.status === status;
    return matchesTerm && matchesStatus;
  });

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: { name: "", email: "", phone: "", role: "", password: "" },
  });

  useEffect(() => {
    if (editing) {
      form.reset({ name: editing.name, email: editing.email, phone: editing.phone ?? "", role: editing.role?._id ?? "", password: "" });
    } else {
      form.reset({ name: "", email: "", phone: "", role: "", password: "" });
    }
  }, [editing, form]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row: IStaffListItem) => {
    setEditing(row);
    setModalOpen(true);
  };

  const onSubmit = (values: StaffFormValues) => {
    const role = roles.find((r) => r._id === values.role)!;

    if (editing) {
      setStaffs((prev) => prev.map((s) => (s._id === editing._id ? { ...s, name: values.name, phone: values.phone, role } : s)));
      toast.success("Staff member updated");
      setModalOpen(false);
      return;
    }

    if (!values.password) {
      form.setError("password", { message: "Password is required for a new staff member" });
      return;
    }

    setStaffs((prev) => [
      ...prev,
      {
        _id: `staff-${Date.now()}`, name: values.name, email: values.email, phone: values.phone, role,
        status: "active", emailVerified: false, phoneVerified: false, isDeleted: false, createdAt: new Date().toISOString(),
      },
    ]);
    toast.success("Staff account created");
    setModalOpen(false);
  };

  const handleForceLogout = (row: IStaffListItem) => {
    toast.success(`Sessions revoked for ${row.name}`);
    setLogoutTarget(null);
  };

  const handleToggleBlock = (row: IStaffListItem) => {
    const next = row.status === "active" ? "blocked" : "active";
    setStaffs((prev) => prev.map((s) => (s._id === row._id ? { ...s, status: next } : s)));
    toast.success(next === "blocked" ? `${row.name} blocked` : `${row.name} activated`);
    setBlockTarget(null);
  };

  const columns: Column<IStaffListItem>[] = [
    {
      header: "Staff Member", accessorKey: "name", render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-bold">{val}</span>
          <span className="text-xs text-gray-500">{row.email}</span>
        </div>
      ),
    },
    { header: "Role", accessorKey: "role", render: (_val, row) => <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-semibold">{row.role?.name ?? "—"}</span> },
    { header: "Last Login", accessorKey: "lastLoginAt", render: (val) => (val ? formatDate(val as string) : "Never") },
    { header: "Status", accessorKey: "status", render: (val) => <Tag theme={val === "active" ? "success" : "error"}>{val as string}</Tag> },
    {
      header: "Actions", accessorKey: "_id", render: (_val, row) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" title="Edit" disabled={!canUpdate} onClick={() => openEdit(row)} className="h-8 w-8 text-orange-500 bg-orange-50">
            <Edit className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" title={row.status === "active" ? "Block" : "Activate"} disabled={!canUpdate || row.role.slug === "super_admin"} onClick={() => setBlockTarget(row)} className="h-8 w-8 text-amber-600 bg-amber-50">
            <ShieldOff className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Force logout" disabled={!canUpdate} onClick={() => setLogoutTarget(row)} className="h-8 w-8 text-red-500 bg-red-50">
            <LogOut className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageWraper
      title="Admins"
      description="Manage admin & staff accounts and assign them a role."
      actions={canCreate ? <Button onClick={openCreate} className="bg-primary hover:bg-primary-dark text-white"><Plus className="mr-2 size-4" /> Add Admin</Button> : undefined}
    >
      <div className="flex flex-wrap gap-3 mb-4">
        <ReuseSearchInput className="min-w-64" placeholder="Search staff..." setSearch={setSearch} setPage={setCurrentPage} />
        <ReuseFilterSelect label="Status" options={statusOptions} value={status} onChange={setStatus} allowClear onClear={() => setStatus("")} />
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <ReusableTable data={filtered} columns={columns} pagination currentPage={currentPage} setCurrentPage={setCurrentPage} limit={10} total={filtered.length} />
      </div>

      <ReusableModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? "Edit Admin" : "Add Admin"}
        description={editing ? "Update the staff member's details and role." : "Create a staff account and assign a role."}
      >
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <FormInput control={form.control} name="name" label="Full Name" placeholder="Jane Doe" />
            <FormInput control={form.control} name="email" label="Email Address" placeholder="staff@ecommerce.com" disabled={!!editing} />
            <FormInput control={form.control} name="phone" label="Phone" placeholder="01700000000" />
            <FormSelect control={form.control} name="role" label="Role" placeholder="Select a role">
              {roles.map((role) => (
                <SelectItem key={role._id} value={role._id}>{role.name}</SelectItem>
              ))}
            </FormSelect>
            <FormPassword control={form.control} name="password" label={editing ? "New Password (leave blank to keep current)" : "Password"} placeholder="••••••••" />
            <Button type="submit" variant="secondary" className="w-full">{editing ? "Save Changes" : "Create Staff"}</Button>
          </FieldGroup>
        </form>
      </ReusableModal>

      <ConfirmModal
        open={!!logoutTarget}
        onCancel={() => setLogoutTarget(null)}
        currentRecord={logoutTarget}
        onConfirm={handleForceLogout}
        title="Force logout"
        description={`Revoke every active session for ${logoutTarget?.name}. They will need to sign in again.`}
        confirmText="Force logout"
        variant="danger"
      />

      <ConfirmModal
        open={!!blockTarget}
        onCancel={() => setBlockTarget(null)}
        currentRecord={blockTarget}
        onConfirm={handleToggleBlock}
        title={blockTarget?.status === "active" ? "Block staff member" : "Activate staff member"}
        description={blockTarget?.status === "active" ? `${blockTarget?.name} will no longer be able to sign in.` : `${blockTarget?.name} will regain access to the dashboard.`}
        confirmText={blockTarget?.status === "active" ? "Block" : "Activate"}
        variant={blockTarget?.status === "active" ? "danger" : "info"}
      />
    </PageWraper>
  );
};

export default EmployeesPage;
