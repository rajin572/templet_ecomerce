import { useState } from "react";
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import RevenueAreaChart from "@/Components/Charts/RevenueAreaChart";
import DonutSplitChart from "@/Components/Charts/DonutSplitChart";
import TopProductsBarChart from "@/Components/Charts/TopProductsBarChart";
import { formatMoney } from "@/utils/money";
import { ORDER_STATUS_COLORS } from "@/utils/chartColors";
import type { IOrdersByStatusItem, ISalesTrendPoint, ITopSellingProduct } from "@/types";

// TODO: wire to GET /admin/reports/sales, /orders, /product-sales, /inventory
// once those endpoints exist. V1 reports are read-only and derived from
// order/inventory records — no profit/COGS/marketing figures belong here.
const SALES_TODAY = 4500000;
const SALES_THIS_WEEK = 28900000;
const SALES_THIS_MONTH = 112000000;

const SALES_TREND: ISalesTrendPoint[] = [
  { date: "Aug 24", Revenue: 12500 },
  { date: "Aug 25", Revenue: 15800 },
  { date: "Aug 26", Revenue: 11200 },
  { date: "Aug 27", Revenue: 19400 },
  { date: "Aug 28", Revenue: 22100 },
  { date: "Aug 29", Revenue: 17600 },
  { date: "Aug 30", Revenue: 25300 },
];

const ORDER_COUNTS = { total: 186, pending: 8, delivered: 152, cancelled: 9 };

const ORDERS_BY_STATUS: IOrdersByStatusItem[] = [
  { category: "Pending", percentage: 10 },
  { category: "Confirmed", percentage: 15 },
  { category: "Processing", percentage: 20 },
  { category: "Packed", percentage: 10 },
  { category: "Shipped", percentage: 15 },
  { category: "Delivered", percentage: 25 },
  { category: "Cancelled", percentage: 5 },
];


const PRODUCT_SALES: ITopSellingProduct[] = [
  { _id: "1", name: "সুন্দরবনের খাঁটি মধু", unitsSold: 142 },
  { _id: "2", name: "গাওয়া ঘি", unitsSold: 118 },
  { _id: "3", name: "কালোজিরা তেল", unitsSold: 96 },
  { _id: "4", name: "সরিষার তেল", unitsSold: 84 },
  { _id: "5", name: "খেজুর (আজওয়া)", unitsSold: 61 },
  { _id: "6", name: "পাঁচফোড়ন মশলা", unitsSold: 47 },
];

const INVENTORY_ALERTS = [
  { _id: "1", product: "সুন্দরবনের খাঁটি মধু (৫০০ গ্রাম)", stock: 4, threshold: 10, status: "Low Stock" },
  { _id: "2", product: "কালোজিরা তেল (২৫০ মিলি)", stock: 0, threshold: 10, status: "Out of Stock" },
  { _id: "3", product: "খেজুর (আজওয়া) (১ কেজি)", stock: 6, threshold: 15, status: "Low Stock" },
];

const productSalesColumns: Column<ITopSellingProduct>[] = [
  { header: "Product", accessorKey: "name", render: (val) => <span className="font-medium">{val}</span> },
  { header: "Units Sold", accessorKey: "unitsSold" },
];

const inventoryColumns: Column<typeof INVENTORY_ALERTS[number]>[] = [
  { header: "Product / Variant", accessorKey: "product", render: (val) => <span className="font-medium">{val}</span> },
  { header: "Current Stock", accessorKey: "stock" },
  { header: "Low Stock Threshold", accessorKey: "threshold" },
  {
    header: "Status",
    accessorKey: "status",
    render: (val) => <Tag theme={val === "Out of Stock" ? "error" : "warning"}>{val}</Tag>,
  },
];

const BasicReportsPage = () => {
  const [salesPage, setSalesPage] = useState(1);
  const [inventoryPage, setInventoryPage] = useState(1);

  return (
    <PageWraper title="Reports" description="Read-only, derived from order and inventory records — no profit/COGS figures in V1.">
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-base-color">Sales</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
            <p className="text-sm text-secondbase-color">Today</p>
            <p className="text-2xl font-bold text-base-color mt-1">{formatMoney(SALES_TODAY)}</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
            <p className="text-sm text-secondbase-color">This Week</p>
            <p className="text-2xl font-bold text-base-color mt-1">{formatMoney(SALES_THIS_WEEK)}</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
            <p className="text-sm text-secondbase-color">This Month</p>
            <p className="text-2xl font-bold text-base-color mt-1">{formatMoney(SALES_THIS_MONTH)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border shadow-sm p-5">
          <RevenueAreaChart data={SALES_TREND} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-base-color">Orders</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="grid grid-cols-2 gap-4 content-start">
            <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
              <p className="text-sm text-secondbase-color">Total</p>
              <p className="text-2xl font-bold text-base-color mt-1">{ORDER_COUNTS.total}</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
              <p className="text-sm text-secondbase-color">Pending</p>
              <p className="text-2xl font-bold text-base-color mt-1">{ORDER_COUNTS.pending}</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
              <p className="text-sm text-secondbase-color">Delivered</p>
              <p className="text-2xl font-bold text-base-color mt-1">{ORDER_COUNTS.delivered}</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
              <p className="text-sm text-secondbase-color">Cancelled</p>
              <p className="text-2xl font-bold text-base-color mt-1">{ORDER_COUNTS.cancelled}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-border shadow-sm p-5">
            <DonutSplitChart data={ORDERS_BY_STATUS} colors={ORDER_STATUS_COLORS} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-base-color">Product Sales</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-border shadow-sm p-5">
            <TopProductsBarChart data={PRODUCT_SALES} />
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <ReusableTable
              data={PRODUCT_SALES}
              columns={productSalesColumns}
              pagination
              currentPage={salesPage}
              setCurrentPage={setSalesPage}
              limit={10}
              total={PRODUCT_SALES.length}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-base-color">Inventory — Low &amp; Out of Stock</h2>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <ReusableTable
            data={INVENTORY_ALERTS}
            columns={inventoryColumns}
            pagination
            currentPage={inventoryPage}
            setCurrentPage={setInventoryPage}
            limit={10}
            total={INVENTORY_ALERTS.length}
          />
        </div>
      </section>
    </PageWraper>
  );
};

export default BasicReportsPage;
