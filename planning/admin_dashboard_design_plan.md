# Admin Dashboard Design Plan (Version 1)

## 1. Objective

Design a functional, secure, and intuitive admin dashboard for managing the e-commerce storefront. This plan details **exactly what must be built** so a non-technical store owner can run the whole business — content, catalog, orders, payments, basic stock, and basic reporting — without ever touching code, for **Version 1 only**.

This document supersedes the previous draft of itself. It is scoped tightly to [V1_Launchable_Ecommerce.md](../All_Versions_Full_Requirements_MD/V1_Launchable_Ecommerce.md), which is the authoritative source for what is and isn't V1. Read §2 below before building anything — the dashboard's codebase already has far more scaffolded than V1 needs, and shipping the wrong things first is as much a risk as missing things.

---

## 2. V1 Scope Boundary — read this first

`ecommerce-dashboard/src/Routes/admin.route.tsx` already wires up a sidebar with **Sales, Catalog, Inventory, Customers, Marketing, Finance, Staff, Settings** — around 30 sub-pages. That list was generated in one pass across the *entire* 13-version roadmap (`All_Versions_Full_Requirements_MD/`), not just V1. Most of it is a 60-70 line placeholder page today. Building all of it out now would put half the dashboard's effort into features V1 explicitly defers.

Per `V1_Launchable_Ecommerce.md §11`, these are **out of scope for V1** — leave the files in place (later versions need them) but **remove or hide their sidebar entries** so staff don't land on dead pages:

| Currently in sidebar | Real version it belongs to | Why it's not V1 |
| --- | --- | --- |
| Sales → Returns, Refunds | V3 Advanced Order & Delivery Management | No return/refund engine in V1 |
| Inventory → Purchases, Suppliers, Warehouses | V4 Inventory & Purchase Management | V1 only needs current stock + movement log |
| Customers → Segments, Customer Activity | V8 CRM & Customer Segmentation | No segmentation in V1 |
| Marketing → Campaigns, Promotions | V7 Marketing, Campaigns & Attribution | V1 marketing = coupons only |
| Finance → Revenue, COGS, Expenses, Reports | V5 Finance, Cost & Profitability | V1 explicitly has **no** profit/COGS/finance reporting |
| Staff → Employees, Roles, Permissions (full UI) | V11 Staff, RBAC, Security & Audit | V1 needs permission *hooks* in the API, not a roles/permissions builder |

The one exception: **Sales → Manual Orders** stays. It's explicitly in V1's route map (`/admin/sales/manual-orders`) — staff need to key in an order taken by phone or WhatsApp.

**What the V1 sidebar should actually look like**, per `V1_Launchable_Ecommerce.md §4 "Admin Dashboard Structure"`:

```text
Dashboard
Website Management
  ├── Banner Management
  ├── Category
  ├── Product
  ├── Combo
  ├── Featured Product
  └── New Arrivals
Sales
  ├── Orders
  └── Manual Orders
Inventory
Customers
Marketing
  └── Coupons
Reports
Settings
```

Note **"Website Management" is its own top-level group**, not a sub-tab under Catalog or Marketing — this is where the "add banners and other things" ask lives, and it's the direct admin-side counterpart of the storefront homepage/collections work already built (`/`, `/collections/combos`, `/collections/best-sales`, `/collections/new-arrivals`, `/collections/featured-products`, `/collections/offers`).

**How the first admin logs in without a Staff UI:** V1 has no staff-management screen (see the table above), so the very first `super_admin` account is created by a one-off seed script (`ecommerce-backend` — add an `npm run seed:admin` command reading credentials from `.env`), not through the dashboard. `ROLES` already has the full enum in `CODING_RULES.md §4.5`; V1 just doesn't expose a UI to assign them yet.

---

## 3. Architecture & Design Principles

### 3.1 React (Vite) SPA
The dashboard is a client-side SPA (`ecommerce-dashboard`), RTK Query against the single `baseApi`. See `ecommerce-dashboard/AGENTS.md` for the binding component/API conventions — this plan doesn't repeat those, only the business scope.

### 3.2 Charts & Data Visualization
Recharts (already a dependency pattern in this codebase's sibling projects) for every chart. Read the `dataviz` skill before writing any chart — palette, mark choice per data shape, and accessible tooltips are handled there; this plan only specifies **which chart, for which data, on which screen** (§5.2, §9).

V1 charts stay deliberately simple: trend lines and status breakdowns from order/inventory data. **No profitability, COGS, ROI or attribution charts in V1** — that's V5/V6/V7 territory, and building it now means re-deriving it later once real cost data exists.

### 3.3 Reusable Components
- **Data tables:** one reusable table component with server-side pagination, sorting, column filters, and a persisted column-visibility state. Every list screen in §5–§9 reuses it — no ad-hoc `<table>` per module.
- **Forms:** React Hook Form + Zod, same contract as the two frontends (`CODING_RULES.md`). Every create/edit form in this plan is a form component, not a page-specific one-off.
- **Image upload:** one Cloudinary-backed uploader (single + gallery mode) reused by Banner, Product, Category, and Combo forms.
- **Status badge:** one component mapping the backend's `ORDER_STATUS` / `PAYMENT_STATUS` enums to colour + label, reused across Orders list, Order detail, and Dashboard Overview — don't let each screen invent its own status-to-colour mapping (this exact drift happened on the storefront side and had to be consolidated into `OrderStatusBadge`; don't repeat it here).

### 3.4 Role-Based Access Control (RBAC) — hooks only in V1
Every list/action in this plan should check a permission string (`banner.manage`, `order.update_status`, `payment.verify`, `coupon.manage`, etc.) even though the UI to *assign* those permissions doesn't ship until V11. Hardcode "super_admin can do everything" for V1; wire the permission check now so V11 is additive, not a rewrite (`V1_Launchable_Ecommerce.md §12.5`).

---

## 4. Global UI Elements

### 4.1 Sidebar
Collapsible, grouped exactly as in §2. Each group header is a section label, not a link; each child is a route.

### 4.2 Top Header
- **Breadcrumbs** reflecting the current route (`Website Management › Banners › Edit`).
- **Quick search**: order ID/phone and customer phone lookup — the two things staff search for dozens of times a day fulfilling COD orders.
- **Payment-verification badge**: a small counter next to the bell/user menu showing the count of orders sitting in `PAYMENT_STATUS = PENDING_VERIFICATION` (manual bKash/Nagad awaiting a human check). This is new work — it didn't exist before COD was extended to include manual wallet payments — and it's the one thing that will actually go wrong operationally if nobody notices it (an order ships before its bKash transfer is confirmed). Clicking it jumps to Orders filtered to that status.
- **User menu:** staff name, role badge, logout.

---

## 5. Dashboard Overview (`/admin`)

### 5.1 Key metric cards
Pull directly from `V1_Launchable_Ecommerce.md §"Basic Reports"` — don't invent extra metrics:
- **Sales today / this week / this month** (COD collected + manual-wallet verified only — a `PENDING`/`PENDING_VERIFICATION` order is not revenue yet, per `CODING_RULES.md §4.6`).
- **Orders total / pending / delivered / cancelled** (this period).
- **Pending payment verification** — count of `BKASH_MANUAL`/`NAGAD_MANUAL` orders in `PENDING_VERIFICATION`. Surface this as its own card, not folded into "pending orders" — it needs a different action (verify a TrxID) than fulfilment does.
- **Low-stock / out-of-stock count** (from Inventory).

### 5.2 Charts
| Chart | Type | Data | Why |
| --- | --- | --- | --- |
| Sales trend | Line, last 30 days | Daily collected/verified revenue | The one chart an owner checks every morning |
| Orders by status | Horizontal bar or donut | Count per `ORDER_STATUS` (V1 subset: Pending/Confirmed/Processing/Packed/Shipped/Delivered/Cancelled) | Shows fulfilment bottlenecks at a glance |
| Payment method split | Donut | Count of orders by `COD` / `BKASH_MANUAL` / `NAGAD_MANUAL` | Directly relevant now that V1 supports three payment paths — tells the owner how much cash-on-delivery risk vs. pre-paid volume they're carrying |
| Top-selling products | Horizontal bar, top 5–10 | Units sold (delivered orders only) | Matches "Product sales: units sold" in the basic-reports spec, and feeds the storefront's "best sellers" placement (§6.5) |

### 5.3 Recent orders table
Latest 5–10 orders needing attention: `Pending`, `Confirmed`, or `PENDING_VERIFICATION` payment — i.e., the ones sitting in the admin's court right now, not a generic "latest orders" feed.

---

## 6. Website Management (`/admin/website/*`)

This is the module that answers "banners and other things" — it's where the store owner changes what customers see on the homepage without a deploy.

### 6.1 Banner Management (`/admin/website/banners`)
Fields (per `V1_Launchable_Ecommerce.md §"Website Management"`): image, title/text, button label, destination URL, active flag, display order.
- **List view:** thumbnail, title, active toggle (inline, no save button needed), order (drag handle or numeric input), actions (edit/delete).
- **Create/edit form:** image upload (hero-banner aspect ratio enforced client-side), title, subtitle/text, button label, destination URL (internal path via a picker — collection/category/product — or external URL), active toggle, sort order.
- **Storefront mapping:** feeds the homepage hero slider and the desktop-only promotional banner slot. A banner set inactive disappears from the storefront immediately (cache-tag revalidation, not a redeploy).

### 6.2 Category (`/admin/website/categories`)
Already speced in the previous draft — keep that, with one addition: a **"Show in navbar" / `hasSub` toggle**, since the storefront's secondary navbar renders differently for a category with children vs. one that links straight through (`website_design_plan.md §3.1`). Fields: name, slug, image, description, parent category, SEO title, SEO description, status, sort order.

### 6.3 Product (`/admin/website/products`)
Full catalog CRUD (name, images, description, price, sale price, SKU, weight/size variants, ingredients/usage, category, status, basic SEO) **plus** the storefront-visibility flags this section exists to control: `isFeatured`, `isNewArrival`, `badge` (new/sale/bestsell/combo). Variant-level SKU/price/sale-price/stock per `V1_Launchable_Ecommerce.md §"Product Variants"` — the product's own stock display is derived from its variants, not entered separately.

### 6.4 Combo (`/admin/website/combos`)
Create a combo offer: name, description, image, the set of products/variants included, combo price (vs. sum of individual prices — display the savings), active flag, placement order. Feeds `/collections/combos` and the homepage combo row.

### 6.5 Featured Product (`/admin/website/featured`)
Manual selection from the product catalog + drag-drop ordering. Feeds `/collections/featured-products` and the homepage featured row. This is a *placement* list (references existing products), not a duplicate product editor.

### 6.6 New Arrivals (`/admin/website/new-arrivals`)
Same pattern as 6.5: manual selection + drag-drop order, feeding `/collections/new-arrivals`. Note per the storefront's business logic, "best sellers" (a *different* homepage row) is **not** manually curated here — it's calculated from delivered-order counts, so it has no admin screen at all in V1.

---

## 7. Sales (`/admin/sales/*`)

### 7.1 Orders (`/admin/sales/orders`)
- **List:** Order ID, date, customer name/phone, total, payment status, delivery status. Filters: status (the V1 subset — Pending/Confirmed/Processing/Packed/Shipped/Delivered/Cancelled), payment method (COD/bKash/Nagad), payment status, date range.
- **Detail (`/admin/sales/orders/:id`):**
  - Customer info, delivery address, delivery method.
  - Itemized list with historical price/variant snapshots (never re-read from the live product — `V1_Launchable_Ecommerce.md §"Key Design Decisions"`).
  - Totals: subtotal, discount, delivery fee, grand total.
  - **Status timeline**, one entry per change with actor + timestamp — this is a hard requirement (`§"Order Management" business logic`), not a nice-to-have. Render it as a vertical timeline, same visual language as the storefront's own order-tracking timeline.
  - **Status transition control** that only allows the legal next steps (Pending → Confirmed → Processing → Packed → Shipped → Delivered; Cancelled from any pre-Shipped state) — don't render a free-form dropdown of all seven statuses, since illegal transitions (e.g. Delivered → Pending) must be blocked per spec.
  - **Payment panel**, method-dependent:
    - `COD`: shows the amount the rider must collect; a "Mark Collected" action once delivered, feeding the `PENDING → COLLECTED → REMITTED` lifecycle (`CODING_RULES.md §4.6`) — collection and courier remittance are two separate actions, not one "paid" checkbox.
    - `BKASH_MANUAL` / `NAGAD_MANUAL`: shows the customer-entered sender number and TrxID, with **Verify** / **Reject** actions moving `PENDING_VERIFICATION → VERIFIED` or `FAILED`. If the TrxID matches another order's, show a visible duplicate-TrxID warning right here (`V1_Launchable_Ecommerce.md §"Edge Cases"` — "flag for admin review", it should not be possible to miss this warning while verifying).
  - **Actions:** add courier tracking info, generate/print invoice or packing slip.

### 7.2 Manual Orders (`/admin/sales/manual-orders`)
A staff-facing order-creation form for phone/WhatsApp/offline sales — same product/variant picker, address, delivery method, and payment fields as customer checkout, but staff-entered. Sets `ORDER_SOURCE` to `PHONE`, `WHATSAPP`, or `OFFLINE` (`CODING_RULES.md §4.5`) so these are distinguishable from `WEBSITE` orders in reporting.

---

## 8. Inventory (`/admin/inventory`) — V1 scope only

Per §2, this is deliberately thin in V1: current stock, low-stock and out-of-stock states, and the audit trail — **not** purchases, suppliers, or warehouses.

- **Stock list:** product/variant, current quantity, low-stock threshold (editable per product), status pill (In Stock / Low Stock / Out of Stock).
- **Stock movement log** (read-only in V1): every stock change with reason (order placed, order cancelled, manual adjustment), quantity delta, actor, timestamp — required even though there's no purchase-order UI yet, because every stock change must produce a movement record regardless (`V1_Launchable_Ecommerce.md §"Inventory" business logic`).
- **Manual adjustment** action (small form: variant, delta, reason) for correcting counts by hand — this is the only "write" path into inventory in V1 beyond the order lifecycle itself.

---

## 9. Customers (`/admin/customers`) — V1 scope only

List only, no segments/activity feed (deferred to V8, see §2):
- **List:** name, phone, email, total orders, total spent, join date. Search by phone (the thing staff actually look customers up by on a COD business).
- **Detail (`/admin/customers/:id`):** read-only profile, order history, saved addresses. No edit-in-place — customers manage their own profile from the storefront account pages already built.

---

## 10. Marketing (`/admin/marketing/coupons`) — V1 scope only

Only Coupons in V1 (Campaigns/Promotions deferred to V7, see §2).

- **List:** code, discount type (percentage/fixed), value, usage count / limit, valid date range, active flag.
- **Create/edit form:** code, percentage-or-fixed discount, minimum order amount, maximum discount cap (for percentage coupons), start/end date, usage limit (total and/or per-customer), first-order-only toggle.
- Usage counters must update transactionally on redemption to prevent over-redemption under concurrent checkouts (`V1_Launchable_Ecommerce.md §"Coupon" business logic`) — this is a backend concern, but the admin list should show live redemption counts, not a cached number.

---

## 11. Reports (`/admin/reports`) — V1 scope only

Four read-only reports, straight from `V1_Launchable_Ecommerce.md §"Basic Reports"`. No profit/COGS/marketing-ROI reporting belongs here in V1 (see §3.2).

| Report | Content | Suggested visual |
| --- | --- | --- |
| Sales | Today / this week / this month totals | Three stat tiles + the same 30-day line chart as the Dashboard (§5.2), just filterable to a custom range here |
| Orders | Total, pending, delivered, cancelled counts for the selected range | Stat tiles + the orders-by-status bar/donut, reused from §5.2 |
| Product sales | Units sold per product for the selected range | Sortable table, exportable to CSV — this is the report staff actually print for restocking decisions |
| Inventory | Low-stock and out-of-stock product list | Table, links straight into the Stock screen (§8) to act on it |

---

## 12. Settings (`/admin/settings`)

### 12.1 General
Store name, contact email, support phone numbers, physical address — feeds the storefront footer and `/contact` page directly (they're currently hardcoded on the website; this is the fix for that).

### 12.2 Delivery Zones & Rates
Flat-rate delivery charges per zone (Inside Dhaka / Outside Dhaka today, extensible later). This directly feeds the checkout page's delivery-method cards and the `/delivery` page's rate table — both currently hardcode ৳60/৳120 on the website side, and this setting is what makes that a real, changeable number instead of a constant in the code.

### 12.3 Payment Settings
- Default payment method (COD) — always on, cannot be disabled in V1.
- **bKash merchant number** and **Nagad merchant number** — these are the exact numbers the storefront checkout page displays under "Send money to this number." Today that number is hardcoded in the website's checkout UI; this setting is what makes it admin-editable.
- Toggle to enable/disable manual bKash/Nagad as a checkout option store-wide (COD always stays available).

### 12.4 Static Page Content
Rich-text editors for the five static pages the storefront already ships as hardcoded English text (`/privacy`, `/terms`, `/return-policy`, `/delivery`, `/about`) — replacing hardcoded copy with admin-editable content, one field per page (title + rich-text body), versioned so a bad edit can be rolled back.

### 12.5 Newsletter Subscribers
Read-only list of emails collected via the storefront footer's newsletter form, with export (CSV). This is the admin-side counterpart to the `/unsubscribe` page already built on the storefront — an email that unsubscribes there should disappear from (or be flagged inactive in) this list.

---

## 13. Deferred — do not build in V1

Explicitly out of scope, per `V1_Launchable_Ecommerce.md §11` (see §2 table for where each currently-scaffolded page belongs instead): returns/refunds engine, supplier/purchase management, advanced inventory (warehouses, stock transfers), finance/COGS/profitability, marketing campaigns & attribution, customer segmentation, loyalty/referral, full staff RBAC UI, Meta Pixel/conversion tracking.

---

## 14. Definition of Done for Dashboard Features

A dashboard feature is only done when:
1. It is integrated with the real backend API — no `DUMMY_*` arrays once the endpoint exists (`CODING_RULES.md §1.2`).
2. Form submissions handle loading states, success toasts, and error messages via `tryCatchWrapper`.
3. Tables reflect real data with functional server-side pagination and filtering.
4. Every action checks its permission string, even with RBAC hardcoded to "super_admin can do everything" in V1 (§3.4).
5. Destructive actions require confirmation and state the business impact (e.g. "This will restore 3 units to stock").
6. The specific V1 acceptance criteria in `V1_Launchable_Ecommerce.md §10` pass — in particular: "Admin can manage banners/products/categories through Website Management," and "Featured and New Arrival ordering is reflected on homepage."

---

## 15. Route Map (V1)

```text
/admin
/admin/website/banners
/admin/website/categories
/admin/website/products
/admin/website/combos
/admin/website/featured
/admin/website/new-arrivals
/admin/sales/orders
/admin/sales/orders/:id
/admin/sales/manual-orders
/admin/inventory
/admin/customers
/admin/customers/:id
/admin/marketing/coupons
/admin/reports
/admin/settings
```

This matches `V1_Launchable_Ecommerce.md §12` exactly, with the Website Management sub-routes spelled out.
