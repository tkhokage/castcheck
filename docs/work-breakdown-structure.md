# Work Breakdown Structure (WBS) — CASTCHECK

Deliverable-oriented decomposition of the program into workstreams and work
packages. Status reflects the actual repository. IDs are stable so the
[RAID log](raid-log.md), [project plan](project-plan.md), and
[release plan](release-management.md) can reference them.

Legend: ✅ done · 🔶 partial · ⬜ backlog

## 1. Program management
- 1.1 Charter — [project-charter.md](project-charter.md) ✅
- 1.2 Stakeholders & RACI — [stakeholder-management.md](stakeholder-management.md) ✅
- 1.3 Roadmap (product + program) — [roadmap.md](roadmap.md), [program-roadmap.md](program-roadmap.md) ✅
- 1.4 Risk / RAID — [raid-log.md](raid-log.md) ✅
- 1.5 Budget & controls — [budget.md](budget.md) ✅
- 1.6 Reporting (exec dashboard, decision log, OKRs) — [executive-dashboard.md](executive-dashboard.md) ✅
- 1.7 Change control — [change-management.md](change-management.md) ✅
- 1.8 Retrospectives — [retrospectives/](retrospectives/) ✅

## 2. Product (Discovery workstream)
- 2.1 Discovery & filters — `/discover`, `filters.tsx` ✅
- 2.2 Opportunity feed & cards — `opportunity-card.tsx` ✅
- 2.3 Verification display — checks/trust/risk on detail page ✅
- 2.4 Matching — career-fit + agency match (`matching.ts`) ✅
- 2.5 Application tracking — `Application` model, `/tracker` ✅
- 2.6 Find-calls launchpad + import — `/find`, `actions/import.ts` ✅
- 2.7 Contract analysis — `/contracts`, `contract.ts` ✅

## 3. Trust & Safety
- 3.1 Risk model (likelihood × impact, thresholds) — `risk.ts` ✅
- 3.2 Automated screening — `screen.ts` ✅
- 3.3 Verification workflow (checks → state, trust levels) — `risk.ts`, moderation ✅
- 3.4 Moderation queue + reports → tickets — `/dashboard/moderation` ✅
- 3.5 Live source verification — `verify-web.ts`, `/api`-less server action ✅
- 3.6 Incident response register — GRC `Incident` model ✅

## 4. Security
- 4.1 Authentication — bcrypt + jose JWT sessions (`auth.ts`) ✅
- 4.2 RBAC — capability-based (`rbac.ts`) ✅
- 4.3 MFA — RFC-6238 TOTP + recovery codes (`totp.ts`, `recovery.ts`) ✅
- 4.4 Audit logging — `audit.ts`, `/dashboard/audit` ✅
- 4.5 Threat modeling — [threat-model.md](threat-model.md) ✅
- 4.6 Account recovery — forgot-password + reset (`password.ts`) ✅
- 4.7 Fail-closed defaults — AUTH_SECRET enforcement, demo-flag gate ✅

## 5. AI
- 5.1 Screening / classification — `screen.ts` + `ai.ts` ✅
- 5.2 Explainability — confidence labels, "AI-assisted vs rule-based" badges ✅
- 5.3 Contract analysis — `contract.ts` + `contractNarrative()` ✅
- 5.4 Evaluation — unit tests over deterministic logic (`*.test.ts`) 🔶
- 5.5 Guardrails — never invent evidence; rule-based fallback everywhere ✅

## 6. Operations (Support)
- 6.1 Support center & tickets — `/support`, `actions/support.ts` ✅
- 6.2 Knowledge base + outbound sources — `/knowledge`, `further-reading.tsx` ✅
- 6.3 Ticketing (triage, priority, resolution workflow) — `triageTicket()` ✅
- 6.4 Escalation & queues — `/dashboard/tickets`, assignment ✅

## 7. Platform (Data / Infra)
- 7.1 CI/CD — `.github/workflows/ci.yml`; Vercel `vercel-build` ✅
- 7.2 Testing — Vitest (51 tests) ✅ ; automated e2e (Playwright) ⬜
- 7.3 Deployment — Docker + compose, Vercel path, standalone build ✅ (live deploy pending creds 🔶)
- 7.4 Data platform — Prisma schema, SQLite→Postgres migration, seed/backfill ✅
- 7.5 Object storage — Vercel Blob (`upload.ts`) ✅
- 7.6 Rate limiting — Upstash Redis (`rate-limit.ts`) ✅
- 7.7 Monitoring — `/api/health` probe ✅ ; APM/alerting ⬜
- 7.8 Legal & accessibility — `/privacy`, `/terms`, `security.txt`, WCAG-AA pass ✅

---

### Coverage note

Every ✅ node maps to committed code, a doc, or a test in this repository. 🔶 and
⬜ nodes are tracked as open items in the [RAID log](raid-log.md) and the
[backlog section of the roadmap](roadmap.md).
