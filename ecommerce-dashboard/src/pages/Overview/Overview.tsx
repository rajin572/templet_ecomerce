import { useNavigate } from "react-router-dom";
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import RevenueAreaChart from "@/Components/Charts/RevenueAreaChart";
import DonutSplitChart from "@/Components/Charts/DonutSplitChart";
import TopProductsBarChart from "@/Components/Charts/TopProductsBarChart";
import DashboardStatCards from "@/Components/Dashboard/Overview/DashboardStatCards";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import { Button } from "@/Components/ui/button";
import { formatMoney } from "@/utils/money";
import { formatDate } from "@/utils/dateFormet";
import { getOrderStatusTheme, getPaymentStatusTheme } from "@/utils/orderStatus";
import { ORDER_STATUS_COLORS, PAYMENT_METHOD_COLORS } from "@/utils/chartColors";
import { IAttentionOrder, IDashboardOverviewData } from "@/types";
// import { useGetDashboardOverviewQuery } from "@/redux/features/dashboard/dashboardApi";

// TODO: wire to GET /admin/dashboard/overview once the endpoint exists.
const DUMMY_OVERVIEW: IDashboardOverviewData = {
  stats: {
    salesToday: 4500000,
    pendingOrders: 8,
    pendingPaymentVerification: 3,
    lowStockItems: 5,
  },
  salesTrend: [
    { date: "Aug 24", Revenue: 12500 },
    { date: "Aug 25", Revenue: 15800 },
    { date: "Aug 26", Revenue: 11200 },
    { date: "Aug 27", Revenue: 19400 },
    { date: "Aug 28", Revenue: 22100 },
    { date: "Aug 29", Revenue: 17600 },
    { date: "Aug 30", Revenue: 25300 },
  ],
  ordersByStatus: [
    { category: "Pending", percentage: 10 },
    { category: "Confirmed", percentage: 15 },
    { category: "Processing", percentage: 20 },
    { category: "Packed", percentage: 10 },
    { category: "Shipped", percentage: 15 },
    { category: "Delivered", percentage: 25 },
    { category: "Cancelled", percentage: 5 },
  ],
  paymentMethodSplit: [
    { category: "COD", percentage: 65 },
    { category: "bKash", percentage: 25 },
    { category: "Nagad", percentage: 10 },
  ],
  topSellingProducts: [
    { _id: "1", name: "সুন্দরবনের খাঁটি মধু", unitsSold: 142 },
    { _id: "2", name: "গাওয়া ঘি", unitsSold: 118 },
    { _id: "3", name: "কালোজিরা তেল", unitsSold: 96 },
    { _id: "4", name: "সরিষার তেল", unitsSold: 84 },
    { _id: "5", name: "খেজুর (আজওয়া)", unitsSold: 61 },
  ],
  attentionOrders: [
    { _id: "1", orderId: "AST-1029", customerName: "Rahim Uddin", customerPhone: "01712345678", total: 145000, status: "Pending", paymentMethod: "COD", paymentStatus: "Pending", placedAt: "2026-08-30T09:15:00Z" },
    { _id: "2", orderId: "AST-1028", customerName: "Karim Sheikh", customerPhone: "01911223344", total: 320000, status: "Confirmed", paymentMethod: "bKash", paymentStatus: "Pending Verification", placedAt: "2026-08-30T08:40:00Z" },
    { _id: "3", orderId: "AST-1027", customerName: "Nasrin Akter", customerPhone: "01611998877", total: 89000, status: "Pending", paymentMethod: "Nagad", paymentStatus: "Pending Verification", placedAt: "2026-08-29T19:05:00Z" },
    { _id: "4", orderId: "AST-1026", customerName: "Jasim Molla", customerPhone: "01555112233", total: 210000, status: "Confirmed", paymentMethod: "COD", paymentStatus: "Pending", placedAt: "2026-08-29T15:22:00Z" },
    { _id: "5", orderId: "AST-1025", customerName: "Fatema Begum", customerPhone: "01812009988", total: 62500, status: "Pending", paymentMethod: "bKash", paymentStatus: "Pending Verification", placedAt: "2026-08-29T11:50:00Z" },
  ],
};

const OverviewPage = () => {
  const navigate = useNavigate();

  // const { data } = useGetDashboardOverviewQuery();
  // const overview = data?.data;
  const overview = DUMMY_OVERVIEW;

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
    <PageWraper title="Dashboard Overview" description="Monitor your store's performance and what needs attention today">
      <DashboardStatCards stats={overview.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border shadow-sm p-5">
          <h2 className="text-base font-semibold text-base-color">Sales Trend</h2>
          <p className="text-sm text-secondbase-color mb-2">Last 7 days — collected COD + verified manual payments</p>
          <RevenueAreaChart data={overview.salesTrend} />
        </div>

        <div className="bg-white rounded-xl border border-border shadow-sm p-5">
          <h2 className="text-base font-semibold text-base-color">Orders by Status</h2>
          <p className="text-sm text-secondbase-color mb-2">Current order pipeline</p>
          <DonutSplitChart data={overview.ordersByStatus} colors={ORDER_STATUS_COLORS} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border shadow-sm p-5">
          <h2 className="text-base font-semibold text-base-color">Payment Method Split</h2>
          <p className="text-sm text-secondbase-color mb-2">Cash on Delivery vs. manual wallet transfer</p>
          <DonutSplitChart data={overview.paymentMethodSplit} colors={PAYMENT_METHOD_COLORS} />
        </div>

        <div className="bg-white rounded-xl border border-border shadow-sm p-5">
          <h2 className="text-base font-semibold text-base-color">Top Selling Products</h2>
          <p className="text-sm text-secondbase-color mb-2">Units sold, delivered orders only</p>
          <TopProductsBarChart data={overview.topSellingProducts} />
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
        <ReusableTable data={overview.attentionOrders} columns={columns} />
      </div>
    </PageWraper>
  );
};

export default OverviewPage;
