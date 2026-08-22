import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Save } from "lucide-react";

const SettingsPage = () => {
    return (
        <PageWraper
            title="Store Settings"
            description="Manage your global store configuration, currency, and branding."
            actions={<Button className="bg-primary hover:bg-primary-dark text-white"><Save className="mr-2 size-4" /> Save Changes</Button>}
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Nav */}
                <div className="md:col-span-1 space-y-2">
                    <div className="bg-primary/10 text-primary font-medium px-4 py-3 rounded-lg cursor-pointer">General</div>
                    <div className="text-gray-600 hover:bg-gray-50 font-medium px-4 py-3 rounded-lg cursor-pointer">Payment Gateways</div>
                    <div className="text-gray-600 hover:bg-gray-50 font-medium px-4 py-3 rounded-lg cursor-pointer">Shipping & Delivery</div>
                    <div className="text-gray-600 hover:bg-gray-50 font-medium px-4 py-3 rounded-lg cursor-pointer">Notifications</div>
                    <div className="text-gray-600 hover:bg-gray-50 font-medium px-4 py-3 rounded-lg cursor-pointer">SEO Settings</div>
                </div>

                {/* Right Content */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h2 className="text-lg font-bold">General Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                                <Input defaultValue="ECommerce" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Store Tagline</label>
                                <Input defaultValue="Premium Food & Spices" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                                <Input defaultValue="support@ecommerce.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                                <Input defaultValue="+880 1XXXXXXXXX" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h2 className="text-lg font-bold">Regional Settings</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                                <select className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                                    <option value="BDT">BDT (৳) - Bangladeshi Taka</option>
                                    <option value="USD">USD ($) - US Dollar</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                                <select className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                                    <option>Asia/Dhaka</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </PageWraper>
    );
};

export default SettingsPage;
