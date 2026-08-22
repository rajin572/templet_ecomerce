# V11 — Staff, RBAC & Business Security

## 1. Purpose

V11 turns administrative access into a professional multi-user control system. Different employees can operate different parts of the platform without seeing or changing data they are not responsible for.

## 2. Scope

Employee management, roles, permissions, action-level authorization, access groups, login history, force logout, audit logs and sensitive data restrictions.

## 3. Dependencies

All prior modules; V1 permission hooks should already exist.

## 4. Core Modules

### Employee Management

Add, edit, disable, archive, reset password, force logout, change role and permission.

#### Business Logic

Prefer disable/archive over destructive deletion to preserve audit history.

### Roles

Super Admin, Manager, Order Manager, Inventory Manager, Accountant, Marketing Manager and custom roles.

#### Business Logic

Roles are collections of permissions; users may have one or more roles if business rules require.

### Permissions

Resource + action permission model: view/create/edit/delete/approve/export and sensitive data access.

#### Business Logic

Backend authorization must enforce permissions; hiding UI menus is not sufficient.

### Audit Log

Record actor, action, resource, record id, timestamp, before/after values where appropriate.

#### Business Logic

Audit log is append-only for normal users.

### Login & Session Security

Login history, device/session tracking, force logout and security events.

#### Business Logic

Revoked sessions become invalid immediately or at next token validation depending on auth architecture.

### Sensitive Data Controls

Finance and customer data may require specialized permissions.

#### Business Logic

Use least privilege; never assume role alone is enough when record-level restrictions are required later.

## 5. Key Design Decisions

- Backend must enforce authorization.
- Audit logs are not normal editable records.
- Employee disable/archive preserves history.
- Security-sensitive actions should be re-authenticated where appropriate.

## 6. End-to-End Business Logic

Admin request → authenticate session → load roles → resolve permissions → authorize route/action → execute domain operation → write audit event.
For privileged operations, optional step-up authentication → execute → audit.

## 7. Data / Entity Requirements

AdminUser/Employee, Role, Permission, RolePermission, UserRole, Session, LoginEvent, AuditLog, SecurityEvent.

## 8. Main Flows

### Add employee
Super Admin → create employee → assign role → assign/override permissions → send activation/invite → employee logs in.

### Permission denial
Request hits API → policy check fails → operation rejected → security/audit event logged.

## 9. Edge Cases & Failure Handling

- Employee disabled while logged in.
- Role changed mid-session.
- Permission removed during a long-lived session.
- Attempt to alter audit logs.
- Privilege escalation through direct API calls.

## 10. Acceptance Criteria

- Unauthorized user cannot access hidden or direct API routes.
- Disabled employee cannot create new actions.
- Audit logs contain required fields.
- Role changes take effect within defined session rules.
- Sensitive financial endpoints require correct permissions.

## 11. Out of Scope / Deferred

Full enterprise SSO, hardware keys and SIEM integration can be added later if scale requires.


## 12. Screen / Route Map

Admin: /staff/employees, /roles, /permissions, /sessions, /audit-logs, /security-events.

## 13. Service / Domain Layer Responsibilities

AuthorizationService, PolicyEngine, StaffService, SessionService, AuditService, SecurityEventService.

## 14. API Responsibility Map

Employee/role/permission CRUD; session revoke; audit query; policy check middleware; security events. No UI-only authorization.


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
