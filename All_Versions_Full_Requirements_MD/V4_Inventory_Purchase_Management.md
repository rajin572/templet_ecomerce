# V4 — Inventory & Purchase Management

## 1. Purpose

V4 converts the basic stock system into an operational inventory system with stock ledger, adjustments, suppliers, purchase orders and receiving. Its purpose is to make inventory and procurement trustworthy as order volume grows.

## 2. Scope

Stock ledger, stock movement, stock adjustments, supplier management, purchase orders, received stock, purchase costing and supplier due/payment tracking.

## 3. Dependencies

Products/variants from V1 and the order/return flows from V3. Finance hooks may exist but final financial reporting is V5/V12.

## 4. Core Modules

### Stock Ledger

Maintain current quantity plus immutable movement history.

#### Business Logic

Every change has a reason/type/reference and actor. Current balance is derived/updated consistently with movements.

### Stock Adjustment

Manual increase/decrease for damage, loss, counting variance, correction or opening balance.

#### Business Logic

Adjustment requires reason; sensitive adjustments are auditable.

### Reserved vs Available

Track physical stock, reserved stock and sellable available stock.

#### Business Logic

Available = on hand - reserved - blocked quantities according to the business rule.

### Supplier Management

Supplier identity, contact, payment terms, balance and notes.

#### Business Logic

Supplier is a first-class entity referenced by purchases and payments.

### Purchase Orders

Create purchase orders with supplier, variants, quantities and expected cost.

#### Business Logic

PO does not increase stock until goods are received.

### Goods Receipt

Record actual received quantities and damaged/missing units.

#### Business Logic

Only received quantities affect inventory. Variance against PO is recorded.

### Purchase Costing

Capture unit cost, lot/reference and effective date.

#### Business Logic

Cost data feeds future historical cost/COGS processes; do not overwrite previous purchase costs.

### Supplier Payment/Due

Track amount paid and remaining due for purchases.

#### Business Logic

Payment records reduce supplier due without altering received quantities.

## 5. Key Design Decisions

- Stock movement is the audit trail.
- Purchase creation does not change stock; receipt does.
- Cost must be historical and tied to purchase/receipt events.
- Manual stock adjustments require reasons.
- Warehouse support can be added later without discarding current ledger design.

## 6. End-to-End Business Logic

PO created → supplier confirms → goods received → received quantities validated → stock increases → cost lots recorded → supplier payable/due updated.
Manual adjustment → approval/reason → stock movement → new balance.
Order/return flows continue to consume/restore stock through the same inventory service.

## 7. Data / Entity Requirements

InventoryBalance, StockMovement, StockAdjustment, Supplier, PurchaseOrder, PurchaseOrderItem, GoodsReceipt, GoodsReceiptItem, CostLot/PurchaseLot, SupplierPayment, SupplierLedger, Warehouse (future-ready).

## 8. Main Flows

### Purchase
Supplier selected → PO lines created → receive shipment → compare ordered vs received → update stock → create cost lot → calculate supplier due.

### Stock adjustment
Select SKU → choose adjustment type → enter quantity/reason → confirm → ledger entry → balance update.

## 9. Edge Cases & Failure Handling

- Partial receipt.
- Over-receipt beyond tolerance.
- Damaged quantity.
- Negative inventory attempt.
- Supplier payment greater than outstanding due.
- Stock count mismatch.
- Product archived while open PO exists.

## 10. Acceptance Criteria

- PO creation does not increase stock.
- Goods receipt increases only actual received quantity.
- Stock movement history exactly explains balance changes.
- Supplier due equals purchases received minus payments plus/minus configured adjustments.
- Manual adjustments require a reason and actor.

## 11. Out of Scope / Deferred

Multi-warehouse transfer, barcode/QR scanning and advanced procurement planning may be added later.


## 12. Screen / Route Map

Admin routes: /admin/inventory/ledger, /adjustments, /suppliers, /purchases, /receipts, /supplier-payments.

## 13. Service / Domain Layer Responsibilities

InventoryLedgerService, StockAdjustmentService, SupplierService, PurchaseService, GoodsReceiptService, CostLotService, SupplierBalanceService.

## 14. API Responsibility Map

Stock balance/movement endpoints; adjustment create/approve; supplier CRUD; PO CRUD; receipt posting; supplier payment posting; stock ledger export.


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
