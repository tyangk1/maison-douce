# Maison Douce — Artisan Bakery E-Commerce

A complete, premium direct-to-consumer e-commerce experience for a fictional
artisan bakery brand. Storefront, checkout, customer accounts and a full
operations console for staff — production-shaped, not a tutorial project.

![Stack](https://img.shields.io/badge/Next.js-14-black) ![TS](https://img.shields.io/badge/TypeScript-strict-blue) ![Prisma](https://img.shields.io/badge/Prisma-6-2D3748) ![Tests](https://img.shields.io/badge/tests-vitest-green)

## Features

**Storefront**
- Cinematic editorial homepage: hero, featured collection, live "baked today"
  stock counters, brand story, signature collection, seasonal campaign,
  process, testimonials, gallery, newsletter
- Catalog with search, category / price / availability filters, sorting, pagination
- Rich product pages: gallery with zoom, stock state, ingredients, allergens, nutrition
- Persistent cart (survives refresh) with animated cart drawer
- Checkout with delivery/pickup, promo codes, and a clearly labelled **mock
  payment provider** behind a swappable adapter interface
- Order confirmation + order history
- Auth (register/login/logout), customer account, profile, addresses, favourites
- About, FAQ, Contact pages; newsletter signup; contact form

**Operations console (`/admin`)**
- Role-guarded, dark operational UI (separate design language from the store)
- Dashboard: revenue KPIs, 14-day chart, low-stock alerts, popular products, activity feed
- Product / category management, inventory adjustments
- Order pipeline with status transitions (cancel → automatic restock)
- Customer overview, promotion campaigns, homepage content editor, media
  library, site settings

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS with a custom token system (Playfair Display + Inter) |
| Motion | Framer Motion (reduced-motion aware) |
| Data | Prisma ORM — SQLite locally, PostgreSQL-portable schema |
| Auth | HttpOnly JWT session cookies (jose) + bcrypt(12), role-checked server-side |
| Validation | Zod on every API route |
| Tests | Vitest (domain + pricing engine with mocked DB) |

## Quick start

```bash
npm install
cp .env.example .env        # defaults work out of the box
npx prisma migrate deploy   # create the database
npm run seed                # 27 products, demo orders, promo codes, admin user
npm run dev                 # http://localhost:3000
```

### Demo accounts (local seed only)

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@maisondouce.test` | `MaisonAdmin!2026` (from `.env`) |
| Customer | `customer@example.com` | `DemoCustomer1` |

> Do **not** seed default admin credentials in production. Create the admin
> account manually with a strong password.

### Mock payments

Checkout charges through `MockPaymentProvider` (`src/lib/payment.ts`):

- `4242 4242 4242 4242` → success
- any number ending `0002` → decline (tests the failure path)

To add Stripe, implement the `PaymentProvider` interface and register it —
no checkout domain or UI changes required.

## Switching to PostgreSQL / Supabase

The Prisma schema is provider-portable:

1. In `prisma/schema.prisma` change `provider = "sqlite"` → `"postgresql"`.
2. Set `DATABASE_URL` to your Supabase pooled connection string (see
   `.env.example`) and `DIRECT_URL` for migrations.
3. `npx prisma migrate deploy && npm run seed`.

All database access is **server-side via Prisma** — the Supabase anon key is
never used from the browser, so no client-side RLS surface exists. If you
later add Supabase Storage for product images, keep buckets private and serve
through signed URLs from API routes; the image layer (`src/lib/assets.ts`) is
the single place to swap sources.

## Scripts

```bash
npm run dev          # dev server
npm run build        # production build
npm start            # serve production build
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm test             # vitest
npm run seed         # seed demo data
npm run db:migrate   # prisma migrate deploy
node scripts/visual-qa.cjs   # full-page screenshots (needs `npx playwright install chromium`)
node scripts/e2e-journey.cjs # browser purchase journey
```

## Project structure

```
src/
  app/
    (storefront)/        # customer experience (shared shell)
    admin/               # operations console (protected route group)
    api/                 # REST endpoints (auth, orders, admin, ...)
  components/
    store/               # storefront UI
    admin/               # console UI
    ui/                  # primitives
  lib/                   # db, auth, pricing engine, payment adapter, validation
prisma/                  # schema + seed
tests/                   # vitest suites
```

## Security notes

- Sessions: HttpOnly, SameSite=Lax, Secure (in production), signed JWT (jose)
- Passwords: bcrypt cost 12; login errors are generic (no account enumeration)
- Every admin API route calls `requireAdmin()` — middleware is defence-in-depth,
  never the only gate; negative tests included in the validation log below
- Carts are re-priced server-side from the database; client prices are ignored
- Orders are scoped by `userId`; order confirmation pages for linked orders
  require the owning session
- Input validated with Zod at every boundary; secrets only via env vars

## Deployment (Vercel)

1. Push to GitHub (see `docs/BUILD_STATUS.md` for current state).
2. Import the repo in Vercel; set env vars for Preview and Production:
   `DATABASE_URL`, `AUTH_SECRET` (+ optional Supabase vars).
3. Run `npx prisma migrate deploy` against the production database once.
4. Vercel builds with `npm run build` — no extra config needed.
