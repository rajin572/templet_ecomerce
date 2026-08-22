# V10 — Marketing Automation & Smart Commerce

## 1. Purpose

V10 adds event-driven automation. The system becomes capable of reacting to customer behavior rather than waiting for staff to manually run every promotion.

## 2. Scope

Abandoned cart recovery, re-engagement, cross-sell/up-sell rules, automated review requests, back-in-stock, price-drop alerts, wishlist notifications and campaign triggers.

## 3. Dependencies

V7 marketing, V8 CRM, V9 loyalty/referral, V6 analytics and notification infrastructure.

## 4. Core Modules

### Automation Engine

Create trigger → conditions → action workflows.

#### Business Logic

Events enter a queue/event bus; rules are evaluated; actions are scheduled/executed; execution is logged and idempotent.

### Abandoned Cart

Detect carts that remain inactive beyond a configured period.

#### Business Logic

Do not message carts that already converted, expired or were cleared. Cap reminders per customer/cart.

### Re-engagement

Example: no order for 60 days.

#### Business Logic

Customer segment condition → campaign/message → optional coupon → conversion measurement.

### Cross-sell/Up-sell

Suggest related items based on past purchases, frequently bought together and configured rules.

#### Business Logic

Exclude already-owned or ineligible products as configured.

### Review Automation

Send review request after delivery with timing controls.

#### Business Logic

One request per eligible order/item unless manually retriggered.

### Back-in-stock / Price-drop

Notify interested customers when a condition becomes true.

#### Business Logic

Subscribers are stored against product/variant and notified once per triggering event with throttling.

### Notification Channels

Email/SMS/WhatsApp/in-app when provider integrations exist.

#### Business Logic

Notification provider abstraction and delivery status logging.

## 5. Key Design Decisions

- Every automation must be idempotent and stoppable.
- Customer consent/preferences must be respected.
- Message frequency must be capped.
- Every automation execution is logged for debugging and analytics.

## 6. End-to-End Business Logic

Business event → queued event → rule matching → condition evaluation → action scheduling → provider dispatch → delivery result → conversion attribution.
Example: OrderDelivered → wait 3 days → check no review exists → send review request → record outcome.

## 7. Data / Entity Requirements

AutomationWorkflow, Trigger, Condition, Action, AutomationExecution, MessageTemplate, NotificationPreference, NotificationDelivery, AbandonedCart, AlertSubscription.

## 8. Main Flows

### Abandoned cart
Cart updated → timer starts → inactivity threshold reached → check no order → send reminder → optionally send coupon → mark recovered if purchase occurs.

### Price drop
Variant price changed → compare threshold → subscribers fetched → notifications queued → results stored.

## 9. Edge Cases & Failure Handling

- Customer unsubscribed.
- Same event processed twice.
- Provider outage.
- Coupon already redeemed.
- Customer buys immediately before scheduled message.
- Automation rule changed after a job was scheduled.

## 10. Acceptance Criteria

- Duplicate events do not produce duplicate rewards/messages.
- Opted-out customer is not contacted.
- Abandoned cart does not trigger after purchase.
- Automation logs show every step.
- Provider failure supports retry without duplicate sends.

## 11. Out of Scope / Deferred

AI-generated copy or predictive recommendations are optional future enhancements, not required for the first automation implementation.


## 12. Screen / Route Map

Admin: /automation/workflows, /executions, /templates. Customer preference/alert routes.

## 13. Service / Domain Layer Responsibilities

EventBus, AutomationRuleEngine, SchedulerService, NotificationService, MessageTemplateService, DeliveryProviderService.

## 14. API Responsibility Map

Workflow CRUD/publish/pause; execution logs; preview/test-run; notification preference; provider delivery-status webhooks.


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
