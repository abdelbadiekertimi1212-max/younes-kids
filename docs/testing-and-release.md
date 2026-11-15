# Younes Kids — Testing & release

## 1. Commands

```bash
npm run typecheck      # tsc --noEmit
npm run lint           # eslint
npm run test           # vitest: unit + database tests (PGlite)
npm run check          # all three
npm run build          # next build
```

Database tests need no Supabase project: `tests/db/harness.ts` starts an in-process Postgres 17 (PGlite), loads a Supabase stub (`anon`/`authenticated`/`service_role` roles, `auth.users`, `auth.uid()`, `storage.*`), then applies **every real migration** plus `supabase/seed.sql`.

## 2. Current results (Younes Kids, 2026-11-15)

| Check | Result |
| --- | --- |
| Typecheck | ✅ 0 errors |
| Lint | ✅ 0 problems |
| Tests | ✅ **78 passed** (7 files: unit + PGlite database tests) |
| Production build | ✅ 108 pages |
| Migrations 0001–0007 on the new Supabase project | ✅ dry run, then applied; `migrate.mjs --status` → up to date |
| Seed | ✅ 6 kids categories, 58 wilayas (500/300 DA, south 800/500), 8 roles, settings, reasons, 4 draft content pages |
| Owner account | ✅ username `12345678`, role owner, "change your initial password" warning on |

**End-to-end run (local dev server against the real database, 2026-11-15)**, all test data deleted afterwards:

- Storefront in AR / FR / EN renders with the Younes Kids logo, colours and fonts; no console errors except product images refused by the local image optimiser (this machine's DNS64 resolves Supabase to `64:ff9b::` addresses, which Next.js treats as private). Images are served normally on Vercel.
- Admin login with username + password; wrong password → generic error.
- Product created in Admin → Products (gender, age size, compare-at price) and published.
- Shop filters: 15 combinations of category, gender, age group, size, colour, price and stock all return the expected products (out-of-stock sizes excluded).
- Product page: sizes in age order with localized labels, size guide, "new" badge in related products.
- Cart → checkout: server quote 2 900 + 500 (wilaya 16, home) = 3 400 DA; confirmation step; order #1001 created; abandoned-checkout lead removed on order.
- Admin: order confirmed → stock 6 → 5 with an `order_committed` inventory log.
- My account: wrong current password refused; username change; password mismatch refused; password change keeps the session; sign-in with the new username (any case) and password; every change in the audit log.
- Landing page: draft saved, private preview link renders with logo, price, colours and sizes.

## 3. Test inventory

**`tests/db/commerce.test.ts` (30 tests, real SQL):**
- Migrations apply on top of 0001/0002 + seed; 0003–0005 are re-runnable.
- Pricing: DB-derived lines/subtotal/fees; client prices ignored; duplicate lines merged; stock limits; unavailable variants; disabled wilayas/delivery types; percentage/fixed/free-shipping codes; min subtotal; expired/unknown codes; product-scoped discounts; free-shipping threshold; best automatic discount.
- `create_order`: atomic creation (order, items, customer, timeline), stock untouched until confirmation; idempotent retries; server-side customer validation; duplicate flag; invalid code rejected; usage limit enforced atomically; consent only when given; per-phone spam limit.
- Lifecycle: TS map ≡ DB rules (36 pairs); illegal transitions rejected by trigger; confirm commits stock; cancel releases once; double-cancel is a no-op; insufficient stock blocks confirmation with no side effects; COD payment status, `sold_count`, customer stats; post-delivery return restocks once.
- Inventory: atomic adjust + log; negative refused; optimistic concurrency; reason whitelist.
- RLS: anon sees only active catalog, no orders/customers/RPCs; archived products hidden (and constraint-protected); signed-in shoppers can browse (private-schema grant); analyst read-only, no secrets; fulfillment can update but not delete orders; product manager can't see orders; manager can't change staff or settings; admin can; legacy inserts get a `role_key`.

**`tests/unit/variants.test.ts` (4):** variant resolution with mixed sized/unsized variants (live data shape), required-option logic, exact-match preference, size availability.

**`tests/unit/lib.test.ts` (12) / `metrics.test.ts` (4):** CSV formula injection + parser round-trip (Arabic, quotes, newlines); permission checks; status map invariants; audit redaction; theme/pixel/URL injection rejected; checkout/discount/product/form schemas; metric formulas and denominators.

**Not automated (gaps):** React component tests; end-to-end browser journeys (Playwright not installed — it downloads browsers, so ask before adding it); load/concurrency tests against real Supabase; accessibility audits.

## 4. Release procedure

> The new code **requires** migrations 0003–0005. Deploying code first would lock staff out of the admin (it reads `staff_roles`) and break checkout (it calls `create_order`). The migrations are backward compatible with the currently deployed code, so apply them first.

0. **Merge first.** The live site runs unpushed code newer than this repository (see `architecture-audit.md` §5.1). Merge this work into that source and keep its reviews, leads, blocked phones, spam/archive and attribution features. Deploying this folder as-is would remove them.
1. **Backup:** `node --env-file=.env.local scripts/db/snapshot.mjs <dir>` (read-only JSON of all data and security definitions) plus Supabase Dashboard → Database → Backups (or `pg_dump` the `public`, `private` and `storage` schemas).
2. **Connection:** `SUPABASE_DB_URL` uses the **Session pooler** `aws-0-eu-west-1.pooler.supabase.com:5432` (user `postgres.<ref>`). The direct `db.<ref>.supabase.co` host is IPv6-only and doesn't resolve from this machine. Verified: status and a full dry run passed on 2026-10-29.
3. `npm run db:migrate:status`: read-only; lists pending migrations and detects the 0001/0002 baseline.
4. `npm run db:migrate:dry`: applies all pending migrations in one transaction, then rolls back.
5. `npm run db:migrate`: applies them for real. Each migration runs in its own transaction and is recorded in `private.schema_migrations`.
6. Assign yourself the owner role (optional; existing `admin` accounts already have every permission): `update public.admins set role_key = 'owner' where email = '<you>';`
7. Merge the code into the GitHub repository that Vercel deploys and push. Add `RATE_LIMIT_SALT` (random string) and, optionally, `AI_GATEWAY_API_KEY` in Vercel → Settings → Environment Variables.
8. Run the smoke test (§5) on the deployment.

**Rollback:** code rollback = redeploy the previous Vercel deployment. That works because the migrations are additive and the old code ignores the new columns and tables. Two behaviours stay strict after a code rollback: illegal status jumps are rejected, and staff writes need a permission. The old admin keeps working for `admin` accounts. Full database rollback = restore the backup from step 1.

## 5. Smoke-test checklist (after migrations)

Storefront (mobile width 375 px, then desktop; AR, then FR):
- [ ] Home, shop, product page render; colour switch changes the image; sold-out sizes struck through.
- [ ] Add 2 products to the cart → badge count; cart shows server prices; quantity limits.
- [ ] Checkout: wilaya fee appears; disabled delivery type is greyed out; wrong discount code shows a localized error; valid code reduces the total; double-tapping "confirm" creates **one** order.
- [ ] Success page → "Track your order" link shows the timeline.
- [ ] `/track` with order number + wrong phone → "not found"; the right phone works.
- [ ] FAQ, shipping (live fees), contact (form sends), footer links all resolve; drafts don't appear in the footer.

Admin:
- [ ] Owner sees every menu item; an `analyst` test account sees read-only screens and gets "no access" on settings.
- [ ] Order: log a call → timeline entry; confirm → stock decreases (inventory history shows `order_committed`); cancel → stock restored once.
- [ ] Ship → delivered → payment "collected" → "received from carrier" → "settled".
- [ ] Product edit: change the French description, save, reload → kept. Edit stock in two tabs → the second save gets a "stock changed" error.
- [ ] Inventory adjust +5 "received" → history entry. Discount create → works at checkout.
- [ ] Exports download; Arabic opens correctly in Excel.
- [ ] Audit log shows the actions above.
