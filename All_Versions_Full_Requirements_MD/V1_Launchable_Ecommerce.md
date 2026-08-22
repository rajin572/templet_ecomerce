# V1 — Launchable E-commerce Foundation

## 1. Purpose

V1 is the first production release. Its only job is to let the business launch, take real customer orders, process them from the admin panel, maintain basic stock, and let customers track their orders. It intentionally avoids finance, advanced marketing analytics, supplier accounting and complex automation.

## 2. Scope

The release includes the storefront, website-management controls, product/category management, product variants, cart, guest checkout, customer accounts, COD/manual bKash, order management, basic inventory, reviews, wishlist, coupons, guest order tracking, basic reports and Open Graph metadata.

## 3. Dependencies

No previous application version. The database and service boundaries must however be designed so later versions can attach to the same Product, Variant, Inventory, Order, Customer and Payment records.

## 4. Core Modules

### Admin Dashboard Structure

Top-level navigation:

```text
Dashboard
Website Management
Sales
Inventory
Customers
Marketing
Reports
Settings
```

Website Management expands into:

```text
Website Management
├── Banner Management
├── Category
├── Product
├── Combo
├── Featured Product
└── New Arrivals
```
This grouping is important because content-management actions for the storefront should be found in one place.

#### UI / Admin Surface

Sidebar with expandable groups; each sub-item opens a list/table page with create/edit/detail actions.

#### Business Logic

Only modules enabled for V1 are shown. Permission hooks should already exist even though detailed staff management is later.

### Storefront & Navigation

Two-level navbar. Primary row: logo, search, track order, sign-in/account, wishlist, cart. Secondary row: Combo, Offer Zone, New Arrivals, Featured Products, then dynamic categories. Category dropdowns are generated from active categories/products.

#### Business Logic

Only active/published navigation items are rendered. Sort order is admin-controlled. Product/category data must be cached safely for storefront performance.

### Homepage

Hero slider, desktop-only promotional image, featured categories, best sellers, new arrivals, exclusive combo deals, promotional image, featured products, customer reviews, Why Choose Us, delivery information, social links and newsletter/offer subscription.

#### Business Logic

Best sellers are calculated from delivered/valid sales counts rather than arbitrary product creation order. Featured and new-arrival lists use admin-controlled flags and display order. Featured-category section is hidden when active category count exceeds the configured threshold of 4.

### Website Management

Banner Management: image, title/text, button label, destination URL, active flag, order. Category: storefront visibility and ordering. Product: storefront visibility/feature/new-arrival controls. Combo: create combo offer and placement. Featured Product: manual selection and drag/drop ordering. New Arrivals: manual selection and drag/drop ordering.

#### Business Logic

Website-management changes update storefront configuration only; business product records remain the source of truth. Display order is stored as a sortable numeric field or ordered relation.

### Catalog & Product

Category fields: name, slug, image, description, parent category, SEO title, SEO description, status, sort order. Product fields: name, images, description, price, sale price, SKU, weight/size, ingredients, usage, category, status, basic SEO. Unlimited products per category.

#### Business Logic

Category slug and product slug must be unique. Archiving a category/product should not destroy historical order data. Products with active inventory/order history should be soft-deleted or archived.

### Product Variants

Variant-level SKU, price, sale price, stock, weight/size. A product may have many variants. Variant is the actual sellable stock unit.

#### Business Logic

Cart and order items reference the variant. Variant SKU must be unique. Product stock display is derived from variant availability when variants exist.

### Cart & Checkout

Cart stores product, variant, quantity, price, discount, coupon, delivery charge and grand total. Checkout collects customer information, shipping address, delivery method, payment method and order summary.

#### Business Logic

Final totals are recalculated server-side. Client-provided totals are never trusted. Stock is revalidated at order creation. Coupon validity is rechecked server-side.

### Guest Checkout

Login is optional. Customer can place an order with name, phone, address and payment details.

#### Business Logic

A guest customer identifier may be created so orders are traceable without forcing account creation. After order completion, offer account creation using the order email/phone if later implemented.

### Payment

V1 supports Cash on Delivery and manual bKash with customer bKash number and transaction ID.

#### Business Logic

Payment method is stored on the order/payment record. Manual bKash starts as pending/unverified until admin marks it verified. Payment provider abstraction is used so future gateways can be added.

### Order Management

Order list, filters, detail page, customer details, order items, totals, payment, shipping data, status and timeline. Statuses: Pending, Confirmed, Processing, Packed, Shipped, Delivered, Cancelled.

#### Business Logic

Allowed transitions should be enforced. Example: Delivered should not move back to Pending without a special admin action. Every status change creates a timeline entry with actor and timestamp.

### Inventory

Basic stock, low stock and out-of-stock. Stock decreases when the defined reservation/commit event occurs; cancellation restores stock.

#### Business Logic

For a safe launch, reserve stock at successful order creation or admin confirmation based on business choice. The rule must be consistent. All stock changes create stock-movement records even if the UI initially only shows current stock.

#### API / Service Responsibilities

Stock service must expose read current stock, validate availability, increment/decrement, and create movement/audit records atomically with the business event.

### Customer Account

Registration/login, profile, My Orders, saved addresses, wishlist, reviews, coupons and track order.

#### Business Logic

Account owner can access only their own orders, reviews and saved addresses.

### Guest Order Tracking

Track Order page accepts an order number and uses a secure access mechanism. Recommended implementation: short-lived tracking token or signed tracking link; order data is not exposed by predictable IDs alone.

#### Business Logic

Tracking token is scoped to one order, short-lived, revocable, and never grants admin access.

### Review & Rating

1–5 stars, written review, verified purchase badge, admin approval, average rating. Only purchasers can review the product.

#### Business Logic

Review permission is checked against a successful purchase of the same product/variant. Moderated reviews only appear publicly. Verified purchase is determined by actual order linkage, not a user-entered flag.

### Wishlist

Add/remove wishlist items and display wishlist page.

### Coupon

Percentage or fixed discount, minimum order, maximum discount, date range, usage limit and optional first-order restriction.

#### Business Logic

Coupon is validated against the final eligible subtotal. Usage counters update transactionally to avoid over-redemption.

### Basic Reports

Sales: today/this week/this month. Orders: total, pending, delivered, cancelled. Product sales: units sold. Inventory: low stock and out-of-stock.

#### Business Logic

Reports are read-only and derived from order/inventory records. No finance or marketing profitability calculations in V1.

### Open Graph Metadata

Product pages expose correct og:title, og:description, og:image and og:url so shared product links have a proper social preview.

#### Business Logic

Metadata is generated from product data and image selection rules.

### SEO & Performance Foundation

Basic slugs, metadata, mobile-first layouts, optimized images, pagination where needed, lazy loading and cache-friendly endpoints.

## 5. Key Design Decisions

- Variant is the sellable inventory unit when variants exist.
- Historical orders must retain their own item snapshot values.
- Final pricing is calculated server-side.
- Order status changes are controlled transitions and produce a timeline entry.
- Inventory changes are auditable even if advanced inventory UI arrives later.
- No product-cost/expense/profit system is part of V1.
- No Meta Pixel/conversion tracking is part of V1; only Open Graph metadata is required.
- RBAC hooks exist in the architecture even though full staff UX comes later.

## 6. End-to-End Business Logic

A customer views a product → selects a variant → adds it to cart → checkout validates stock and pricing → server calculates totals → order is created → payment method is recorded → inventory is updated according to the chosen stock rule → admin processes the order through controlled statuses → customer tracks progress → delivered order becomes eligible for review.

The customer website and admin dashboard never directly edit each other’s state; both call shared domain services.

## 7. Data / Entity Requirements

Core entities: User, GuestCustomer/CustomerProfile, Address, Category, Product, ProductImage, ProductVariant, Cart, CartItem, Order, OrderItem, Payment, OrderStatusHistory, InventoryItem/StockBalance, StockMovement, Review, WishlistItem, Coupon, CouponRedemption, Banner, HomepagePlacement/SectionConfig, Combo, NewsletterSubscriber.

Orders should preserve product name, SKU, variant name, price and discount as historical snapshots.

## 8. Main Flows

### Online Order
1. Customer adds variant to cart.
2. Checkout validates product status, variant status and stock.
3. Server recalculates subtotal/discount/delivery/total.
4. Order is created.
5. Payment record is created.
6. Inventory event is committed.
7. Order timeline begins.

### Manual bKash
1. Customer chooses bKash.
2. Enters number + transaction ID.
3. Order is created with payment status Pending Verification.
4. Admin verifies/rejects.

### Review
1. Customer requests review.
2. Server checks successful purchase.
3. Review submitted.
4. Admin approves.
5. Approved review appears publicly.

## 9. Edge Cases & Failure Handling

- Product becomes inactive while it is in a cart: revalidate at checkout.
- Stock is insufficient: block order or reduce quantity with explicit user confirmation.
- Coupon expires between cart and checkout: reject/recalculate at checkout.
- Duplicate manual payment transaction ID: flag for admin review.
- Customer opens an old tracking link after expiry: require a new secure link.
- Admin cancels an already shipped/delivered order: block normal transition and require the relevant return/refund flow later.
- Product is archived: preserve historical order snapshots.

## 10. Acceptance Criteria

- Customer can buy without login.
- Customer can buy a variant and the correct price is used.
- Invalid coupon cannot reduce final total.
- Stock cannot become negative through normal order placement.
- Cancellation restores stock according to the configured rule.
- Only genuine purchasers can submit verified reviews.
- Customer cannot access another customer’s order/account data.
- Admin can manage banners/products/categories through Website Management.
- Featured and New Arrival ordering is reflected on homepage.
- Product share preview displays correct Open Graph information.

## 11. Out of Scope / Deferred

Deferred: advanced delivery integrations, return/refund engine, supplier/purchase, advanced inventory, finance, COGS, ROI/ROAS, marketing analytics, customer segmentation, loyalty, referral, automation, advanced staff controls.


## 12. Screen / Route Map

Customer routes: /, /products, /category/:slug, /product/:slug, /cart, /checkout, /track-order, /login, /register, /account/*.
Admin routes: /admin, /admin/website/*, /admin/sales/orders, /admin/sales/manual-orders, /admin/inventory, /admin/customers, /admin/marketing/coupons, /admin/reports/*.

## 13. Service / Domain Layer Responsibilities

AuthService, CatalogService, HomepageService, CartService, CheckoutService, OrderService, PaymentService, InventoryService, ReviewService, WishlistService, CouponService, TrackingService, ReportService, SocialMetadataService.

## 14. API Responsibility Map

Typical API responsibilities:
- GET /products, GET /products/:id, GET /categories, GET /homepage.
- POST /cart/items, PATCH /cart/items/:id, DELETE /cart/items/:id.
- POST /checkout/validate, POST /orders.
- GET /orders/:id (authenticated owner only), POST /guest-order-access.
- POST /payments/manual-bkash, POST /reviews, POST /wishlist.
- Admin CRUD for banners/categories/products/combos/placements/orders/coupons.


# 12. Implementation-Level Specification

## 12.1 UI & Navigation Rules
- Each version should add only its own menu groups and screens.
- Existing navigation must remain stable unless a migration is explicitly documented.
- List pages should support loading, empty, error and success states.
- Create/edit forms should preserve entered values when server validation fails.
- Destructive actions require confirmation and should clearly state business impact.
- Tables should support pagination and server-side filtering where data volume can grow.

## 12.2 Validation Rules
- All critical business validations are enforced on the server.
- IDs, slugs, SKUs, codes and financial amounts are validated at the domain boundary.
- Money is stored using a fixed-precision decimal/integer minor-unit strategy; floating-point arithmetic must not be used for financial totals.
- Dates and timestamps are stored consistently, with display conversion handled at the UI boundary.
- Every version should define maximum lengths, required fields and enumerated status values.

## 12.3 Transaction & Consistency Rules
- Any operation that changes multiple dependent records must use an atomic transaction where the database supports it.
- Example: creating an order + reserving stock + creating payment intent should not partially succeed.
- Idempotency keys should be used for retryable operations such as payment submission, webhook processing, stock posting and reward issuance.
- Derived values must be recalculable from authoritative records.

## 12.4 Error Handling
Every service should return a predictable error structure containing:
- machine-readable error code
- user-safe message
- optional field-level validation errors
- request/correlation ID for support

Sensitive internal stack traces must never be exposed to customers.

## 12.5 Permissions
Even in versions where the full RBAC interface has not been released, service methods should be permission-aware. A later version must not require rewriting every endpoint to add authorization.

## 12.6 Observability
Each major operation should be traceable using:
- request/correlation ID
- actor/user ID where applicable
- event/action name
- success/failure
- latency
- error code

Business-critical actions should create an audit event when appropriate.

## 12.7 Performance
- Paginate large datasets.
- Index fields used for product lookup, SKU, order number, status, customer ID and date-range reporting.
- Avoid N+1 queries in admin tables and storefront lists.
- Cache low-change homepage configuration where appropriate.
- Use background jobs for expensive reports, notifications and batch operations.

## 12.8 Security
- Validate and authorize every backend request.
- Do not trust client-supplied prices, discounts, stock, roles or permission flags.
- Never expose sequential internal IDs in security-sensitive tracking URLs when a secure token is available.
- Protect admin routes independently from customer routes.
- Rate-limit authentication, tracking, coupon and public write endpoints.

## 12.9 Database Migration Rules
- Every schema change needs a versioned migration.
- Backward-incompatible data transformations require a migration plan and rollback/backup strategy.
- New nullable fields are preferred when introducing fields used by a later module before all historical data is backfilled.
- Historical business records should not be rewritten casually.

## 12.10 Deployment / Release Checklist
1. Database migration tested.
2. Seed/default configuration prepared.
3. API tests passing.
4. Critical user flows passing.
5. Permissions tested.
6. Performance smoke test completed.
7. Error monitoring checked.
8. Backup verified where financial/order data is involved.
9. Rollback plan prepared.
10. Version acceptance criteria signed off.

## 12.11 QA Strategy
Each version should test:
- happy path
- validation failure
- permission failure
- duplicate request
- concurrency/race conditions
- empty state
- large dataset
- network retry
- browser/mobile behavior
- regression of previous versions

## 12.12 Documentation Deliverables
For every version, implementation should produce:
- database changes
- API changes
- UI screen list
- business-rule notes
- environment variables/configuration
- test cases
- deployment notes
- release notes
