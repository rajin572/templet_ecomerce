import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "../ui/sidebar";
import { NavGroup } from "./nav-group";
import { NavUser } from "./nav-user";
import { adminRoutes } from "@/Routes/admin.route";
import { AllImages } from "@/assets/AllImages";
import { useAuthUser } from "@/hooks/usePermission";

export function AppSidebar() {
  const { user, permissions, isSuperAdmin } = useAuthUser();

  // Entries without a `permission` are open to any signed-in staff member.
  // Hiding is convenience only — the backend enforces the same permission.
  const visibleGroups = adminRoutes
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        const required = (item as { permission?: string }).permission;
        if (!required || isSuperAdmin) return true;
        return permissions.includes(required);
      }),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Sidebar collapsible={"icon"} variant={"sidebar"}>
      <SidebarHeader className="overflow-hidden">
        <div className="flex items-start justify-center w-fit mx-auto">
          <img src={AllImages.logo} alt="logo" className="max-w-40" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {visibleGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t-2 border-[#FFFFFF1A]">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
