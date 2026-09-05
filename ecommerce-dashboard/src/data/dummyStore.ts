// Shared, cross-referenced dummy data for the design-only phase (no backend
// yet — see AGENTS.md §2.8). Categories/products/orders/reviews all point at
// each other's real ids so pages built against this data stay consistent
// instead of each page inventing its own disconnected fixtures.
import type { ICategory, IProduct, ICustomer, IOrder, IReview, ICoupon } from "@/types";

export const DUMMY_CATEGORIES: ICategory[] = [
  { _id: "cat-honey", name: "Honey", slug: "honey", parentId: null, status: "active", order: 1, createdAt: "2026-08-01T00:00:00Z" },
  { _id: "cat-spices", name: "Spices", slug: "spices", parentId: null, status: "active", order: 2, createdAt: "2026-08-01T00:00:00Z" },
  { _id: "cat-spices-whole", name: "Whole Spices", slug: "whole-spices", parentId: "cat-spices", status: "active", order: 1, createdAt: "2026-08-02T00:00:00Z" },
  { _id: "cat-spices-ground", name: "Ground Spices", slug: "ground-spices", parentId: "cat-spices", status: "active", order: 2, createdAt: "2026-08-02T00:00:00Z" },
  { _id: "cat-oil-ghee", name: "Oil & Ghee", slug: "oil-ghee", parentId: null, status: "active", order: 3, createdAt: "2026-08-01T00:00:00Z" },
  { _id: "cat-dates", name: "Dates & Dry Fruits", slug: "dates-dry-fruits", parentId: null, status: "active", order: 4, createdAt: "2026-08-01T00:00:00Z" },
  { _id: "cat-dates-ajwa", name: "Ajwa & Premium Dates", slug: "ajwa-premium-dates", parentId: "cat-dates", status: "active", order: 1, createdAt: "2026-08-03T00:00:00Z" },
  { _id: "cat-dates-nuts", name: "Nuts & Dry Fruits", slug: "nuts-dry-fruits", parentId: "cat-dates", status: "active", order: 2, createdAt: "2026-08-03T00:00:00Z" },
  { _id: "cat-tea", name: "Tea & Beverages", slug: "tea-beverages", parentId: null, status: "inactive", order: 5, createdAt: "2026-08-05T00:00:00Z" },
];

export const DUMMY_PRODUCTS: IProduct[] = [
  { _id: "prod-honey-sundarban", name: "Premium Sundarbans Honey", slug: "premium-sundarbans-honey", sku: "HONEY-01", categoryId: "cat-honey", images: ["https://placehold.co/80x80/FEF3C7/92400E.png?text=Honey"], price: 850, comparePrice: 950, stock: 120, unit: "500g", status: "published", createdAt: "2026-08-05T00:00:00Z" },
  { _id: "prod-honey-litchi", name: "Litchi Flower Honey", slug: "litchi-flower-honey", sku: "HONEY-02", categoryId: "cat-honey", images: ["https://placehold.co/80x80/FEF3C7/92400E.png?text=Honey"], price: 780, stock: 60, unit: "500g", status: "published", createdAt: "2026-08-06T00:00:00Z" },
  { _id: "prod-spice-cinnamon", name: "Cinnamon Stick", slug: "cinnamon-stick", sku: "SPICE-W01", categoryId: "cat-spices-whole", images: ["https://placehold.co/80x80/FDE68A/78350F.png?text=Spice"], price: 220, stock: 80, unit: "100g", status: "published", createdAt: "2026-08-07T00:00:00Z" },
  { _id: "prod-spice-cardamom", name: "Black Cardamom", slug: "black-cardamom", sku: "SPICE-W02", categoryId: "cat-spices-whole", images: ["https://placehold.co/80x80/FDE68A/78350F.png?text=Spice"], price: 340, stock: 8, unit: "100g", status: "published", createdAt: "2026-08-07T00:00:00Z" },
  { _id: "prod-spice-turmeric", name: "Turmeric Powder", slug: "turmeric-powder", sku: "SPICE-G01", categoryId: "cat-spices-ground", images: ["https://placehold.co/80x80/FCD34D/78350F.png?text=Spice"], price: 180, stock: 250, unit: "200g", status: "published", createdAt: "2026-08-08T00:00:00Z" },
  { _id: "prod-spice-chili", name: "Red Chili Powder", slug: "red-chili-powder", sku: "SPICE-G02", categoryId: "cat-spices-ground", images: ["https://placehold.co/80x80/FCA5A5/7F1D1D.png?text=Spice"], price: 160, stock: 0, unit: "200g", status: "published", createdAt: "2026-08-08T00:00:00Z" },
  { _id: "prod-oil-mustard", name: "Organic Mustard Oil", slug: "organic-mustard-oil", sku: "OIL-01", categoryId: "cat-oil-ghee", images: ["https://placehold.co/80x80/FDE047/713F12.png?text=Oil"], price: 350, stock: 45, unit: "1L", status: "published", createdAt: "2026-08-09T00:00:00Z" },
  { _id: "prod-ghee-cow", name: "Deshi Ghee (Cow)", slug: "deshi-ghee-cow", sku: "GHEE-01", categoryId: "cat-oil-ghee", images: ["https://placehold.co/80x80/FEF9C3/854D0E.png?text=Ghee"], price: 1200, stock: 15, unit: "500g", status: "published", createdAt: "2026-08-09T00:00:00Z" },
  { _id: "prod-dates-ajwa", name: "Premium Ajwa Dates", slug: "premium-ajwa-dates", sku: "DATE-01", categoryId: "cat-dates-ajwa", images: ["https://placehold.co/80x80/451A03/FDE68A.png?text=Dates"], price: 2200, stock: 15, unit: "1kg", status: "published", createdAt: "2026-08-10T00:00:00Z" },
  { _id: "prod-dates-medjool", name: "Medjool Dates", slug: "medjool-dates", sku: "DATE-02", categoryId: "cat-dates-ajwa", images: ["https://placehold.co/80x80/451A03/FDE68A.png?text=Dates"], price: 1650, stock: 22, unit: "1kg", status: "published", createdAt: "2026-08-10T00:00:00Z" },
  { _id: "prod-nuts-cashew", name: "Cashew Nuts", slug: "cashew-nuts", sku: "NUT-01", categoryId: "cat-dates-nuts", images: ["https://placehold.co/80x80/FEF3C7/78350F.png?text=Nuts"], price: 980, stock: 40, unit: "500g", status: "published", createdAt: "2026-08-11T00:00:00Z" },
  { _id: "prod-nuts-almond", name: "Almonds", slug: "almonds", sku: "NUT-02", categoryId: "cat-dates-nuts", images: ["https://placehold.co/80x80/FEF3C7/78350F.png?text=Nuts"], price: 890, stock: 3, unit: "500g", status: "draft", createdAt: "2026-08-11T00:00:00Z" },
];

export const DUMMY_CUSTOMERS: ICustomer[] = [
  { _id: "CUST-001", name: "Rahim Uddin", phone: "01711223344", email: "rahim@example.com", address: "House 12, Road 4, Dhanmondi, Dhaka", orders: 2, spent: 3960, type: "Registered", status: "Active", joinedAt: "2026-05-02T00:00:00Z" },
  { _id: "CUST-002", name: "Karim Hassan", phone: "01822334455", email: "karim@example.com", address: "Flat 3B, Agrabad, Chattogram", orders: 1, spent: 350, type: "Guest", status: "Active", joinedAt: "2026-06-14T00:00:00Z" },
  { _id: "CUST-003", name: "Salma Begum", phone: "01933445566", email: "salma@example.com", address: "45 Zindabazar, Sylhet", orders: 2, spent: 4400, type: "Registered", status: "Active", joinedAt: "2026-04-20T00:00:00Z" },
  { _id: "CUST-004", name: "Jamal Bhuiyan", phone: "01644556677", email: "", address: "Village Rd, Bogura Sadar, Bogura", orders: 1, spent: 2200, type: "Offline", status: "Active", joinedAt: "2026-07-01T00:00:00Z" },
  { _id: "CUST-005", name: "Farzana Yasmin", phone: "01555667788", email: "farzana@example.com", address: "House 8, Uttara Sector 7, Dhaka", orders: 1, spent: 0, type: "Registered", status: "Active", joinedAt: "2026-07-22T00:00:00Z" },
];

const p = (id: string) => DUMMY_PRODUCTS.find((x) => x._id === id)!;

export const DUMMY_ORDERS: IOrder[] = [
  {
    _id: "1", orderId: "ORD-10052", customerName: "Rahim Uddin", customerPhone: "01711223344",
    customerAddress: "House 12, Road 4, Dhanmondi, Dhaka", source: "Website",
    items: [
      { productId: p("prod-honey-sundarban")._id, name: p("prod-honey-sundarban").name, image: p("prod-honey-sundarban").images[0], unit: "500g", price: 850, quantity: 2 },
      { productId: p("prod-spice-cinnamon")._id, name: p("prod-spice-cinnamon").name, image: p("prod-spice-cinnamon").images[0], unit: "100g", price: 220, quantity: 1 },
    ],
    subtotal: 1920, deliveryFee: 60, discount: 0, total: 1980,
    paymentMethod: "bKash", paymentStatus: "Pending Verification", transactionId: "8N7K2X4PQ1",
    status: "Pending",
    statusHistory: [{ status: "Pending", note: "Order placed, awaiting bKash verification", at: "2026-09-04T10:30:00Z" }],
    placedAt: "2026-09-04T10:30:00Z",
  },
  {
    _id: "2", orderId: "ORD-10051", customerName: "Karim Hassan", customerPhone: "01822334455",
    customerAddress: "Flat 3B, Agrabad, Chattogram", source: "Facebook",
    items: [{ productId: p("prod-oil-mustard")._id, name: p("prod-oil-mustard").name, image: p("prod-oil-mustard").images[0], unit: "1L", price: 350, quantity: 1 }],
    subtotal: 350, deliveryFee: 100, discount: 0, total: 450,
    paymentMethod: "COD", paymentStatus: "Pending",
    status: "Processing",
    statusHistory: [
      { status: "Pending", at: "2026-09-03T16:15:00Z" },
      { status: "Confirmed", note: "Confirmed by phone call", at: "2026-09-03T17:00:00Z" },
      { status: "Processing", note: "Packing at Main Warehouse", at: "2026-09-04T09:00:00Z" },
    ],
    placedAt: "2026-09-03T16:15:00Z",
  },
  {
    _id: "3", orderId: "ORD-10050", customerName: "Salma Begum", customerPhone: "01933445566",
    customerAddress: "45 Zindabazar, Sylhet", source: "WhatsApp",
    items: [
      { productId: p("prod-spice-turmeric")._id, name: p("prod-spice-turmeric").name, image: p("prod-spice-turmeric").images[0], unit: "200g", price: 180, quantity: 3 },
      { productId: p("prod-spice-chili")._id, name: p("prod-spice-chili").name, image: p("prod-spice-chili").images[0], unit: "200g", price: 160, quantity: 2 },
    ],
    subtotal: 860, deliveryFee: 120, discount: 0, total: 980,
    paymentMethod: "Nagad", paymentStatus: "Verified", transactionId: "9XJ4M1Z7QT",
    status: "Shipped", courierName: "Pathao Courier", courierTrackingId: "PTH-88213",
    statusHistory: [
      { status: "Pending", at: "2026-09-02T11:20:00Z" },
      { status: "Confirmed", at: "2026-09-02T12:10:00Z" },
      { status: "Processing", at: "2026-09-02T15:00:00Z" },
      { status: "Packed", at: "2026-09-03T09:30:00Z" },
      { status: "Shipped", note: "Handed to Pathao Courier — PTH-88213", at: "2026-09-03T14:45:00Z" },
    ],
    placedAt: "2026-09-02T11:20:00Z",
  },
  {
    _id: "4", orderId: "ORD-10049", customerName: "Jamal Bhuiyan", customerPhone: "01644556677",
    customerAddress: "Village Rd, Bogura Sadar, Bogura", source: "Website",
    items: [{ productId: p("prod-dates-ajwa")._id, name: p("prod-dates-ajwa").name, image: p("prod-dates-ajwa").images[0], unit: "1kg", price: 2200, quantity: 1 }],
    subtotal: 2200, deliveryFee: 100, discount: 100, total: 2200,
    paymentMethod: "COD", paymentStatus: "Verified",
    status: "Delivered", courierName: "Sundarban Courier", courierTrackingId: "SC-44210",
    statusHistory: [
      { status: "Pending", at: "2026-08-28T09:00:00Z" },
      { status: "Confirmed", at: "2026-08-28T09:30:00Z" },
      { status: "Processing", at: "2026-08-28T13:00:00Z" },
      { status: "Packed", at: "2026-08-29T10:00:00Z" },
      { status: "Shipped", note: "Handed to Sundarban Courier — SC-44210", at: "2026-08-29T16:00:00Z" },
      { status: "Delivered", note: "COD collected on delivery", at: "2026-08-31T13:20:00Z" },
    ],
    placedAt: "2026-08-28T09:00:00Z",
  },
  {
    _id: "5", orderId: "ORD-10048", customerName: "Farzana Yasmin", customerPhone: "01555667788",
    customerAddress: "House 8, Uttara Sector 7, Dhaka", source: "Phone",
    items: [{ productId: p("prod-ghee-cow")._id, name: p("prod-ghee-cow").name, image: p("prod-ghee-cow").images[0], unit: "500g", price: 1200, quantity: 1 }],
    subtotal: 1200, deliveryFee: 60, discount: 0, total: 1260,
    paymentMethod: "COD", paymentStatus: "Failed",
    status: "Cancelled",
    statusHistory: [
      { status: "Pending", at: "2026-08-27T08:10:00Z" },
      { status: "Cancelled", note: "Customer unreachable after 3 call attempts", at: "2026-08-27T18:00:00Z" },
    ],
    placedAt: "2026-08-27T08:10:00Z",
  },
  {
    _id: "6", orderId: "ORD-10047", customerName: "Salma Begum", customerPhone: "01933445566",
    customerAddress: "45 Zindabazar, Sylhet", source: "Website",
    items: [
      { productId: p("prod-nuts-cashew")._id, name: p("prod-nuts-cashew").name, image: p("prod-nuts-cashew").images[0], unit: "500g", price: 980, quantity: 2 },
      { productId: p("prod-nuts-almond")._id, name: p("prod-nuts-almond").name, image: p("prod-nuts-almond").images[0], unit: "500g", price: 890, quantity: 1 },
    ],
    subtotal: 2850, deliveryFee: 100, discount: 150, total: 2800,
    paymentMethod: "bKash", paymentStatus: "Verified", transactionId: "7QW3N9K2LP",
    status: "Delivered", courierName: "RedX", courierTrackingId: "RDX-99120",
    statusHistory: [
      { status: "Pending", at: "2026-08-20T10:00:00Z" },
      { status: "Confirmed", at: "2026-08-20T10:40:00Z" },
      { status: "Processing", at: "2026-08-20T14:00:00Z" },
      { status: "Packed", at: "2026-08-21T09:00:00Z" },
      { status: "Shipped", note: "Handed to RedX — RDX-99120", at: "2026-08-21T15:00:00Z" },
      { status: "Delivered", at: "2026-08-23T12:00:00Z" },
    ],
    placedAt: "2026-08-20T10:00:00Z",
  },
  {
    _id: "7", orderId: "ORD-10046", customerName: "Rahim Uddin", customerPhone: "01711223344",
    customerAddress: "House 12, Road 4, Dhanmondi, Dhaka", source: "Website",
    items: [
      { productId: p("prod-dates-medjool")._id, name: p("prod-dates-medjool").name, image: p("prod-dates-medjool").images[0], unit: "1kg", price: 1650, quantity: 1 },
      { productId: p("prod-spice-cardamom")._id, name: p("prod-spice-cardamom").name, image: p("prod-spice-cardamom").images[0], unit: "100g", price: 340, quantity: 1 },
    ],
    subtotal: 1990, deliveryFee: 0, discount: 30, total: 1960,
    paymentMethod: "COD", paymentStatus: "Verified",
    status: "Delivered", courierName: "Pathao Courier", courierTrackingId: "PTH-77004",
    statusHistory: [
      { status: "Pending", at: "2026-08-15T09:00:00Z" },
      { status: "Confirmed", at: "2026-08-15T09:20:00Z" },
      { status: "Processing", at: "2026-08-15T13:00:00Z" },
      { status: "Packed", at: "2026-08-16T09:00:00Z" },
      { status: "Shipped", note: "Handed to Pathao Courier — PTH-77004", at: "2026-08-16T14:00:00Z" },
      { status: "Delivered", note: "COD collected on delivery", at: "2026-08-18T11:00:00Z" },
    ],
    placedAt: "2026-08-15T09:00:00Z",
  },
];

export const DUMMY_REVIEWS: IReview[] = [
  {
    _id: "rev-1", orderId: "ORD-10049", productId: "prod-dates-ajwa", productName: "Premium Ajwa Dates",
    productImage: p("prod-dates-ajwa").images[0], customerName: "Jamal Bhuiyan", customerPhone: "01644556677",
    rating: 5, comment: "খুবই ভালো মানের খেজুর, একদম আসল আজওয়া খেজুরের মতো স্বাদ। দ্রুত ডেলিভারিও পেয়েছি।",
    status: "published", adminReply: "ধন্যবাদ আপনার মূল্যবান মতামতের জন্য!", createdAt: "2026-09-01T08:00:00Z",
  },
  {
    _id: "rev-2", orderId: "ORD-10047", productId: "prod-nuts-cashew", productName: "Cashew Nuts",
    productImage: p("prod-nuts-cashew").images[0], customerName: "Salma Begum", customerPhone: "01933445566",
    rating: 4, comment: "কাজু বাদাম তাজা ছিল, তবে দাম একটু বেশি মনে হয়েছে।",
    status: "published", createdAt: "2026-08-25T10:00:00Z",
  },
  {
    _id: "rev-3", orderId: "ORD-10047", productId: "prod-nuts-almond", productName: "Almonds",
    productImage: p("prod-nuts-almond").images[0], customerName: "Salma Begum", customerPhone: "01933445566",
    rating: 3, comment: "প্যাকেজিং আরেকটু ভালো হতে পারতো, কিছু বাদাম ভাঙা ছিল।",
    status: "pending", createdAt: "2026-08-25T10:05:00Z",
  },
  {
    _id: "rev-4", orderId: "ORD-10046", productId: "prod-dates-medjool", productName: "Medjool Dates",
    productImage: p("prod-dates-medjool").images[0], customerName: "Rahim Uddin", customerPhone: "01711223344",
    rating: 5, comment: "অসাধারণ! পরিবারের সবাই পছন্দ করেছে। আবার অর্ডার করবো ইনশাআল্লাহ।",
    status: "published", adminReply: "আলহামদুলিল্লাহ! আপনার পাশে থাকার জন্য ধন্যবাদ।", createdAt: "2026-08-19T09:00:00Z",
  },
  {
    _id: "rev-5", orderId: "ORD-10046", productId: "prod-spice-cardamom", productName: "Black Cardamom",
    productImage: p("prod-spice-cardamom").images[0], customerName: "Rahim Uddin", customerPhone: "01711223344",
    rating: 2, comment: "This review contained a promotional link and was removed by moderation.",
    status: "rejected", createdAt: "2026-08-19T09:10:00Z",
  },
  {
    _id: "rev-6", orderId: "ORD-10047", productId: "prod-nuts-cashew", productName: "Cashew Nuts",
    productImage: p("prod-nuts-cashew").images[0], customerName: "Salma Begum", customerPhone: "01933445566",
    rating: 5, comment: "Second time ordering — consistent quality every time!",
    status: "pending", createdAt: "2026-09-04T07:30:00Z",
  },
];

export const DUMMY_COUPONS: ICoupon[] = [
  { _id: "cpn-1", code: "WELCOME10", type: "percentage", value: 10, minOrderAmount: 500, maxDiscount: 200, usageLimit: 500, usedCount: 128, startDate: "2026-08-01T00:00:00Z", expiryDate: "2026-12-31T00:00:00Z", status: "active", createdAt: "2026-08-01T00:00:00Z" },
  { _id: "cpn-2", code: "FREESHIP", type: "fixed", value: 100, minOrderAmount: 1000, usageLimit: 1000, usedCount: 340, startDate: "2026-08-01T00:00:00Z", expiryDate: "2026-10-31T00:00:00Z", status: "active", createdAt: "2026-08-01T00:00:00Z" },
  { _id: "cpn-3", code: "BULK15", type: "percentage", value: 15, minOrderAmount: 2000, maxDiscount: 500, usageLimit: 200, usedCount: 12, startDate: "2026-09-01T00:00:00Z", expiryDate: "2026-11-30T00:00:00Z", status: "inactive", createdAt: "2026-08-28T00:00:00Z" },
  { _id: "cpn-4", code: "EID50", type: "fixed", value: 50, minOrderAmount: 300, usageLimit: 2000, usedCount: 1876, startDate: "2026-06-01T00:00:00Z", expiryDate: "2026-06-20T00:00:00Z", status: "expired", createdAt: "2026-05-25T00:00:00Z" },
];
