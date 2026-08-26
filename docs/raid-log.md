# RAID Log — CASTCHECK

**RAID** = Risks · Assumptions · Issues · Dependencies. Living register reviewed
at each phase gate. Probability/Impact: L/M/H.

## Risks

| ID | Description | Owner | Prob | Impact | Mitigation | Status |
|----|-------------|-------|------|--------|-----------|--------|
| R-01 | AI incorrectly classifies an opportunity (false verified / false scam) | AI / PM | M | H | Deterministic rule-based screening is the baseline; AI only summarizes/labels; every output carries confidence; human moderation on high-risk | Open (mitigated) |
| R-02 | Verification evidence becomes stale (a real site changes / goes down) | Trust & Safety | M | H | `lastVerifiedAt` freshness timestamps + live web re-check (`verify-web.ts`); re-verify on a schedule (Phase 6) | Open (mitigated) |
| R-03 | Bleeding-edge stack (Next 16 / React 19 / Prisma 7) breaks the build | Platform | M | M | Pinned Prisma to v6; documented Turbopack/root workarounds; CI on every PR | Open (mitigated) |
| R-04 | Third-party casting sites' ToS prohibit data integration | Product / Legal | H | M | No scraping — launchpad links out + user-initiated import; documented in Terms | Closed (design decision DEC-002) |
| R-05 | Real business listed in the directory is misrepresented (defamation risk) | Trust / Legal | L | H | Real agencies seeded at trust level 2 "publicly observable", clearly labeled not verified/endorsed, no risk flags | Open (mitigated) |
| R-06 | Local disk uploads lost on serverless redeploy | Platform | H | M | Object storage (Vercel Blob) behind env var (G4) | Closed |
| R-07 | Weak/absent `AUTH_SECRET` in production | Security | M | H | Fail-closed: app refuses to boot in prod on weak secret (G2) | Closed |
| R-08 | Password reset / verification emails silently fail | Security / Support | M | H | Real provider integration (Resend) with dev fallback that never drops the link (G3) | Closed |

## Assumptions

| ID | Assumption | Owner | Impact if false | Status |
|----|-----------|-------|-----------------|--------|
| A-01 | Solo delivery; timeline/budget are illustrative | PM | Re-baseline plan & budget | Valid |
| A-02 | Demo data is acceptable until permitted real sources exist | Product | Accelerate Phase 6 data work | Valid |
| A-03 | Operator will provide cloud accounts (Vercel/DB/email) for the live deploy | Sponsor | Deploy blocked; ship deploy-ready only | Valid |
| A-04 | Rule-based logic is sufficient when AI keys are absent | AI | Degraded UX, still functional | Validated (fallbacks tested) |

## Issues

| ID | Description | Owner | Prob | Impact | Resolution | Status |
|----|-------------|-------|------|--------|-----------|--------|
| I-01 | Docs claimed both "TOTP MFA" and "MFA-ready architecture" — inconsistent | Security | H | M | Real TOTP MFA + recovery codes shipped (G3); README/architecture/threat-model reconciled to state the implemented control | **Closed** (see [decision-log DEC-003](decision-log.md)) |
| I-02 | `next start` fails with `output: standalone`; must run `.next/standalone/server.js` | Platform | H | L | Documented in deployment.md; Docker/Vercel use the correct entrypoint | Closed |
| I-03 | Free tunnel services (Cloudflare/localtunnel/localhost.run) intermittently unreliable for a public demo URL | Platform | M | L | Not a code defect; permanent public URL is the Vercel deploy | Open (accepted) |

## Dependencies

| ID | Description | Owner | Prob | Impact | Plan | Status |
|----|-------------|-------|------|--------|------|--------|
| D-01 | Production DB migration required (SQLite → PostgreSQL) | Platform | M | H | `set-db-provider.mjs` + committed `prisma/migrations/0_init`; `vercel-build` runs `migrate deploy` | Ready |
| D-02 | Operator cloud credentials (Vercel, Neon, Resend, Upstash) for live deploy | Sponsor | H | H | Complete setup guide in deployment.md; blocked only on operator action | **Blocking go-live** |
| D-03 | Email sending domain verification (Resend) for reset/verification to arbitrary users | Security | M | M | Documented; test mode works to owner address until a domain is verified | Open |
| D-04 | Real contact/security inbox on a real domain (currently placeholder) | Ops / Legal | H | L | Placeholders + TODO centralized in `constants.ts` + `security.txt` | Open |

## Sequencing dependencies (technical)

- **Verification engine → moderation workflow → application readiness** — you
  cannot moderate or safely apply until screening/verification produces evidence.
- **Authentication → RBAC → audit logging** — identity must exist before roles;
  roles must exist before privileged actions are meaningfully auditable.

See [project-plan.md](project-plan.md) for these on the schedule.
