# CASTCHECK — Technical Program Management Case Study

> A recruiter or executive can read this top-to-bottom without knowing
> TypeScript. A technical reader can click into any linked doc and go deep. Two
> layers of proof from one project.

**One line:** I planned, organized, de-risked, and delivered a trust-first
opportunity platform for emerging performers — as a **program** of four
workstreams — and drove it to production-ready with documented controls,
decisions, and outcomes.

---

## 1. Business problem
Emerging actors can't easily tell **legitimate** casting opportunities from
**scams**, and they juggle applications across fragmented channels. That costs
them time, money, and real work. There was no single place to **find → verify →
evaluate → apply → track**, with the reasoning shown rather than hidden.

## 2. Program objective
Deliver an MVP that lets users discover, assess, apply to, and track
opportunities on a **trustworthy and explainable** verification process — one
that never labels something "verified" without evidence and never hides
uncertainty. → [Project Charter](project-charter.md)

## 3. How the work was organized (program, not just a project)
Four parallel programs, each with its own projects and cross-program
dependencies → [Program Roadmap](program-roadmap.md), [WBS](work-breakdown-structure.md):

1. **Trust Platform** — verification engine, risk scoring, screening, moderation.
2. **Secure Platform** — identity, RBAC, MFA, audit, privacy, recovery.
3. **Intelligent Platform** — AI screening, matching, contract analysis, guardrails.
4. **Operations Platform** — support, knowledge base, incidents, admin.
Underpinned by a **Platform** workstream (CI/CD, data, deployment, monitoring).

## 4. Stakeholders & coordination
Internal (Product, Engineering, Security, GRC, AI/ML, Support, Design), external
(actors, casting pros, agencies), and governance (Legal/Privacy, Trust & Safety).
Coordination modeled with RACI matrices for verification, security, AI, and
release. → [Stakeholder Management + RACI](stakeholder-management.md)

## 5. Timeline
A 16-week plan across seven delivery phases + UAT + production readiness, with the
critical sequencing made explicit (auth→RBAC→audit; verification→moderation→apply).
→ [Project Plan (with Gantt)](project-plan.md)

## 6. Technical architecture (the deep layer)
Next.js 16 full-stack app; server-rendered with server actions; Prisma data layer
(SQLite in dev → Postgres in prod); custom auth (bcrypt + JWT), TOTP MFA; an AI
layer that always falls back to deterministic rules.
→ [Architecture](architecture.md) · [Security](security.md) · [Threat Model](threat-model.md) · [Privacy](privacy.md) · [GRC](grc.md) · [AI limits](ai-limitations.md)

## 7. Risk management
A living **RAID log** — e.g. AI misclassification (rule-based fallback + human
review), stale evidence (freshness + live re-check), production infra gaps
(object storage/Redis/migration), and the go-live dependency on operator cloud
credentials. → [RAID Log](raid-log.md)

## 8. Key decisions (governed, not accidental)
Hybrid risk scoring for explainability; **link-out + import instead of scraping**
(ToS/legal); real TOTP MFA (resolving a doc inconsistency); data minimization for
contracts; graceful degradation for every integration.
→ [Decision Log](decision-log.md) · [Change Management](change-management.md)

## 9. Delivery & quality
Incremental releases v0.1 → v0.9, each with a go/no-go gate and rollback plan;
51 unit tests (incl. the RFC-6238 MFA vector) green in CI on every build; UAT
scenarios by role. → [Release Management](release-management.md) · [UAT Plan](uat-plan.md) · [Testing](testing.md)

## 10. Results (outcomes, measured where possible)
Framed as OKRs: ≥95% of opportunities auto-screened; 100% of risk decisions show
evidence + confidence; **zero** unverified-as-verified; privileged actions logged;
self-service account recovery; accessibility to WCAG AA. → [Program OKRs](program-okrs.md) · [Executive Dashboard](executive-dashboard.md)

**Status:** MVP + all delivery phases + the production-readiness pass (G1–G8) are
delivered and committed. The live v1.0 deploy (Vercel + Postgres) is configured to
one step and awaits operator cloud credentials — a controlled, documented gate,
not missing work.

## 11. Budget & controls
An illustrative $135.3k MVP budget tracked planned vs. actual vs. variance
(~15% under, driven by rule-based fallbacks and free-tier infra). → [Budget](budget.md)

## 12. Lessons learned
Guardrails-first makes AI safe to ship; many "production-readiness" gaps are
really ease-of-use gaps; provision the live environment before the final pass so
go-live UAT isn't blocked. → [Retrospectives](retrospectives/)

---

### Which role does this evidence support?
| Role | Evidence in this repo |
|------|-----------------------|
| **Project Coordinator** | GitHub tracking, [RAID](raid-log.md), dependencies, [status/dashboard](executive-dashboard.md), documentation |
| **Technical Project Coordinator** | SDLC, [CI/CD](../.github/workflows/ci.yml), [technical requirements](work-breakdown-structure.md), [architecture](architecture.md), testing, deployment |
| **Project Manager** | [scope/charter](project-charter.md), [schedule](project-plan.md), [budget](budget.md), [risk](raid-log.md), [stakeholders](stakeholder-management.md), [change control](change-management.md), [UAT](uat-plan.md), [releases](release-management.md) |
| **Program Manager** | [multi-workstream program](program-roadmap.md), cross-project dependencies, governance ([decision log](decision-log.md)), [OKRs](program-okrs.md), [executive reporting](executive-dashboard.md) |
