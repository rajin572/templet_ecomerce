# V5 — Finance, Cost & Profitability

## 1. Purpose

V5 introduces the first real profitability engine. The system moves from “sales amount” to “actual economic result” by tracking product cost, COGS, expenses, overhead allocation and profit.

## 2. Scope

Historical product cost, cost history, COGS, packaging/delivery/payment costs, expense management, overhead allocation, product profitability, gross/net profit and margins.

## 3. Dependencies

Requires order data, inventory/purchase data and reliable payment/refund records. V4 purchasing provides the strongest historical cost source.

## 4. Core Modules

### Cost History

Record effective costs over time rather than a single mutable cost.

#### Business Logic

New orders use the cost applicable to the business costing method at the transaction time. Historical orders retain their recognized cost.

### COGS

Calculate the cost attached to sold units.

#### Business Logic

COGS methodology must be chosen and documented (e.g., weighted average/FIFO/manual policy). The system should not silently switch methods.

### Expense Management

Record rent, electricity, salaries, packaging, shipping, software, marketing and other expenses.

#### Business Logic

Expenses have categories, dates, amounts, payment methods, notes and attachments. Expenses are immutable financial events; corrections use adjustments/reversals.

### Overhead Allocation

Allocate common operating costs to products/orders using configurable models.

#### Business Logic

Possible methods: per unit, revenue %, COGS %, order %, weight, manual. Each allocation run stores the method and inputs used.

### Actual Product Cost

Combine direct and allocated costs to show true profitability.

#### Business Logic

Selling price - recognized direct cost - relevant variable/allocated costs = contribution/actual profit according to the chosen profitability view.

### Profit Dashboard

Revenue, COGS, gross profit, expenses, net profit, margins.

#### Business Logic

Metrics are derived from transactions; dashboard numbers are not manually typed.

### Refund/Return Impact

Reflect refunds and returned goods in the financial model.

#### Business Logic

Refunds reverse or adjust revenue/payment components; returned goods affect inventory and COGS according to accounting policy.

## 5. Key Design Decisions

- Costing method must be explicitly selected and documented.
- Financial numbers come from transaction records, not dashboard edits.
- Historical records must not change because current product cost changes.
- Allocation runs must be reproducible.
- Refunds are separate financial events.

## 6. End-to-End Business Logic

Purchase/receipt → cost lot. Sale → recognize revenue + COGS. Expense → financial transaction. Refund → reverse/adjust applicable revenue/payment and inventory/COGS effects. Period close → allocate overhead using chosen method → profitability snapshot/report.

## 7. Data / Entity Requirements

CostHistory/CostLot, COGSRecord, Expense, ExpenseCategory, OverheadAllocationRule, OverheadAllocationRun, RevenueTransaction, PaymentTransaction, RefundTransaction, FinancialPeriod, LedgerEntry (V12 can expand).

## 8. Main Flows

### Product profitability
Selling price → direct cost → packaging → delivery → payment fee → marketing allocation (if enabled) → overhead allocation (if enabled) → profit/margin.

### Expense correction
Original expense remains → reversal/adjustment transaction created → corrected view uses both events.

## 9. Edge Cases & Failure Handling

- Missing cost for a sold SKU.
- Cost changes mid-day.
- Partial refund.
- Negative margin product.
- Expense dated outside the reporting period.
- Overhead allocation run repeated accidentally.
- Late purchase invoice changes cost after sale.

## 10. Acceptance Criteria

- Old orders retain recognized historical cost.
- COGS is deterministic from documented method.
- Revenue minus COGS equals gross profit.
- Expenses reduce net profit but do not alter historical order totals.
- Allocation runs record their methodology.
- Duplicate expense entry is prevented or auditable.

## 11. Out of Scope / Deferred

Full double-entry accounting, tax filing integration and statutory accounting reports are V12.


## 12. Screen / Route Map

Admin finance routes: /admin/finance/dashboard, /expenses, /cost-history, /cogs, /allocations, /profitability, /periods.

## 13. Service / Domain Layer Responsibilities

CostService, COGSService, ExpenseService, OverheadAllocationService, ProfitabilityService, FinancialPeriodService.

## 14. API Responsibility Map

Expense CRUD; cost-history read/write; COGS calculation/rebuild; allocation preview/run; profitability drill-down; period close/reopen where permitted.


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
