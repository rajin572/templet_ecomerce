# V3 — Advanced Order & Delivery Management

## 1. Purpose

V3 makes the post-purchase operation professional. It adds structured returns/refunds/exchanges and a delivery workflow that can support zone pricing, courier tracking and COD reconciliation.

## 2. Scope

Order lifecycle extensions, returns, refunds, exchange, delivery zones, delivery methods, courier references, ETA, parcel tracking, failed delivery, retry, partial delivery and COD reconciliation.

## 3. Dependencies

V1/V2 orders, customers, payments and inventory. V3 must preserve the original order snapshot and status timeline.

## 4. Core Modules

### Order Lifecycle

Add operational states and controlled transitions for fulfillment and delivery.

#### Business Logic

Separate order status from payment status and fulfillment/delivery status where necessary. Do not overload one enum with unrelated meanings.

### Returns

Customer/admin can initiate return request against delivered or eligible items.

#### Business Logic

Return eligibility is determined by configured rules such as delivered date, item type and quantity. Each request records reason and item quantities.

### Refunds

Full/partial refunds linked to returned quantities and payment records.

#### Business Logic

Refund amount is calculated from the refundable amount, not arbitrary manual totals. Inventory/finance hooks are emitted.

### Exchange

Replace returned item with another variant/product according to business rules.

#### Business Logic

Treat exchange as return + replacement allocation so inventory remains auditable.

### Delivery Zones

Define Inside Dhaka, Outside Dhaka or custom regions, charges and free-delivery thresholds.

#### Business Logic

Delivery charge is selected based on the final delivery address/zone and current rule version.

### Courier Management

Track courier, consignment/reference, tracking URL/status.

#### Business Logic

Courier integration is abstracted; manual tracking can work before full API integration.

### Delivery Failures

Failed delivery reason, retry, return-to-origin handling.

#### Business Logic

Every failure changes delivery status and records the event/time/reason.

### Partial Delivery

Support orders that are shipped/delivered in parts.

#### Business Logic

Order-level status should not erase line-level fulfillment state. Track item quantities by shipment/fulfillment unit.

### COD Reconciliation

Track expected COD, collected COD, courier fees and discrepancies.

#### Business Logic

Reconciliation records are tied to courier settlement batches.

## 5. Key Design Decisions

- Separate payment status from delivery/order status.
- Use item-level quantities for returns and partial delivery.
- Never edit the historical order total to represent a refund; create a linked refund record.
- Courier integration must be replaceable.

## 6. End-to-End Business Logic

Order confirmed → fulfillment → shipment created → courier reference assigned → out for delivery → delivered.
If failure occurs, create delivery-failure event → retry or return-to-origin.
If return approved, create return record → receive/inspect → inventory outcome → refund/exchange outcome.
COD reconciliation consumes delivered COD amounts and courier settlement records.

## 7. Data / Entity Requirements

ReturnRequest, ReturnItem, Refund, RefundItem, ExchangeOrder/ExchangeRequest, DeliveryZone, DeliveryMethod, Shipment, ShipmentItem, Courier, TrackingEvent, DeliveryFailure, CODSettlement, CODSettlementLine, DeliveryRateRule.

## 8. Main Flows

### Return
Customer → Return Request → Admin Review → Approved → Product Received → Inspection → Refund/Exchange → Inventory/Finance update.

### COD settlement
Delivered COD order → courier settlement batch → expected amount vs received amount → fee/difference → reconciliation result.

## 9. Edge Cases & Failure Handling

- Return exceeds purchased quantity: reject.
- Order is already refunded: prevent duplicate refund.
- Partial delivery plus return: calculate only against eligible delivered quantities.
- Courier API unavailable: retain manual tracking workflow.
- Delivery address changes after shipment: require explicit re-routing process.

## 10. Acceptance Criteria

- Valid return can be requested only under configured policy.
- Refund cannot exceed refundable amount.
- Partial return updates correct quantities.
- Shipment tracking is independent from payment status.
- Delivery failure creates an auditable event.
- COD settlement totals reconcile accurately.

## 11. Out of Scope / Deferred

Full courier API automation may be introduced progressively per courier. Advanced route optimization is outside this version.


## 12. Screen / Route Map

Admin/customer routes for returns, refunds, shipments, deliveries, tracking events, courier settlements and delivery zones.

## 13. Service / Domain Layer Responsibilities

ReturnService, RefundService, ExchangeService, ShipmentService, DeliveryZoneService, CourierService, CODReconciliationService.

## 14. API Responsibility Map

Return create/approve/reject/receive; refund preview/create; exchange create; shipment create/update; courier tracking sync; delivery-zone/rate APIs; COD settlement and reconciliation endpoints.


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
