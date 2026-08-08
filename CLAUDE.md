@AGENTS.md

# CASTCHECK — operating file

Working notes for building CASTCHECK. The full product spec lives in the user's
reference document; this file tracks how the code is organized and what's done.

## Stack
Next.js 16 (App Router, Server Components + Server Actions), TypeScript,
Tailwind v4, Prisma 6 + SQLite (local; swap provider to `postgresql` for prod),
custom auth (bcryptjs + jose JWT httpOnly cookie), Zod, Anthropic SDK (optional).

## Run
- `npm run dev` — dev server (preview config uses port 3100)
- `npm run db:push` / `npm run db:seed` — schema + demo data
- `npm run build` — production build (must stay green)
- Demo accounts: `actor@ / casting@ / agency@ / moderator@ / support@ / grc@ / admin@castcheck.app`, password `demo1234`

## Layout
- `src/app/(main)` — app shell (nav+footer): landing, discover, opportunities,
  agencies, profile, tracker, saved, knowledge, support, dashboard (role-gated).
- `src/app/(auth)` — login/register, no chrome.
- `src/app/actions/*` — server actions (auth, opportunities, profile, support,
  moderation, admin, create-opportunity).
- `src/lib/*` — db, auth, rbac, risk, matching, screen, ai, audit, constants, utils.
- `src/components/*` — UI kit (`ui.tsx`), badges, cards, controls.

## Conventions
- Business logic (risk, matching, screen) stays as pure functions in `lib`.
- Every privileged server action re-checks `can(role, cap)` server-side.
- Every mutation validates with Zod and calls `audit()` where security-relevant.
- Verification/trust/risk vocabulary lives in `constants.ts` + `risk.ts` — reuse it.
- Career fit is always separate from risk; never let fit suppress a warning.
- AI results always carry `{source, confidence}` and fall back to rules.

## Phase status
- Phase 1 MVP — done · Phase 2 Trust — done · Phase 3 Support — done
- Phase 4 Security & GRC — done · Phase 5 AI — done · Phase 6 Real data — planned

## Production readiness — done
Hardening: rate limiting, TOTP MFA, email verification, validated uploads, 36-test
Vitest suite. Deploy: `output: "standalone"`, `/api/health`, Postgres path
(scripts/set-db-provider.mjs + prisma/migrations/0_init + db:migrate:deploy),
Dockerfile + docker-compose, GitHub Actions CI, docs/deployment.md. Verified via
`next build` + `next start` (pages 200, health db:up). Local dev stays SQLite.
Live cloud deploy is the only remaining step — needs the user's host credentials.

## Backlog (see docs/roadmap.md)
Postgres+object storage in prod, Redis-backed limiter, real email provider,
Playwright e2e. Phase 6 real permitted-source data.
