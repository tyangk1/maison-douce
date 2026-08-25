# BUILD STATUS — Maison Douce

Living checkpoint file. Updated at meaningful milestones so another session
can resume without re-discovering context.

**Last updated:** 2026-08-25

## Completed

- [x] Prisma schema (User/Address/Category/Product/ProductImage/Inventory/
      Cart/Wishlist/Order/OrderItem/Payment/Promotion/NewsletterSubscriber/
      SiteSetting/ContactMessage/ActivityLog) + migration applied
- [x] Seed: 27 products, 7 categories, demo orders/customers/promotions,
      homepage content, admin account (env-driven)
- [x] Lib layer: auth (JWT cookies, bcrypt, requireUser/requireAdmin),
      Zod validation, cart pricing engine, mock payment provider adapter,
      asset layer with fallbacks
- [x] Storefront: homepage (all 10 sections), catalog + filters/search/sort,
      product detail (gallery/zoom/related), cart page + drawer,
      checkout (delivery/pickup, promos, mock payment), order confirmation,
      login/register, account (overview/orders/wishlist/profile+addresses),
      about/faq/contact, 404
- [x] Admin console: login, dashboard (KPIs/chart/alerts/activity), orders
      (filters/status pipeline/detail drawer, cancel-restock), products CRUD,
      categories, inventory, customers, promotions, homepage content editor,
      media library, settings
- [x] Tests: 18 vitest tests (money/utils/validation/pricing engine) — passing
- [x] Validation: typecheck ✓, lint ✓, prisma validate ✓, production build ✓
- [x] Live smoke tests against production server: all public routes 200,
      auth guards (307/401/403) verified, guest checkout + decline path (402)
      verified, order isolation verified
- [x] Visual QA via Playwright: 15 screenshots reviewed (desktop + mobile),
      fixed login redirect race (prefetched RSC), added noscript fallback
- [x] CI workflow (.github/workflows/ci.yml): secret check, typecheck, lint,
      prisma validate, migrate deploy, tests, build, seed smoke

## Remaining / known limitations

- [ ] GitHub push — remote configured (origin → tyangk1/maison-douce);
      push requires one interactive `gh auth login` or browser OAuth because
      stored GCM credentials demand an interactive flow. Local repo is clean
      and ready: `git push -u origin main`
- [ ] Supabase/Vercel deployment requires human login (no credentials in env)
- [ ] Payments are a labelled mock; Stripe adapter interface exists
- [ ] Wishlist is localStorage-based for guests; server-synced for accounts
- [ ] No email sending (order/receipt emails are simulated in copy)
- [ ] Product images are Unsplash-hosted; swap via src/lib/assets.ts

## How to resume

```bash
npm install && npx prisma migrate deploy && npm run seed && npm run dev
npm test && npm run build   # verify health
```
