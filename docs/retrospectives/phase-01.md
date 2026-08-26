# Retrospective — Phase 1: Foundation (MVP)

**Scope:** landing, auth, profile, feed, filters, detail, save, tracker, seed data.

## What went well
- Establishing the domain layer (`src/lib/*`: risk, matching, constants) *before*
  UI paid off immediately — later phases reused it with almost no rework.
- Seeding realistic data (legit, flagged, and high-risk listings) made every
  later trust/AI feature demonstrable from day one.

## What failed / was harder than expected
- The bleeding-edge stack fought back: Prisma 7 had removed `url` from the schema
  (driver adapters), and Turbopack mis-detected the workspace root from a stray
  home-dir lockfile. Both cost time.

## What surprised us
- How much of "trust & safety" is really just **information architecture** —
  showing the evidence clearly matters as much as computing a score.

## What changed
- Pinned Prisma to v6 ([DEC-004](../decision-log.md)); pinned the Turbopack root
  in `next.config.ts`. Recorded both as workarounds.

## What we'll do differently
- Stand up CI earlier so stack-churn breakages surface on the first PR, not at
  build time. (Actioned in the platform workstream.)
