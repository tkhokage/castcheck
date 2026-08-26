# Running CASTCHECK as a GitHub Project (board setup)

The repository *itself* is part of the PM demonstration: Issues, Pull Requests,
[Actions/CI](../.github/workflows/ci.yml), and a Project board. This guide sets up
the board so the delivery looks like a program, not just source code.

> Requires you to be signed in to GitHub (the board is created under your
> account). Issue templates for **Epic** and **User story** are already in
> `.github/ISSUE_TEMPLATE/`.

## 1. Board columns (workflow)
Create a Project (Projects → New project → Board) with these columns:

```
Backlog → Ready → In Progress → Blocked → QA → UAT → Done
```

## 2. Epics (one per program workstream)
Create these as Epic issues (label `epic`), mapped to the programs in
[program-roadmap.md](program-roadmap.md):

| Epic | Program | Covers (WBS) |
|------|---------|--------------|
| Trust & Safety | Trust Platform | verification, risk scoring, screening, moderation, evidence |
| Security | Secure Platform | auth, RBAC, MFA, audit, privacy, recovery |
| AI | Intelligent Platform | screening, matching, contract analysis, guardrails, eval |
| Support | Operations Platform | support center, KB, ticketing, escalation |
| Product | Product | discovery, feed, verification UI, matching, tracking, import |
| Infrastructure | Platform | CI/CD, testing, deployment, data, storage, monitoring |

## 3. Every issue carries
Use the **User story** template — it enforces: **Objective · Requirements ·
Acceptance criteria · Dependencies · Owner · Priority · Definition of Done.**

## 4. Custom fields (Project settings → Fields)
Add: **Program** (single-select: the six above), **Priority** (P0/P1/P2),
**Epic** (link), **Estimate** (number). This makes the board filterable by
workstream — exactly what a program manager reviews.

## 5. Seed backlog (paste as issues to make the board real)
A starter set that reflects the actual build and the open work:

- **[Trust]** Duplicate-opportunity detection — *Program: Trust · P1 · depends on Phase-6 data model.* (backlog)
- **[Trust]** Scheduled re-verification of live sources — *Program: Trust · P1 · depends on `verify-web.ts`.* (backlog)
- **[Security]** Verify a Resend sending domain for arbitrary-recipient email — *Program: Security · P1 · RAID D-03.* (ready)
- **[Security]** Replace placeholder contact/security inboxes with real addresses — *Program: Security · P2 · RAID D-04.* (ready)
- **[AI]** AI-evaluation harness (golden cases) — *Program: AI · P2.* (backlog)
- **[Infra]** Playwright e2e for critical journeys — *Program: Infrastructure · P1 · roadmap backlog.* (ready)
- **[Infra]** Deploy v1.0 to Vercel + Postgres — *Program: Infrastructure · P0 · RAID D-02 (operator).* (blocked)
- **[Infra]** APM / alerting on `/api/health` and error rates — *Program: Infrastructure · P2.* (backlog)
- **[Ops]** Support metrics (first-response, resolution time) instrumentation — *Program: Operations · P2.* (backlog)

## 6. Automation (optional)
Project workflows: move to **In Progress** when a linked PR opens; **QA** when CI
passes; **Done** when the issue closes. CI already runs on every push/PR.

## 7. Closed items worth pinning as "done" evidence
`I-01` (MFA doc inconsistency, resolved by [DEC-003](decision-log.md)),
`R-06`/`R-07`/`R-08` (uploads/secret/email — closed in the G-pass).
