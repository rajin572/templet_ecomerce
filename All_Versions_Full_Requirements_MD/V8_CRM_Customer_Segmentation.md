# V8 — Customer CRM & Segmentation

## 1. Purpose

V8 turns customer information into an actionable CRM. The goal is to understand customer value, purchasing behavior and segments so the business can personalize future experiences and campaigns.

## 2. Scope

Customer 360 profile, purchase behavior, customer value, segmentation, cohort-style views and reusable audience definitions.

## 3. Dependencies

V1 customer/account/order history plus V6 analytics. V7 attribution is useful but not mandatory for basic CRM.

## 4. Core Modules

### Customer 360

Unified customer view: profile, addresses, orders, spend, last purchase, favorites, coupon behavior, wishlist and reviews.

#### Business Logic

Data is aggregated from source modules; the CRM should not duplicate authoritative transaction data unnecessarily.

### Segments

Rule-based segments such as New, Returning, VIP, Inactive, High Value, Coupon User, Product/Category Buyer.

#### Business Logic

Segments are dynamic unless explicitly saved as a snapshot audience for a campaign.

### Customer Value

AOV, total spend, purchase frequency, CLV.

#### Business Logic

Metric definitions must match V6 and V12 finance/reporting definitions.

### Purchase Behavior

Favorite categories/products, recency, frequency and monetary value.

#### Business Logic

Use RFM-style concepts if helpful while preserving the business’s own naming.

### CRM Notes & Tags

Business notes and configurable tags.

#### Business Logic

Sensitive notes require permission controls and audit history.

## 5. Key Design Decisions

- CRM is a view and action layer around authoritative customer/order records.
- Segments must be testable and explainable.
- Sensitive customer information requires stronger permission controls.

## 6. End-to-End Business Logic

Customer orders/events → profile aggregation → segment rules → segment membership → CRM dashboard → eligible marketing/loyalty use. Segment membership changes when the underlying customer data changes, unless a campaign freezes an audience snapshot.

## 7. Data / Entity Requirements

CustomerProfile, CustomerMetric, CustomerTag, SegmentDefinition, SegmentMembership, CustomerNote, CustomerCohort.

## 8. Main Flows

### Segment
Define “No order in 60 days” → run/refresh → customers matching rule become Inactive → segment can be viewed/exported/used by later campaign automation.

## 9. Edge Cases & Failure Handling

- Guest customer later creates account: merge identity carefully.
- Duplicate customer profiles.
- Phone/email changes.
- Segment rules change after a campaign launched.
- Customer requests data correction/deletion under applicable policy.

## 10. Acceptance Criteria

- Customer 360 data matches source records.
- Segments update predictably.
- Guest-to-account merge does not duplicate order totals.
- CRM access is permission-controlled.
- Segment counts match report queries.

## 11. Out of Scope / Deferred

Automated campaigns are V10; loyalty/referral rewards are V9.


## 12. Screen / Route Map

Admin CRM routes: /customers/:id, /segments, /tags, /cohorts, /customer-metrics.

## 13. Service / Domain Layer Responsibilities

Customer360Service, SegmentService, CustomerMetricService, CohortService, CustomerIdentityMergeService.

## 14. API Responsibility Map

Customer profile/metrics; segment CRUD/refresh; membership counts; customer tags/notes; guest-to-account merge operations.


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
