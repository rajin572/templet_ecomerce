# V7 — Marketing & Campaign Management

## 1. Purpose

V7 turns marketing into a measurable operating function. It introduces campaigns, promotions, source attribution, marketing cost and performance views so the business can compare channels by revenue and profitability.

## 2. Scope

Campaigns, promotions, advanced coupon targeting, channels, attribution, marketing spend, orders/revenue/profit by source, ROAS and ROI.

## 3. Dependencies

V5 finance and V6 analytics. V1 Open Graph sharing is already available; V7 adds actual campaign/attribution measurement.

## 4. Core Modules

### Campaign Management

Create campaign with name, objective, dates, budget, channel, target and content reference.

#### Business Logic

Campaign state follows draft → scheduled/active → completed/paused.

### Promotion Management

Bundle promotion, category promotion, product promotion and free-delivery promotion.

#### Business Logic

Promotion rules must be evaluated consistently with coupon rules.

### Advanced Coupon Engine

Target by product, category, customer segment, first order, minimum spend, free delivery, Buy X Get Y.

#### Business Logic

Eligibility engine evaluates all conditions before discount application.

### Marketing Channels

Facebook, Google, Organic, Direct, WhatsApp, Offline and configurable channels.

#### Business Logic

Every source must use a stable enum/key for reporting.

### Attribution

Capture campaign/source parameters and associate them with sessions/orders where possible.

#### Business Logic

Attribution model must be defined (e.g., first-touch, last-touch, position-based) rather than changing numbers silently.

### Marketing Spend

Record campaign spend and connect it to finance.

#### Business Logic

Spend transactions should originate in finance but be tagged with campaign/channel references.

### ROAS/ROI

Revenue and profit-based campaign performance.

#### Business Logic

ROAS = attributed revenue / ad spend. ROI definition must explicitly state the numerator/denominator used by the business.

## 5. Key Design Decisions

- Attribution model must be explicit.
- Coupon rules should be centralized, not duplicated by campaign code.
- Marketing spend is financial data and should integrate with V5/V12 transactions.
- A campaign cannot be considered profitable solely from revenue if cost is known.

## 6. End-to-End Business Logic

Campaign created → tracking parameters/source metadata generated → traffic arrives → user/session attribution captured → order created → revenue attributed → marketing spend loaded → ROAS/ROI calculated → campaign dashboard updated.

## 7. Data / Entity Requirements

Campaign, CampaignChannel, Promotion, PromotionRule, MarketingSource, AttributionTouch, AttributionSnapshot, MarketingSpend, CampaignPerformanceAggregate.

## 8. Main Flows

### Campaign
Create → schedule → launch → track traffic → attribute orders → record spend → report revenue/profit/ROAS/ROI.

### Advanced coupon
Customer/cart context → evaluate rules → determine maximum eligible benefit → apply → record redemption.

## 9. Edge Cases & Failure Handling

- Customer interacts with multiple campaigns.
- Attribution data missing.
- Coupon overlaps.
- Campaign spend arrives after orders.
- Refund occurs after campaign revenue was attributed.

## 10. Acceptance Criteria

- Coupon rules combine correctly and cannot exceed configured caps.
- Campaign revenue reconciles with attributed orders.
- ROAS calculation matches source data.
- Spend records link to financial records.
- Attribution model is consistent across reports.

## 11. Out of Scope / Deferred

Automated behavioral marketing and deep customer journeys belong to V10.


## 12. Screen / Route Map

Admin marketing routes: /campaigns, /promotions, /channels, /attribution, /spend, /roas, /roi.

## 13. Service / Domain Layer Responsibilities

CampaignService, PromotionService, CouponRuleEngine, AttributionService, MarketingSpendService, MarketingAnalyticsService.

## 14. API Responsibility Map

Campaign CRUD/schedule; promotion and coupon rule APIs; attribution capture/read; spend entry; campaign performance and ROAS/ROI reporting.


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
