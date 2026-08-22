# BUILD_PLAN.md — ECommerce, the complete plan

The full build, start to finish: 25 parts, every model, every endpoint, every screen, every task, in dependency order. Each part is a **vertical slice** — when it is done, that feature works end to end for real users: backend API → shared types → dashboard → website → design → charts → green typecheck. Nothing is left "to wire up later".

**Companion documents**

- [CODING_RULES.md](CODING_RULES.md) — how code is written (wrappers, reusable components, module layout, API envelope, the verification gate)
- [CHART_STANDARDS.md](CHART_STANDARDS.md) — validated palette, chart form per data job, per-module chart lists
- [CLAUDE.md](CLAUDE.md) — repo map and current state
- Specs: [phase-1](phase-1-complete-website-design.md) website §3 · [phase-2](phase-2-complete-dashboard-design.md) dashboard §4, RBAC §8 · [phase-3](phase-3-complete-backend-design.md) backend §5 · [requirements](ecommerce_project_requirements.md)

---

## A. Decisions that shape everything

| #   | Decision                                                          | Consequence                                                                                                                                                      |
| --- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Cash on delivery only** — no gateway, no online payment         | Money moves after delivery; order _confirmation_ replaces the payment gate; courier remittance is tracked as a receivable ([CODING_RULES §4.6](CODING_RULES.md)) |
| 2   | **Revenue is recognised on collection**, not on order placement   | A placed order posts nothing to the ledger; a failed delivery posts only costs. Every profit number depends on this                                              |
| 3   | **Money is stored as integer poisha**                             | No float drift in COGS, allocation, partial refunds; format only at render                                                                                       |
| 4   | **Permission-based RBAC**, enforced server-side                   | Every non-public route carries `auth()` + `requirePermission()`; hidden UI is never the boundary                                                                 |
| 5   | **Orders snapshot price, cost, customer and address**             | Historical orders never resolve through live product docs                                                                                                        |
| 6   | **Bengali-first storefront**, English admin                       | `lang="bn"`, Hind Siliguri, ৳, Bengali UI copy on the website                                                                                                    |
| 7   | **One backend, three consumers** (website, dashboard, future app) | No business logic in either frontend                                                                                                                             |

## B. Milestones & release plan

| Milestone                       | Parts     | What it delivers                                                        | Est.  |
| ------------------------------- | --------- | ----------------------------------------------------------------------- | ----- |
| **M0 — Foundation**             | 0–2       | Everything compiles, auth + RBAC works, uploads and site settings exist | ~17 d |
| **M1 — Catalog live**           | 3–5       | A browsable, searchable storefront with a real catalog                  | ~18 d |
| **M2 — GO LIVE (COD MVP)**      | 6–11, 13  | Customers order, staff fulfil, cash is collected and reconciled         | ~44 d |
| **M3 — Operations depth**       | 12, 14–16 | Manual/offline sales, reviews, customer intelligence, purchasing        | ~18 d |
| **M4 — Finance truth**          | 17–19     | Cost history, expenses, overhead, profit/ROI/ROAS dashboard             | ~19 d |
| **M5 — Growth**                 | 20–22     | Marketing, loyalty, notifications, reports & exports                    | ~19 d |
| **M6 — Compliance & hardening** | 23–24     | Audit log, CMS/SEO, security, performance, deploy                       | ~12 d |

**Total ≈ 147 dev-days ≈ 30 working weeks** for one full-time developer doing backend _and_ both frontends. **To go live: parts 0–11 + 13 ≈ 79 dev-days ≈ 16 weeks.**

These are planning estimates for sequencing and expectation-setting, not commitments. They assume one developer, no learning overhead on the stack, and that the design specs don't change mid-part. Two developers splitting backend/frontend cuts wall-clock by roughly a third, not a half — the vertical-slice structure means they hand off inside every part.

## C. Master schedule

| Part | Scope                            | Depends on | Est. | Milestone |
| ---- | -------------------------------- | ---------- | ---- | --------- |
| 0    | Foundation & repair              | —          | 5 d  | M0        |
| 1    | Auth, users & RBAC               | 0          | 8 d  | M0        |
| 2    | Uploads, settings & site content | 1          | 4 d  | M0        |
| 3    | Category & brand                 | 2          | 4 d  | M1        |
| 4    | Product & variant                | 3          | 10 d | M1        |
| 5    | Search, filter & sort            | 4          | 4 d  | M1        |
| 6    | Inventory & stock                | 4          | 6 d  | M2        |
| 7    | Cart & wishlist                  | 6          | 5 d  | M2        |
| 8    | Delivery, couriers & coupons     | 7          | 5 d  | M2        |
| 9    | Checkout & orders                | 8          | 10 d | M2        |
| 10   | COD collection & remittance      | 9          | 6 d  | M2        |
| 11   | Order operations                 | 10         | 7 d  | M2        |
| 13   | Returns, refunds & cancellations | 11         | 5 d  | M2        |
| 12   | Manual / offline orders          | 11         | 4 d  | M3        |
| 14   | Reviews & ratings                | 11         | 4 d  | M3        |
| 15   | Customers & segments             | 11         | 5 d  | M3        |
| 16   | Suppliers & purchases            | 6          | 5 d  | M3        |
| 17   | Product cost & COGS              | 16         | 5 d  | M4        |
| 18   | Expenses, overhead & approvals   | 17         | 6 d  | M4        |
| 19   | Finance engine & dashboard       | 18         | 8 d  | M4        |
| 20   | Marketing, attribution & loyalty | 19         | 8 d  | M5        |
| 21   | Notifications & realtime         | 11         | 5 d  | M5        |
| 22   | Reports & exports                | 19         | 6 d  | M5        |
| 23   | Audit log, CMS & SEO             | 11         | 5 d  | M6        |
| 24   | Hardening, performance & deploy  | all        | 7 d  | M6        |

**Critical path to launch:** 0 → 1 → 2 → 3 → 4 → 6 → 7 → 8 → 9 → 10 → 11 → 13. Part 5 (search) and Part 21 (order emails) run alongside without blocking.

## D. Working agreement — how each part runs

1. **Read** the part below, plus the spec sections it names.
2. **Branch** `part-<n>-<slug>` off `main`. One part per branch.
3. **Backend first** — constants → interface → model → validation → service → controller → routes → mount → Postman check. No frontend work until the endpoints return correct data.
4. **Types** — write `<feature>.type.ts` in both frontends from the actual response, export from `src/types/index.ts`.
5. **Dashboard** — API slice + tags, pages/modals from the reusable inventory, route + sidebar entry + permission.
6. **Website** — server fetch / service action with cache tags, UI from the reusable inventory, `revalidateTag` on mutations.
7. **Design & states** — match the spec; implement loading / empty / error / validation / success; check 375 / 768 / 1440 px.
8. **Delete** the dummy data this part replaces.
9. **Gate** — [CODING_RULES §6](CODING_RULES.md): typecheck + lint + build green in all three projects.
10. **Manual QA** — run the part's "Done when" list against the local backend.
11. **Update** the tracker in §G, merge, tag if it closes a milestone.
12. **Strict Next.js Rule**: Do NOT use `"use client"` in `page.tsx` files. Server components only for pages.
13. **Strict Reusability Rule**: For forms, you MUST use the reusable forms provided. For Modals, Tables, and other UI pieces, you MUST search the reusable component inventory first and use them as your highest priority.

## E. Environment setup (do this once, before Part 0)

- [ ] **Git**: this folder is not a repository yet. `git init`, add `.gitignore` per project (node_modules, .env, dist, .next), initial commit, remote, branch protection on `main`.
- [ ] **MongoDB as a single-node replica set.** Mongoose transactions — which Parts 6, 9, 10, 13, 16, 17 and 19 all require — **do not work on a standalone `mongod`**. Either run local Mongo with `--replSet rs0` and `rs.initiate()`, or use a MongoDB Atlas cluster. Discovering this at Part 9 costs a day; doing it now costs ten minutes.
- [ ] **Backend `.env`**: `PORT`, `DATABASE_URL`, `NODE_ENV`, `JWT_ACCESS_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`, `BCRYPT_SALT_ROUNDS`, `OTP_EXPIRES_IN`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `EMAIL_USER`, `EMAIL_PASS`, `CLIENT_URLS`, `SMS_API_KEY` (later).
- [ ] **Dashboard `.env`**: `VITE_PUBLIC_SERVER_URL=http://localhost:5000/api/v1`, `VITE_PUBLIC_IMAGE_URL`, `VITE_PUBLIC_SOCKET_API`.
- [ ] **Website `.env`**: `NEXT_PUBLIC_BASE_API=http://localhost:5000/api/v1`, `NEXT_PUBLIC_SERVER_API`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SOCKET_API`.
- [ ] **`.env.example`** committed for all three (never the real `.env`).
- [ ] **Postman/Thunder collection** at `docs/ECommerce.postman_collection.json`, one folder per part, kept current as endpoints land.
- [ ] **Seed script** (`npm run seed`): super admin, default roles + permissions, delivery zones for Bangladesh districts, a few categories/products for local work.
- [ ] **Cloudinary account** + folder `ECommerce_uploads`; **SMTP** credentials verified by sending one test OTP.

---

# THE PARTS

---

## Part 0 — Foundation & repair

**M0 · depends on: nothing · est. 5 d**

**Outcome:** all three projects compile clean, share one API contract, and the backend has the middleware and utilities every later part depends on.
**Specs:** phase-3 §5.2–5.6.

### 0.1 Backend — fix what's broken

- [ ] `validateRequest`: Zod 4 API (`ZodObject` / `ZodType`; `AnyZodObject` and `ZodEffects` no longer exist)
- [ ] `handleZodError`: `path` typing (`PropertyKey` → `string | number`)
- [ ] `category.validation.ts`: `{ error: "..." }` replaces `required_error`
- [ ] `jwtHelpers`: `SignOptions` typing for `expiresIn`
- [ ] `user.model.ts` / `category.model.ts`: pre-save hook typings
- [ ] `auth.service.ts`: `IUser` import path
- [ ] `category.controller.ts`: `req.params` string typing
- [ ] `fileUpload.ts`: drop the uninstalled `multer-storage-cloudinary`; write a typed Cloudinary `upload_stream` storage engine instead

### 0.2 Backend — the skeleton every part uses

- [ ] `src/app/config/index.ts` — env loaded **and validated with Zod**, exported typed; nothing reads `process.env` directly again
- [ ] `src/constants/` — `httpStatus.ts`, `permissions.ts`, `roles.ts`, business enums ([CODING_RULES §4.5](CODING_RULES.md))
- [ ] `src/interfaces/` — `IApiResponse`, `IMeta`, `IGenericErrorResponse`, `IAuthUser`, `IQueryPayload`
- [ ] `src/utils/QueryBuilder.ts` — `searchTerm`, whitelisted filters, `sort`, `page`, `limit`, field selection, returns `meta { page, limit, total, totalPage }`
- [ ] `src/utils/money.ts` — poisha helpers; `src/utils/pick.ts`; `src/utils/slugify.ts`; `src/utils/generateId.ts` (order numbers, non-guessable)
- [ ] `src/utils/transaction.ts` — `runInTransaction(fn)` session helper
- [ ] `globalErrorHandler`: add Mongoose validation / cast / duplicate-key normalisation and `errorCode`
- [ ] Fix route mounts: `/auth`, `/settings`, `/staff` (not `/auths`, `/settingss`, `/staffs`); add `GET /api/v1/health`
- [ ] `app.ts`: CORS from `CLIENT_URLS`, `express.json({ limit: "10mb" })`, `cookie-parser`, request logger
- [ ] Move `generate-backend.js` to `scripts/` with a warning header, or delete it

### 0.3 Dashboard

- [ ] `eslint.config.js` (typescript-eslint + react-hooks + react-refresh) so `npm run lint` runs at all
- [ ] Fix the build errors in `pages/Auth/SignIn.tsx` and `redux/features/auth/authApi.ts` (type login as `IApiResponse<ILoginData>`)
- [ ] `src/types/common.type.ts`: `IApiResponse<T>`, `IListResponse<T>`, `IMeta`, `IQueryArgs`, `IErrorResponse` → export from `types/index.ts`
- [ ] `src/utils/money.ts` (`formatMoney`, `toPoisha`, `fromPoisha`)
- [ ] `.env` → local backend

### 0.4 Website

- [ ] Same `common.type.ts` + `money.ts`
- [ ] Storefront primitives the spec needs that don't exist: `EmptyState`, `SkeletonCard`, `QuantitySelector`, `StarRating`, `Breadcrumb`, `SectionHeader`, `CategoryPill`, `SocialShareBar`, `Badge` variants (New / Sale / BestSell / Combo / OutOfStock)
- [ ] `loading.tsx` per route group; verify `error.tsx` / `not-found.tsx` against spec §3.26
- [ ] `.env` → local backend; Cloudinary in `next.config.ts` `images.remotePatterns` (replace deprecated `domains`)

### 0.5 Charts foundation (both frontends)

Nine later parts are chart-driven, so this lands once — see [CHART_STANDARDS.md](CHART_STANDARDS.md).

- [ ] Viz CSS custom properties (`--viz-1…8`, `--viz-seq-*`, `--viz-div-*`, `--viz-good|warn|serious|critical`, grid/axis/ink/surface/de-emphasis), light **and** dark columns
- [ ] `chartTheme.ts` — fixed slot order, entity→colour maps, axis/money formatters. The only place a chart colour is defined
- [ ] `StatTile`, `KpiRow`, `HeroFigure`, `Meter`, `ChartCard` (title + table-view toggle + empty state + hold-frame-on-refetch), shared tooltip and legend
- [ ] Rebuild the existing `Charts/AreaChart.tsx` and `Charts/BarChart.tsx` on these tokens

### Done when

- `npx tsc --noEmit` / `npm run lint` / `npm run build` clean in all three projects
- Both frontends call `/health` against the local backend successfully
- A sample `ChartCard` renders with correct tokens in light and dark
- `rs.status()` confirms the replica set, and a throwaway two-collection transaction commits

---

## Part 1 — Auth, users & RBAC

**M0 · depends on: 0 · est. 8 d**

**Outcome:** real customers and staff authenticate; every later endpoint can be protected by permission.
**Specs:** phase-3 §5.7–5.9 · phase-2 §4.14–4.15, §8 · phase-1 §3.18.

### 1.1 Backend — models

- [ ] `user` — name, email, phone, password (hashed, `select:false`), role ref, status (`active|blocked|archived`), emailVerified, phoneVerified, avatar, lastLoginAt, `isDeleted`
- [ ] `role` — name, slug, description, permissions[], isSystem (system roles undeletable)
- [ ] `permission` — catalog seeded from `constants/permissions.ts` (`resource.action`)
- [ ] `otp` — email/phone, code, type (`signup|forgot|order_confirm`), expiresAt, attempts, consumedAt
- [ ] `address` — user, label, name, phone, district, thana, area, street, postcode, isDefault
- [ ] `session` (light) — user, refreshTokenHash, device, ip, lastUsedAt, revokedAt

### 1.2 Backend — endpoints

| Method       | Path                      | Access                        | Purpose                                         |
| ------------ | ------------------------- | ----------------------------- | ----------------------------------------------- |
| POST         | `/auth/register`          | public                        | customer signup → OTP to email/phone            |
| POST         | `/auth/verify-otp`        | public                        | verify signup OTP, create the account           |
| POST         | `/auth/resend-otp`        | public, rate-limited          | resend a signup/forgot OTP                      |
| POST         | `/auth/login`             | public                        | customer **and** staff login → access + refresh |
| POST         | `/auth/refresh-token`     | refresh token                 | rotate the access token                         |
| POST         | `/auth/logout`            | auth                          | revoke the session                              |
| POST         | `/auth/forgot-password`   | public, rate-limited          | send reset OTP                                  |
| POST         | `/auth/verify-forgot-otp` | public                        | verify reset OTP → reset token                  |
| POST         | `/auth/reset-password`    | reset token                   | set a new password                              |
| PATCH        | `/auth/change-password`   | auth                          | change while logged in                          |
| GET          | `/auth/me`                | auth                          | user + role + resolved permissions              |
| GET/PATCH    | `/users/me`               | auth                          | profile read/update (name, phone, avatar)       |
| GET/POST     | `/addresses`              | auth                          | list / create                                   |
| PATCH/DELETE | `/addresses/:id`          | auth (owner)                  | update / remove                                 |
| PATCH        | `/addresses/:id/default`  | auth (owner)                  | set default                                     |
| GET          | `/staff`                  | `staff.view`                  | staff list, filters + pagination                |
| POST         | `/staff`                  | `staff.create`                | create staff, assign role                       |
| GET/PATCH    | `/staff/:id`              | `staff.view` / `staff.update` | detail / edit                                   |
| PATCH        | `/staff/:id/status`       | `staff.update`                | activate / block / archive                      |
| PATCH        | `/staff/:id/role`         | `staff.manage_roles`          | change role                                     |
| POST         | `/staff/:id/force-logout` | `staff.update`                | revoke all sessions                             |
| GET/POST     | `/roles`                  | `staff.manage_roles`          | list / create custom roles                      |
| PATCH/DELETE | `/roles/:id`              | `staff.manage_roles`          | edit / delete (system roles blocked)            |
| GET          | `/permissions`            | `staff.manage_permissions`    | permission catalog, grouped by resource         |

### 1.3 Backend — service rules

- [ ] bcrypt at configured cost; passwords never returned, never logged
- [ ] Access token short-lived, refresh long-lived and rotated; refresh stored hashed in `session`
- [ ] OTP: 4–6 digits, expiry from config, max attempts, single-use, invalidated on success
- [ ] `auth()` middleware → `req.user = { userId, role, permissions[] }`; `requirePermission(...perms)` checks the resolved set
- [ ] Role→permission defaults for all ten roles (phase-2 §8.1); super_admin implicitly holds everything
- [ ] Seed script: super admin from env, system roles, full permission catalog
- [ ] Login returns role so clients can route; **customers and staff use the same endpoint, different role**

### 1.4 Shared types

- [ ] `auth.type.ts` (both frontends): `IUser`, `IRole`, `IPermission`, `IAddress`, `ILoginResponse`, `IJwtPayload` (with `permissions`)

### 1.5 Dashboard

- [ ] Wire `SignIn`, `ForgetPassword`, `OtpPage`, `UpdatePassword` to real endpoints via `tryCatchWrapper`
- [ ] `useUserData` exposes permissions; add `usePermission("x.y")` hook
- [ ] `ProtectedRoute` checks role; page guards check permission; sidebar filters `admin.route.tsx` entries by permission (phase-2 §4.2)
- [ ] `Staff/EmployeesPage` — list, create/edit modal (role select, status), force-logout action
- [ ] `Staff/RolesPage` — CRUD custom roles
- [ ] `Staff/PermissionsPage` — matrix grid: resource rows × action columns, checkbox per cell, save per role
- [ ] Profile settings page (own profile + change password)

### 1.6 Website

- [ ] `(auth)/sign-in`, `sign-up`, `verify-otp`, `forgot-password`, `reset-password` on the new endpoints; keep the cookie chain and the `role !== "user"` rejection
- [ ] `middleware.ts` guarding `/dashboard/*` with redirect + return URL
- [ ] `/dashboard/profile` — profile edit + change password
- [ ] `/dashboard/address` — address CRUD with default selection (checkout depends on this in Part 9)
- [ ] OTP screen: 6-box auto-focus input, countdown, resend enabled after countdown (spec §3.18)

### Done when

- Customer registers → OTP arrives → verifies → logs in → sees their profile
- Staff logs into the dashboard; a staff member **without** `product.create` cannot see the button, cannot reach the route, and gets 403 when the request is replayed by hand
- Force-logout invalidates that user's refresh token immediately
- Password reset works end to end; used OTPs cannot be replayed

---

## Part 2 — Uploads, settings & site content

**M0 · depends on: 1 · est. 4 d**

**Outcome:** images upload once and everywhere; store configuration and homepage content are data, not hardcoded strings.
**Specs:** phase-2 §4.19 · phase-1 §3.3–3.5, §3.9.

### 2.1 Backend — models

- [ ] `settings` (singleton) — store name, logo, favicon, contact phone/email, address, socials, WhatsApp number, currency, free-delivery threshold, maintenance mode, default SEO (title/description/OG image), business hours
- [ ] `banner` — title, image (desktop + mobile), link, position (`hero|mid|category`), sortOrder, active, schedule (start/end)
- [ ] `homepageSection` — key, title (bn/en), type (`products|categories|banner|reviews|brands`), source (category/flag/manual list), sortOrder, active

### 2.2 Backend — endpoints

| Method       | Path                 | Access                            | Purpose                    |
| ------------ | -------------------- | --------------------------------- | -------------------------- |
| POST         | `/uploads`           | auth + permission                 | single file → Cloudinary   |
| POST         | `/uploads/multiple`  | auth + permission                 | up to N files              |
| DELETE       | `/uploads/:publicId` | auth + permission                 | remove an asset            |
| GET          | `/settings/public`   | public, cached                    | storefront-safe settings   |
| GET          | `/settings`          | `settings.view`                   | full settings              |
| PATCH        | `/settings`          | `settings.update`                 | update                     |
| GET          | `/banners`           | public                            | active banners by position |
| GET/POST     | `/banners` (admin)   | `banner.view` / `banner.create`   | manage                     |
| PATCH/DELETE | `/banners/:id`       | `banner.update` / `banner.delete` | manage                     |
| GET          | `/homepage-sections` | public                            | ordered section config     |
| PATCH        | `/homepage-sections` | `settings.update`                 | reorder / toggle           |

- [ ] Upload validation: mimetype whitelist, size cap, image dimension sanity; store `url` + `publicId`; deleting a record deletes the asset

### 2.3 Dashboard

- [ ] `Settings/SettingsPage` — real tabs: Store, Contact, Social, Delivery defaults, SEO defaults; `FormUpload` for logo/favicon
- [ ] Banner manager — list, upload desktop + mobile image, position, schedule, drag-order, activate/deactivate
- [ ] Homepage section manager — reorder and toggle the storefront's sections

### 2.4 Website

- [ ] `/settings/public` fetched with `next: { tags: ["settings"], revalidate: 3600 }`; consumed by `Header`, `Footer`, `FloatingChat` (WhatsApp), free-delivery upsell
- [ ] `HeroBanner` and `PromoBanner` read `/banners`; homepage renders sections in configured order
- [ ] `revalidateTag("settings" | "banners")` after dashboard saves

### Done when

- Changing the store phone in the dashboard changes it in the website footer after revalidation
- A scheduled banner appears and disappears on its own dates
- Reordering homepage sections reorders the live homepage

---

## Part 3 — Category & brand

**M1 · depends on: 2 · est. 4 d**

**Outcome:** the real category tree drives storefront navigation and product classification.
**Specs:** phase-3 §5.12 · phase-2 §4.7 · phase-1 §3.5, §3.10.

### 3.1 Backend — models

- [ ] `category` — name (bn/en), slug, parent, image, icon, description, sortOrder, status, SEO (title/description/OG), createdBy/updatedBy, `isDeleted`, virtual `productCount`
- [ ] `brand` — name, slug, logo, description, status, sortOrder

### 3.2 Backend — endpoints

| Method            | Path                       | Access            | Purpose                         |
| ----------------- | -------------------------- | ----------------- | ------------------------------- |
| GET               | `/categories`              | public            | flat list, filters + pagination |
| GET               | `/categories/tree`         | public, cached    | nested tree for nav + mega menu |
| GET               | `/categories/:slug`        | public            | one category + children + SEO   |
| POST              | `/categories`              | `category.create` | create                          |
| PATCH             | `/categories/:id`          | `category.update` | edit                            |
| DELETE            | `/categories/:id`          | `category.delete` | archive (never hard delete)     |
| PATCH             | `/categories/reorder`      | `category.update` | bulk sortOrder                  |
| GET               | `/brands`, `/brands/:slug` | public            | list / detail                   |
| POST/PATCH/DELETE | `/brands`, `/brands/:id`   | `brand.*`         | manage                          |

### 3.3 Backend — service rules

- [ ] Slug auto-generated, unique, immutable once products reference it (or redirect map kept)
- [ ] Parent change validates against cycles and max depth (3 levels: Food → Spices → Powder)
- [ ] Archiving a parent archives or reparents children — decide and enforce one rule
- [ ] `productCount` computed, not stored stale

### 3.4 Dashboard

- [ ] `Catalog/CategoriesPage` — tree table with expand/collapse, create/edit modal (parent select, image, sortOrder, status, SEO fields), reorder, archive
- [ ] `Catalog/BrandsPage` — CRUD with logo upload

### 3.5 Website

- [ ] `CategoryBar` + hover mega menu from `/categories/tree` (spec §3.5)
- [ ] `MobileDrawer` category accordion
- [ ] `FeaturedCategories` row on the homepage
- [ ] `/category/[slug]` — banner, breadcrumb, title, description, product grid shell (products arrive in Part 4), `generateStaticParams`, `generateMetadata`, breadcrumb JSON-LD

### Done when

- Creating a nested category in the dashboard makes it appear in the storefront nav and mega menu after revalidation
- Reordering categories reorders the nav
- A cycle (making a child its own parent's parent) is rejected by the API

---

## Part 4 — Product & variant

**M1 · depends on: 3 · est. 10 d**

**Outcome:** the catalog is real end to end — admin creates a product, customers browse and open it.
**Specs:** phase-3 §5.11 · phase-2 §4.6 · phase-1 §3.11–3.13.

### 4.1 Backend — models

- [ ] `product` — name (bn/en), slug, SKU, category, subcategory, brand, shortDescription, description (rich text), images[], thumbnail, `price` (poisha), `salePrice`, unit (kg/g/pcs), weight, flags[] (`new|best_selling|combo|organic|pre_order|free_delivery|trending`), ingredients, specifications, lowStockThreshold, status (`draft|published|archived`), publishedAt, SEO (title/description/keywords/OG), ratingAvg, ratingCount, salesCount, createdBy/updatedBy, `isDeleted`
- [ ] `variant` — product, name, attributes (size/weight/pack), SKU, `price`, `salePrice`, image, status
- [ ] **Cost fields exist on the product** (`currentCost`) but are only serialised when the caller holds `product.view_cost` (Part 17 adds history)

### 4.2 Backend — endpoints

| Method            | Path                         | Access            | Purpose                                                                                                     |
| ----------------- | ---------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------- |
| GET               | `/products`                  | public            | list: `searchTerm`, `category`, `brand`, `priceMin`, `priceMax`, `flag`, `inStock`, `sort`, `page`, `limit` |
| GET               | `/products/:slug`            | public            | detail + variants + SEO + rating summary                                                                    |
| GET               | `/products/:id/related`      | public            | same category, exclude self                                                                                 |
| GET               | `/products/admin`            | `product.view`    | admin list incl. drafts/archived, cost column when permitted                                                |
| POST              | `/products`                  | `product.create`  | create                                                                                                      |
| PATCH             | `/products/:id`              | `product.update`  | edit                                                                                                        |
| DELETE            | `/products/:id`              | `product.delete`  | archive                                                                                                     |
| PATCH             | `/products/:id/publish`      | `product.publish` | publish / unpublish                                                                                         |
| POST              | `/products/:id/duplicate`    | `product.create`  | clone as draft                                                                                              |
| PATCH             | `/products/bulk`             | `product.update`  | bulk status / category / flag                                                                               |
| GET               | `/products/export`           | `product.export`  | CSV of the current filter                                                                                   |
| GET               | `/products/:id/variants`     | public            | variants                                                                                                    |
| POST/PATCH/DELETE | `/variants`, `/variants/:id` | `product.*`       | manage                                                                                                      |

### 4.3 Backend — service rules

- [ ] Slug unique; SKU unique across products and variants
- [ ] `salePrice < price` enforced; both in poisha; discount % derived, never stored
- [ ] Public endpoints return **only** published, non-deleted products, and never cost fields
- [ ] Indexes: `slug`, `category+status`, `flags`, `price`, text index (Part 5 extends)
- [ ] Publishing requires: images ≥1, price > 0, category set — validated in the service

### 4.4 Shared types

- [ ] `product.type.ts`, `variant.type.ts` in both frontends (`IProduct`, `IProductListItem`, `IVariant`, `IGetProductsResponse`, `IProductQueryArgs`)

### 4.5 Dashboard

- [ ] `Catalog/ProductsPage` — search, category/brand/status/flag filters, table (thumbnail, name, SKU, category, price, stock, status `Tag`), row actions (view, edit, duplicate, publish, archive), bulk bar, export
- [ ] Product create/edit screen with tabbed sections built from `ReuseForm`: **General** (names, slugs, category, brand, flags), **Media** (multi-image upload, reorder, thumbnail), **Pricing** (price, sale price, unit, cost when permitted), **Variants** (repeatable rows), **Inventory** (SKU, low-stock threshold), **SEO** (title, description, keywords, OG preview), **Description** (`RichTextEditor`)
- [ ] `Catalog/VariantsPage` — cross-product variant list

### 4.6 Website

- [ ] `/shop` — product grid, sort dropdown, pagination or infinite scroll (spec §3.11)
- [ ] `/category/[slug]` — grid wired to the real endpoint
- [ ] `ProductCard` — badges, wishlist heart, rating, price + strikethrough, stock badge, add-to-cart, quick view; **all states** (default, hover, out of stock, skeleton) per spec §3.12
- [ ] `/product/[slug]` — gallery with zoom/thumbnails, title, rating, price, variant selector, `QuantitySelector`, Add to Cart, Buy Now, wishlist, **Order on WhatsApp** with pre-filled message, `SocialShareBar` (Facebook, WhatsApp, Messenger, Copy Link), description / reviews tabs, related products row
- [ ] `generateMetadata` + Product JSON-LD; images through `next/image`

### 4.7 Charts

None yet — product performance charts arrive with sales data (Part 11, [CHART_STANDARDS §7.2](CHART_STANDARDS.md)).

### Done when

- Publishing a product in the dashboard makes it appear on `/shop` and its category page after `revalidateTag("products")`
- Prices render as ৳ from poisha everywhere; sale price shows the strikethrough and correct discount badge
- An unpublished/archived product 404s on the storefront but is visible in the dashboard
- Cost fields are absent from the public payload — verified by reading the raw JSON

---

## Part 5 — Search, filter & sort

**M1 · depends on: 4 · est. 4 d**

**Outcome:** customers find products by name, Bengali or English, with working filters.
**Specs:** phase-1 §3.10 (sidebar), §3.11 (sort), §3.14 (search).

### 5.1 Backend

- [ ] Text index across name (bn/en), SKU, brand, category name, tags; diacritic/case-insensitive
- [ ] Fuzzy fallback for near-misses ("holud" → হলুদ / Turmeric): trigram-ish regex or Atlas Search if available
- [ ] Sort keys: `default | price_asc | price_desc | newest | best_selling | top_rated`
- [ ] Whitelisted filter params in `QueryBuilder`; never accept arbitrary Mongo operators from the query string

| Method | Path                     | Access            | Purpose                                      |
| ------ | ------------------------ | ----------------- | -------------------------------------------- |
| GET    | `/search/suggestions?q=` | public            | ≤8: thumbnail, name, price, slug             |
| GET    | `/search?q=`             | public            | full results, same shape as `/products`      |
| GET    | `/search/popular`        | public            | popular/recent terms for the empty dropdown  |
| POST   | `/search/log`            | public, throttled | record a query for analytics (feeds Part 20) |

### 5.2 Website

- [ ] Header search with debounced dropdown (thumbnail + name + price, "See all results for …")
- [ ] Mobile: search icon expands to full-width input
- [ ] `/search?q=` results page: count line, grid, sidebar filters, sort
- [ ] Filter sidebar: product flags, `PriceRangeSlider` with min/max inputs, brands checkbox list, rating (spec §3.10)
- [ ] Mobile filter as a full-screen modal with Apply / Reset
- [ ] Filter state synced to the URL (shareable, back-button correct)
- [ ] No-results state: illustration + "কোনো পণ্য পাওয়া যায়নি" + suggestions

### 5.3 Dashboard

- [ ] Product table search/sort/filter uses the same params, so behaviour matches the storefront

### Done when

- Typing a Bengali product name shows suggestions within ~300 ms
- Every filter combination is reflected in the URL and survives reload
- Sorting by price returns correctly ordered results across pages (not just within a page)

---

## Part 6 — Inventory & stock

**M2 · depends on: 4 · est. 6 d**

**Outcome:** stock is authoritative and safe against overselling — before any order can exist.
**Specs:** phase-3 §5.14 · phase-2 §4.8.

### 6.1 Backend — models

- [ ] `inventory` — product, variant, warehouse, `onHand`, `reserved`, virtual `available = onHand - reserved`, lowStockThreshold, updatedAt; unique index on (product, variant, warehouse)
- [ ] `stockMovement` — type (`RECEIVE|ADJUST|RESERVE|RELEASE|DEDUCT|RESTOCK|TRANSFER|AUDIT`), product/variant, warehouse, qty (signed), before, after, reason, reference (order/purchase id), actor, createdAt
- [ ] `warehouse` — name, code, address, isDefault, status

### 6.2 Backend — service primitives (used by Parts 9, 11, 13, 16)

- [ ] `reserveStock(items, ref, session)` — fails loudly if `available < qty`
- [ ] `releaseStock(items, ref, session)` — on cancel/expiry
- [ ] `deductStock(items, ref, session)` — on dispatch
- [ ] `restock(items, ref, session)` — on RTO/return
- [ ] All four run **inside the caller's transaction** and always write a `stockMovement` row. No stock field is ever written outside these functions

### 6.3 Backend — endpoints

| Method         | Path                    | Access             | Purpose                                          |
| -------------- | ----------------------- | ------------------ | ------------------------------------------------ |
| GET            | `/inventory`            | `inventory.view`   | list with filters (warehouse, category, low/out) |
| GET            | `/inventory/:productId` | `inventory.view`   | per-variant breakdown                            |
| GET            | `/inventory/low-stock`  | `inventory.view`   | at/below threshold                               |
| GET            | `/inventory/stats`      | `inventory.view`   | KPI + chart series                               |
| POST           | `/inventory/adjust`     | `inventory.update` | manual adjust with reason (audited)              |
| POST           | `/inventory/receive`    | `inventory.update` | receive stock (Part 16 calls this)               |
| POST           | `/inventory/transfer`   | `inventory.update` | warehouse → warehouse                            |
| GET            | `/stock-movements`      | `inventory.view`   | ledger, filters + pagination + export            |
| GET/POST/PATCH | `/warehouses`           | `inventory.*`      | manage                                           |

### 6.4 Dashboard

- [ ] `Inventory/StockPage` — table (product, SKU, warehouse, on hand, reserved, available, threshold, status `Tag`), filters, adjust / receive / transfer modals with mandatory reason
- [ ] `Inventory/StockMovementPage` — filterable ledger with before/after and actor
- [ ] `Inventory/WarehousesPage` — CRUD
- [ ] **Charts** — [CHART_STANDARDS §7.1](CHART_STANDARDS.md): KPI row (stock value, SKUs, low stock, out of stock, reserved) · stock in/out **diverging column** by day · low-stock top-10 horizontal bar with status dot + label · stock value by category bar · stock-age heatmap

### 6.5 Website

- [ ] Stock badges on card and detail: In Stock / Low Stock / Out of Stock
- [ ] Out-of-stock card state (image opacity, disabled button) per spec §3.12
- [ ] Quantity selector capped at available

### Done when

- Two concurrent reservations for the last unit → one succeeds, one fails cleanly (test it deliberately)
- Every stock change has a matching movement row with actor and reason
- Adjusting stock in the dashboard changes the storefront badge after revalidation

---

## Part 7 — Cart & wishlist

**M2 · depends on: 6 · est. 5 d**

**Outcome:** one cart that survives login, plus a real wishlist.
**Specs:** phase-3 §5.21 · phase-1 §3.15, §3.20.

### 7.1 Backend — models

- [ ] `cart` — user **or** guestToken, items[{ product, variant, qty, priceAtAdd }], coupon (applied in Part 8), updatedAt, TTL index for abandoned guest carts (feeds Part 20)
- [ ] `wishlist` — user, product, addedAt; unique (user, product)

### 7.2 Backend — endpoints

| Method | Path                                | Access              | Purpose                                      |
| ------ | ----------------------------------- | ------------------- | -------------------------------------------- |
| GET    | `/cart`                             | auth or guest token | current cart with fresh prices + stock       |
| POST   | `/cart/items`                       | auth or guest       | add item                                     |
| PATCH  | `/cart/items/:itemId`               | auth or guest       | change quantity                              |
| DELETE | `/cart/items/:itemId`               | auth or guest       | remove item                                  |
| DELETE | `/cart`                             | auth or guest       | clear                                        |
| POST   | `/cart/merge`                       | auth                | merge guest cart into the user cart at login |
| POST   | `/cart/validate`                    | auth or guest       | re-price + stock check before checkout       |
| GET    | `/wishlist`                         | auth                | list                                         |
| POST   | `/wishlist`                         | auth                | add (idempotent)                             |
| DELETE | `/wishlist/:productId`              | auth                | remove                                       |
| POST   | `/wishlist/:productId/move-to-cart` | auth                | move                                         |

- [ ] Server always re-reads current price and stock; `priceAtAdd` is informational only, never the charge basis
- [ ] Merge rule: same product → max(qty) capped at available; never silently drop items

### 7.3 Website

- [ ] `CartDrawer` — items, quantity ±, remove, free-delivery upsell banner (threshold from settings), "You May Also Like" row, subtotal, Checkout, Continue Shopping
- [ ] `/cart` full page — table (desktop) / cards (mobile), coupon input (Part 8 wires validation), summary sidebar, both CTAs
- [ ] Zustand store becomes the guest-side cache that syncs to the server and merges on login
- [ ] `/dashboard/wishlist` + header wishlist count; guest clicking wishlist → login with return URL
- [ ] Empty states for both

### Done when

- Guest adds 3 items → logs in → cart contains those items merged with anything already saved
- A price changed in the dashboard is reflected in the cart on next load
- Adding beyond available stock is rejected with a clear message

---

## Part 8 — Delivery, couriers & coupons

**M2 · depends on: 7 · est. 5 d**

**Outcome:** the two inputs checkout needs before it can compute a total — and the cost side COD accounting will need.
**Specs:** phase-3 §5.19, §5.23 · phase-2 §4.11 · phase-1 §3.16, §3.22.

### 8.1 Backend — models

- [ ] `deliveryZone` — name, districts[], thanas[], **customer fee**, freeDeliveryThreshold, estimatedDays, status
- [ ] `courier` — name, code, contact, **courierCharge** (per parcel or by weight), **codFeePercent** (their cut for handling cash), **rtoCharge**, active. _Cost-side fields — never the same number as the customer fee_
- [ ] `coupon` — code, type (`percentage|fixed|free_delivery|buy_x_get_y`), value, maxDiscount, minOrderValue, appliesTo (`all|product|category`), targets[], firstOrderOnly, customerIds[], usageLimit, perCustomerLimit, usedCount, startsAt, endsAt, status
- [ ] `couponUsage` — coupon, customer/phone, order, discount, usedAt

### 8.2 Backend — endpoints

| Method            | Path                                                | Access              | Purpose                                     |
| ----------------- | --------------------------------------------------- | ------------------- | ------------------------------------------- |
| GET               | `/delivery/zones`                                   | public              | zones for the checkout selects              |
| GET               | `/delivery/districts`, `/delivery/thanas?district=` | public              | cascading selects                           |
| POST              | `/delivery/quote`                                   | public              | fee for district/thana/subtotal/weight      |
| POST/PATCH/DELETE | `/delivery/zones`                                   | `settings.shipping` | manage                                      |
| GET/POST/PATCH    | `/couriers`                                         | `settings.shipping` | manage courier cost config                  |
| POST              | `/coupons/validate`                                 | public              | **the only source of truth for a discount** |
| GET               | `/coupons`                                          | `coupon.view`       | list + filters                              |
| POST/PATCH/DELETE | `/coupons`, `/coupons/:id`                          | `coupon.*`          | manage                                      |
| GET               | `/coupons/:id/usage`                                | `coupon.view`       | who used it, when, how much                 |
| GET               | `/coupons/available`                                | auth                | customer's usable coupons ("My Coupons")    |

### 8.3 Backend — service rules

- [ ] Validation checks, in order: exists → active → within window → min order → applies to cart contents → first-order → customer eligibility → usage limits → compute discount → cap at maxDiscount
- [ ] The response returns the **computed discount in poisha**; the client never sends a discount
- [ ] `usedCount` increments only when the order is actually created (inside Part 9's transaction), and decrements on cancel

### 8.4 Dashboard

- [ ] Settings → Shipping: zone table with fees and thresholds, courier cost config
- [ ] `Marketing/CouponsPage` — CRUD with type-dependent fields, schedule, limits, status `Tag`, usage drawer

### 8.5 Website

- [ ] Checkout district → thana cascading selects driving a live delivery fee
- [ ] Coupon input in cart drawer, cart page and checkout: apply, show discount, remove, clear error copy on failure
- [ ] "My Coupons" in the account area with copy-code

### Done when

- Changing a zone fee changes the checkout total immediately
- An expired, over-limit or ineligible coupon is rejected with the specific reason
- A hand-crafted request with a fake discount is ignored — the server's number wins

---

## Part 9 — Checkout & orders

**M2 · depends on: 8 · est. 10 d — the biggest and most delicate part**

**Outcome:** a customer (guest or logged-in) places a real order that reserves stock, gets confirmed, and can be tracked.
**Specs:** phase-3 §5.15–5.18 · phase-1 §3.16–3.17, §3.19.

### 9.1 Backend — the order model (phase-3 §5.15 in full)

- [ ] Identity: `orderNumber` (non-sequential, non-guessable), `source` (`WEBSITE|FACEBOOK|WHATSAPP|PHONE|OFFLINE|MANUAL|OTHER`), `idempotencyKey`
- [ ] Customer: user ref **or** guest, plus a **customer snapshot** (name, phone, email) — never a live join
- [ ] Addresses: shipping + billing **snapshots**
- [ ] Items[]: product, variant, name, image, SKU, qty, `unitPrice`, `lineDiscount`, `lineTotal`, **`unitCost` snapshot** (Part 17 makes it effective-dated)
- [ ] Money (all poisha): `subtotal`, `couponCode`, `discount`, `deliveryFee`, `otherCharges`, `grandTotal`, **`codAmount`**
- [ ] Statuses: `status` (order), `paymentStatus`, `deliveryStatus`, `refundStatus`
- [ ] COD: `paymentMethod: "COD"`, courier ref, tracking number, expected delivery date
- [ ] Confirmation: `confirmedAt`, `confirmedBy`, `confirmationMethod` (`otp|call`), attempts
- [ ] Ops: `timeline[]` (status, at, by, note), `internalNotes[]`, `customerNote`, attribution fields (Part 20 fills them), `createdAt/updatedAt`

### 9.2 Backend — order creation flow (one transaction)

1. Validate payload (Zod) and rate-limit by phone/IP
2. Reject blocked phones; apply the repeat-RTO rule (hook now, tightened in Part 24)
3. Load cart server-side; **re-price every line from the live product/variant**
4. Validate + compute the coupon discount (Part 8 service)
5. Compute the delivery fee from zone + subtotal
6. Compute `grandTotal` and set `codAmount = grandTotal`, `paymentStatus = PENDING`
7. `reserveStock(items, orderId, session)` — abort the whole transaction if anything is short
8. Generate `orderNumber`; write the order + first timeline entry; increment coupon usage
9. Clear the cart; return the order
10. **No finance postings** — revenue is recognised on collection (Part 10)
11. Same `idempotencyKey` within the window returns the _same_ order, never a second one

### 9.3 Backend — endpoints

| Method | Path                      | Access                 | Purpose                                          |
| ------ | ------------------------- | ---------------------- | ------------------------------------------------ |
| POST   | `/orders`                 | public (guest) or auth | place an order (`Idempotency-Key` header)        |
| POST   | `/orders/:id/confirm-otp` | public, rate-limited   | customer confirms via OTP                        |
| POST   | `/orders/:id/resend-otp`  | public, rate-limited   | resend confirmation OTP                          |
| PATCH  | `/orders/:id/confirm`     | `order.confirm`        | staff logs a confirmation call outcome           |
| GET    | `/orders/me`              | auth                   | customer's orders, filter by status              |
| GET    | `/orders/me/:orderNumber` | auth                   | own order detail                                 |
| POST   | `/orders/track`           | public, rate-limited   | orderNumber **+ phone**, minimal payload         |
| GET    | `/orders`                 | `order.view`           | admin list (basic here, full filters in Part 11) |

### 9.4 Shared types

- [ ] `order.type.ts` in both frontends: `IOrder`, `IOrderItem`, `IOrderTimelineEntry`, `ICreateOrderPayload`, `IOrderQueryArgs`, status unions matching the backend constants exactly

### 9.5 Website — checkout (spec §3.16, adapted to COD)

- [ ] Two-column desktop / single-column mobile
- [ ] Left: order review (image, name, variant, qty, line total) · shipping address form (name, phone, email optional, house/street/area, district select, thana select) · billing "same as shipping" checkbox with separate form when unchecked
- [ ] Right: **cash on delivery block** — explainer + "ডেলিভারিতে পরিশোধ: ৳X", no radio group, no gateway logos · coupon input · subtotal / delivery / discount / total · special notes textarea (0/90) · terms + privacy + refund policy checkbox · **Place Order**
- [ ] Logged-in variant: saved-address selector + "add new"; guest variant: full form + optional account creation
- [ ] Validation inline per field; disabled submit while pending; double-submit guarded by the idempotency key
- [ ] `/order-success/[orderNumber]` — success icon, "আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে", order number, **collect-on-delivery amount**, expected delivery date, Continue Shopping + Track Order
- [ ] `/track-order` — order number + phone, timeline with reached/unreached steps and timestamps, "Order Not Found" state with illustration and Back to Shopping
- [ ] `/dashboard/orders` list + `/dashboard/orders/[id]` detail with timeline

### 9.6 Dashboard

- [ ] Orders appear in `Sales/OrdersPage` with an **unconfirmed queue** at the top; confirm/reject actions with note (full operations in Part 11)

### Done when

- Guest order: stock reserved, order number returned, appears in the dashboard as unconfirmed, trackable by number + phone
- A tampered client total is ignored — the server's total is charged
- Double-clicking Place Order creates exactly one order
- An order for an out-of-stock item fails cleanly with nothing reserved and no partial order written
- Confirmation by OTP and by staff call both move the order to `CONFIRMED` and write a timeline entry

---

## Part 10 — COD collection & courier remittance

**M2 · depends on: 9 · est. 6 d**

**Outcome:** the cash journey is tracked from rider to bank, and revenue is recognised at the right moment.
**Specs:** phase-3 §5.22, §5.24 adapted to COD ([CODING_RULES §4.6](CODING_RULES.md)).

### 10.1 Backend — models

- [ ] `payment` (one per order) — order, `codAmount`, `collectedAmount`, collectedAt, collectedBy, courier, `remittance` ref, remittedAt, `codFee`, `deliveryCost`, `rtoCost`, status, shortfallReason
- [ ] `remittance` — courier, period (from/to), orders[], expectedTotal, receivedAmount, deductedFees, difference, status (`open|settled|disputed`), settledBy, settledAt, note

### 10.2 Backend — the state machine (enforced in the service, inside transactions)

```
order DELIVERED       → payment COLLECTED → post SALE + COGS + DELIVERY_COST + COD_FEE   ← revenue recognised
remittance settled    → payment REMITTED  → receivable becomes cash in hand
order DELIVERY_FAILED → payment FAILED    → post DELIVERY_COST + RTO_COST, restock       ← never revenue
```

- [ ] Partial collection recorded explicitly with a reason and flagged as a shortfall — never silently treated as paid
- [ ] Collected amount validated against `codAmount`; mismatch requires a reason and is audited
- [ ] Finance postings are idempotent — replaying a collection never doubles revenue

### 10.3 Backend — endpoints

| Method | Path                               | Access              | Purpose                                   |
| ------ | ---------------------------------- | ------------------- | ----------------------------------------- |
| PATCH  | `/payments/:orderId/collect`       | `order.update`      | mark cash collected (amount + note)       |
| PATCH  | `/payments/:orderId/fail`          | `order.update`      | delivery failed → RTO costs + restock     |
| GET    | `/payments`                        | `finance.view`      | payment list with filters                 |
| GET    | `/payments/pending-cod`            | `finance.view`      | delivered, not yet remitted (receivables) |
| POST   | `/remittances`                     | `remittance.create` | open a batch for a courier + period       |
| GET    | `/remittances`, `/remittances/:id` | `remittance.view`   | list / reconciliation lines               |
| PATCH  | `/remittances/:id/settle`          | `remittance.settle` | record received amount + fees, close      |
| GET    | `/finance/cash-summary`            | `finance.view`      | cash in hand vs with courier              |

### 10.4 Dashboard

- [ ] Collect action on the order (confirm modal showing expected amount; mismatch requires a reason)
- [ ] **Remittance screen** — open batches, expected vs received, fee deductions, per-order lines, settle action, shortfall list
- [ ] Cash panel: Pending with courier · Collected today · Remitted this month · Shortfall
- [ ] Payment-status filter on the order list

### 10.5 Website

- [ ] Order detail and tracking show the COD amount and whether it was paid on delivery. Nothing else — there is no payment UI

### Done when

- Delivering an order posts `SALE` + `COGS` **exactly once** (replay the call and confirm no duplicate)
- A failed delivery posts only costs, restocks the goods, and never appears in revenue
- A courier batch with a deliberate shortfall reconciles and reports the difference
- `finance/cash-summary` matches a hand calculation for a small test set

---

## Part 11 — Order operations

**M2 · depends on: 10 · est. 7 d**

**Outcome:** staff run the whole order lifecycle from the dashboard.
**Specs:** phase-2 §4.4 · phase-3 §5.16 · phase-1 §3.19.

### 11.1 Backend

- [ ] **Explicit transition map** validated in the service; every illegal transition is rejected with a clear message:
      `PENDING→CONFIRMED|CANCELLED` · `CONFIRMED→PROCESSING|CANCELLED` · `PROCESSING→PACKED` · `PACKED→SHIPPED` (deduct stock) · `SHIPPED→OUT_FOR_DELIVERY` · `OUT_FOR_DELIVERY→DELIVERED|DELIVERY_FAILED` · `DELIVERY_FAILED→RETURNED_TO_ORIGIN` · `DELIVERED→RETURN_REQUESTED` (Part 13)
- [ ] Every transition writes a timeline entry + audit record and fires a notification hook (Part 21)

| Method | Path                  | Access         | Purpose                                                                                                        |
| ------ | --------------------- | -------------- | -------------------------------------------------------------------------------------------------------------- |
| GET    | `/orders`             | `order.view`   | full filters: date range, status, payment status, source, courier, customer, product, coupon; sort; pagination |
| GET    | `/orders/:id`         | `order.view`   | full detail incl. snapshots and profit summary (`finance.profit.view`)                                         |
| PATCH  | `/orders/:id/status`  | `order.update` | validated transition + note                                                                                    |
| PATCH  | `/orders/bulk/status` | `order.update` | bulk transition                                                                                                |
| PATCH  | `/orders/:id/notes`   | `order.update` | internal note                                                                                                  |
| PATCH  | `/orders/:id/assign`  | `order.update` | assign courier + tracking number                                                                               |
| GET    | `/orders/:id/invoice` | `order.view`   | PDF, marked **Cash on Delivery — collect ৳X**                                                                  |
| GET    | `/orders/export`      | `order.export` | CSV of the current filter                                                                                      |
| GET    | `/orders/stats`       | `order.view`   | KPI + chart series                                                                                             |

### 11.2 Dashboard

- [ ] `Sales/OrdersPage` — filter bar (one row, date range first), table (order #, customer, date, items, total, source `Tag`, payment `Tag`, status `Tag`), row actions, bulk bar, export
- [ ] Order detail page/drawer — items with snapshots, customer, addresses, COD amount + collection state, courier + tracking, timeline, internal notes, status actions, invoice download, profit summary (permission-gated)
- [ ] Unconfirmed queue with call-outcome logging
- [ ] **Charts** — [CHART_STANDARDS §7.2–7.3](CHART_STANDARDS.md): pipeline funnel with drop-off (ordinal ramp) · placed vs delivered multi-line · order→delivery time histogram · delivery outcome by courier as a 100% stacked bar in **status** colours with icon + label · revenue trend line · orders-by-source stacked column (fixed source→colour map) · top-products bar

### 11.3 Website

- [ ] Customer order detail: timeline, invoice download, cancel/return buttons only when eligible
- [ ] Order status changes reflected on the tracking page

### Done when

- An illegal transition (e.g. `PENDING → DELIVERED`) is rejected by the API
- Dispatching deducts stock exactly once; the movement ledger proves it
- The invoice PDF opens with correct totals and the COD amount
- Every chart on the page re-renders from the single filter row

---

## Part 13 — Returns, refunds & cancellations

**M2 · depends on: 11 · est. 5 d — required for launch: RTO is a daily event in COD**

**Outcome:** cancellations, failed deliveries, returns and cash refunds are handled without corrupting stock or finance.
**Specs:** phase-3 §5.16 · phase-2 §4.4 · requirements §16.

### 13.1 Backend — models

- [ ] `returnRequest` — order, items[], reason, type (`return|exchange`), status (`requested|approved|rejected|received|completed`), images[], requestedBy, reviewedBy, notes
- [ ] `refund` — order, returnRequest, amount, type (`full|partial`), reason, **payout method (`cash|bank|mobile_manual`)**, reference, paidBy, paidAt, status (`pending|settled`), proof

### 13.2 Backend — rules

- [ ] **Cancel before dispatch:** releases the reservation, restores coupon usage, posts nothing (no money moved)
- [ ] **Delivery failed → RTO:** restock, post `DELIVERY_COST` + `RTO_COST`, no revenue (Part 10 already wires this)
- [ ] **Return after delivery:** eligibility window from settings; on receipt → restock + `REFUND` posting
- [ ] **Refunds are manual cash-out** — no gateway to reverse; an unsettled refund is a liability until marked settled with method + reference

| Method | Path                                          | Access                                       | Purpose                                 |
| ------ | --------------------------------------------- | -------------------------------------------- | --------------------------------------- |
| POST   | `/orders/:id/cancel`                          | auth (owner, pre-dispatch) or `order.cancel` | cancel                                  |
| PATCH  | `/orders/:id/cancel/approve`, `/reject`       | `order.cancel`                               | staff decision when policy needs review |
| POST   | `/orders/:id/return-request`                  | auth (owner)                                 | request a return                        |
| GET    | `/returns`                                    | `order.view`                                 | queue with filters                      |
| PATCH  | `/returns/:id/approve`, `/reject`, `/receive` | `order.update`                               | workflow; `receive` restocks            |
| POST   | `/refunds`                                    | `order.refund`                               | create full/partial refund              |
| GET    | `/refunds`                                    | `finance.view`                               | list incl. outstanding                  |
| PATCH  | `/refunds/:id/settle`                         | `order.refund`                               | record payout + reference               |
| GET    | `/returns/stats`                              | `order.view`                                 | KPI + chart series                      |

### 13.3 Dashboard

- [ ] `Sales/ReturnsPage` — queue, approve/reject with reason, receive-and-restock action
- [ ] `Sales/RefundsPage` — create refund (confirm modal capturing payout method + reference), outstanding list, settle action
- [ ] **Charts** — [CHART_STANDARDS §7.4](CHART_STANDARDS.md): KPI row (RTO rate, return rate, cancellation rate, refunds outstanding) · RTO/return/cancel three-series trend · ranked reasons bar · RTO by district/courier (bar or heatmap) · settled vs outstanding meter

### 13.4 Website

- [ ] Cancel / return request from order detail with reason (and photo upload for returns)
- [ ] Status visible in the timeline; return policy page linked from checkout and order detail

### Done when

- Cancelling before dispatch releases stock and restores the coupon
- An RTO restocks, costs the business, and never counts as revenue
- A partial refund reduces net revenue by exactly the refunded amount and shows as outstanding until settled

---

## Part 12 — Manual / offline orders

**M3 · depends on: 11 · est. 4 d**

**Outcome:** phone, Facebook, WhatsApp and counter sales flow through the same pipeline as online orders.
**Specs:** phase-3 §5.17 · phase-2 §4.5.

### 12.1 Backend

| Method | Path                       | Access         | Purpose                                 |
| ------ | -------------------------- | -------------- | --------------------------------------- |
| POST   | `/orders/manual`           | `order.create` | create an order on behalf of a customer |
| GET    | `/customers/lookup?phone=` | `order.create` | find or pre-fill an existing customer   |

- [ ] Two cases: **to be delivered** (normal COD lifecycle) and **counter sale** — created already `DELIVERED` + `COLLECTED`, no delivery fee, no COD fee, posts revenue immediately
- [ ] Manual discount and delivery fee allowed with permission; both audited
- [ ] Identical effects to online orders: stock, revenue, COGS, customer history, reports

### 12.2 Dashboard

- [ ] `Sales/ManualOrdersPage` — list filtered to manual sources
- [ ] Create form: customer lookup by phone (or new customer inline) · product picker with live stock and price · qty · manual discount · delivery fee · source select · "cash received now" toggle · note · live totals
- [ ] **Charts** — [CHART_STANDARDS §7.2](CHART_STANDARDS.md): online vs manual/offline stacked bar; manual folded into the shared orders-by-source column. Never a separate "manual sales" pie

### Done when

- A counter sale posts revenue immediately and deducts stock, with no delivery or COD fee
- A phone order behaves exactly like a website order through the whole lifecycle
- Both appear in the same reports as website orders

---

## Part 14 — Reviews & ratings

**M3 · depends on: 11 · est. 4 d**

**Outcome:** verified customers review products; staff moderate; ratings show on the storefront.
**Specs:** phase-3 §5.20 · phase-1 §3.21 · phase-2 §4.6.

### 14.1 Backend

- [ ] `review` — product, customer, order, rating 1–5, title, body, images[], `isVerifiedPurchase` (computed from delivered orders), status (`PENDING|APPROVED|REJECTED|HIDDEN`), moderatedBy, reports[]
- [ ] Product `ratingAvg` / `ratingCount` recomputed on approval or removal — never trusted from the client

| Method       | Path                          | Access                 | Purpose                                          |
| ------------ | ----------------------------- | ---------------------- | ------------------------------------------------ |
| POST         | `/reviews`                    | auth + delivered order | write a review                                   |
| PATCH/DELETE | `/reviews/:id`                | auth (own)             | edit / delete own                                |
| GET          | `/products/:id/reviews`       | public                 | approved only, paginated, sort by recent/helpful |
| GET          | `/reviews/me`                 | auth                   | my reviews                                       |
| GET          | `/reviews`                    | `review.view`          | moderation queue with filters                    |
| PATCH        | `/reviews/:id/status`         | `review.moderate`      | approve / reject / hide                          |
| POST         | `/reviews/:id/report`         | auth                   | report abuse                                     |
| GET          | `/reviews/summary/:productId` | public                 | rating distribution                              |

### 14.2 Dashboard

- [ ] `Catalog/ReviewsPage` — queue with product / rating / status filters, approve / reject / hide, reported-review flag

### 14.3 Website

- [ ] Product page reviews tab: summary (average, distribution bars), list with pagination, verified badge
- [ ] Write-review form, reachable only from a delivered order
- [ ] `/dashboard/reviews` — edit/delete own
- [ ] Homepage reviews section from real approved reviews

### Done when

- A customer who never bought the product cannot review it
- Approving a review updates the product's average rating and shows it on the storefront
- Rejected/hidden reviews are invisible publicly but visible in moderation

---

## Part 15 — Customers & segments

**M3 · depends on: 11 · est. 5 d**

**Outcome:** the business can see who its customers are and how they behave.
**Specs:** phase-2 §4.10 · phase-3 §5.29.

### 15.1 Backend

- [ ] Customer aggregates: totalOrders, totalSpend, AOV, LTV, firstOrderAt, lastOrderAt, RTO count, type (`guest|registered`)
- [ ] Segments: new, returning, VIP, inactive, high-value, guest — rules configurable in settings
- [ ] Activity timeline: orders, reviews, logins, coupon uses, support notes

| Method | Path                                             | Access            | Purpose                                |
| ------ | ------------------------------------------------ | ----------------- | -------------------------------------- |
| GET    | `/customers`                                     | `customer.view`   | list with segment/status/spend filters |
| GET    | `/customers/:id`                                 | `customer.view`   | profile + aggregates                   |
| GET    | `/customers/:id/orders`, `/reviews`, `/activity` | `customer.view`   | related data                           |
| PATCH  | `/customers/:id/status`                          | `customer.update` | block / unblock                        |
| PATCH  | `/customers/:id/notes`                           | `customer.update` | internal note                          |
| GET    | `/customers/segments`                            | `customer.view`   | segment counts + members               |
| GET    | `/customers/analytics`                           | `customer.view`   | new vs returning, cohorts, districts   |
| GET    | `/customers/export`                              | `customer.export` | CSV                                    |

### 15.2 Dashboard

- [ ] `Customers/CustomersPage` + detail modal (profile, addresses, orders, reviews, wishlist summary, coupons, timeline, notes)
- [ ] `Customers/SegmentsPage`, `Customers/CustomerActivityPage`
- [ ] **Charts** — [CHART_STANDARDS §7.9](CHART_STANDARDS.md): KPI row · new vs returning stacked column · segment mix stacked bar (fixed segment→colour map) · **cohort retention heatmap** · top-10 customers bar · orders by district bar. No pie of segments

### 15.3 Website

- [ ] Account overview stat cards (total orders, wishlist items, active coupons) from the same aggregates

### Done when

- Aggregates match a hand count for a test customer
- Blocking a customer prevents new orders from that account and phone
- The cohort heatmap renders with real data and a working table view

---

## Part 16 — Suppliers & purchases

**M3 · depends on: 6 · est. 5 d**

**Outcome:** stock arrives through a recorded purchase, at a recorded cost.
**Specs:** phase-2 §4.9 · requirements §19.

### 16.1 Backend

- [ ] `supplier` — name, phone, email, address, paymentTerms, status, notes
- [ ] `purchase` — purchaseNumber, supplier, items[{ product, variant, qty, unitCost, total }], subtotal, otherCost, grandTotal, paymentStatus (`unpaid|partial|paid`), receivedStatus (`pending|partial|received`), purchaseDate, createdBy

| Method       | Path                     | Access                                | Purpose                |
| ------------ | ------------------------ | ------------------------------------- | ---------------------- |
| GET/POST     | `/suppliers`             | `supplier.view` / `supplier.create`   | list / create          |
| PATCH/DELETE | `/suppliers/:id`         | `supplier.update` / `supplier.delete` | manage                 |
| GET/POST     | `/purchases`             | `purchase.view` / `purchase.create`   | list / create          |
| GET          | `/purchases/:id`         | `purchase.view`                       | detail                 |
| POST         | `/purchases/:id/receive` | `purchase.receive`                    | receive (full/partial) |
| PATCH        | `/purchases/:id/payment` | `purchase.update`                     | record payment         |
| GET          | `/purchases/stats`       | `purchase.view`                       | KPI + charts           |

- [ ] **Receiving is one transaction:** stock movement (`RECEIVE`) + inventory update + **cost-history entry** (Part 17) + `PURCHASE` finance posting

### 16.2 Dashboard

- [ ] `Inventory/SuppliersPage` — CRUD
- [ ] `Inventory/PurchasesPage` — list, create (supplier, line items with unit cost, totals), receive flow (full/partial), payment status
- [ ] Charts: purchase spend by month (column), spend by supplier (bar), unpaid purchases meter

### Done when

- Receiving a purchase raises stock, writes movements, and records the new unit cost
- A partial receive leaves the rest pending and does not over-credit stock

---

## Part 17 — Product cost & COGS

**M4 · depends on: 16 · est. 5 d**

**Outcome:** every sold unit knows what it cost, historically — so profit is real.
**Specs:** phase-3 §5.13, §5.25 · phase-2 §4.12.

### 17.1 Backend

- [ ] `costHistory` — product, variant, effectiveFrom, previousCost, newCost, source (`purchase|manual|import`), reason, purchase ref, createdBy
- [ ] Cost resolution service: `getCostAt(productId, variantId, date)` — orders snapshot the cost **effective at order time**; COGS is computed from snapshots, never from the current cost
- [ ] Cost changes require `product.change_cost`; large changes can route through the approval workflow (Part 18)

| Method | Path                         | Access                | Purpose                                     |
| ------ | ---------------------------- | --------------------- | ------------------------------------------- |
| POST   | `/products/:id/cost`         | `product.change_cost` | set a new cost with reason + effective date |
| GET    | `/products/:id/cost-history` | `product.view_cost`   | full history                                |
| GET    | `/products/cost-list`        | `product.view_cost`   | cost table with margins                     |
| GET    | `/finance/cogs`              | `finance.view`        | COGS for a period, by product/category      |
| GET    | `/finance/margin`            | `finance.profit.view` | margin by product/category                  |

### 17.2 Dashboard

- [ ] Product Costs screen (cost, price, margin %, last change), cost-history modal (timeline of changes with actor + reason)
- [ ] `Finance/CogsPage`
- [ ] Cost columns hidden entirely without `product.view_cost`
- [ ] **Charts** — [CHART_STANDARDS §7.5](CHART_STANDARDS.md): revenue / COGS / gross-profit stacked column by month · unit cost vs selling price multi-line (**one axis**) · cost before→after dumbbell · margin by product/category diverging bar

### Done when

- An order placed before a cost change keeps the old cost basis; one placed after uses the new one
- COGS for a period matches the sum of item cost snapshots for collected orders in that period

---

## Part 18 — Expenses, overhead & approvals

**M4 · depends on: 17 · est. 6 d**

**Outcome:** every business cost is recorded, approved where sensitive, and allocated explainably.
**Specs:** phase-2 §4.13, §4.16 · phase-3 §5.26.

### 18.1 Backend

- [ ] `expenseCategory` — name, type (`fixed|variable`), active (seeded: raw material, packaging, shipping, salary, rent, electricity, internet, marketing, software, office, other)
- [ ] `expense` — amount, date, category, description, paymentMethod, reference, attachment, createdBy, approvalStatus (`pending|approved|rejected`), approvedBy, approvedAt, rejectionReason
- [ ] `overheadConfig` — period, totalOverhead, method (`per_unit|revenue_percent|order_count|product|category|manual`), basis value, allocations[], **recorded method so reports stay explainable**
- [ ] `approvalRequest` (generic) — module, action, targetId, payload, requestedBy, status, reviewedBy, reason — reused by cost change, large discount, refund, stock adjustment, publish

| Method       | Path                                | Access                              | Purpose                      |
| ------------ | ----------------------------------- | ----------------------------------- | ---------------------------- |
| GET/POST     | `/expenses`                         | `expense.view` / `expense.create`   | list / create                |
| PATCH/DELETE | `/expenses/:id`                     | `expense.update` / `expense.delete` | manage                       |
| PATCH        | `/expenses/:id/approve`, `/reject`  | `expense.approve`                   | approval workflow            |
| GET/POST     | `/expense-categories`               | `expense.view` / `expense.update`   | manage categories            |
| GET/PATCH    | `/finance/overhead-config`          | `finance.view` / `finance.update`   | allocation method            |
| POST         | `/finance/overhead/allocate`        | `finance.update`                    | run allocation for a period  |
| GET          | `/approvals`                        | `approval.view`                     | pending queue across modules |
| PATCH        | `/approvals/:id/approve`, `/reject` | per-module permission               | decide                       |

### 18.2 Dashboard

- [ ] `Finance/ExpensesPage` — list with category/date/status filters, create/edit with attachment upload, approval actions
- [ ] Overhead configuration screen (method picker with a live preview: "৳70,000 ÷ 1,000 units = ৳70/unit")
- [ ] Approval centre — one queue for every pending sensitive action
- [ ] **Charts** — [CHART_STANDARDS §7.6–7.7](CHART_STANDARDS.md): expenses — KPI row · ranked expense-by-category bar (≤7 + Other) · monthly stacked column by top-5 category · budget vs actual diverging bar. **No pie.** Overhead — **revenue → net profit waterfall** with every step labelled · allocation-basis stacked bar · overhead-per-unit line · allocated vs unallocated meter

### Done when

- An expense above the configured threshold cannot be finalised without approval
- Changing the allocation method changes per-unit overhead and the reports say which method was used
- The waterfall's steps sum exactly to net profit

---

## Part 19 — Finance engine & dashboard

**M4 · depends on: 18 · est. 8 d**

**Outcome:** one ledger explains every taka, and the dashboard tells the truth about profit.
**Specs:** phase-3 §5.24–5.27 · phase-2 §4.3, §4.12.

### 19.1 Backend

- [ ] `financeTransaction` — type (`SALE|COGS|PURCHASE|EXPENSE|REFUND|COD_FEE|DELIVERY_COST|RTO_COST|MARKETING_COST|ADJUSTMENT`), amount, date, source module + record id, order/customer/product refs, note, createdBy. **Every business event posts here** — nothing is computed on the fly from order documents alone
- [ ] Profit service: gross profit = revenue − COGS; net profit = gross − delivery − COD fee − RTO − refunds − marketing − allocated overhead − operating expenses; margins; ROI = profit / investment × 100; **ROAS = attributed revenue / ad spend, kept separate**
- [ ] COD accounting: revenue only from collected orders · **pending COD as a receivable** · cash in hand vs with courier · delivery success and RTO rates

| Method | Path                               | Access                | Purpose                                       |
| ------ | ---------------------------------- | --------------------- | --------------------------------------------- |
| GET    | `/finance/summary`                 | `finance.view`        | headline numbers for a range                  |
| GET    | `/finance/transactions`            | `finance.view`        | ledger with filters + export                  |
| GET    | `/finance/profit`                  | `finance.profit.view` | gross/net, margins, waterfall steps           |
| GET    | `/finance/roi`, `/finance/roas`    | `finance.profit.view` | separate metrics                              |
| GET    | `/finance/cash`                    | `finance.view`        | in hand, with courier, receivable ageing      |
| POST   | `/finance/transactions/adjustment` | `finance.update`      | manual adjustment with reason (audited)       |
| GET    | `/dashboard/overview`              | auth                  | KPI cards + chart series, permission-filtered |

### 19.2 Dashboard

- [ ] `Overview` — real data; card set from phase-2 §4.3 **plus** Pending COD, Cash in hand, RTO rate, Delivery success rate
- [ ] `Finance/RevenuePage`, profit screen, ROI and ROAS screens, ledger table with export
- [ ] Every finance screen gated by `finance.view` / `finance.profit.view`
- [ ] **Charts** — [CHART_STANDARDS §7.8](CHART_STANDARDS.md): one **hero figure** (net profit) · KPI row · revenue vs net profit line using **emphasis** (net profit accent, revenue grey) · revenue → net profit waterfall · cash in hand vs with courier stacked column · margin vs target line · ROAS by channel bar · ROI trend line. **ROI and ROAS never share a plot; no chart has two y-axes.** One filter row scopes the page

### Done when

- Ledger totals reconcile with order and expense data for a test month, by hand
- Deleting nothing and adjusting only through `ADJUSTMENT` keeps the ledger auditable
- Every KPI on Overview matches the finance endpoints for the same range

---

## Part 20 — Marketing, attribution & loyalty

**M5 · depends on: 19 · est. 8 d**

**Outcome:** the business knows which channel makes money, and has tools to bring customers back.
**Specs:** phase-3 §5.28 · phase-2 §4.11 · requirements §11–13.

### 20.1 Backend

- [ ] `campaign` — name, channel (`facebook|google|whatsapp|influencer|other`), adSpend, startsAt, endsAt, utm parameters, status
- [ ] `promotion` — name, type, rules, schedule, targets
- [ ] Attribution on the order: source, medium, campaign, content, referrer, landingPage, firstTouch/lastTouch
- [ ] Abandoned cart detection (cart untouched N hours, has items, has contact) + recovery token
- [ ] `loyaltyConfig` + `loyaltyLedger` — earn rate, redeem rate, expiry, per-order cap
- [ ] `referral` — code per customer, referred orders, reward rules

| Method                | Path                                     | Access            | Purpose                                                 |
| --------------------- | ---------------------------------------- | ----------------- | ------------------------------------------------------- |
| GET/POST/PATCH/DELETE | `/campaigns`                             | `campaign.*`      | manage campaigns + ad spend                             |
| GET/POST/PATCH/DELETE | `/promotions`                            | `campaign.*`      | manage promotions                                       |
| GET                   | `/marketing/analytics`                   | `campaign.view`   | orders/revenue/profit by channel, ROAS, CAC, conversion |
| GET                   | `/marketing/attribution`                 | `campaign.view`   | source → order → revenue path                           |
| GET                   | `/carts/abandoned`                       | `campaign.view`   | list with contact + value                               |
| POST                  | `/carts/abandoned/:id/recover`           | `campaign.update` | send recovery message                                   |
| GET                   | `/loyalty/me`, POST `/loyalty/redeem`    | auth              | customer points                                         |
| GET/PATCH             | `/loyalty/config`                        | `settings.update` | rules                                                   |
| GET                   | `/referrals/me`, POST `/referrals/apply` | auth              | referral code + apply                                   |
| GET                   | `/referrals`                             | `campaign.view`   | admin view                                              |

### 20.2 Dashboard

- [ ] `Marketing/CampaignsPage`, `Marketing/PromotionsPage`, marketing analytics screen, abandoned-cart list with recovery action, loyalty/referral config
- [ ] Charts: revenue by channel bar · ROAS by channel bar · spend vs attributed revenue (two series, one axis, both ৳) · abandoned vs recovered stacked column · CAC trend line

### 20.3 Website

- [ ] UTM capture on landing → persisted to the cart → written onto the order
- [ ] Loyalty points and referral code in the account area
- [ ] Abandoned-cart recovery link restores the cart

### Done when

- An order placed after clicking a UTM link is attributed to that campaign
- ROAS for a campaign matches attributed revenue ÷ its ad spend by hand
- A recovery link restores the exact cart

---

## Part 21 — Notifications & realtime

**M5 · depends on: 11 (order emails needed at launch) · est. 5 d**

**Outcome:** customers and staff are told what happened, in-app and by email/SMS.
**Specs:** requirements §12, §26 · phase-2 §4.19.

### 21.1 Backend

- [ ] `notification` — user, type, title, body, data, readAt, channel
- [ ] `notificationTemplate` — key, subject, body (bn/en), channel, variables
- [ ] Triggers: order placed · order confirmed · dispatched · out for delivery · delivered · failed · return approved · refund settled · low stock (staff) · new order (staff) · approval pending (staff)
- [ ] Channels: in-app (always), email (nodemailer, templates), SMS adapter interface (BD provider pluggable — OTP and dispatch alerts first)
- [ ] Socket.IO server: staff room (new order, low stock) and customer room (order status)

| Method         | Path                                   | Access            | Purpose                   |
| -------------- | -------------------------------------- | ----------------- | ------------------------- |
| GET            | `/notifications`                       | auth              | list                      |
| GET            | `/notifications/unread-count`          | auth              | badge                     |
| PATCH          | `/notifications/:id/read`, `/read-all` | auth              | mark read                 |
| GET/POST/PATCH | `/notification-templates`              | `settings.update` | manage templates          |
| PATCH          | `/settings/notifications`              | `settings.update` | channel toggles per event |

**Launch subset (do this during M2):** order placed + confirmed + dispatched + delivered emails, and the OTP SMS/email. The rest can follow in M5.

### 21.2 Dashboard & website

- [ ] Dashboard: notification bell + list, live new-order and low-stock toasts via socket
- [ ] Website: `/dashboard/notifications`, live order-status updates on order detail and tracking

### Done when

- Placing an order sends the customer a confirmation email with the correct COD amount
- A staff member sees a new-order toast without refreshing
- Templates render Bengali correctly in real inboxes (test Gmail + one Bangladeshi provider)

---

## Part 22 — Reports & exports

**M5 · depends on: 19 · est. 6 d**

**Outcome:** every business question has an answerable, exportable report.
**Specs:** phase-2 §4.18.

### 22.1 Backend

| Method | Path                  | Access                | Purpose                                |
| ------ | --------------------- | --------------------- | -------------------------------------- |
| GET    | `/reports/sales`      | `report.view`         | by day/product/category/source         |
| GET    | `/reports/orders`     | `report.view`         | volume, status mix, fulfilment time    |
| GET    | `/reports/products`   | `report.view`         | units, revenue, margin, returns        |
| GET    | `/reports/categories` | `report.view`         | performance by category                |
| GET    | `/reports/inventory`  | `report.view`         | stock value, ageing, movement          |
| GET    | `/reports/purchases`  | `report.view`         | supplier spend                         |
| GET    | `/reports/expenses`   | `report.view`         | by category, approval state            |
| GET    | `/reports/profit`     | `finance.profit.view` | gross/net, margins                     |
| GET    | `/reports/customers`  | `report.view`         | acquisition, retention, LTV            |
| GET    | `/reports/marketing`  | `report.view`         | channel performance                    |
| GET    | `/reports/coupons`    | `report.view`         | usage, discount cost, revenue          |
| GET    | `/reports/roi`        | `finance.profit.view` | ROI / ROAS                             |
| POST   | `/products/import`    | `product.import`      | CSV import with dry-run + error report |

- [ ] Every report accepts the same filter contract (date range, product, category, customer, source, status, staff) and `?format=json|csv|xlsx`
- [ ] Exports stream (never buffer a whole month in memory); large exports run as a job with a download link

### 22.2 Dashboard

- [ ] Reports section with one filter row, chart + table per report, CSV/Excel export buttons, print-ready layout
- [ ] Charts follow the same standards; no new colour decisions

### Done when

- Every report's CSV opens in Excel with Bengali text intact (UTF-8 BOM)
- A 12-month export completes without timing out
- Numbers agree with the finance dashboard for the same range

---

## Part 23 — Audit log, CMS & SEO

**M6 · depends on: 11 · est. 5 d**

**Outcome:** sensitive actions are traceable, and content/SEO are managed without deploys.
**Specs:** phase-2 §4.17 · phase-1 §3.24–3.25 · requirements §29.

### 23.1 Backend

- [ ] `auditLog` — user, action, module, recordId, before, after, ip, userAgent, createdAt; written by a helper from every sensitive service path (price, cost, stock adjust, refund, permission change, expense approval, settings change, order status)
- [ ] `page` — slug, title (bn/en), content (rich text, sanitised), SEO, status — Terms, Privacy, Return Policy, FAQ, About, Contact
- [ ] SEO settings + sitemap/robots data sources

| Method                | Path                             | Access         | Purpose                            |
| --------------------- | -------------------------------- | -------------- | ---------------------------------- |
| GET                   | `/audit-logs`, `/audit-logs/:id` | `audit.view`   | filterable trail with before/after |
| GET                   | `/pages/:slug`                   | public         | CMS content                        |
| GET/POST/PATCH/DELETE | `/pages`                         | `page.*`       | manage                             |
| GET/PATCH             | `/settings/seo`                  | `settings.seo` | defaults, OG image, analytics IDs  |

### 23.2 Dashboard & website

- [ ] Activity Logs screen with module/user/date filters and a before→after diff view
- [ ] CMS editor using `RichTextEditor` (HTML sanitised server-side **and** on render)
- [ ] Website: informational pages from CMS, `sitemap.ts`, `robots.ts`, canonical URLs, Organization / Product / Breadcrumb JSON-LD, OG images

### Done when

- Changing a product price writes an audit entry with old and new values and the actor
- Editing the return policy in the dashboard updates the public page
- `sitemap.xml` lists every published product and category

---

## Part 24 — Hardening, performance & deploy

**M6 · depends on: everything · est. 7 d**

**Outcome:** the system is safe to run in production and fast enough to keep customers.
**Specs:** phase docs §9–§11.

### 24.1 Security

- [ ] Rate limiting: auth, OTP, order confirmation, order tracking, coupon validation, search
- [ ] `helmet`, mongo-sanitize, strict CORS allow-list, payload caps, HTTPS-only cookies in production
- [ ] Refresh-token rotation + reuse detection; session/device list; force logout (`GET /auth/sessions`, `DELETE /auth/sessions/:id`)
- [ ] Upload validation (mimetype, magic bytes, size), no path traversal, no public bucket listing
- [ ] Production error responses without stacks; secrets audit; dependency audit
- [ ] **COD risk controls:** blocked-phone list (`GET/POST/DELETE /risk/blocked-phones`), per-phone open-order cap, repeat-RTO flagging that forces confirmation, duplicate-order detection, fraud view in the dashboard. In a COD business this is the difference between profit and loss

### 24.2 Performance

- [ ] Index review against real query patterns (`explain()` the top 20 queries); pagination caps; projection instead of full documents
- [ ] N+1 removal in list endpoints; aggregation pipelines for stats endpoints
- [ ] Website: image sizing, `next/image` everywhere, bundle analysis, Lighthouse ≥ 90 mobile, Bengali font subsetting/preload
- [ ] Dashboard: route-level code splitting, memoised heavy tables/charts

### 24.3 Accessibility & QA

- [ ] Keyboard navigation, visible focus, ARIA labels, AA contrast (phase-1 §3.27)
- [ ] Full regression pass over every part's "Done when" list
- [ ] Cross-browser + real device check (low-end Android, 3G throttling)

### 24.4 Deploy & operations

- [ ] `.env.example` complete for all three projects; production env set
- [ ] Backend deploy (PM2 or Docker) behind Nginx with TLS; website on Vercel or Node; dashboard as static build with SPA rewrites (`_redirects` already present)
- [ ] MongoDB production replica set + automated daily backups + tested restore
- [ ] Logging (rotated), uptime monitoring, error alerting, `/health` checks
- [ ] Runbook: deploy, rollback, restore, seed, credential rotation

### Done when

- A penetration pass finds no unauthenticated access to protected data
- Lighthouse mobile ≥ 90 on home, category and product pages
- A restore from backup into a clean database succeeds
- Every phase-doc acceptance checklist is ticked

---

# F. Cross-cutting checklists

**Every part, before merge** ([CODING_RULES §7](CODING_RULES.md)): backend module complete with auth + permission · `QueryBuilder` + `meta` on lists · transactions on multi-collection writes · audit on sensitive writes · types in both frontends · dashboard endpoints with tags + pages from the reusable inventory + route/sidebar permission · website server fetch with cache tags + `revalidateTag` on mutations · dummy data deleted · loading/empty/error/validation/success states · design matched at 375/768/1440 · charts per CHART_STANDARDS · gate green · flow driven manually.

**Security (continuous):** no client-computed money · no client-sent role or permission · every protected route double-checked server-side · no secrets in `NEXT_PUBLIC_*`/`VITE_*` · every list endpoint paginated and capped.

**Data integrity (continuous):** nothing hard-deleted · order snapshots never re-resolved · stock only via the four primitives · finance only via ledger postings · every status change through its transition map.

# G. Risk register

| Risk                                                                  | Impact                                                      | Mitigation                                                                                                               |
| --------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Mongo standalone can't do transactions**                            | Parts 6, 9, 10, 13, 16, 19 silently break or can't be built | Replica set / Atlas **before Part 0** (§E)                                                                               |
| **COD fake orders & RTO losses**                                      | Direct cash loss on every failed delivery                   | Order confirmation in Part 9; risk controls in Part 24; RTO rate on the dashboard from Part 11                           |
| **Revenue recognised at placement**                                   | Every profit number inflated by the failure rate            | Enforced in Part 10; explicitly tested in its "Done when"                                                                |
| **Very new majors** (Express 5, Mongoose 9, Zod 4, Next 16, React 19) | Training-data patterns don't apply; silent API drift        | Part 0 fixes the known breaks; read `node_modules/next/dist/docs/` before App Router work; never copy old-major snippets |
| **Recharts v2 (dashboard) vs v3 (website)**                           | Chart components diverge                                    | Shared token layer + per-project wrappers; align versions during Part 0 if cheap                                         |
| **Stale inherited docs** (Yatos / eKayzone / transport marketplace)   | Wrong feature assumptions                                   | Rules live in CODING_RULES + this plan; treat old docs as component reference only ([CLAUDE.md](CLAUDE.md))              |
| **Single developer**                                                  | Bus factor, no review                                       | Small branches, per-part demos, this plan as the handover document                                                       |
| **Courier API availability**                                          | Delivery/remittance may stay manual longer                  | Courier adapters isolated; manual entry always works                                                                     |
| **SMS provider cost/deliverability in BD**                            | OTP failures block signup and order confirmation            | Email OTP as fallback from day one; provider behind an interface                                                         |
| **Scope creep from the phase docs**                                   | Launch slips                                                | MVP = Parts 0–11 + 13; everything else is post-launch, explicitly                                                        |

# H. Go-live checklist (end of M2)

- [ ] Parts 0–11 and 13 complete, each with its "Done when" verified
- [ ] Launch notification subset from Part 21 (order emails + OTP) live
- [ ] Real catalog loaded: categories, products, images, prices, stock, delivery zones
- [ ] Super admin + real staff accounts with correct roles; test accounts removed
- [ ] Production env vars, domain, TLS, Cloudinary, SMTP verified in production
- [ ] Backups running and a restore tested
- [ ] Full order rehearsal in production: place → confirm → dispatch → deliver → collect → remit, plus one RTO and one refund
- [ ] Legal pages published (terms, privacy, return policy), contact and WhatsApp live
- [ ] Analytics/pixel installed; sitemap and robots served
- [ ] Rollback plan written and understood

# I. Post-launch backlog (from requirements §13 roadmap)

Multi-branch/warehouse operations · POS · mobile app (the API is already the single source) · advance-payment or gateway support if the COD-only decision is revisited · supplier portal · advanced BI · multi-currency/multi-language · subscription boxes · B2B/wholesale pricing tiers.

# J. Progress tracker

| Part | Scope                            | Milestone | Est. | Status |
| ---- | -------------------------------- | --------- | ---- | ------ |
| 0    | Foundation & repair              | M0        | 5 d  | ☐      |
| 1    | Auth, users & RBAC               | M0        | 8 d  | ☐      |
| 2    | Uploads, settings & site content | M0        | 4 d  | ☐      |
| 3    | Category & brand                 | M1        | 4 d  | ☐      |
| 4    | Product & variant                | M1        | 10 d | ☐      |
| 5    | Search, filter & sort            | M1        | 4 d  | ☐      |
| 6    | Inventory & stock                | M2        | 6 d  | ☐      |
| 7    | Cart & wishlist                  | M2        | 5 d  | ☐      |
| 8    | Delivery, couriers & coupons     | M2        | 5 d  | ☐      |
| 9    | Checkout & orders                | M2        | 10 d | ☐      |
| 10   | COD collection & remittance      | M2        | 6 d  | ☐      |
| 11   | Order operations                 | M2        | 7 d  | ☐      |
| 13   | Returns, refunds & cancellations | M2        | 5 d  | ☐      |
| —    | **GO LIVE**                      | —         | —    | ☐      |
| 12   | Manual / offline orders          | M3        | 4 d  | ☐      |
| 14   | Reviews & ratings                | M3        | 4 d  | ☐      |
| 15   | Customers & segments             | M3        | 5 d  | ☐      |
| 16   | Suppliers & purchases            | M3        | 5 d  | ☐      |
| 17   | Product cost & COGS              | M4        | 5 d  | ☐      |
| 18   | Expenses, overhead & approvals   | M4        | 6 d  | ☐      |
| 19   | Finance engine & dashboard       | M4        | 8 d  | ☐      |
| 20   | Marketing, attribution & loyalty | M5        | 8 d  | ☐      |
| 21   | Notifications & realtime         | M5        | 5 d  | ☐      |
| 22   | Reports & exports                | M5        | 6 d  | ☐      |
| 23   | Audit log, CMS & SEO             | M6        | 5 d  | ☐      |
| 24   | Hardening, performance & deploy  | M6        | 7 d  | ☐      |
