# Change Management — CASTCHECK

## Process

```
Request → Impact analysis (scope/schedule/cost/risk) → Options → Decision → Log
```

1. **Raise** a Change Request (CR) with a clear ask and reason.
2. **Assess** impact across scope, schedule, budget, security, and risk.
3. **Present options** (do now / defer / reduce / reject) with trade-offs.
4. **Decide** — PM decides within contingency; Sponsor approves anything that
   moves a release gate, exceeds contingency, or changes the charter.
5. **Log** the decision (here + [decision-log.md](decision-log.md)) and update
   the [plan](project-plan.md), [RAID](raid-log.md), and [releases](release-management.md).

Authority: PM approves ≤ 1 week effort within contingency; Sponsor approves the rest.

## Change request log

### CR-001 — Contract digital-likeness (AI) clause analysis
- **Request:** flag AI-training / digital-replica / voice-cloning / perpetual-rights language in agency & production contracts.
- **Reason:** new, fast-rising risk to performers (AI likeness rights).
- **Impact:** ~2 weeks dev; additional AI eval; security review of stored text; new UI.
- **Options:** (A) add now · (B) defer to a later phase · (C) drop.
- **Decision:** **Approved — folded into the Contract Analysis feature** (Phase 5). Implemented as high-concern flags in `contract.ts`; text is **not** stored (minimization), reducing the security-review burden.
- **Status:** Delivered.

### CR-002 — Real transactional email
- **Request:** move password reset & verification from in-app links to real email.
- **Reason:** account recovery is the highest-friction gap; in-app links aren't production-viable.
- **Impact:** ~1 week; new provider dependency (Resend); env/secrets; domain verification (D-03).
- **Options:** (A) build with provider + fallback · (B) provider-only · (C) defer.
- **Decision:** **Approved — (A).** Built behind `EMAIL_PROVIDER_API_KEY` with a dev fallback (G3), matching the AI-layer degradation pattern.
- **Status:** Delivered.

### CR-003 — External-source launchpad + import (instead of scraping)
- **Request:** help users work with Actors Access / Casting Networks / Backstage / IMDbPro.
- **Reason:** users want a single hub; those platforms are where real listings live.
- **Impact:** design + ~1 week. **Constraint:** their ToS prohibit scraping/credential-proxying.
- **Options:** (A) scrape/log-in-as-user · (B) link-out launchpad + user-initiated import · (C) drop.
- **Decision:** **Approved — (B).** (A) rejected as a ToS/security violation (see [DEC-002](decision-log.md)). Delivered `/find` launchpad + `/find/import`.
- **Status:** Delivered.

### CR-004 — Object storage + Redis rate limiting
- **Request:** replace local-disk uploads and in-memory rate limiting for production.
- **Reason:** serverless loses local files on redeploy; per-instance limits don't hold across instances.
- **Impact:** ~1 week; two new provider dependencies (Vercel Blob, Upstash); env/secrets.
- **Decision:** **Approved.** Both behind env vars with local fallbacks (G4).
- **Status:** Delivered.

### CR-005 — Production-readiness / ease-of-use pass (G-phases)
- **Request:** close every point where a real user hits a dead end (recovery, error pages, legal, a11y, deploy).
- **Impact:** ~2 weeks across 9 sub-phases.
- **Decision:** **Approved** as a dedicated program pass; tracked G1–G9 in [AGENTS.md](../AGENTS.md).
- **Status:** G1–G8 delivered; G9 (live deploy) pending operator credentials (D-02).

### CR-006 — Live cloud deployment (Vercel + Postgres)
- **Request:** stand up a permanent public production instance.
- **Impact:** operator cloud accounts + secrets; not doable without operator action.
- **Options:** (A) operator deploys via the one-step `vercel-build` · (B) remain deploy-ready.
- **Decision:** **Config approved & shipped (A-ready).** Execution blocked on D-02 (operator credentials).
- **Status:** Open — awaiting operator.
