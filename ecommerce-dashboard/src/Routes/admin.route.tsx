import OverviewPage from "@/pages/Overview/Overview";
import {
  LayoutDashboard, ShoppingCart, Package, Box, Users, Megaphone,
  DollarSign, Settings, ListOrdered, RotateCcw, RefreshCcw, Layers,
  Star, Activity, UserCheck, FileText, Building2
} from "lucide-react";

import OrdersPage from "@/pages/Sales/OrdersPage";
import ManualOrdersPage from "@/pages/Sales/ManualOrdersPage";
import ReturnsPage from "@/pages/Sales/ReturnsPage";
import RefundsPage from "@/pages/Sales/RefundsPage";

import ProductsPage from "@/pages/Catalog/ProductsPage";
import CategoriesPage from "@/pages/Catalog/CategoriesPage";
import VariantsPage from "@/pages/Catalog/VariantsPage";
import BrandsPage from "@/pages/Catalog/BrandsPage";
import ReviewsPage from "@/pages/Catalog/ReviewsPage";

import StockPage from "@/pages/Inventory/StockPage";
import StockMovementPage from "@/pages/Inventory/StockMovementPage";
import PurchasesPage from "@/pages/Inventory/PurchasesPage";
import SuppliersPage from "@/pages/Inventory/SuppliersPage";
import WarehousesPage from "@/pages/Inventory/WarehousesPage";

import CustomersPage from "@/pages/Customers/CustomersPage";
import SegmentsPage from "@/pages/Customers/SegmentsPage";
import CustomerActivityPage from "@/pages/Customers/CustomerActivityPage";

import CouponsPage from "@/pages/Marketing/CouponsPage";
import CampaignsPage from "@/pages/Marketing/CampaignsPage";
import PromotionsPage from "@/pages/Marketing/PromotionsPage";

import RevenuePage from "@/pages/Finance/RevenuePage";
import CogsPage from "@/pages/Finance/CogsPage";
import ExpensesPage from "@/pages/Finance/ExpensesPage";
import ReportsPage from "@/pages/Finance/ReportsPage";

import EmployeesPage from "@/pages/Staff/EmployeesPage";
import RolesPage from "@/pages/Staff/RolesPage";
import PermissionsPage from "@/pages/Staff/PermissionsPage";

import SettingsPage from "@/pages/Settings/SettingsPage";
import ProfilePage from "@/pages/Settings/ProfilePage";

export const adminRoutes = [
  {
    title: "",
    items: [
      {
        title: "Dashboard",
        url: "overview",
        icon: LayoutDashboard,
        element: <OverviewPage />,
      },
    ],
  },
  {
    title: "Sales",
    items: [
      {
        title: "Orders",
        url: "orders",
        permission: "order.view",
        icon: ShoppingCart,
        element: <OrdersPage />,
      },
      {
        title: "Manual Orders",
        url: "manual-orders",
        permission: "order.view",
        icon: ListOrdered,
        element: <ManualOrdersPage />,
      },
      {
        title: "Returns",
        url: "returns",
        permission: "order.view",
        icon: RotateCcw,
        element: <ReturnsPage />,
      },
      {
        title: "Refunds",
        url: "refunds",
        permission: "order.view",
        icon: RefreshCcw,
        element: <RefundsPage />,
      },
    ],
  },
  {
    title: "Catalog",
    items: [
      {
        title: "Products",
        url: "products",
        permission: "product.view",
        icon: Package,
        element: <ProductsPage />,
      },
      {
        title: "Categories",
        url: "categories",
        permission: "category.view",
        icon: Layers,
        element: <CategoriesPage />,
      },
      {
        title: "Variants",
        url: "variants",
        permission: "product.view",
        icon: Box,
        element: <VariantsPage />,
      },
      {
        title: "Brands",
        url: "brands",
        permission: "brand.view",
        icon: Star,
        element: <BrandsPage />,
      },
      {
        title: "Reviews",
        url: "reviews",
        permission: "product.view",
        icon: Star,
        element: <ReviewsPage />,
      },
    ],
  },
  {
    title: "Inventory",
    items: [
      {
        title: "Stock",
        url: "stock",
        permission: "inventory.view",
        icon: Box,
        element: <StockPage />,
      },
      {
        title: "Stock Movement",
        url: "stock-movement",
        permission: "inventory.view",
        icon: Activity,
        element: <StockMovementPage />,
      },
      {
        title: "Purchases",
        url: "purchases",
        permission: "inventory.view",
        icon: ShoppingCart,
        element: <PurchasesPage />,
      },
      {
        title: "Suppliers",
        url: "suppliers",
        permission: "inventory.view",
        icon: Building2,
        element: <SuppliersPage />,
      },
      {
        title: "Warehouses",
        url: "warehouses",
        permission: "inventory.view",
        icon: Building2,
        element: <WarehousesPage />,
      },
    ],
  },
  {
    title: "Customers",
    items: [
      {
        title: "All Customers",
        url: "customers",
        icon: Users,
        element: <CustomersPage />,
      },
      {
        title: "Segments",
        url: "segments",
        icon: Users,
        element: <SegmentsPage />,
      },
      {
        title: "Customer Activity",
        url: "customer-activity",
        icon: Activity,
        element: <CustomerActivityPage />,
      },
    ],
  },
  {
    title: "Marketing",
    items: [
      {
        title: "Coupons",
        url: "coupons",
        permission: "coupon.view",
        icon: Megaphone,
        element: <CouponsPage />,
      },
      {
        title: "Campaigns",
        url: "campaigns",
        icon: Megaphone,
        element: <CampaignsPage />,
      },
      {
        title: "Promotions",
        url: "promotions",
        icon: Megaphone,
        element: <PromotionsPage />,
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        title: "Revenue",
        url: "revenue",
        permission: "finance.view",
        icon: DollarSign,
        element: <RevenuePage />,
      },
      {
        title: "COGS",
        url: "cogs",
        permission: "finance.view",
        icon: DollarSign,
        element: <CogsPage />,
      },
      {
        title: "Expenses",
        url: "expenses",
        permission: "finance.view",
        icon: DollarSign,
        element: <ExpensesPage />,
      },
      {
        title: "Reports",
        url: "reports",
        permission: "finance.view",
        icon: FileText,
        element: <ReportsPage />,
      },
    ],
  },
  {
    title: "Staff",
    items: [
      {
        title: "Employees",
        url: "employees",
        permission: "staff.view",
        icon: UserCheck,
        element: <EmployeesPage />,
      },
      {
        title: "Roles",
        url: "roles",
        permission: "staff.manage_roles",
        icon: UserCheck,
        element: <RolesPage />,
      },
      {
        title: "Permissions",
        url: "permissions",
        permission: "staff.manage_permissions",
        icon: UserCheck,
        element: <PermissionsPage />,
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        title: "Store Settings",
        url: "settings",
        permission: "settings.view",
        icon: Settings,
        element: <SettingsPage />,
      },
      {
        // No permission — every signed-in staff member manages their own account.
        title: "My Profile",
        url: "profile",
        icon: UserCheck,
        element: <ProfilePage />,
      },
    ],
  },
];
