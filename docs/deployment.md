# Deployment

CASTCHECK is production-ready. Local development uses SQLite; **production uses
PostgreSQL**. Pick one of the paths below.

The production build and runtime are verified: `npm run build` succeeds with
`output: "standalone"`, and `next start` serves the app (home, discover, login,
and `GET /api/health` → `{"status":"ok","db":"up"}`).

---

## Prerequisites

- A PostgreSQL database (managed: Neon, Supabase, RDS, Railway; or self-hosted).
- `AUTH_SECRET` — a long random string:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
  ```
- **Transactional email (for password reset + verification).** Sign up for
  [Resend](https://resend.com) (free tier: 3,000 emails/mo), verify a sending
  domain, create an API key, and set:
  - `EMAIL_PROVIDER_API_KEY` — the Resend API key.
  - `EMAIL_FROM` — e.g. `CASTCHECK <noreply@yourdomain.com>` (must match a
    verified Resend domain).
  - `APP_URL` — your public base URL (e.g. `https://castcheck.vercel.app`), so
    email links are absolute.
  Without these, reset/verification links are logged and shown in a dev-only
  banner instead of emailed — fine for local dev, not for production.
- **Object storage for uploads.** On Vercel: **Storage → Blob → Create store**;
  the `BLOB_READ_WRITE_TOKEN` is injected automatically (copy it for other hosts).
  Without it, uploads use local disk — which is ephemeral on serverless, so set
  this for any real deploy.
- **Redis rate limiting.** Sign up for [Upstash](https://upstash.com), create a
  Redis database, and set `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`.
  Without them the limiter falls back to per-instance memory.
- Optional `ANTHROPIC_API_KEY` to enable the AI layer.

See [`.env.production.example`](../.env.production.example).

---

## Option A — Docker Compose (self-contained: app + Postgres)

```bash
export AUTH_SECRET="$(node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))")"
docker compose up --build
# → http://localhost:3000   (health: /api/health)
```

Compose starts Postgres, runs `prisma migrate deploy` (the `migrate` service),
then launches the standalone Next server. Data persists in the `pgdata` volume.

To load demo data once: `docker compose run --rm migrate npx prisma db seed`.

## Option B — Vercel (managed, recommended for a live URL)

Vercel needs **your** account login, so run these yourself:

1. Create a Postgres database (e.g. Neon) and copy its connection string.
2. In the project: `npm i -g vercel && vercel link`.
3. Add env vars (Project → Settings → Environment Variables):
   `DATABASE_URL`, `AUTH_SECRET`, and optionally `ANTHROPIC_API_KEY`.
4. Point Prisma at Postgres and apply the schema:
   ```bash
   npm run db:use:postgres
   npx prisma migrate deploy      # against your production DATABASE_URL
   npm run db:seed                # optional demo data
   ```
5. Deploy: `vercel --prod`.

> `npm run db:use:postgres` rewrites the Prisma datasource provider to
> `postgresql`. Commit that change for the production branch (or run it in the
> build step). Use `npm run db:use:sqlite` to switch back for local dev.

## Option C — Any Node host / VPS

```bash
npm ci
npm run db:use:postgres
npx prisma generate
npx prisma migrate deploy        # DATABASE_URL points at your Postgres
npm run build
npm run start                    # or run .next/standalone/server.js
```

Put it behind a reverse proxy (Nginx/Caddy) with TLS. Point health checks at
`/api/health`.

---

## Post-deploy checklist

- [ ] `AUTH_SECRET` is a strong, unique value (not the dev default).
- [ ] `DATABASE_URL` uses TLS (`sslmode=require` for managed Postgres).
- [ ] Migrations applied (`prisma migrate deploy`).
- [ ] `/api/health` returns 200.
- [ ] Rotate/curate demo data or start clean (see [roadmap.md](roadmap.md) Phase 6).
- [ ] Move uploads to object storage and the rate limiter to Redis for scale
      (see [security.md](security.md)).
