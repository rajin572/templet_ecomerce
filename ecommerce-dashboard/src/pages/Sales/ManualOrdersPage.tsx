import { useState } from 'react';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Plus, Search, ShoppingCart } from "lucide-react";

const ManualOrdersPage = () => {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <PageWraper 
      title="Create Manual Order" 
      description="Create orders manually for offline, phone, or WhatsApp customers."
      actions={<Button className="bg-primary hover:bg-primary-dark text-white"><ShoppingCart className="mr-2 size-4" /> Place Order</Button>}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Order Form */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold mb-4">Customer Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Phone</label>
                        <div className="flex gap-2">
                            <Input placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
                            <Button variant="outline"><Search className="size-4" /></Button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                        <Input placeholder="Full Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Products</h2>
                    <Button variant="outline" size="sm" className="text-primary border-primary"><Plus className="size-4 mr-1"/> Add Product</Button>
                </div>
                <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
                    No products added yet. Click "Add Product" to search and add items to this order.
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold mb-4">Shipping Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                        <Input placeholder="Full Street Address" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City / District</label>
                        <Input placeholder="Dhaka" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Order Source</label>
                        <select className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                            <option>Phone Call</option>
                            <option>WhatsApp</option>
                            <option>Facebook</option>
                            <option>Offline / Walk-in</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                <h2 className="text-lg font-bold mb-4">Order Summary</h2>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-medium">৳0.00</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Discount</span>
                        <span className="font-medium text-error">- ৳0.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500">Delivery Fee</span>
                        <Input className="w-24 h-8 text-right" placeholder="৳" defaultValue="60" />
                    </div>
                    <div className="border-t pt-3 flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-primary">৳60.00</span>
                    </div>
                </div>
                
                <h3 className="text-sm font-bold mt-6 mb-2">Payment Method</h3>
                <select className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 mb-6">
                    <option>Cash on Delivery (COD)</option>
                    <option>bKash</option>
                    <option>Nagad</option>
                    <option>Bank Transfer</option>
                </select>

                <Button className="w-full bg-primary hover:bg-primary-dark text-white h-12 text-base">
                    Place Order
                </Button>
            </div>
        </div>
      </div>
    </PageWraper>
  );
};

export default ManualOrdersPage;
