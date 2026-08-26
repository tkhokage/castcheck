# Release Management — CASTCHECK

Incremental releases, each with a scope, a testing bar, an explicit **go/no-go**
gate, and a **rollback** plan. Releases map to the product phases and the
production-readiness (G) pass.

## Release train

| Release | Theme | Maps to | Status |
|---------|-------|---------|--------|
| v0.1 | Foundation (MVP) | Phase 1 | ✅ Shipped |
| v0.2 | Trust & Safety | Phase 2 | ✅ Shipped |
| v0.3 | Security & GRC | Phase 4 | ✅ Shipped |
| v0.4 | AI | Phase 5 | ✅ Shipped |
| v0.5 | Operations | Phase 3 support | ✅ Shipped |
| v0.9 | Production readiness | G1–G8 | ✅ Shipped (code) |
| v1.0 | Production MVP (live) | G9 | 🔶 Config ready; awaiting operator deploy (D-02) |

## Standard gate (every release)

- **Testing:** unit suite + `npm run build` green in CI; relevant UAT scenarios Pass.
- **Go/no-go inputs:** open Sev-1/2 defects (must be 0), RAID review, security posture.
- **Rollback:** revert to the previous git tag / Vercel deployment; DB migrations
  are additive and backward-compatible within a release.

## Release detail

### v0.1 — Foundation
- **Scope:** landing, auth (register/login/logout), actor profile, opportunity feed, search/filters, detail page, save, application tracker, seed data.
- **Risks:** bleeding-edge stack (R-03). **Deps:** data model → seed.
- **Go/no-go:** MVP journey works end-to-end; build green. **Result:** Go.

### v0.2 — Trust & Safety
- **Scope:** verification states + trust levels, risk scoring, risk indicators, report→ticket, moderation queue, agency directory + matching.
- **Risks:** R-01 (AI misclass — N/A yet, rule-based), R-05 (real-agency framing).
- **Deps:** verification engine → moderation. **Go/no-go:** high-risk cannot auto-verify. **Result:** Go.

### v0.3 — Security & GRC
- **Scope:** RBAC, TOTP MFA + recovery codes, audit logging, data classification, risk register, control matrix, incident register, GRC dashboard.
- **Risks:** R-07 (weak secret — fail-closed). **Deps:** auth → RBAC → audit.
- **Go/no-go:** privileged actions audited; threat model documented. **Result:** Go.

### v0.4 — AI
- **Scope:** opportunity screening narrative, risk summary, career-fit narrative, ticket triage, contract analysis + digital-likeness flags; guardrails + rule-based fallbacks.
- **Risks:** R-01. **Deps:** AI guardrails → AI features.
- **Go/no-go:** every AI output labeled + falls back cleanly without a key. **Result:** Go.

### v0.5 — Operations
- **Scope:** support center, auto-triaged tickets, resolution checklists, knowledge base + authoritative outbound links.
- **Go/no-go:** report and ticket flows close the loop. **Result:** Go.

### v0.9 — Production readiness (G1–G8)
- **Scope:** env onboarding, fail-closed AUTH_SECRET + demo gate, account recovery (email/reset/2FA codes), object storage, Redis rate limiting, branded error/404/loading + success banners, privacy/terms + security.txt, WCAG-AA accessibility, KB outbound links.
- **Risks/Deps:** R-06/R-08 closed; D-03 (email domain), D-04 (real inboxes) open.
- **Go/no-go:** build + 51 tests green; verified flows (reset, 404, privacy/terms). **Result:** Go.

### v1.0 — Production MVP (live)
- **Scope:** deploy to Vercel + managed Postgres; email, object storage, Redis wired via env; go-live UAT re-run against the live instance.
- **Risks:** D-02 (operator credentials — **blocking**), D-03.
- **Go/no-go criteria:** `/api/health` 200 · migrations applied · demo accounts hidden · a real verification email arrives · an upload survives a redeploy · privacy/terms reachable · error/404 branded.
- **Rollback:** Vercel instant rollback to the prior deployment; DB migration `0_init` is the baseline.
- **Result:** Pending operator deploy.
