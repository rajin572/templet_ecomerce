# V9 — Loyalty, Referral & Retention

## 1. Purpose

V9 adds systems designed to increase repeat purchases and generate customer-driven acquisition. It introduces points, memberships, rewards and referrals.

## 2. Scope

Loyalty points, membership tiers, reward rules, redemption, referral links/codes and reward ledger.

## 3. Dependencies

V8 customer/CRM and V1/V3 completed-order data. V5 finance should be consulted for the monetary treatment of discounts/rewards.

## 4. Core Modules

### Loyalty Points

Earn points for defined actions, primarily purchases; redeem against eligible benefits.

#### Business Logic

Points are ledger transactions, not a mutable balance only. Every earn/redeem/expire/adjust event is recorded.

### Membership Tiers

Silver, Gold, VIP or configurable tiers.

#### Business Logic

Tier eligibility uses configurable rules such as spend, orders or points over a defined period.

### Rewards

Birthday offers, first-order offers, purchase milestones and member-only promotions.

#### Business Logic

Reward issuance checks eligibility and anti-abuse rules.

### Referral

Customer receives unique referral code/link; referred customer gets a defined benefit; referrer earns a reward.

#### Business Logic

Reward is released only after the referred order reaches the business-defined qualifying state, e.g. delivered/not returned.

### Reward Ledger

Audit every point/reward transaction.

#### Business Logic

Balances are derived from ledger or rebuilt from it.

## 5. Key Design Decisions

- Rewards must be auditable.
- Referral rewards should not be granted before the qualifying order condition is met.
- Points have expiry/configurable policies if desired.
- Discount liabilities must be understood by finance.

## 6. End-to-End Business Logic

Purchase/referral event → eligibility check → reward calculation → ledger entry → customer balance/tier updated. Redemption → eligibility check → reward consumption → order discount or benefit application → ledger entry.

## 7. Data / Entity Requirements

LoyaltyAccount, LoyaltyLedger, LoyaltyRule, MembershipTier, MembershipHistory, Reward, RewardRedemption, ReferralCode, ReferralRelationship, ReferralReward.

## 8. Main Flows

### Purchase points
Eligible delivered order → calculate points → add ledger entry → update visible balance.

### Referral
Customer shares code → new customer signs up/orders → qualifying order completes → reward unlocks → both users receive configured benefit.

## 9. Edge Cases & Failure Handling

- Returned/refunded qualifying order.
- Referral self-referral.
- Same phone/device suspicious referrals.
- Duplicate point grant.
- Tier downgrades/upgrades.
- Coupon + points stacking limits.

## 10. Acceptance Criteria

- Points are issued exactly once.
- Refund/return policy correctly reverses or adjusts rewards.
- Referral cannot reward invalid/self-referrals.
- Tier calculation is deterministic.
- Redemption respects balance and rules.

## 11. Out of Scope / Deferred

Sophisticated automated journeys are V10.


## 12. Screen / Route Map

Customer: /loyalty, /rewards, /referral. Admin: /admin/loyalty/rules, /tiers, /ledger, /referrals.

## 13. Service / Domain Layer Responsibilities

LoyaltyLedgerService, RewardService, MembershipService, ReferralService, FraudCheckService.

## 14. API Responsibility Map

Points ledger; redemption; tier evaluation; reward issuance; referral code create/resolve; qualifying-order checks; reversal endpoints.


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
