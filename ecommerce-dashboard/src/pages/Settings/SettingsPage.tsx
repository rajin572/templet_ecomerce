import { useState } from "react";
import { toast } from "sonner";
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Switch } from "@/Components/ui/switch";
import { Save } from "lucide-react";
import { cn } from "@/lib/utils";

// TODO: wire to GET/PATCH /settings once it exists — this form edits local
// component state until then, per AGENTS.md §2.8.
const TABS = ["General", "Payment Gateways", "Shipping & Delivery", "Notifications", "SEO Settings"] as const;
type Tab = typeof TABS[number];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>("General");

  const [general, setGeneral] = useState({ storeName: "ECommerce", tagline: "Premium Food & Spices", email: "support@ecommerce.com", phone: "+880 1XXXXXXXXX", currency: "BDT", timezone: "Asia/Dhaka" });
  const [payment, setPayment] = useState({ codEnabled: true, bkashNumber: "01XXXXXXXXX", nagadNumber: "01XXXXXXXXX", requireTrxId: true });
  const [shipping, setShipping] = useState({ dhakaFee: 60, outsideDhakaFee: 120, freeShippingThreshold: 2000 });
  const [notifications, setNotifications] = useState({ orderConfirmationSms: true, orderConfirmationEmail: false, lowStockAlert: true, lowStockThreshold: 20 });
  const [seo, setSeo] = useState({ metaTitle: "ECommerce — খাঁটি মধু, মশলা ও খাদ্যপণ্য", metaDescription: "সরাসরি উৎপাদক থেকে খাঁটি মধু, মশলা ও প্রিমিয়াম খাদ্যপণ্য, ক্যাশ অন ডেলিভারিতে।" });

  const handleSave = () => {
    toast.success(`${activeTab} settings saved`);
  };

  return (
    <PageWraper
      title="Store Settings"
      description="Manage your global store configuration, currency, and branding."
      actions={<Button className="bg-primary hover:bg-primary-dark text-white" onClick={handleSave}><Save className="mr-2 size-4" /> Save Changes</Button>}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "w-full text-left font-medium px-4 py-3 rounded-lg cursor-pointer transition-colors",
                activeTab === tab ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="md:col-span-2 space-y-6">
          {activeTab === "General" && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <h2 className="text-lg font-bold">General Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                  <Input value={general.storeName} onChange={(e) => setGeneral((s) => ({ ...s, storeName: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Tagline</label>
                  <Input value={general.tagline} onChange={(e) => setGeneral((s) => ({ ...s, tagline: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <Input value={general.email} onChange={(e) => setGeneral((s) => ({ ...s, email: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                  <Input value={general.phone} onChange={(e) => setGeneral((s) => ({ ...s, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    value={general.currency}
                    onChange={(e) => setGeneral((s) => ({ ...s, currency: e.target.value }))}
                    className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="BDT">BDT (৳) - Bangladeshi Taka</option>
                    <option value="USD">USD ($) - US Dollar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  <select
                    value={general.timezone}
                    onChange={(e) => setGeneral((s) => ({ ...s, timezone: e.target.value }))}
                    className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option>Asia/Dhaka</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Payment Gateways" && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <h2 className="text-lg font-bold">Payment Methods</h2>
              <p className="text-sm text-secondbase-color -mt-2">This store accepts Cash on Delivery by default, plus manual bKash/Nagad transfer verified against a transaction ID. There is no automated payment gateway.</p>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <div>
                  <p className="font-medium text-sm">Cash on Delivery (COD)</p>
                  <p className="text-xs text-secondbase-color">Always available at checkout</p>
                </div>
                <Switch checked={payment.codEnabled} onCheckedChange={(v) => setPayment((s) => ({ ...s, codEnabled: v }))} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">bKash Merchant/Personal Number</label>
                  <Input value={payment.bkashNumber} onChange={(e) => setPayment((s) => ({ ...s, bkashNumber: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nagad Merchant/Personal Number</label>
                  <Input value={payment.nagadNumber} onChange={(e) => setPayment((s) => ({ ...s, nagadNumber: e.target.value }))} />
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <div>
                  <p className="font-medium text-sm">Require Transaction ID</p>
                  <p className="text-xs text-secondbase-color">Customer must enter the TrxID before a manual payment is marked "Pending Verification"</p>
                </div>
                <Switch checked={payment.requireTrxId} onCheckedChange={(v) => setPayment((s) => ({ ...s, requireTrxId: v }))} />
              </div>
            </div>
          )}

          {activeTab === "Shipping & Delivery" && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <h2 className="text-lg font-bold">Delivery Fees</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inside Dhaka (৳)</label>
                  <Input type="number" value={shipping.dhakaFee} onChange={(e) => setShipping((s) => ({ ...s, dhakaFee: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Outside Dhaka (৳)</label>
                  <Input type="number" value={shipping.outsideDhakaFee} onChange={(e) => setShipping((s) => ({ ...s, outsideDhakaFee: Number(e.target.value) }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping Threshold (৳, 0 to disable)</label>
                  <Input type="number" value={shipping.freeShippingThreshold} onChange={(e) => setShipping((s) => ({ ...s, freeShippingThreshold: Number(e.target.value) }))} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "Notifications" && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <h2 className="text-lg font-bold">Notifications</h2>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">SMS on order confirmation</p>
                <Switch checked={notifications.orderConfirmationSms} onCheckedChange={(v) => setNotifications((s) => ({ ...s, orderConfirmationSms: v }))} />
              </div>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <p className="text-sm font-medium">Email on order confirmation</p>
                <Switch checked={notifications.orderConfirmationEmail} onCheckedChange={(v) => setNotifications((s) => ({ ...s, orderConfirmationEmail: v }))} />
              </div>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <p className="text-sm font-medium">Low stock alerts</p>
                <Switch checked={notifications.lowStockAlert} onCheckedChange={(v) => setNotifications((s) => ({ ...s, lowStockAlert: v }))} />
              </div>
              {notifications.lowStockAlert && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alert when stock falls below</label>
                  <Input type="number" className="max-w-40" value={notifications.lowStockThreshold} onChange={(e) => setNotifications((s) => ({ ...s, lowStockThreshold: Number(e.target.value) }))} />
                </div>
              )}
            </div>
          )}

          {activeTab === "SEO Settings" && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <h2 className="text-lg font-bold">Homepage SEO</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                <Input value={seo.metaTitle} onChange={(e) => setSeo((s) => ({ ...s, metaTitle: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                <textarea
                  value={seo.metaDescription}
                  onChange={(e) => setSeo((s) => ({ ...s, metaDescription: e.target.value }))}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm min-h-24 focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWraper>
  );
};

export default SettingsPage;
