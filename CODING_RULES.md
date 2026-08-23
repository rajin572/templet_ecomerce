# CODING_RULES.md — how code gets written in this repo

Binding rules for every change in `e-commerce-website`, `e-commerce-dashboard` and `e-commerce-backend`. Read this before writing code; read [BUILD_PLAN.md](BUILD_PLAN.md) to know _which_ part you are building. Repo map and current state: [CLAUDE.md](CLAUDE.md).

**Before writing any chart, graph, KPI row, stat tile or dashboard layout, read [CHART_STANDARDS.md](CHART_STANDARDS.md)** — it carries the validated palette, the form-per-job table, mark specs, and the per-module chart list. Charts are never freestyled, and recharts is never imported directly into a page.

---

## 0. The four non-negotiables

1. **Reusable components always.** Never hand-roll a table, modal, form field, search box, pagination, tag or spinner. The inventories are in §2.4 (website) and §3.5 (dashboard). **For Modal, table and other components, your first priority MUST be to search the inventory and use an existing reusable component.** For forms, you MUST use the provided reusable forms (e.g., ReuseForm). If a shared component's default look fights the design, extend the component with a prop — don't fork it.
2. **Every network call goes through a wrapper.** Website reads → Next `fetch` in a server component or a `"use server"` service; website authenticated calls → `fetchWithAuth`; website client calls → `clientFetch`; dashboard → RTK Query `baseApi.injectEndpoints`. **Raw `fetch(...)`/`axios` in a component is a bug.**
3. **Every mutation goes through `tryCatchWrapper`.** Never `.unwrap()`, never a bare `try/catch` around a mutation in the UI. The wrapper owns loading/success/error toasts and error normalisation.
4. **Every static text is localized.** A user-visible string literal written into a website component is a bug — it comes from `src/i18n/dictionaries/{bn,en}.json`, and both files change in the same commit. Details in §2.6.

Plus one gate: **a part is not done until §6 passes green.** No `any`, no unused symbols, no failing typecheck.

---

## 1. Universal rules (all three projects)

### 1.1 Types

- Every API request and response has a TypeScript interface. Interfaces are `I`-prefixed (`IProduct`, `IGetProductsResponse`).
- Types live in `src/types/<feature>.type.ts` and are re-exported from `src/types/index.ts` in **both** frontends. Backend domain types live in `src/modules/<name>/<name>.interface.ts`.
- `any` is banned. If unavoidable, add `// eslint-disable-next-line @typescript-eslint/no-explicit-any` **with a one-line reason**.
- Response types mirror the server envelope exactly (§4). Don't invent a flatter shape and cast to it.

### 1.2 No fake data

Once a part's API exists, the UI reads the API — no `DUMMY_*` arrays, no hardcoded counts, no placeholder totals. The scaffolding data currently in the dashboard pages and website home is temporary and must be deleted by the part that wires the real endpoint.

Design-only exception (only when the endpoint genuinely does not exist yet): write the real endpoint + hook first, verify the request shape in the network tab, then comment out the call with a `// TODO: wire to <hook> once the endpoint exists.` marker directly above the fallback array. Never ship dummy data without that commented real call beside it.

### 1.3 Cleanliness

- No `console.log` outside `tryCatchWrapper` and server-side error logging.
- No dead imports, no commented-out code (except the §1.2 TODO pattern), no unused locals or params — strict mode fails the build on them.
- Comments explain **why**, never what. No decorative comment blocks.
- Never delete records: use `isDeleted` / `status: "archived"` and filter in queries.

### 1.4 Money, dates, IDs

- **Money is stored as an integer in poisha** (`৳1,250.50` → `125050`) on the backend and in every DTO. Format only at the render edge (`formatMoney(value)` → `৳1,250.50`). Never do arithmetic on floats, never send a computed total from the client.
- Dates: ISO 8601 strings across the wire; render with `formatDate` / `formatDateTime` from `src/utils/dateFormet.ts` — never `new Date().toLocaleString()` inline.
- IDs: Mongo `_id` as `string` in DTOs. Customer-facing order references are separate, non-sequential, non-guessable (`orderNumber`).

### 1.5 Security posture

- The server never trusts the client for: prices, discounts, delivery fees, totals, stock, cost, role, permissions, or order status. Recompute or re-read all of it server-side.
- Hidden UI is not authorisation. Every protected route carries backend auth + permission middleware regardless of what the frontend hides.
- No secrets in client components or in `NEXT_PUBLIC_*` / `VITE_*` variables.

---

## 2. Website — `e-commerce-website` (Next.js 16, App Router)

### 2.1 The fetch decision table

| Situation                                                                                          | Use                                                                                                                        | Where                                                          |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Public, SEO-relevant, first paint (home, shop, category, product detail, CMS pages)                | **Next `fetch`** in an async **server component** with `next: { revalidate, tags }`                                        | `page.tsx` or a server-only `src/service/<Feature>/…` function |
| Authenticated read on the server (account, orders, addresses)                                      | `fetchWithAuth` from [src/lib/fetchWraper.tsx](e-commerce-website/src/lib/fetchWraper.tsx) inside a `"use server"` service | `src/service/<Feature>/<feature>Api.ts`                        |
| Any mutation (login, add to cart on server, place order, review, profile)                          | `"use server"` action in `src/service/…` calling `fetchWithAuth`, invoked from the UI through `tryCatchWrapper`            | service + client component                                     |
| Client-side read after interaction (search suggestions, filter re-query, infinite scroll, polling) | `clientFetch` from [src/lib/clientFetch.ts](e-commerce-website/src/lib/clientFetch.ts)                                     | `"use client"` component                                       |

Rules that follow from it:

- Base URL always comes from `getBaseUrl()` / `getServerUrl()` in `src/helpers/config/envConfig.ts`. No literal hosts in code.
- Every server `fetch` declares its caching intent explicitly: `{ next: { revalidate: 300, tags: ["products"] } }` for catalog data, `{ cache: "no-store" }` for anything per-user or stock-sensitive. An un-annotated `fetch` is a review failure.
- After a mutation that changes cached data, call `revalidateTag("<tag>")` (and `revalidatePath` where a specific route must refresh) inside the same server action. Tag names are centralised in [src/helpers/TagTypes.ts](e-commerce-website/src/helpers/TagTypes.ts).
- Auth cookies are set/cleared **only** inside `"use server"` services via `next/headers`. Cookie names: `ECommerce_access_token`, `ECommerce_refresh_token`, and the step tokens `ECommerce_signup_token`, `ECommerce_forget_token`, `ECommerce_forgot_otp_match_token`.
- `"use client"` only when the component needs state, effects, refs or browser APIs. Push it to the leaf — a page should not become a client component to render one interactive button. **NEVER use `"use client"` in a `page.tsx` or `page.js` file.** Pages must always be Server Components.

### 2.2 Mutation shape (copy this)

```tsx
const res = await tryCatchWrapper(
  placeOrder, // "use server" action
  { body: payload },
  { toastLoadingMessage: "অর্ডার প্রসেস হচ্ছে..." },
);
if (res?.success) {
  clearCart();
  router.push(`/order-success/${res.data.orderNumber}`);
}
```

### 2.3 Rendering rules

- Each route provides `loading.tsx` (skeletons, not a bare spinner) and inherits `error.tsx`; lists render an `EmptyState` when empty. Spec §3.26 lists every state that must exist — all of them are required, not optional.
- `generateMetadata` on every public route (title, description, OG, canonical). Product and category pages emit JSON-LD.
- Images through `next/image` with sizes; remote hosts must be registered in `next.config.ts`.
- Bengali-first: `bn` is the default locale, Hind Siliguri, currency `৳`, Bengali-friendly line-height. `<html lang>` is driven by the route's locale, never hardcoded. All UI copy comes from the dictionaries — see §2.6.

### 2.4 Website component inventory — check here before creating anything

`src/components/ui/CustomUi/`: `ReuseableTable`, `ReuseableModal`, `ReuseableSheet`, `Modal/ConfirmModal`, `ReusablePagination`, `ReusableTabs`, `ReusableTooltip`, `ReuseRating`, `ReuseTag`, `ReuseImagePreview`, `PriceRangeSlider`, `Container`, `PageWraper`, `SpinLoader`, `Loading`, `Accordion`, `ReuseYearSelect`.
`src/components/ui/CustomUi/ReuseForm/`: `Form.tsx` exporting `FormBase`, `FormInput`, `FormTextarea`, `FormPassword`, `FormSelect`, `FormMultiSelect`, `FormCheckbox`, `FormUpload`, `FormDurationInput`; plus `ReuseSearchInput`, `ReuseFilterSelect`, `ReuseDatePicker`, `ReuseTimePicker`, `MultiSelect`, `FileUpload`.
`src/components/shared/`: `Header`, `TopBar`, `CategoryBar`, `MobileAppBar`, `MobileDrawer`, `BottomNavBar`, `Footer`, `ProductCard`, `CartDrawer`, `FloatingCart`, `FloatingChat`, `Sidebar`, `DashboardTopBar`, `RichTextEditor`.
`src/components/ui/`: shadcn primitives (`button`, `input`, `select`, `dialog`, `sheet`, `table`, `badge`, `skeleton`, `input-otp`, `sidebar`, …).

Missing storefront primitives the spec requires (`EmptyState`, `SkeletonCard`, `QuantitySelector`, `StarRating` wrapper, `Breadcrumb`, `SectionHeader`, `CategoryPill`, `SocialShareBar`, `Badge` variants) are built **once** into `src/components/ui/CustomUi/` when the first part needs them, then reused.

### 2.5 Styling

Use the `:root` shadcn tokens — `bg-primary` (orange `#F97316`), `text-foreground`, `text-muted-foreground`, `bg-card`, `border-border`, `bg-badge-new|badge-sale|badge-combo|badge-bestsell`, `text-success|warning|destructive`. The legacy `@theme default` block (`--color-secondary-color` emerald etc.) is template leftover — do not extend it. Raw hex in JSX is a bug.

### 2.6 Localization — every static text comes from the dictionary

The storefront ships in Bengali (`bn`, default) and English (`en`). Every route lives under `src/app/[locale]/`, so the locale is always in the URL — that is what makes both languages indexable and what `hreflang` points at. The locale redirect lives in `src/proxy.ts` (Next 16 renamed `middleware` → `proxy`).

**A user-visible string literal in a component is a bug.** That covers labels, buttons, placeholders, headings, empty states, validation and toast copy, `aria-label`, image `alt`, page titles and meta descriptions. Every one of them comes from `src/i18n/dictionaries/bn.json` + `en.json`, and **both files are updated in the same commit**.

| Context             | How to read it                                                       |
| ------------------- | -------------------------------------------------------------------- |
| Server Component    | `const t = await getDictionary()` — nothing ships to the browser     |
| Client Component    | `const t = useT()` from `@/components/i18n/DictionaryProvider`       |
| `generateMetadata`  | `await getDictionaryFor(locale)` — `params` already carries it       |
| Values in a string  | `format(t.shop.showingResults, { first, last, total })`              |

- **Internal links use `LocaleLink`, never bare `next/link`.** A bare `/shop` drops the visitor through the proxy redirect and can bounce an English visitor back into Bengali.
- **Numbers, prices and dates go through `Intl`** with `INTL_LOCALES[locale]`. Bengali renders its own digit glyphs (১২৩), so hand-concatenating `৳` + a JS number is wrong.
- **`bn.json` defines the key set.** A key missing from `en.json` fails `npx tsc --noEmit` by design — fix the translation, never silence it with a cast.
- **Catalog content is NOT translated.** Product and category names/descriptions stay Bengali; only UI chrome is bilingual. Do not add `titleEn`/`titleBn` (or `LocalizedText`) fields to backend models — that scope was considered and rejected because it doubles catalog data entry for staff, forever.

---

## 3. Dashboard — `e-commerce-dashboard` (Vite SPA + RTK Query)

### 3.1 The fetch wrapper here is `baseApi`

[src/redux/api/baseApi.ts](e-commerce-dashboard/src/redux/api/baseApi.ts) is the single `createApi` (its `fetchBaseQuery` is the dashboard's fetch wrapper: base URL, credentials, token header). **Do not modify it**, and never call `fetch`/`axios` from a page or component. Every endpoint is added through:

```ts
const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query<IGetProductsResponse, IProductQueryArgs>({
      query: (params) => ({ url: "/products", method: "GET", params }),
      providesTags: [tagTypes.product],
    }),
    updateProduct: build.mutation<
      IApiResponse<IProduct>,
      { params: { id: string }; body: FormData }
    >({
      query: ({ params, body }) => ({
        url: `/products/${params.id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [tagTypes.product, tagTypes.dashboard],
    }),
  }),
});
export const { useGetProductsQuery, useUpdateProductMutation } = productApi;
```

Cache tags live in `src/redux/tagTypes.ts` — add the tag there and to `tagTypesList`. A mutation invalidates **every** tag whose screen the change affects (an order status change touches `order`, `dashboard`, `finance`).

### 3.2 Mutation shape (copy this)

```ts
const res = await tryCatchWrapper(
  updateProduct,
  { params: { id }, body: formData },
  { toastLoadingMessage: "Saving..." },
);
if (res?.success) setIsModalOpen(false);
```

### 3.3 Standard list page (copy this)

```tsx
<PageWraper title="Products" description="Manage catalog products">
  <div className="flex flex-wrap gap-3">
    <ReuseSearchInput className="min-w-64" placeholder="Search products..." setSearch={setSearch} setPage={setCurrentPage} />
    <ReuseFilterSelect label="Status" options={statusOptions} value={status} onChange={setStatus} />
  </div>
  {isFetching ? (
    <div className="py-20 flex justify-center"><SpinLoader /></div>
  ) : (
    <ReusableTable data={items} columns={columns} pagination currentPage={currentPage} setCurrentPage={setCurrentPage} limit={limit} total={total} />
  )}
  <ProductDetailModal open={isDetailOpen} onClose={…} productId={selectedId} />
  <ConfirmModal open={confirmOpen} … variant="danger" iconPreset="delete" />
</PageWraper>
```

Query args: `{ page, limit, searchTerm: search.length > 0 ? search : undefined, ...filters }`. Detail queries skip until needed: `{ skip: !open || !id, refetchOnMountOrArgChange: true }`. Filter param names match the filter (`status`, `category`, `source`) — never a generic `filter`.

### 3.4 Routing & permissions

Add a page by adding one entry to [src/Routes/admin.route.tsx](e-commerce-dashboard/src/Routes/admin.route.tsx) — it feeds both the sidebar and `routeGenerator`. Each entry declares the permission that reveals it (`permission: "product.view"`), and the sidebar filters on the logged-in user's permission set (Part 1). Route protection stays `ProtectedRoute`; page-level guards use the permission hook, and the backend enforces the same permission independently.

### 3.5 Dashboard component inventory — check here before creating anything

`src/Components/ui/CustomUi/`: `ReuseableTable` (+ `Column<T>`), `ReuseableModal`, `ReuseableSheet`, `Modal/ConfirmModal`, `PageWraper`, `SpinLoader`, `Loading`, `ReuseTag`, `ReuseRating`, `ReusablePagination`, `ReusableTabs`, `ReuseTabs`, `ReusableTooltip`, `ReuseImagePreview`, `RichTextEditor`, `PriceRangeSlider`, `Container`, `Accordion`, `VideoPlayer`, `ReuseYearSelect`, `NotFound/`.
`ReuseForm/`: `FormInput`, `FormTextarea`, `FormPassword`, `FormSelect`, `FormMultiSelect`, `FormCheckbox`, `FormSwitch`, `FormUpload`, `FormDatePicker`, `ReuseSearchInput`, `ReuseFilterSelect`, `ReuseDatePicker`, `ReuseTimePicker`, `MultiSelect`, `FileUpload`.
`src/Components/Charts/`: `AreaChart`, `BarChart` (recharts) — extend these for new chart types instead of importing recharts ad hoc.

Feature-specific modals go in `src/Components/Dashboard/<Feature>/`. Pages go in `src/pages/<Feature>/<Name>Page.tsx`.

### 3.6 Styling & display

Tokens only: `text-base-color`, `text-secondbase-color`, `bg-secondary-color`, `bg-background-color`, `bg-primary-color`. Statuses always render through `<Tag theme="success|error|warning|blue|purple|orange">`. Dates through `formatDate`/`formatDateTime`. Images through `getImageUrl()` + path. Empty tables render a centred `No items found.` line, not an invented illustration.

### 3.7 Forms

react-hook-form + Zod everywhere:

```tsx
const schema = z.object({
  name: z.string().min(1, "Required"),
  price: z.coerce.number().min(0),
});
type FormValues = z.infer<typeof schema>;
const { control, handleSubmit, reset } = useForm<FormValues>({
  resolver: zodResolver(schema),
  defaultValues: { name: "", price: 0 },
});
useEffect(() => {
  if (record) reset(record);
}, [record, reset]);
```

File uploads go as `FormData` with `formData.append("data", JSON.stringify(payload))` + the file field, matching the backend's multer field name.

---

## 4. Backend — `e-commerce-backend` (Express + Mongoose + Zod)

### 4.1 Module layout — every module, no exceptions

```
src/modules/<name>/
  <name>.interface.ts    domain types (I-prefixed)
  <name>.constant.ts     enums, allowed filters, searchable fields
  <name>.model.ts        Mongoose schema + indexes + hooks
  <name>.validation.ts   Zod schemas ({ body }, { params }, { query })
  <name>.service.ts      ALL business logic and DB access
  <name>.controller.ts   thin: catchAsync + read validated input + sendResponse
  <name>.routes.ts       paths + auth() + requirePermission() + validateRequest()
```

Register in [src/app/routes/index.ts](e-commerce-backend/src/app/routes/index.ts) with a correct plural path (`/products`, `/orders`, `/auth`, `/settings`, `/staff` — the generator's `/auths`, `/settingss`, `/staffs` are wrong and get fixed in Part 0).

### 4.2 Layer rules

- **Routes**: no logic. `router.post("/", auth(), requirePermission("product.create"), validateRequest(ProductValidation.create), ProductController.create)`.
- **Controllers**: no business rules, no direct model access. Always `catchAsync`, always reply through `sendResponse` — never `res.json` by hand.
- **Services**: own every rule (totals, coupon application, stock reservation, COGS, profit, refunds, finance transactions, audit entries). Throw `ApiError(status, message)` for business failures.
- **Models**: schema, indexes, virtuals, hooks. No request-shaped logic.
- **Validation**: Zod 4 syntax (`z.object({ body: z.object({...}) })`, `{ error: "..." }` not `required_error`). Validate params and query too, and coerce numbers (`z.coerce.number()`).

### 4.3 Cross-cutting requirements

- **Auth**: `auth()` verifies the JWT and attaches `req.user`. `requirePermission("resource.action")` checks the resolved role→permission set. Every non-public route carries both. Public routes are explicit and few (catalog reads, guest tracking, webhooks).
- **Query building**: one shared `QueryBuilder` util handles `searchTerm`, `page`, `limit`, `sort`, field selection and whitelisted filters, and returns `meta: { page, limit, total, totalPage }`. Every list endpoint uses it — no bespoke pagination.
- **Transactions**: any operation touching more than one collection (order creation, stock movement, refund, purchase receive, finance postings) runs inside a Mongoose session and is atomic.
- **Snapshots**: orders store price, cost, product name, variant, customer and address **as they were at order time**. Never resolve historical orders through live product documents.
- **Idempotency**: order placement and payment webhooks accept/record an idempotency key and never double-apply.
- **Audit**: every sensitive write (price, cost, stock adjust, refund, permission change, expense approval) writes an audit entry with actor, before, after.
- **Uploads**: multer → Cloudinary via `src/utils/fileUpload.ts`; validate mimetype and size; store the returned URL/public_id, never a local path.

### 4.4 Response envelope — never deviate

```ts
sendResponse(res, {
  statusCode: 200,
  success: true,
  message: "Products retrieved successfully",
  meta,
  data,
});
```

```jsonc
// success
{ "success": true, "statusCode": 200, "message": "...", "meta": { "page": 1, "limit": 10, "total": 42, "totalPage": 5 }, "data": {} }
// error
{ "success": false, "statusCode": 400, "message": "...", "errorCode": "VALIDATION_ERROR", "errorMessages": [{ "path": "body.price", "message": "..." }] }
```

Stacks are attached only when `NODE_ENV !== "production"`. `globalErrorHandler` normalises Zod, Mongoose validation/cast/duplicate-key, auth, permission and `ApiError` failures — controllers never format errors themselves.

### 4.5 Shared enums (backend constants → frontend types, same strings)

```
ORDER_STATUS      PENDING CONFIRMED PROCESSING PACKED SHIPPED OUT_FOR_DELIVERY DELIVERED
                  DELIVERY_FAILED RETURNED_TO_ORIGIN CANCELLED
                  RETURN_REQUESTED RETURNED REFUND_PENDING REFUNDED
PAYMENT_STATUS    PENDING COLLECTED REMITTED FAILED REFUNDED PARTIALLY_REFUNDED
PAYMENT_METHOD    COD                       // only value the system implements — see §4.6
ORDER_SOURCE      WEBSITE FACEBOOK WHATSAPP PHONE OFFLINE MANUAL OTHER
REVIEW_STATUS     PENDING APPROVED REJECTED HIDDEN
TXN_TYPE          SALE COGS PURCHASE EXPENSE REFUND COD_FEE DELIVERY_COST RTO_COST
                  MARKETING_COST ADJUSTMENT
ROLES             super_admin admin manager order_manager inventory_manager accountant
                  marketing_manager customer_support delivery_manager content_manager user
```

Status transitions are validated in the service layer against an explicit transition map — no free-form status writes.

### 4.6 Cash on delivery — the payment model of this system

**The platform collects money only as cash on delivery.** No payment gateway, no online payment, no card, no bKash/Nagad/Rocket checkout. The phase-1 spec (§3.16) shows online options; the owner's decision supersedes it. Anything that assumes money arrives at checkout time is wrong here.

What that means in code:

- **`paymentMethod` is always `COD`.** Keep it as a field with an enum of one value so a gateway can be added later without a migration — but do not write gateway adapters, redirect flows, webhook endpoints, signature verification or return URLs. That work does not exist in this project.
- **Placing an order moves no money.** The order records `codAmount` (grand total in poisha) as the sum the rider must collect. Payment status starts `PENDING`.
- **Cash lifecycle is three steps, and they are different events:** `PENDING` → `COLLECTED` (rider took the cash from the customer, order is `DELIVERED`) → `REMITTED` (courier settled that cash to the business). Undelivered goes `FAILED`, with the order at `DELIVERY_FAILED` → `RETURNED_TO_ORIGIN`. Never collapse `COLLECTED` and `REMITTED` into one "paid" flag — money sitting with the courier is a receivable, not cash in hand.
- **Revenue is recognised on collection, not on order placement.** A `PENDING` order posts nothing to the finance ledger. `SALE` + `COGS` post when the order is delivered and collected. A failed delivery posts only its costs (`DELIVERY_COST`, `RTO_COST`) and restocks the goods — it must never appear as revenue.
- **COD-specific costs are first-class:** `DELIVERY_COST` (courier charge), `COD_FEE` (courier's percentage for handling cash), `RTO_COST` (return-shipping loss on a failed delivery). These replace `PAYMENT_FEE` in the profit formula.
- **Fake orders are the main risk.** Order confirmation (phone/OTP or a confirmation call marked in the dashboard) is part of the order flow, not an optional extra; blocked phone numbers and repeat-RTO customers are enforced server-side at order creation.
- Money still never comes from the client: `codAmount` is recomputed server-side from items + coupon + delivery fee, and the collected amount recorded on delivery is validated against it.

---

## 5. Naming

| Thing                        | Convention                              | Example                                  |
| ---------------------------- | --------------------------------------- | ---------------------------------------- |
| Backend module files         | `<name>.<layer>.ts`                     | `order.service.ts`                       |
| Backend service export       | `<Name>Service` object                  | `OrderService.createOrder`               |
| REST paths                   | plural kebab                            | `/orders`, `/stock-movements`            |
| Frontend type files          | `<feature>.type.ts`                     | `order.type.ts`                          |
| Interfaces                   | `I` prefix                              | `IOrder`, `IGetOrdersResponse`           |
| Dashboard pages / components | PascalCase                              | `OrdersPage.tsx`, `OrderDetailModal.tsx` |
| Dashboard API slices         | `<feature>Api.ts`                       | `orderApi.ts`                            |
| Website routes               | kebab-case folders                      | `app/(mainLayout)/track-order/page.tsx`  |
| Website services             | `src/service/<Feature>/<feature>Api.ts` | `service/OrderService/orderApi.ts`       |
| Hooks                        | `use` + camelCase                       | `usePermission.ts`                       |
| Zod schemas                  | `<Name>Validation.<action>`             | `ProductValidation.create`               |

---

## 6. The verification gate — run before calling any part done

```bash
# backend
cd e-commerce-backend  && npx tsc --noEmit && npm run build

# dashboard
cd e-commerce-dashboard && npx tsc -b --force && npm run lint && npm run build

# website
cd e-commerce-website  && npx tsc --noEmit && npm run lint && npm run build
```

All three must exit clean — zero type errors, zero lint errors, zero new warnings. Then run the app and drive the actual screen (create → list → edit → delete, error path, empty state, mobile width). A part is done when the gate is green **and** the flow works end to end against the real API, not before.

---

## 7. Definition of Done — paste into every part

- [ ] Backend: model, constants, Zod validation, service, controller, routes, mounted, auth + permission attached
- [ ] Backend: list endpoint uses `QueryBuilder` and returns `meta`; multi-collection writes use a transaction; audit entry where sensitive
- [ ] Types added to both frontends and exported from `src/types/index.ts`
- [ ] Dashboard: endpoints in `<feature>Api.ts` with tags; page + modals built from the reusable inventory; route + sidebar entry with permission
- [ ] Website: server fetch / service action with explicit cache tags; `revalidateTag` after mutations; UI built from the reusable inventory
- [ ] All `DUMMY_*` data for this feature deleted
- [ ] Every new user-visible string added to **both** `bn.json` and `en.json`; no string literal left in JSX; screen checked at `/bn/…` and `/en/…`
- [ ] Loading, empty, error, validation-error and success states implemented on every new screen
- [ ] Design matches the phase spec / supplied screenshot (colours, spacing, which elements appear); checked at mobile, tablet and desktop widths
- [ ] §6 gate green in all three projects
- [ ] Flow driven manually end to end against the local backend

---

## 8. Anti-patterns

| Don't                                             | Do                                                                           |
| ------------------------------------------------- | ---------------------------------------------------------------------------- |
| `fetch("https://api…/products")` in a component   | server `fetch` with `getBaseUrl()` + tags, `clientFetch`, or an RTK endpoint |
| `await mutation(payload).unwrap()`                | `tryCatchWrapper(mutation, { body: payload }, { … })`                        |
| New `<table>` / `<Dialog>` / custom pagination    | `ReusableTable`, `ReuseableModal`, `ReusablePagination`                      |
| `text-gray-500`, `#F97316` in JSX                 | design tokens (`text-muted-foreground`, `bg-primary`, `text-base-color`)     |
| Total/discount computed in the browser and posted | server recomputes from cart + coupon + zone                                  |
| Posting revenue when the order is placed          | post `SALE`/`COGS` when the order is delivered **and** cash collected        |
| One `isPaid` flag for COD                         | separate `COLLECTED` (rider has it) from `REMITTED` (business has it)        |
| Building gateway adapters / webhooks              | COD only — see §4.6                                                          |
| `price: number` as float ৳                        | integer poisha + `formatMoney` at render                                     |
| `params: { search }`                              | `params: { searchTerm }`                                                     |
| Deleting a document                               | `isDeleted` / archived status                                                |
| Hiding a button as "authorisation"                | `requirePermission()` on the route, hiding as UX only                        |
| `any` to silence a type error                     | model the real response type                                                 |
| `<button>Add To Cart</button>`                    | `<button>{t.common.addToCart}</button>` from the dictionary                  |
| `import Link from "next/link"` for an internal route | `LocaleLink` — keeps the visitor's language                               |
| Adding a key to `bn.json` only, "translate later" | both dictionaries in the same commit; the build enforces it                  |
| `৳${price}` / `date.toLocaleString()` with no locale | `Intl` with `INTL_LOCALES[locale]`                                        |
| Leaving `DUMMY_ORDERS` beside a working endpoint  | delete it in the same commit                                                 |
| Editing `baseApi.ts` to add an endpoint           | `baseApi.injectEndpoints` in the feature file                                |
