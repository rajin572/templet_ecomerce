# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Read these before writing code

- **[CODING_RULES.md](CODING_RULES.md)** — binding rules for how code gets written here: the fetch wrapper to use per project (Next `fetch` / `fetchWithAuth` / `clientFetch` / RTK `baseApi`), `tryCatchWrapper` on every mutation, the reusable-component inventories, backend module layout, the API envelope, and the typecheck gate every change must pass.
- **[CHART_STANDARDS.md](CHART_STANDARDS.md)** — required reading before any chart, graph, KPI row or dashboard layout: the validated categorical/sequential/diverging/status palette (light + dark), which form fits which data job, mark and interaction specs, and the chart list for each analytics module (inventory, sales, orders, returns, cost, allocation, expenses, finance, customers).
- **[BUILD_PLAN.md](BUILD_PLAN.md)** — the complete project plan: 25 dependency-ordered parts grouped into six milestones, with every model, endpoint, screen and task spelled out. Each part is one vertical slice (backend API → shared types → dashboard → website → design → charts → green typecheck) and carries its own "Done when" acceptance list. It also holds the master schedule, the working agreement per part, environment setup, the risk register and the go-live checklist. **Find the current part there before starting anything**, and run the §E environment setup (especially the MongoDB replica set) before Part 0.

## What this is

**ECommerce** — a Bengali-market e-commerce + business-management platform (spices/food products first, designed to scale to any catalog). **Payment is Cash on Delivery by default, with an optional manual bKash/Nagad transfer** the customer can choose instead at checkout — no automated payment gateway, no card processing, no webhooks. COD money moves after delivery and is recognised on collection; a manual bKash/Nagad payment is entered by the customer (wallet number + Transaction ID) and stays pending until staff verify it against the wallet statement. Courier remittance on COD orders is tracked as a receivable (see [CODING_RULES.md §4.6](CODING_RULES.md)). Three **independent** npm projects sit side by side in this folder. This is not a monorepo and not a git repo: there is no root `package.json`, no workspaces, no shared lockfile. Each project installs, builds and runs on its own.

| Folder                                         | Role                              | Stack                                                                                                |
| ---------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [e-commerce-website/](e-commerce-website/)     | Customer storefront (Phase 1)     | Next.js 16 App Router, React 19, Tailwind v4, shadcn, Zustand, GSAP/Lenis                            |
| [e-commerce-dashboard/](e-commerce-dashboard/) | Admin/staff back office (Phase 2) | Vite + React 19 SPA, TypeScript, Redux Toolkit + RTK Query, react-router-dom v7, Tailwind v4, shadcn |
| [e-commerce-backend/](e-commerce-backend/)     | REST API (Phase 3)                | Express 5, Mongoose 9, Zod 4, JWT, Cloudinary, nodemailer                                            |

The root `.md` files are the specs, and they are the source of truth for scope:

- [ecommerce_project_requirements.md](ecommerce_project_requirements.md) — original brief (mixed Bengali/English).
- [phase-1-complete-website-design.md](phase-1-complete-website-design.md), [phase-2-complete-dashboard-design.md](phase-2-complete-dashboard-design.md), [phase-3-complete-backend-design.md](phase-3-complete-backend-design.md) — each file repeats the same shared sections (§1–2 vision/requirements, §6–13 business modules, finance rules, RBAC, security, deployment). The phase-specific content is §3 in phase 1, §4 in phase 2, §5 in phase 3 — read those, skip the duplicated remainder.
- [website_design_reference/](website_design_reference/) — storefront visual reference screenshots.

## Commands

Run everything from inside the project folder; there is no root-level runner.

```bash
# e-commerce-backend  (Express API, port 5000, MongoDB at DATABASE_URL or localhost/ECommerce)
npm run start:dev     # ts-node-dev --transpile-only (no typecheck — see "Current state")
npm run build         # tsc -> dist/
npm start             # node dist/server.js

# e-commerce-dashboard  (Vite SPA, http://localhost:5173)
npm run dev
npm run build         # tsc -b && vite build
npm run lint          # currently broken — no eslint config exists
npm run preview

# e-commerce-website  (Next.js, http://localhost:3000)
npm run dev           # next dev --turbopack
npm run build
npm start
npm run lint
```

There is no test framework, no test script and no test files in any of the three projects. "Verify it works" here means running the dev server and driving the actual screen.

## Architecture

### Backend — layered module pattern

`src/modules/<name>/` holds the full vertical slice: `.interface.ts` → `.model.ts` → `.validation.ts` (Zod) → `.service.ts` (all business logic + DB access) → `.controller.ts` (thin, wrapped in `catchAsync`, replies via `sendResponse`) → `.routes.ts`. Modules are mounted in [src/app/routes/index.ts](e-commerce-backend/src/app/routes/index.ts) under `/api/v1`.

Cross-cutting pieces: `ApiError` + `globalErrorHandler` (normalises Zod errors and `ApiError` into `{ success, message, errorMessages, stack }`), `validateRequest(schema)` (validates `{body, query, params, cookies}` together, so schemas must nest under a `body:` key), `sendResponse` (uniform `{ statusCode, success, message, meta, data }`), `jwtHelpers`, `emailSender`, `fileUpload` (multer → Cloudinary), `invoiceGenerator` (pdfkit).

[generate-backend.js](e-commerce-backend/generate-backend.js) scaffolds a module set from an array of names and **overwrites existing files unconditionally**, including `src/app/routes/index.ts`. Don't re-run it after hand-editing modules.

### Dashboard — RTK Query SPA

- **Single API surface:** [src/redux/api/baseApi.ts](e-commerce-dashboard/src/redux/api/baseApi.ts) is the only `createApi`; feature files call `baseApi.injectEndpoints`. Do not modify `baseApi`. Cache tags live in [src/redux/tagTypes.ts](e-commerce-dashboard/src/redux/tagTypes.ts) — add new tags there and register them in `tagTypesList`.
- **Auth:** JWT in cookies, decoded client-side. `useUserData()` reads `ECommerce_main_accessToken` through `useSyncExternalStore` (dispatch `TOKEN_UPDATED_EVENT` after login/logout so subscribers re-read). `baseApi.prepareHeaders` sends the token as a `token` header (plus the forgot-password/OTP-match tokens for those flows).
- **Routing:** [src/Routes/admin.route.tsx](e-commerce-dashboard/src/Routes/admin.route.tsx) is a single grouped array of `{title, url, icon, element}` that feeds **both** the sidebar and `routeGenerator()` — adding a page there wires up nav and route at once. Everything under `/admin` is behind `ProtectedRoute role={["admin","super_admin","staff"]}`; `/`, `/dashboard`, `/overview` all redirect through `AuthRedirect`.
- **Mutations always go through `tryCatchWrapper`** (`src/utils/tryCatchWrapper.ts`), never `.unwrap()` or bare try/catch — it owns the loading/success/error toasts.

### Website — App Router storefront

- Route groups map to layouts: `(mainLayout)` = header/footer storefront, `(dashboardLayout)` = logged-in customer account area (sidebar + topbar), `(auth)` = sign-in/sign-up/OTP/reset flows.
- **Data access has two paths.** Server side: `"use server"` modules under `src/service/` (see [AuthServiceAPi.ts](e-commerce-website/src/service/AuthService/AuthServiceAPi.ts)) call the API and set cookies via `next/headers`; `fetchWithAuth` (`src/lib/fetchWraper.tsx`) injects the token for authenticated server calls. Client side: `clientFetch` (`src/lib/clientFetch.ts`) reads the cookie via `js-cookie` and sets the `Authorization` header. Refresh-token handling is written but commented out in both.
- **Auth cookies** (deliberately not httpOnly, because client code reads them): `ECommerce_access_token`, `ECommerce_refresh_token`, plus short-lived `ECommerce_signup_token` / `ECommerce_forget_token` / `ECommerce_forgot_otp_match_token` that gate each step of the signup and password-reset chains. Login rejects any JWT whose `role !== "user"`.
- **Cart** is client-only Zustand with `persist` (`e-commerce-cart-storage`), not server state.
- **Bengali-first:** `<html lang="bn">`, Hind Siliguri (`--font-hind-siliguri`) for both body and headings, UI copy and dummy data in Bengali, prices in ৳.
- Mutations use the same `tryCatchWrapper` contract as the dashboard (`src/utils/tryCatchWrapper.ts`).

### Shared contracts across the three projects

- **API envelope:** `{ success, statusCode, message, data, meta? }`, with list endpoints returning `data.data[]` + `data.meta` (`page`/`limit`/`total`). Frontend types mirror this shape (`IGet<X>Response`).
- **`tryCatchWrapper`** exists in both frontends with the same signature — `wrapper(triggerFn, { body, params }, { toastLoadingMessage, ... })` returning `{ success, message, data }`.
- **Design tokens, not hex.** Dashboard: `text-base-color`, `text-secondbase-color`, `bg-secondary-color`, `bg-background-color`, `bg-primary-color`. Website [globals.css](e-commerce-website/src/app/globals.css) carries two token sets — the live brand palette is the `:root` shadcn one (primary orange `#F97316`, `--badge-new/sale/combo/bestsell`, dark-mode overrides under `.dark`); the `@theme default` block (emerald `--color-secondary-color`) is template leftovers still referenced by a few layouts. New website work should use the `:root`/shadcn tokens.
- `@/` resolves to `src/` in all three frontend-side configs.

## Current state (verified 2026-08-19)

The repo is mid-scaffold. Assume nothing is wired end to end unless you check.

- **Backend:** only `auth` (OTP signup, login, forgot/reset password) and the `user`/`category` models carry real logic. `product`, `order`, `customer`, `finance`, `settings`, `staff` are still the one-field `{ name?: string }` stubs emitted by the generator. There is **no auth/RBAC middleware yet** — nothing verifies a JWT on protected routes, despite spec §5.8.
- **`npm run build` fails in the backend** (~18 tsc errors): Zod 4 removed `AnyZodObject`/`ZodEffects`/`required_error`, `multer-storage-cloudinary` is imported by `src/utils/fileUpload.ts` but not in `package.json`, plus `jsonwebtoken` v9 `expiresIn` typing and Mongoose hook typing. `npm run start:dev` runs regardless because `ts-node-dev --transpile-only` skips typechecking — so a green dev server does not mean the code compiles.
- **`npm run build` fails in the dashboard** (3 errors in `src/pages/Auth/SignIn.tsx` and `authApi.ts` — the RTK mutation trigger doesn't match the `tryCatchWrapper` response type). **`npm run lint` fails**: the script and the eslint plugins are installed but no `eslint.config.js` exists.
- **Website builds clean** (24 routes prerendered).
- **Most frontend pages are design scaffolds fed by local `DUMMY_*` arrays**, not the API. The dashboard's page files were emitted by [generate-pages.js](e-commerce-dashboard/generate-pages.js) and its API slices by [generate-redux.cjs](e-commerce-dashboard/generate-redux.cjs); both overwrite unconditionally.
- **Neither frontend points at this backend.** `e-commerce-dashboard/.env` targets a devtunnels host and `e-commerce-website/.env` targets `api.beyondstyles.co.uk`. To work against the local API, set them to `http://localhost:5000/api/v1` (`VITE_PUBLIC_SERVER_URL` / `NEXT_PUBLIC_BASE_API`).
- **Route names don't line up yet.** The generator's naive pluralisation mounts `/api/v1/auths`, `/api/v1/settingss`, `/api/v1/staffs`, while the dashboard's RTK endpoints call `/auth/login`, `/products`, `/orders`. Fix the backend mounts rather than bending the clients.
- Backend `.env` currently holds only `EMAIL_USER`/`EMAIL_PASS`; `DATABASE_URL`, `PORT`, `JWT_SECRET`, `JWT_EXPIRES_IN` and the `CLOUDINARY_*` keys all fall back to defaults or are missing.

## Inherited docs — read with care

Several in-project docs were copied from earlier client projects and never fully rewritten. Their **conventions and component APIs are accurate and worth following**; their project descriptions, feature inventories and stack claims are not.

- [e-commerce-dashboard/AGENTS.md](e-commerce-dashboard/AGENTS.md) — the working contract for dashboard code. §2 (golden rules), §3 (new-page workflow), §4 (API rules), §5–7 (design system, forms, naming) apply as written. Ignore §1's "luxury transport marketplace" description and §9's completed-work table — both belong to the previous project.
- [e-commerce-dashboard/PROJECT_GUIDE.md](e-commerce-dashboard/PROJECT_GUIDE.md) — deep reference for the reusable component library, form system and utilities, written as "Yatos Admin Dashboard". Component signatures still match; endpoint lists and page inventory do not.
- [e-commerce-website/project_structure.md](e-commerce-website/project_structure.md) — an eKayzone spec. It mandates TanStack Query and a reels/video engine, **none of which exist here** (no TanStack Query in `package.json`). Treat only its general React/Next patterns as advice, and verify against `package.json` before following it.
- `e-commerce-website/CLAUDE.md` is just `@AGENTS.md`, and that `AGENTS.md` is the auto-generated Next.js block telling you to read `node_modules/next/dist/docs/` — Next 16 differs from older training data, so do that before writing App Router code.

## Working conventions

Beyond the dashboard AGENTS.md rules, which apply to the whole repo in spirit:

- Type every API response in `src/types/` with an `I` prefix and re-export from `src/types/index.ts`. No `any` without an eslint-disable and a reason.
- Reuse before creating: `ReusableTable`, `ReuseableModal`/`ReuseableSheet`, `ConfirmModal`, `ReuseSearchInput`, `ReuseFilterSelect`, `ReuseTag`, `SpinLoader`, `PageWraper`, and the `ReuseForm/Form*` field components (dashboard `src/Components/ui/CustomUi/`, website `src/components/ui/CustomUi/`).
- Forms are react-hook-form + Zod via `zodResolver`; populate edit forms with `reset(record)` in a `useEffect`.
- List endpoints paginate with `page`/`limit` and search with `searchTerm` (send it only when non-empty). Skip detail queries with `{ skip: !open || !id, refetchOnMountOrArgChange: true }`.
- When the user supplies a screenshot, it is the spec — match it exactly and verify by running the app and looking at the screen, not by reading the code.
