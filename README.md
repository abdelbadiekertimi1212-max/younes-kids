# Younes Kids 👑

Online children's clothing store for Algeria (0–14 years): babies, girls, boys, pyjamas, shoes and accessories.
**Cash on delivery** to all 58 wilayas, guest checkout, Arabic (default, RTL) · Français · English, and a full admin.

The full product specification is in [`docs/MASTER_PROMPT.md`](docs/MASTER_PROMPT.md).

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** — kids palette (logo gold, navy, sky / candy / mint), Baloo Bhaijaan 2 + Nunito
- **Supabase** — Postgres (RLS everywhere), Auth (staff only), Storage
- **Vercel** hosting + Analytics

## Features

- 🧒 Kids catalog: age sizes (`0-3M` … `14Y`, shoes `16`–`38`) always sorted by age, girls / boys / unisex,
  size guide by age and height, "new / promo / almost sold out" badges
- 🔎 Shop filters: category, gender, age group, size, colour, price, in stock (shareable URLs)
- 🛒 Cart, checkout with server-side pricing, delivery fee per wilaya, discount codes, abandoned-checkout leads
- 📦 Orders: confirmation workflow, stock committed on confirm, COD collection / settlement, carriers, CSV export
- 📣 Landing pages for ads (movable order form, button design), homepage builder (draft → preview → publish)
- 📈 Meta Pixel + Conversions API, TikTok, GA4, first-party visits and conversion
- 🔐 Staff roles and permissions, audit log, username login, "My account" to change username / password

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the Supabase keys
npm run dev
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm test` | Unit + database tests (PGlite) |

## Database

```bash
# SUPABASE_DB_URL (session-pooler connection string) must be in .env.local
node --env-file=.env.local scripts/db/migrate.mjs            # applies supabase/migrations
node --env-file=.env.local scripts/db/run-sql.mjs supabase/seed.sql   # categories, 58 wilayas, settings
node --env-file=.env.local scripts/db/create-admin.mjs --username <name> --password <pw> --role owner --must-change
```

## Admin

- Sign in at **`/ar/admin/login`** with your **username** (or email) and password.
- Change your username and password in **Admin → My account** (also linked from Settings).
- Products: add photos, sizes by age, colours and stock. Sizes are suggested and sorted automatically.

## Environment

See [`.env.example`](.env.example). Secrets live only in `.env.local` (git-ignored) and in Vercel
(**Project → Settings → Environment Variables**):
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`.

## Deployment

Vercel, connected to this GitHub repository: every push to `main` deploys to production.
`robots.txt`, `sitemap.xml` (with hreflang), Open Graph images and Product JSON-LD are generated automatically.
