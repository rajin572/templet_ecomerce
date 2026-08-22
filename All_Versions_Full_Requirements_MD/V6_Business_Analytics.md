# V6 — Advanced Business Analytics

## 1. Purpose

V6 turns operational data into decision-making dashboards. It focuses on sales, product, category, customer, funnel and profitability analytics without yet becoming a full marketing automation platform.

## 2. Scope

Sales trends, product/category performance, customer metrics, funnel analytics, cart/checkout abandonment, AOV, repeat purchase, margins and customer/product/channel profitability.

## 3. Dependencies

V1 orders/customers + V4 inventory/purchases + V5 finance/cost.

## 4. Core Modules

### Executive Sales Dashboard

Revenue, orders, units, AOV, growth and trend charts.

#### Business Logic

All metrics support configurable date ranges and comparison periods.

### Product Analytics

Revenue/product, units/product, profit/product, margin/product, sales velocity.

#### Business Logic

Product rankings can be based on selected metric and period.

### Category Analytics

Revenue, profit, units and margin by category.

#### Business Logic

Hierarchical categories can roll up to parents.

### Customer Analytics

New vs returning, AOV, total spend, CLV, repeat rate.

#### Business Logic

Definitions are fixed and documented so dashboard numbers remain consistent.

### Funnel Analytics

Visit → product view → add to cart → checkout → purchase.

#### Business Logic

Events should use anonymous/session-safe identifiers and be aggregated for reporting.

### Abandonment Analytics

Cart abandonment and checkout abandonment.

#### Business Logic

A consistent inactivity/timeout definition must be used.

### Profitability Analytics

Profit by product, category and channel when attribution data is available.

#### Business Logic

Use V5 cost/expense model; clearly distinguish gross profit vs net/allocated profit.

## 5. Key Design Decisions

- Every metric must have a written definition.
- Date filters should be consistent across dashboards.
- Analytics must not directly mutate transactional data.
- Historical reports should remain reproducible.

## 6. End-to-End Business Logic

Raw transactional data → aggregation layer → metric definitions → dashboard widgets → drill-down into underlying records. Heavy analytics queries should use pre-aggregations or optimized reporting collections where necessary.

## 7. Data / Entity Requirements

AnalyticsEvent, DailySalesAggregate, ProductPerformanceAggregate, CustomerMetrics, FunnelEvent, FunnelAggregate, ReportSnapshot (optional).

## 8. Main Flows

### Product profitability
Select date range → calculate sales → calculate recognized COGS/allocated cost → rank products → click product → drill into orders.

### Funnel
Collect approved events → sessionize/aggregate → compute conversion percentages → compare periods.

## 9. Edge Cases & Failure Handling

- Anonymous traffic without purchase.
- Duplicate events.
- Late-arriving data.
- Refunds after a period closes.
- Category hierarchy changes.
- Product archived after historical sales.

## 10. Acceptance Criteria

- Dashboard totals reconcile with transactional reports.
- Product profit matches V5 finance calculation.
- Parent-category totals equal child roll-ups where configured.
- Funnel percentages are mathematically consistent.
- Refunds are reflected according to documented metric rules.

## 11. Out of Scope / Deferred

Advanced attribution and campaign ROAS are primarily V7.


## 12. Screen / Route Map

Admin analytics routes: /admin/analytics/overview, /sales, /products, /categories, /customers, /funnel, /abandonment.

## 13. Service / Domain Layer Responsibilities

AnalyticsAggregationService, MetricsService, FunnelService, ProductAnalyticsService, CustomerAnalyticsService, ReportingQueryService.

## 14. API Responsibility Map

Date-filtered dashboards, drill-down endpoints, aggregate refresh/status, metric definition endpoint, export endpoints.


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
