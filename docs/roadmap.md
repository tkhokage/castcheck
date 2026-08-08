# Roadmap

CASTCHECK is built in phases. Phases 1–5 are implemented in this build; Phase 6
and the later AI modules are designed and staged.

| Phase | Build | Status |
|-------|-------|--------|
| **1 — MVP** | Landing, registration, profile, feed, search, filters, detail page, save, tracker, demo data | ✅ Done |
| **2 — Trust** | Verification status, risk score, risk indicators, report flow, moderation, agency directory + profiles | ✅ Done |
| **3 — Support** | Support center, ticket creation, dashboard, assignment, priority, status, knowledge base | ✅ Done |
| **4 — Security & GRC** | RBAC, audit logs, data classification, risk register, control matrix, incident management, GRC dashboard, access reviews | ✅ Done |
| **5 — AI** | Opportunity screening, risk analysis, career fit, agency matching, ticket triage (with rule-based fallbacks) | ✅ Done |
| **6 — Real data** | Permitted-source research, integrations, attribution, verification timestamps, freshness, duplicate detection, source reliability | 🔜 Planned |

## Phase 6 — real data strategy

No casting boards are scraped. Real listings arrive through:

1. **Verified posters** — casting professionals and agencies submit listings that
   pass through the verification pipeline (already supported in this build).
2. **Curator** — a human adds real, permitted listings with attribution.
3. **Permitted integrations** — only sources whose terms allow it, with source
   reliability scoring.

Source priority: official sources → government registries → industry
organizations → established professional sources → reputable journalism → public
reputation signals → social media → anonymous claims. Reviews and social posts
are never definitive proof. Until a source is genuinely live, data is labeled
**demo**.

## Later AI modules (designed)

- **Contract analysis** — commission, exclusivity, termination, likeness/AI
  clauses; education only.
- **AI & digital likeness** — flag training, replica, voice-cloning, and
  synthetic-performance language.

## Production hardening

Done in this build:

- ✅ Rate limiting on login, registration, and reports.
- ✅ Email verification (token flow + `/verify`).
- ✅ TOTP multi-factor authentication (enroll, enforce, disable).
- ✅ File upload storage + type/size validation for headshots, resumes, reels.
- ✅ Automated unit suite for `lib/*` (36 tests, incl. RFC 6238 TOTP vector).

Still open:

- Migrate to Postgres + `prisma migrate deploy` and object storage for uploads.
- Back the rate limiter with Redis for multi-instance deployments.
- Wire a real email provider for verification + notifications.
- End-to-end tests (Playwright) for the critical journeys.
