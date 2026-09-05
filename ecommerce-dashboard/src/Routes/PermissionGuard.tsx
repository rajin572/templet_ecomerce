// import { Link } from "react-router-dom";
// import { ShieldAlert } from "lucide-react";
// import SpinLoader from "@/Components/ui/CustomUi/SpinLoader";
// import { useAuthUser } from "@/hooks/usePermission";

/**
 * Page-level guard. Hiding a sidebar entry is convenience only — a staff member
 * can still type the URL, so every guarded page checks the resolved permission
 * set. The backend enforces the same permission independently.
 *
 * FIXME: design-only phase — there is no backend yet, so `useAuthUser()` has
 * nothing real to resolve and every permission-gated page would otherwise show
 * "You don't have access". Bypassing the check so every page is reachable for
 * design review. Restore the commented block below once auth is wired to a
 * real API, and re-add the four imports above.
 */
const PermissionGuard = ({
  children,
}: {
  permission: string;
  children: React.ReactNode;
}) => {
  return <>{children}</>;

  // const { permissions, isSuperAdmin, isLoading } = useAuthUser();
  //
  // if (isLoading) {
  //   return (
  //     <div className="py-32 flex justify-center">
  //       <SpinLoader />
  //     </div>
  //   );
  // }
  //
  // if (!isSuperAdmin && !permissions.includes(permission)) {
  //   return (
  //     <div className="py-24 flex flex-col items-center text-center gap-3">
  //       <div className="rounded-full bg-red-50 p-4">
  //         <ShieldAlert className="size-8 text-red-500" />
  //       </div>
  //       <h2 className="text-xl font-bold text-base-color">You don&apos;t have access</h2>
  //       <p className="text-sm text-gray-500 max-w-md">
  //         This page requires the <code className="font-mono">{permission}</code> permission. Ask an
  //         administrator to grant it to your role.
  //       </p>
  //       <Link to="/admin/overview" className="text-secondary-color font-semibold text-sm">
  //         Back to dashboard
  //       </Link>
  //     </div>
  //   );
  // }
  //
  // return <>{children}</>;
};

export default PermissionGuard;
