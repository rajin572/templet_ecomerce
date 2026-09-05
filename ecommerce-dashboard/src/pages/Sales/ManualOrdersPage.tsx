import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Plus, Minus, Search, ShoppingCart, X } from "lucide-react";
import ProductPickerModal from "@/Components/Dashboard/Website/ProductPickerModal";
import { DUMMY_CUSTOMERS, DUMMY_PRODUCTS } from "@/data/dummyStore";
import type { IOrderItem, IOrderSource, IOrderPaymentMethod } from "@/types";

// TODO: wire to a POST /orders (manual) endpoint once it exists — this form
// only resets and toasts locally until then, per AGENTS.md §2.8.
const ManualOrdersPage = () => {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [source, setSource] = useState<IOrderSource>("Phone");
  const [paymentMethod, setPaymentMethod] = useState<IOrderPaymentMethod>("COD");
  const [deliveryFee, setDeliveryFee] = useState(60);
  const [discount, setDiscount] = useState(0);
  const [items, setItems] = useState<IOrderItem[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    const match = DUMMY_CUSTOMERS.find((c) => c.phone === value);
    if (match) {
      setCustomerName(match.name);
      setAddress(match.address ?? "");
    }
  };

  const availableProducts = DUMMY_PRODUCTS.filter((p) => !items.some((i) => i.productId === p._id));

  const handleAddProducts = (ids: string[]) => {
    const newItems: IOrderItem[] = ids.map((id) => {
      const p = DUMMY_PRODUCTS.find((x) => x._id === id)!;
      return { productId: p._id, name: p.name, image: p.images[0], unit: p.unit, price: p.price, quantity: 1 };
    });
    setItems((prev) => [...prev, ...newItems]);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i)));
  };

  const removeItem = (productId: string) => setItems((prev) => prev.filter((i) => i.productId !== productId));

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);
  const total = Math.max(0, subtotal + deliveryFee - discount);

  const resetForm = () => {
    setCustomerName(""); setPhone(""); setAddress(""); setCity(""); setItems([]); setDiscount(0); setDeliveryFee(60);
  };

  const handlePlaceOrder = () => {
    if (!customerName.trim() || !phone.trim()) { toast.error("Customer name and phone are required"); return; }
    if (items.length === 0) { toast.error("Add at least one product to the order"); return; }
    toast.success(`Order placed for ${customerName} — ৳${total}`);
    resetForm();
  };

  return (
    <PageWraper
      title="Create Manual Order"
      description="Create orders manually for offline, phone, or WhatsApp customers."
      actions={<Button className="bg-primary hover:bg-primary-dark text-white" onClick={handlePlaceOrder}><ShoppingCart className="mr-2 size-4" /> Place Order</Button>}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4">Customer Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Phone</label>
                <div className="flex gap-2">
                  <Input placeholder="01XXXXXXXXX" value={phone} onChange={(e) => handlePhoneChange(e.target.value)} />
                  <Button variant="outline" type="button"><Search className="size-4" /></Button>
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
              <Button variant="outline" size="sm" className="text-primary border-primary" onClick={() => setPickerOpen(true)}>
                <Plus className="size-4 mr-1" /> Add Product
              </Button>
            </div>
            {items.length === 0 ? (
              <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
                No products added yet. Click "Add Product" to search and add items to this order.
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 p-2 rounded-lg border border-border">
                    {item.image && <img src={item.image} alt={item.name} className="size-10 rounded-md border border-border object-cover" />}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-secondbase-color">{item.unit} · ৳{item.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="size-7" onClick={() => updateQuantity(item.productId, -1)}><Minus className="size-3" /></Button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="size-7" onClick={() => updateQuantity(item.productId, 1)}><Plus className="size-3" /></Button>
                    </div>
                    <span className="w-16 text-right text-sm font-bold">৳{item.price * item.quantity}</span>
                    <Button variant="ghost" size="icon" className="size-7 text-red-500" onClick={() => removeItem(item.productId)}><X className="size-4" /></Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4">Shipping Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                <Input placeholder="Full Street Address" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City / District</label>
                <Input placeholder="Dhaka" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Source</label>
                <select value={source} onChange={(e) => setSource(e.target.value as IOrderSource)} className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="Phone">Phone Call</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Offline">Offline / Walk-in</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">৳{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Discount</span>
                <Input type="number" className="w-24 h-8 text-right" value={discount} onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Delivery Fee</span>
                <Input type="number" className="w-24 h-8 text-right" value={deliveryFee} onChange={(e) => setDeliveryFee(Math.max(0, Number(e.target.value)))} />
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">৳{total.toFixed(2)}</span>
              </div>
            </div>

            <h3 className="text-sm font-bold mt-6 mb-2">Payment Method</h3>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as IOrderPaymentMethod)} className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring mb-6">
              <option value="COD">Cash on Delivery (COD)</option>
              <option value="bKash">bKash</option>
              <option value="Nagad">Nagad</option>
            </select>

            <Button className="w-full bg-primary hover:bg-primary-dark text-white h-12 text-base" onClick={handlePlaceOrder}>
              Place Order
            </Button>
          </div>
        </div>
      </div>

      <ProductPickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        title="Add Products to Order"
        description="Search and select products to add as line items."
        availableProducts={availableProducts}
        onAdd={handleAddProducts}
      />
    </PageWraper>
  );
};

export default ManualOrdersPage;
