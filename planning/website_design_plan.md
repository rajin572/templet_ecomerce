# Website Design Plan

## 1. Objective

Design a modular, scalable, and conversion-focused e-commerce storefront. This document focuses exclusively on the **Customer Website**, detailing the layout and UI components for **every single page**, from the homepage through checkout, authentication, and the complete user dashboard.

---

## 2. Architecture & Assets

### 2.1 Next.js SSR & Island Architecture

The storefront will be built using a **Next.js Server-Side Rendering (SSR)** approach, specifically adhering to the **Island Architecture** pattern (via Next.js App Router and React Server Components).

- **Island Architecture Focus:** The majority of the UI (the "sea") will be rendered as static server components to send zero JavaScript to the client. Interactive elements like the Add to Cart button, image carousels, and variant selectors will act as isolated interactive "islands" (Client Components).
- **SEO & Performance:** SSR will be utilized to render category pages, product detail pages, and the homepage on the server to ensure maximum SEO visibility and incredibly fast initial page loads.
- **Dynamic Content:** Cart and Checkout will utilize client-side reactivity (islands) combined with server-side validation to ensure real-time price and stock accuracy without re-rendering the entire page.

### 2.2 Placeholder Assets

- During the design and prototyping phase, **Unsplash** (`https://unsplash.com/`) will be used as the primary source for high-quality placeholder images (for hero banners, product mockups, and category headers).

### 2.3 Strict Coding Rules

- **Server Components:** `page.js` or `page.tsx` files must **never** use `"use client"`. All pages must be rendered as Server Components.
- **Form Reusability:** When building forms, you must use the provided reusable form components (e.g., `ReuseForm`). Do not build forms from scratch.
- **Component Priority:** For Modals, Tables, and other UI elements, always search the reusable component inventory first. Existing components must be used as the first priority over creating new ones.
- **Localization:** Every static text must be localized. No user-visible string is written into a component — labels, buttons, placeholders, headings, empty states, validation and toast copy, `aria-label`, image `alt`, page titles and meta descriptions all come from `src/i18n/dictionaries/bn.json` and `en.json`, and **both files are updated together**. Server Components read them with `await getDictionary()`, Client Components with `useT()`. See CODING_RULES.md §2.6 for the full rule.

### 2.4 Language & Routing

The site ships in Bengali (`bn`, the default) and English (`en`). Every page in this plan lives under `/[locale]/…` — the paths written below (`/collections/combos`, `/cart`, `/account/orders`) are **relative to the locale segment**, so the real URLs are `/bn/collections/combos` and `/en/collections/combos`.

- Internal navigation uses `LocaleLink`, never bare `next/link`.
- Only the UI chrome is bilingual. **Product and category content stays Bengali** — the catalog is not translated, so staff never enter a product twice.
- Prices, quantities and dates render through `Intl` for the active locale (Bengali uses its own digits: ১২৩).

---

## 3. Global UI Elements (Present Across All Pages)

### 3.1 Two-Level Navbar ✅ [COMPLETED]

- **Primary Navbar (Top Row):** Brand Logo (**Strict Rule:** Do not change or invert the logo color under any circumstances), Global Search Bar, Track Order link, Sign In / Account link, Wishlist icon, Cart icon (with item count/total badge).
- **Secondary Navigation (Bottom Row):** Combo (`/collections/combos`), Offer Zone (`/collections/offers`), then the dynamic Active Categories. A category with children opens a hover dropdown listing each child (`/category/:categorySlug/:subCategorySlug`) above a **"View all <category>"** link (`/category/:categorySlug`); a category with `hasSub: false` links straight to `/category/:categorySlug`. The mobile drawer mirrors this as an accordion.
- **Single source of categories:** the navbar, the mobile drawer, the homepage category marquee and the category routes all read the **same** category tree from `src/service/CatalogService/`, so a slug can never drift between the link and the page it opens.

### 3.2 Footer ✅ [COMPLETED]

- **Links:** Privacy Policy, Terms & Conditions, Return Policy.
- **Info Sections:** "Why Choose Us", Delivery Information.
- **Socials & Forms:** Facebook/Instagram links, Newsletter/Offer Subscription form.

---

## 4. Public Storefront Pages

### 4.1 Homepage (`/`)

- **Hero / Banner Section:** Slider or static promotional image (using Unsplash placeholders) with a Call-To-Action (CTA). ✅ [COMPLETED]
- **Featured Categories:** Grid of max 4 categories. ✅ [COMPLETED]
- **Best Selling Products:** Horizontal scrolling list or grid. ✅ [COMPLETED]
- **New Arrivals:** Curated product grid. ✅ [COMPLETED]
- **Promotional Banner:** Secondary banner for targeted campaigns. ✅ [COMPLETED]
- **Exclusive Combo Deals:** Dedicated section for bundled offers. ✅ [COMPLETED]
- **Featured Products:** Curated product grid. ✅ [COMPLETED]
- **Customer Reviews:** Carousel of approved verified-purchase reviews.

### 4.2 Product Discovery Routes

There are **exactly three ways to reach products**, and no others. **`/shop` does not exist** — it was removed along with `/products`, and every link that pointed at it now points at a collection, a category, or the homepage.

| Route                                     | Lists                                                                                                                                 |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `/collections/:collectionSlug`            | A curated set the admin flags — combos, best sellers, new arrivals, featured products, offer zone                                     |
| `/category/:categorySlug`                 | Everything in one top-level category. Where **"View all <category>"** lands, and where a category with `hasSub: false` links directly |
| `/category/:categorySlug/:subCategorySlug` | One child category                                                                                                                    |
| `/product/:productId`                     | A single product                                                                                                                      |

All four are Server Components. The catalog read is a cached server `fetch` (`revalidate` + tag) so the listing HTML is indexable; only the toolbar, filters, gallery and buy panel are Client Component islands.

#### 4.2.1 Collection Page (`/collections/:collectionSlug`) ✅ [COMPLETED]

The slug set is **fixed** — five collections, each with its own title, description and accent. These are the static links in the secondary navbar and the "View All" target of every homepage product row.

| Slug                 | Collection             | Linked from                       |
| -------------------- | ---------------------- | --------------------------------- |
| `combos`             | Exclusive Combo Deals  | Navbar "Combo", homepage combo row |
| `best-sales`         | Best Selling Products  | Homepage best-selling row          |
| `new-arrivals`       | New Arrivals           | Homepage new-arrivals row          |
| `featured-products`  | Featured Products      | Homepage featured row              |
| `offers`             | Offer Zone             | Navbar "Offer Zone", hero CTA      |

- **Breadcrumb:** Home › Collection title.
- **Header:** Collection title, one-line description, live product count.
- **Body:** the shared catalog browser (§4.3).
- **Routing:** the five slugs are prerendered with `generateStaticParams`; any other slug returns `notFound()`.

#### 4.2.2 Category Page (`/category/:categorySlug`) ✅ [COMPLETED]

- **Breadcrumb:** Home › Category.
- **Header:** Category title, description, live product count.
- **Sub-category strip:** `CategoryPill` row linking to each child, plus an "All" pill that stays active here. Hidden when the category has `hasSub: false` — those categories link straight to this page from the navbar.
- **Body:** every product in the category, **including all of its sub-categories** — the shared catalog browser (§4.3).
- **Routing:** unknown slug → `notFound()`. Category slugs are prerendered.

#### 4.2.3 Sub-category Page (`/category/:categorySlug/:subCategorySlug`) ✅ [COMPLETED]

- **Breadcrumb:** Home › Category › Sub-category.
- **Header:** Sub-category title, live product count.
- **Sub-category strip:** the same sibling pills, with this one active and "All" linking back up to the parent.
- **Body:** only this sub-category's products — the shared catalog browser (§4.3).
- **Routing:** a sub-category slug that does not belong to the parent category → `notFound()`.

### 4.3 Shared Catalog Browser ✅ [COMPLETED]

One component (`src/components/catalog/CatalogBrowser.tsx`) drives the body of every collection, category and sub-category page, so the three route families look and behave identically.

- **Toolbar:** "Showing x–y of z", sort select (default / popularity / latest / price ↑ / price ↓), grid ⇄ list toggle (desktop only).
- **Filter sidebar** (collapsed behind a "Filters" button below `lg`): max-price slider and stock availability. Category navigation is **links, not checkboxes** — moving between categories is a route change, not a filter.
- **Grid view:** `ProductCard` at 2 / 3 / 4 columns. **List view:** wide row with image, name, price, blurb, add-to-cart.
- **Empty state:** `EmptyState` with a "clear filters" action — never a blank grid.
- **Pagination:** `ReusablePagination`, 12 per page, resets to page 1 whenever a filter or sort changes.
- **Loading:** each route ships `loading.tsx` built from `SkeletonCard`, not a spinner.

### 4.4 Product Detail Page (`/product/:productId`) ✅ [COMPLETED]

The URL is keyed on the **product id**, not a slug — `/product/:productId`.

- **Breadcrumb:** Home › Category › Sub-category › Product name, built from the product's own category path.
- **Media Gallery (Left):** Main image with thumbnail carousel — Client island.
- **Product Info (Right):** Name, star summary, Original Price, Sale Price, savings badge, short description.
- **Buy panel:** variant (weight) selector, quantity stepper, "Add to Cart", "Buy Now", wishlist, WhatsApp order — one Client island; the variant choice feeds the WhatsApp message.
- **Meta block:** SKU, category link, stock status, share row.
- **Details Tabs:** Description / Reviews (rating breakdown + verified-purchase list).
- **Cross-Selling:** "Related Products" — same category, current product excluded.
- **Architecture Note:** Server-rendered with `generateMetadata` (title, description, OG image) and a `Product` JSON-LD block, so social crawlers and search engines get everything on first byte. Unknown id → `notFound()`.

---

## 5. Checkout & Order Tracking Pages

### 5.1 Cart Page or Drawer (`/cart`) ✅ [COMPLETED]

- **List of Items:** Image, Variant name, Quantity (+/- controls), Unit Price, Total.
- **Summary Box:** Subtotal, Discount, Coupon input, Delivery charge, Grand total.
- **Action:** "Proceed to Checkout" button.

### 5.2 Checkout Flow (`/checkout`)

- **Step 1 - Customer Info:** Name, Phone Number.
- **Step 2 - Shipping:** Delivery Address, Delivery Method.
- **Step 3 - Payment:** Cash on Delivery or Manual bKash (shows fields for bKash Number & TrxID).
- **Step 4 - Order Summary:** Final server-validated total.
- **Action:** "Place Order" button.

### 5.3 Checkout Success / Order Confirmation (`/checkout/success`)

- **Header:** "Thank You for Your Order!" success message.
- **Content:** Display the generated Order Number, an estimated delivery timeline, and a prompt to track the order.
- **Actions:** "Track Order" button, "Continue Shopping" button.
- **Guest Prompt:** If the user is a guest, display an option to "Create an account to save your order history" (using the details they just provided).

### 5.4 Guest Order Tracking (`/track-order`)

- **Input Form:** Order Number field.
- **Tracking View:** Visual timeline (Pending -> Confirmed -> Processing -> Packed -> Shipped -> Delivered), displaying ordered items and status.

---

## 6. Authentication Pages (Auth Flow)

These pages should have a clean, focused layout (often omitting the secondary navbar to minimize distractions).

### 6.1 Login Page (`/login`)

- **Form Fields:** Email/Phone input, Password input (with toggle visibility icon).
- **Actions:** "Login" button, "Forgot Password?" link.
- **Alternatives:** "Don't have an account? Register here" link.
- **Guest Option:** "Continue as Guest" link (redirects back to checkout if arriving from the cart).

### 6.2 Registration Page (`/register`)

- **Form Fields:** Full Name, Phone Number, Email Address (Optional), Password, Confirm Password.
- **Actions:** "Create Account" button.
- **Alternatives:** "Already have an account? Login here" link.

### 6.3 Forgot Password Page (`/forgot-password`)

- **Form Fields:** Phone/Email input to send OTP or reset link.
- **Actions:** "Send Reset Instructions" button.
- **Navigation:** "Back to Login" link.

### 6.4 Reset Password Page (`/reset-password`)

- **Form Fields:** OTP/Token input (if applicable), New Password, Confirm New Password.
- **Actions:** "Reset Password" button.

---

## 7. Customer Dashboard Pages (`/account/*`)

The User Dashboard will feature a unified layout: a **Left Sidebar** for navigation and a **Main Content Area** on the right. Mobile screens will use a slide-out menu or top tabs for the sidebar.

### 7.1 Dashboard Overview (`/account`)

- **Welcome Banner:** Greeting (e.g., "Hello, [Name]").
- **Quick Stats:** Total Orders, Active Wishlist Items, Available Coupons.
- **Recent Activity:** Snippet of the most recent order status.

### 7.2 My Profile (`/account/profile`)

- **Form Fields:** First Name, Last Name, Phone Number, Email.
- **Security Section:** Change Password form (Current Password, New Password, Confirm Password).
- **Actions:** "Save Changes" button.

### 7.3 Order History (`/account/orders`)

- **Order List:** A table or list of cards showing: Order Number, Date, Total Amount, and Status Badge (Pending, Shipped, Delivered, etc.).
- **Actions:** "View Details" button for each order.

### 7.4 Order Details (`/account/orders/:id`)

- **Header:** Order Number and Date.
- **Timeline:** Visual progress tracker of the order status.
- **Itemized List:** Image, Name, Variant, Quantity, and Price of purchased items (historical snapshots).
- **Summary:** Subtotal, Discounts, Delivery Fee, Total Paid.
- **Details:** Shipping Address and Payment Method used.

### 7.5 Saved Addresses (`/account/addresses`)

- **Address Grid:** Cards displaying existing saved addresses (Home, Office, etc.).
- **Actions:** "Edit" and "Delete" buttons on each card.
- **Add New:** "Add New Address" button opening a form modal (Name, Phone, Street, City, Zone).

### 7.6 My Wishlist (`/account/wishlist`)

- **Product Grid:** Cards showing saved items (Image, Name, Price, Stock Status).
- **Actions:** "Add to Cart" button (if in stock), "Remove from Wishlist" trash icon.

### 7.7 My Reviews (`/account/reviews`)

- **Pending Reviews:** List of recently purchased items waiting to be reviewed. (Clicking opens a review form modal: 1-5 stars, Text area).
- **Published Reviews:** List of past reviews submitted by the user showing the given rating, text, and date.

### 7.8 My Coupons (`/account/coupons`)

- **Available Coupons:** Cards showing active discount codes, validity dates, minimum order requirements, and a "Copy Code" button.
- **Used/Expired:** Greyed-out list of past coupons.

---

## 8. Static & System Pages

### 8.1 Static Info Pages ✅ [COMPLETED]

- **Delivery Information (`/delivery`):** Text content explaining rates and timelines.
- **Privacy Policy (`/privacy`):** Plain text layout.
- **Terms & Conditions (`/terms`):** Plain text layout.
- **Return Policy (`/returns`):** Plain text layout explaining eligibility.
- **About Us (`/about`):** Standard page detailing company background, mission, and "Why Choose Us" expanded content.
- **Contact Us (`/contact`):** Page displaying support phone numbers, email address, physical address, and a basic contact form.

### 8.2 System Pages

- **404 Not Found (`/404`):** Friendly error page with an illustration (from Unsplash), a "Page not found" message, and a "Return to Homepage" button.
- **500 Server Error (`/500`):** Fallback error page for server crashes or network issues, prompting the user to try again later.
- **Maintenance Mode (`/maintenance`):** A temporary holding page displayed when the storefront is down for scheduled updates, showing a "We'll be back soon" message.
- **Guest Review Submission (`/review/:token`):** A standalone page allowing guest customers (who haven't registered) to submit a verified review via a secure link sent to their email/phone after an order is delivered.
- **Newsletter Unsubscribe (`/unsubscribe`):** A simple confirmation page required for users who click the "unsubscribe" link from promotional emails generated by the homepage newsletter form.
