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

Vercel needs **your** account login, so do the account steps yourself. The repo
is already Vercel-ready: a `vercel-build` script (in `package.json`) switches
Prisma to Postgres, generates the client, runs `prisma migrate deploy`, and
builds — Vercel runs it automatically, so you don't have to script the build.

1. Create a managed Postgres DB (e.g. [Neon](https://neon.tech)) and copy its
   connection string (`...?sslmode=require`).
2. Import `github.com/tkhokage/castcheck` into Vercel (New Project → Import).
3. Add Environment Variables (Project → Settings → Environment Variables):
   - **Required:** `DATABASE_URL` (your Postgres URL), `AUTH_SECRET` (generate:
     `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`),
     `NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS=false`.
   - **Email (required for reset/verification):** `EMAIL_PROVIDER_API_KEY`,
     `EMAIL_FROM`, `APP_URL` (your Vercel URL). See the email prerequisite above.
   - **Storage:** add Vercel Blob (Storage → Blob) — `BLOB_READ_WRITE_TOKEN` is
     injected automatically.
   - **Rate limiting:** `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
   - Optional: `ANTHROPIC_API_KEY`.
4. Deploy. `vercel-build` runs migrations against your DB and builds.
5. Seed demo data once (optional), from your machine with the prod `DATABASE_URL`
   exported: `npm run db:use:postgres && npm run db:seed`.

> Local dev stays on SQLite — `vercel-build` only flips the provider inside
> Vercel's ephemeral build. Use `npm run db:use:sqlite` if you ever switch it
> locally.

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

Enforced by the codebase (verify once live):

- [ ] `AUTH_SECRET` is a strong, unique value — the app **refuses to boot**
      otherwise in production (fail-closed, G2).
- [ ] `NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS` is `false` so no demo creds show (G2).
- [ ] `DATABASE_URL` uses TLS (`sslmode=require` for managed Postgres).
- [ ] Migrations applied — `vercel-build` runs `prisma migrate deploy` (G9).
- [ ] `/api/health` returns 200.
- [ ] `EMAIL_PROVIDER_API_KEY` + `EMAIL_FROM` + `APP_URL` set — a real
      verification email arrives on sign-up, and password reset emails send (G3).
- [ ] `BLOB_READ_WRITE_TOKEN` set — an uploaded headshot persists across a
      redeploy (object storage, G4).
- [ ] `UPSTASH_REDIS_REST_URL` / `_TOKEN` set — rate limiting shared across
      instances (G4).
- [ ] `/privacy` and `/terms` reachable from the footer; a bad URL renders the
      branded 404 (G5/G6).
- [ ] Replace the placeholder `contact@` / `security@castcheck.example` addresses
      (`src/lib/constants.ts` + `/.well-known/security.txt`) with real, monitored
      inboxes on your domain (G6 TODO).
- [ ] Rotate/curate demo data or start clean (see [roadmap.md](roadmap.md) Phase 6).
