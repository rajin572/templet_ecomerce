import { useNavigate } from "react-router-dom";
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import DashboardStatCards from "@/Components/Dashboard/Overview/DashboardStatCards";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import { Button } from "@/Components/ui/button";
import { Package, Layers, Users, Megaphone, Mail, UserCog, ArrowUpRight } from "lucide-react";
import { formatMoney } from "@/utils/money";
import { formatDate } from "@/utils/dateFormet";
import { getOrderStatusTheme, getPaymentStatusTheme } from "@/utils/orderStatus";
import { DUMMY_PRODUCTS, DUMMY_CATEGORIES, DUMMY_CUSTOMERS, DUMMY_COUPONS, DUMMY_NEWSLETTER_SUBSCRIBERS, DUMMY_STAFF } from "@/data/dummyStore";
import { IAttentionOrder, IDashboardStats } from "@/types";
// import { useGetDashboardOverviewQuery } from "@/redux/features/dashboard/dashboardApi";

// TODO: wire to GET /admin/dashboard/overview once the endpoint exists.
// This page is the cross-module launchpad — what's happening everywhere.
// For sales-specific charts and trends, see Sales > Sales Overview instead;
// deliberately not duplicated here.
const DUMMY_STATS: IDashboardStats = {
  salesToday: 4500000,
  pendingOrders: 8,
  pendingPaymentVerification: 3,
  lowStockItems: 5,
};

const DUMMY_ATTENTION_ORDERS: IAttentionOrder[] = [
  { _id: "1", orderId: "AST-1029", customerName: "Rahim Uddin", customerPhone: "01712345678", total: 145000, status: "Pending", paymentMethod: "COD", paymentStatus: "Pending", placedAt: "2026-08-30T09:15:00Z" },
  { _id: "2", orderId: "AST-1028", customerName: "Karim Sheikh", customerPhone: "01911223344", total: 320000, status: "Confirmed", paymentMethod: "bKash", paymentStatus: "Pending Verification", placedAt: "2026-08-30T08:40:00Z" },
  { _id: "3", orderId: "AST-1027", customerName: "Nasrin Akter", customerPhone: "01611998877", total: 89000, status: "Pending", paymentMethod: "Nagad", paymentStatus: "Pending Verification", placedAt: "2026-08-29T19:05:00Z" },
  { _id: "4", orderId: "AST-1026", customerName: "Jasim Molla", customerPhone: "01555112233", total: 210000, status: "Confirmed", paymentMethod: "COD", paymentStatus: "Pending", placedAt: "2026-08-29T15:22:00Z" },
  { _id: "5", orderId: "AST-1025", customerName: "Fatema Begum", customerPhone: "01812009988", total: 62500, status: "Pending", paymentMethod: "bKash", paymentStatus: "Pending Verification", placedAt: "2026-08-29T11:50:00Z" },
];

const OverviewPage = () => {
  const navigate = useNavigate();

  // const { data } = useGetDashboardOverviewQuery();
  const stats = DUMMY_STATS;
  const attentionOrders = DUMMY_ATTENTION_ORDERS;

  const snapshot = [
    {
      label: "Products",
      value: DUMMY_PRODUCTS.filter((p) => p.status === "published").length,
      sub: `of ${DUMMY_PRODUCTS.length} total`,
      icon: Package,
      color: "text-secondary-color bg-secondary-color/10",
      url: "/admin/products",
    },
    {
      label: "Categories",
      value: DUMMY_CATEGORIES.filter((c) => c.status === "active").length,
      sub: "active",
      icon: Layers,
      color: "text-blue-600 bg-blue-50",
      url: "/admin/categories",
    },
    {
      label: "Customers",
      value: DUMMY_CUSTOMERS.length,
      sub: "total accounts",
      icon: Users,
      color: "text-emerald-600 bg-emerald-50",
      url: "/admin/customers",
    },
    {
      label: "Active Coupons",
      value: DUMMY_COUPONS.filter((c) => c.status === "active").length,
      sub: "running now",
      icon: Megaphone,
      color: "text-purple-600 bg-purple-50",
      url: "/admin/coupons",
    },
    {
      label: "Newsletter Subscribers",
      value: DUMMY_NEWSLETTER_SUBSCRIBERS.filter((s) => s.status === "subscribed").length,
      sub: "subscribed",
      icon: Mail,
      color: "text-pink-600 bg-pink-50",
      url: "/admin/newsletter",
    },
    {
      label: "Admins & Staff",
      value: DUMMY_STAFF.length,
      sub: "accounts",
      icon: UserCog,
      color: "text-amber-600 bg-amber-50",
      url: "/admin/admins",
    },
  ];

  const columns: Column<IAttentionOrder>[] = [
    { header: "Order ID", accessorKey: "orderId", render: (val) => <span className="font-bold">#{val}</span> },
    {
      header: "Customer",
      accessorKey: "customerName",
      render: (_, row) => (
        <div>
          <p className="font-medium">{row.customerName}</p>
          <p className="text-xs text-secondbase-color">{row.customerPhone}</p>
        </div>
      ),
    },
    { header: "Total", accessorKey: "total", render: (val) => formatMoney(val) },
    {
      header: "Order Status",
      accessorKey: "status",
      render: (val) => <Tag theme={getOrderStatusTheme(val)}>{val}</Tag>,
    },
    {
      header: "Payment",
      accessorKey: "paymentStatus",
      render: (_, row) => (
        <div className="flex flex-col gap-1 items-start">
          <span className="text-xs text-secondbase-color">{row.paymentMethod}</span>
          <Tag theme={getPaymentStatusTheme(row.paymentStatus)}>{row.paymentStatus}</Tag>
        </div>
      ),
    },
    { header: "Placed", accessorKey: "placedAt", render: (val) => formatDate(val) },
    {
      header: "Action",
      accessorKey: "_id",
      render: (_, row) => (
        <Button
          variant="secondary"
          size="sm"
          className="text-xs py-1 h-auto"
          onClick={() => navigate(`/admin/orders/${row._id}`)}
        >
          View Order
        </Button>
      ),
    },
  ];

  return (
    <PageWraper title="Dashboard Overview" description="What's happening across the whole store today — for sales trends and charts, see Sales Overview">
      <DashboardStatCards stats={stats} />

      <div>
        <h2 className="text-base font-semibold text-base-color mb-3">Store at a Glance</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {snapshot.map(({ label, value, sub, icon: Icon, color, url }) => (
            <button
              key={label}
              type="button"
              onClick={() => navigate(url)}
              className="group bg-white rounded-xl border border-border shadow-sm p-4 text-left hover:border-secondary-color/40 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`size-9 rounded-lg flex items-center justify-center ${color}`}>
                  <Icon className="size-4.5" />
                </div>
                <ArrowUpRight className="size-3.5 text-secondbase-color opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-bold text-base-color">{value}</p>
              <p className="text-xs text-secondbase-color mt-0.5">{label} · {sub}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-base-color">Orders Needing Attention</h2>
            <p className="text-sm text-secondbase-color">Pending fulfilment or awaiting payment verification</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/orders")}>
            View All Orders
          </Button>
        </div>
        <ReusableTable data={attentionOrders} columns={columns} />
      </div>
    </PageWraper>
  );
};

export default OverviewPage;
