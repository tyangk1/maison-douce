# Supabase Integration Notes

## Current architecture

All database access happens **server-side through Prisma** (`src/lib/db.ts`).
The browser never talks to Supabase directly — there is no anon-key client —
so Row Level Security is not part of the current trust boundary. Authorization
is enforced in application code:

- `requireUser()` / `requireAdmin()` on every protected API route
- ownership checks (e.g. address deletion verifies `userId` match)
- middleware as an additional (never sole) gate for `/admin` and `/account`

## Migrating to Supabase Postgres

1. Create a Supabase project (free tier is sufficient).
2. `prisma/schema.prisma`: change `provider = "sqlite"` → `"postgresql"`.
   Add to the datasource block:
   ```prisma
   directUrl = env("DIRECT_URL")
   ```
3. Env vars (see `.env.example`):
   - `DATABASE_URL` = Supabase **pooled** connection string (port 6543,
     `?pgbouncer=true&connection_limit=1`) for runtime.
   - `DIRECT_URL` = direct connection (port 5432) for `migrate deploy`.
4. `npx prisma migrate deploy` then `npm run seed` (dev/demo only).
5. Regenerate: `npx prisma generate`.

SQLite → Postgres caveats handled by this schema: it already avoids SQLite-only
features (no enums — status fields are strings validated by Zod; no scalar
lists — tags are comma-separated).

## Supabase Storage (optional product imagery)

Suggested buckets: `product-images` (public read), `brand-assets` (private),
`user-uploads` (private, per-user path prefix).

If/when the client uploads media:

- Uploads must go through a server route holding the service-role key; never
  embed the service-role key in the browser.
- Storage RLS policies should restrict `user-uploads` writes to
  `auth.uid()::text = (storage.foldername(name))[1]`.
- Public buckets expose read-only `SELECT` to anon; writes admin-only.

## Admin roles

The role lives on the `User.role` column and is re-verified against the
database on every request (`getVerifiedSession`) — a stale or forged JWT role
claim cannot grant admin access after a role change.
