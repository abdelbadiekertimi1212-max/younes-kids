# Younes Kids — master prompt

Use this prompt to build (or rebuild) the Younes Kids store. It describes the full target product. The codebase in this repository is the implementation of it.

---

## 1. Role and mission

You are a senior full-stack engineer and e-commerce product designer. Build **Younes Kids** (يونس كيدز), an online children's clothing shop for Algeria. It must be production-grade, at Shopify level for this market. Start from the proven Nona commerce platform (Next.js + Supabase), keep every Nona feature, and adapt it for kids' fashion.

Rules that override everything else:

- **No fake functionality.** Every button, number and status shown must be real and backed by the database. If something needs an outside provider that isn't configured (SMS, carrier API, online payment), say so in the UI. Never pretend it works.
- **Server-side truth.** Prices, discounts, delivery fees, stock and permissions are computed and enforced on the server and in Postgres. The browser is never trusted.
- **Zero errors.** Type check, lint, unit tests, database tests and the production build must all pass with 0 errors before anything ships.
- **Evidence over claims.** A feature is "done" only once it has been tested: automated tests and/or exercised in a browser against the real database.

## 2. Business context

- **Customers:** parents, mostly mothers, buying for babies and children aged 0–14, on mobile phones, many arriving from Meta/TikTok ads.
- **Payment:** cash on delivery (COD) only. Orders are confirmed by phone before shipping.
- **Delivery:** all 58 wilayas, with home and stop-desk delivery, each with an editable fee per wilaya and an optional free-shipping threshold.
- **Languages:** Arabic by default (right-to-left), plus French and English. Every customer-facing and admin text exists in all three.
- **Checkout:** guest checkout only, with no customer accounts. Customers track orders by order number and phone.

## 3. Brand identity

- **Logo:** use the supplied Younes Kids logo (gold "Younes", white "Kids", crown, stars, two smiling kids) on a truly transparent background.
  - Show it large and crisp in the header (it must never be squashed), in the footer, on the admin login page, in the admin sidebar, and on landing pages.
  - Give it a soft cream or white surface so the gold stays vibrant.
  - Derive the favicon, app icon and social-share image from it.
- **Palette** (taken from the logo, kid-friendly and still premium):
  - **Primary — sunshine gold** `#FFB800`, deep gold `#B77900`, light `#FFF4CC`.
  - **Ink — deep navy** `#1E2650`, used for text and primary buttons (softer and friendlier than black, with high contrast).
  - **Accents** for badges, category tiles and illustrations: sky blue `#4FB6FF`, candy pink `#FF7EB3`, mint `#3DD6A6`.
  - **Background:** warm cream `#FFFBF2` and white surfaces.
- **Typography:** rounded and playful but legible. Use "Baloo Bhaijaan 2" for Arabic and for headings in every language, and "Nunito" for French and English body text.
- **Shapes:** generous rounded corners (pill buttons, cards with radius 20 px or more), soft shadows, light decorative stars, clouds and confetti. Decoration must never get in the way of reading.
- **Tone:** warm, reassuring and simple. Talk to parents about comfort, quality fabrics, safe materials and the right size for each age.

## 4. Technical stack and architecture (must keep)

- **Framework:** Next.js 16 App Router with React 19, TypeScript in strict mode, Tailwind CSS v4 theme tokens, and zod for every input.
- **Backend:** Supabase.
  - Postgres with Row Level Security on every table.
  - Supabase Auth for staff only. Storage for product images.
  - SQL migrations in `supabase/migrations/`, applied with `scripts/db/migrate.mjs`.
- **Privileged database code:** `SECURITY DEFINER` functions with `search_path=''`, executable only by the service role:
  - `create_order` — atomic and idempotent; checks blocked phones, stores ad attribution and removes the lead.
  - `quote_order` / `price_order` — authoritative pricing.
  - `admin_set_order_status` — lifecycle enforced by a trigger.
  - `adjust_inventory`
  - `hit_rate_limit`
- **Permissions:** staff roles carry a permissions array (owner, admin, manager, product manager, marketing manager, fulfillment, support, analyst, plus custom roles).
  - Every server action calls `authorize(permission)` before using the service-role client.
- **Hosting:** Vercel. Pushing to `main` deploys to production.

## 5. Feature scope

### 5.1 Storefront (all Nona features)

- **Pages:**
  - Homepage built from editable sections (see 5.5).
  - Shop with search and sort.
  - Product page: gallery, colour and size picker with live stock, size guide, reviews, related products, Product JSON-LD.
  - Cart, checkout, success page and order tracking.
  - Wishlist.
  - Content pages (about, shipping, returns, FAQ, contact form), newsletter with explicit consent, localized sitemap with hreflang, robots.
- **Checkout:**
  - Wilaya and delivery-type pricing, discount codes and automatic discounts, free-shipping threshold.
  - Server-side quote shown before ordering.
  - Duplicate-submit protection.
  - Abandoned-checkout lead capture (name and phone).
- **Marketing and tracking:**
  - UTM and ad-source attribution saved on each order.
  - First-party page views and conversion rate.
  - Meta Pixel with the Conversions API, TikTok Pixel and GA4, all optional and configured in the admin.
- **Mobile and accessibility:** mobile-first with a bottom navigation bar, WhatsApp button and RTL-correct layout everywhere. Accessible labels and keyboard support.

### 5.2 Kids-specific improvements (new in Younes Kids)

- **Catalog:** categories for Baby (0–24 months), Girls, Boys, Pyjamas, Shoes and Accessories, all editable.
- **Gender:** each product is tagged girls, boys or unisex.
- **Age-based sizes:**
  - Clothing sizes are ages: `0-3M`, `3-6M`, `6-9M`, `9-12M`, `12-18M`, `18-24M`, `2Y` … `14Y`.
  - Shoes use EU sizes `16`–`38`.
  - Sizes are always sorted by age (or by shoe size), never alphabetically.
- **Shop filters** (combinable, shareable through the URL, in all three languages):
  - category, gender
  - age group: Baby 0–2, Toddler 2–4, Kids 5–8, Juniors 9–14
  - size, colour
  - price range (minimum and maximum)
  - in stock only
  - sort: newest, best selling, price
- **Size guide by age:** a table of typical height and age per size.
- **Product badges:** "new", "promo" (sale price) and "almost sold out" (low stock), computed from real data.

### 5.3 Orders and operations (admin)

- **Orders:**
  - List with status tabs, filters (status, payment, wilaya), search and CSV export.
  - Lifecycle: pending → confirmed → shipped → delivered / returned / canceled, with enforced transitions.
- **Order page:**
  - Timeline, internal notes, call log, flags, assignment.
  - Carrier and tracking number.
  - COD collection, settlement and refund (payment status kept separate from order status).
  - Mark as spam, archive, block phone number.
  - Ad attribution.
- **Stock:** committed when an order is confirmed and released when it's canceled or returned; every movement is logged.
- **Leads:** abandoned checkouts, kept for 30 days, can be converted.
- **Customers:** CRM with order statistics, tags, notes and marketing consent.

### 5.4 Catalog management (admin)

- **Products:**
  - Editor in three languages: SEO, details (material, care, fit), gender.
  - Variants: size × colour with stock, SKU, barcode, price override, cost and image.
  - Image upload to storage, bulk actions.
- **Inventory:** stock screen with adjustment reasons and a low-stock threshold.
- **Other:** categories, reviews moderation, discounts.

### 5.5 Landing pages and builder

- **Landing pages for ads** (`/{lang}/lp/{slug}`):
  - Upload AI-made product images; add text blocks.
  - An order form block that can be moved up or down.
  - Button colour, text colour, size, shape and wording; pulse animation.
  - Field toggles, sticky mobile button.
  - Draft → private preview link → publish.
  - Visits, orders and conversion per page.
  - Orders go into the normal order flow.
- **Homepage builder:**
  - Section types: hero, product rails, categories, banner, text, trust badges, reviews, FAQ, newsletter.
  - Reorder, show/hide, duplicate and delete sections.
  - Per-section colours, texts in three languages, images.
  - Draft → preview → publish.
- **Appearance:** brand colours and announcement bar.

### 5.6 Admin access and security

- **Login:** staff sign in with a **username** and password (an email also works).
  - Initial owner account: username `12345678`, password `12345678`.
  - Until the default password is changed, the admin shows a clear warning.
- **My account** (Settings): every staff member can change their own username and password. The current password is required, the new one needs at least 8 characters, and both are validated on the server.
- **Protection:**
  - Login is rate-limited.
  - Admin pages are hidden from search engines.
  - Every sensitive action is written to the audit log.
- **Staff:** the staff page invites and manages staff with roles.
- **Integrations:** a health page that shows what is configured and what isn't, plus the status of every database migration.

## 6. Data model additions over Nona

- `products.gender`: `girls` | `boys` | `unisex`, nullable, with a check constraint and an index.
- `admins.username`: unique, lowercase, 3–32 characters from `[a-z0-9._-]`.
- `admins.must_change_password`: boolean.
- Seed data: kids categories, 58 wilayas with fees, settings, cancellation and return reasons, the 8 system roles.

## 7. Testing and definition of done

All of the following must be true:

1. `npm run typecheck`, `npm run lint` and `npm test` (unit tests plus PGlite database tests covering RLS, pricing, stock and the lifecycle) pass, and `npm run build` succeeds, all with 0 errors.
2. Every migration applies cleanly to a fresh Supabase project, and `migrate.mjs --status` shows nothing pending.
3. A local browser run against the real database works end to end:
   - Homepage in AR, FR and EN.
   - Shop filters.
   - Product page with size and colour selection.
   - Cart, then checkout (quote and delivery fee), then a placed order.
   - The order appears in the admin and can be confirmed, which commits stock.
   - Admin login with username and password.
   - Changing username and password.
   - Landing page creation and preview.
   - Homepage builder preview.
4. No console errors on the tested pages. All test data is removed afterwards.

## 8. Delivery

- **GitHub:** push the code to `main` of the GitHub repository.
- **Vercel:** create the project from the repository with these environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable key)
  - `SUPABASE_SERVICE_ROLE_KEY` (secret key)
  - `NEXT_PUBLIC_SITE_URL`
- **Secrets:** they live only in `.env.local` and in Vercel, never in git.
- **Credentials shared during setup:** rotate any key or password that was shared in a chat once setup is done.
