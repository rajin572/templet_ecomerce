import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import RevenueAreaChart from "@/Components/Charts/RevenueAreaChart";
import DonutSplitChart from "@/Components/Charts/DonutSplitChart";
import TopProductsBarChart from "@/Components/Charts/TopProductsBarChart";
import { Button } from "@/Components/ui/button";
import { ShoppingCart, Wallet, ClipboardCheck, Undo2 } from "lucide-react";
import { useOrders } from "@/store/orderStore";
import { ORDER_STATUS_COLORS, PAYMENT_METHOD_COLORS } from "@/utils/chartColors";

// Unlike the main Dashboard Overview / Reports pages (still static dummy
// data — see AGENTS.md §2.8), this page reads the live in-memory order store
// directly, so every stat and chart here reacts immediately to accept/ship/
// verify/return actions taken anywhere in Sales.
const SalesOverviewPage = () => {
  const navigate = useNavigate();
  const orders = useOrders();

  const stats = useMemo(() => {
    const totalRevenue = orders.filter((o) => o.paymentStatus === "Verified").reduce((sum, o) => sum + o.total, 0);
    const pendingVerification = orders.filter((o) => o.paymentStatus === "Pending Verification").length;
    const pendingRefunds = orders.filter((o) => o.refundStatus === "pending").length;
    return { totalOrders: orders.length, totalRevenue, pendingVerification, pendingRefunds };
  }, [orders]);

  const revenueTrend = useMemo(() => {
    const byDay = new Map<string, number>();
    orders.forEach((o) => {
      if (o.paymentStatus !== "Verified") return;
      const key = o.placedAt.slice(0, 10);
      byDay.set(key, (byDay.get(key) ?? 0) + o.total);
    });
    return Array.from(byDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, Revenue]) => ({ date: new Date(key).toLocaleDateString("en-BD", { month: "short", day: "numeric" }), Revenue }));
  }, [orders]);

  const ordersByStatus = useMemo(() => {
    const counts = new Map<string, number>();
    orders.forEach((o) => counts.set(o.status, (counts.get(o.status) ?? 0) + 1));
    const total = orders.length || 1;
    return Array.from(counts.entries()).map(([category, count]) => ({ category, percentage: Math.round((count / total) * 100) }));
  }, [orders]);

  const paymentMethodSplit = useMemo(() => {
    const counts = new Map<string, number>();
    orders.forEach((o) => counts.set(o.paymentMethod, (counts.get(o.paymentMethod) ?? 0) + 1));
    const total = orders.length || 1;
    return Array.from(counts.entries()).map(([category, count]) => ({ category, percentage: Math.round((count / total) * 100) }));
  }, [orders]);

  const topProducts = useMemo(() => {
    const counts = new Map<string, { name: string; unitsSold: number }>();
    orders.filter((o) => o.status === "Delivered").forEach((o) => {
      o.items.forEach((item) => {
        const existing = counts.get(item.productId);
        if (existing) existing.unitsSold += item.quantity;
        else counts.set(item.productId, { name: item.name, unitsSold: item.quantity });
      });
    });
    return Array.from(counts.entries())
      .map(([_id, v]) => ({ _id, ...v }))
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 6);
  }, [orders]);

  return (
    <PageWraper title="Sales Overview" description="Live snapshot of orders, revenue and payments — updates as you work through Sales.">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm flex items-center gap-3">
          <div className="size-10 rounded-lg bg-secondary-color/10 flex items-center justify-center shrink-0">
            <ShoppingCart className="size-5 text-secondary-color" />
          </div>
          <div>
            <p className="text-sm text-secondbase-color">Total Orders</p>
            <p className="text-2xl font-bold text-base-color">{stats.totalOrders}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm flex items-center gap-3">
          <div className="size-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
            <Wallet className="size-5 text-success" />
          </div>
          <div>
            <p className="text-sm text-secondbase-color">Verified Revenue</p>
            <p className="text-2xl font-bold text-base-color">৳{stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm flex items-center gap-3">
          <div className="size-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
            <ClipboardCheck className="size-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-secondbase-color">Awaiting Payment Verification</p>
            <p className="text-2xl font-bold text-base-color">{stats.pendingVerification}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm flex items-center gap-3">
          <div className="size-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
            <Undo2 className="size-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-secondbase-color">Refunds Pending</p>
            <p className="text-2xl font-bold text-base-color">{stats.pendingRefunds}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border shadow-sm p-5">
          <h2 className="text-base font-semibold text-base-color">Revenue Trend</h2>
          <p className="text-sm text-secondbase-color mb-2">Verified payments, by day placed</p>
          {revenueTrend.length > 0 ? <RevenueAreaChart data={revenueTrend} /> : <p className="text-sm text-secondbase-color py-16 text-center">No verified revenue yet.</p>}
        </div>

        <div className="bg-white rounded-xl border border-border shadow-sm p-5">
          <h2 className="text-base font-semibold text-base-color">Orders by Status</h2>
          <p className="text-sm text-secondbase-color mb-2">Current pipeline, including returns</p>
          <DonutSplitChart data={ordersByStatus} colors={ORDER_STATUS_COLORS} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border shadow-sm p-5">
          <h2 className="text-base font-semibold text-base-color">Payment Method Split</h2>
          <p className="text-sm text-secondbase-color mb-2">Cash on Delivery vs. manual wallet transfer</p>
          <DonutSplitChart data={paymentMethodSplit} colors={PAYMENT_METHOD_COLORS} />
        </div>

        <div className="bg-white rounded-xl border border-border shadow-sm p-5">
          <h2 className="text-base font-semibold text-base-color">Top Selling Products</h2>
          <p className="text-sm text-secondbase-color mb-2">Units sold, delivered orders only</p>
          {topProducts.length > 0 ? <TopProductsBarChart data={topProducts} /> : <p className="text-sm text-secondbase-color py-16 text-center">No delivered orders yet.</p>}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate("/admin/orders/pending")}>Review Pending Orders</Button>
        <Button variant="outline" onClick={() => navigate("/admin/orders/returns")}>Review Returns</Button>
      </div>
    </PageWraper>
  );
};

export default SalesOverviewPage;
