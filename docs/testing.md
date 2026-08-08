# Testing & verification

## How this build was verified

- **Production build** — `npm run build` compiles cleanly: TypeScript passes and
  all 21 routes build with no errors.
- **Manual E2E in a browser** across roles:
  - Landing, Discover (filters + search), and opportunity detail render with
    live seed data.
  - The critical-risk scam listing correctly shows all failed checks, a 25/25
    risk matrix, seven risk indicators, and — crucially — a *separate* career-fit
    score, proving "a good fit never hides a warning."
  - Actor flow: profile, tracker (seeded applications), saved, career-fit on
    detail pages.
  - Staff flows: operations overview (live aggregates), moderation queue, ticket
    queue, GRC register/controls/incidents, user management, audit log.
  - Posting flow: a casting pro submits a listing → auto-screened → pending
    checks + computed risk → appears in moderation.
- **Domain logic spot-check** — `screen.ts` was exercised on scam text and
  produced the expected 7 indicators and a high-risk/flagged recommendation.

## Suggested automated test suite (backlog)

Pure domain logic in `src/lib` is the highest-value, easiest target:

- `risk.ts` — `riskLevel` thresholds; `deriveVerificationState` transitions.
- `matching.ts` — `careerFit` / `agencyMatch` scoring and that risk is never
  folded into fit.
- `screen.ts` — each scam pattern fires; severity aggregation and suggested
  state/status.

Recommended tooling: **Vitest** for unit tests, **Playwright** for the critical
user journeys (register → profile → discover → track; report → ticket;
moderation decision).

## Manual regression checklist

1. Register a new actor → lands on profile.
2. Complete profile → career-fit scores appear on detail pages and agencies.
3. Save + track an opportunity → appears in Saved and Tracker.
4. Report a listing → confirmation shown; item appears in moderation + a ticket
   is created.
5. Sign in as moderator → flag/publish/reject updates the listing.
6. Sign in as support → triage + resolve a ticket.
7. Sign in as admin → change a role, deactivate a user; both appear in the audit
   log.
