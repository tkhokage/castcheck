# Project Charter — CASTCHECK

| | |
|---|---|
| **Program** | Build a trusted opportunity platform for emerging performers |
| **Product** | CASTCHECK — *Find it. Verify it. Pursue it.* |
| **Document owner** | Program Manager |
| **Sponsor** | Executive Sponsor (portfolio) |
| **Status** | Active — MVP delivered; production-readiness pass (G-phases) complete; production deploy pending operator credentials |
| **Version** | 1.0 |

> This is a portfolio charter for a self-directed build. It is written the way a
> real charter would be handed to an executive sponsor, and every success
> criterion below maps to code and tests that actually exist in this repository.

---

## 1. Business problem

Emerging actors have difficulty distinguishing **legitimate** opportunities from
**fraudulent** ones, and they manage applications across fragmented channels
(Actors Access, Casting Networks, Backstage, IMDbPro, agency sites, social).
The result is wasted time and money, exposure to scams (upfront fees, gift-card
"registration," off-platform contact, requests for SSN/banking), and missed real
work because caution and opportunity are in constant tension.

There is no single place that helps a performer **find** what exists, **verify**
what is real, **evaluate** the residual risk against their actual career goals,
**apply**, and **track** — with the reasoning shown, not hidden.

## 2. Project objective

Build an MVP that enables users to **discover, assess, apply to, and track**
opportunities while maintaining a **trustworthy and explainable** verification
process — one that never presents a listing as "verified" without evidence and
never hides uncertainty.

## 3. Success criteria (outcomes, not output)

These are measurable and testable. The "Evidence" column points at where each is
enforced in the codebase.

| # | Success criterion | Evidence in repo |
|---|-------------------|------------------|
| SC-1 | ≥95% of submitted opportunities receive an automated initial screen | `src/lib/screen.ts` runs on every post/import; `screen.test.ts` |
| SC-2 | 100% of risk decisions expose evidence **and** a confidence/uncertainty label | Verification-check list + `AiResult.confidence` on every AI output |
| SC-3 | Critical-risk conditions prevent automatic "verified" status | `deriveVerificationState()` (risk.ts) + `risk.test.ts`; screening maps ≥2 high signals → `high_risk`/`flagged` |
| SC-4 | Support tickets receive automated triage (category + priority) | `triageTicket()` (ai.ts) with rule-based fallback |
| SC-5 | Application tracking supports end-to-end status visibility | `Application` model, 11 statuses, `/tracker` |
| SC-6 | CI passes on every PR | `.github/workflows/ci.yml` (install → generate → test → build) |
| SC-7 | Security controls documented **and** tested | `docs/security.md`, `docs/threat-model.md`; 51 unit tests incl. TOTP RFC-6238 vector |
| SC-8 | A user can self-recover access (forgot password, lost 2FA device) without DB edits | `/forgot-password`, `/reset-password`, 2FA recovery codes (G3) |
| SC-9 | Uploaded media persists across deploys on the production target | Object storage via `BLOB_READ_WRITE_TOKEN` (G4) |

## 4. Scope

**In scope (MVP + trust + support + security/GRC + AI + production-readiness):**
discovery & filtering, evidence-based verification, risk scoring, career-fit &
agency matching, application tracker, agency directory, report→ticket workflow,
support center + knowledge base, RBAC + MFA + audit logging, GRC register/controls/
incidents, AI screening/triage/contract-analysis (with rule-based fallbacks),
account recovery, object storage, rate limiting, legal pages, accessibility.

**Out of scope (this phase):** live integrations that scrape third-party casting
platforms (ToS-prohibited — CASTCHECK links out instead), native mobile apps,
payments, and real-time messaging.

## 5. Key deliverables

Working application (7 product areas), test suite + CI, full documentation set
(architecture, security, threat model, privacy, GRC, support, AI limits, roadmap,
deployment, testing) and — in this 2.0 pass — the program-management artifacts
(charter, WBS, RAID, stakeholders/RACI, plan, change control, UAT, releases,
budget, OKRs, decision log, retrospectives, executive dashboard, PM case study).

## 6. Milestones (summary — see [project-plan.md](project-plan.md))

| Milestone | Target | State |
|-----------|--------|-------|
| M1 Discovery complete | Wk 2 | ✅ |
| M2 Core platform (MVP) | Wk 5 | ✅ |
| M3 Trust & Safety | Wk 8 | ✅ |
| M4 Security & GRC | Wk 9 | ✅ |
| M5 AI layer | Wk 11 | ✅ |
| M6 Operations | Wk 12 | ✅ |
| M7 Testing / UAT | Wk 14 | ✅ (unit + manual; automated e2e is backlog) |
| M8 Production readiness | Wk 16 | ✅ code; deploy pending operator credentials |

## 7. High-level risks (see [raid-log.md](raid-log.md))

AI misclassification (mitigated by rule-based fallback + human review), stale
verification evidence (freshness timestamps), production data/infra gaps (object
storage + Redis + Postgres migration path), and dependency on operator-owned
cloud credentials for the final live deploy.

## 8. Assumptions & constraints

- Solo delivery; timeline and budget are **illustrative** (see [budget.md](budget.md)).
- Demo data until permitted real-data sources are integrated (Phase 6).
- Bleeding-edge stack (Next.js 16, React 19, Tailwind v4) — a deliberate risk,
  managed by pinning Prisma to v6 and documenting workarounds.

## 9. Authority

The Program Manager owns scope, schedule, risk, and reporting, and controls
change via the process in [change-management.md](change-management.md). The
Executive Sponsor approves charter changes, budget variance beyond contingency,
and go/no-go at each release gate ([release-management.md](release-management.md)).
