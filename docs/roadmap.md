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

## Later AI modules

- ✅ **Contract analysis** (`/contracts`) — paste an agency/production agreement
  and get a plain-language, clause-by-clause breakdown: commission (with a
  high-rate flag), exclusivity, term, renewal, termination, territory, expenses,
  payment, confidentiality, publicity, and post-termination commissions.
  Education only — every serious item points to an entertainment attorney.
  Rule-based engine (`src/lib/contract.ts`, unit-tested) with optional AI summary;
  stores findings only, never the raw contract text (data minimization).
- ✅ **AI & digital likeness** — folded into contract analysis: detects and
  high-flags digital-replica, voice-cloning, AI-training, synthetic-performance,
  and perpetual/irrevocable-rights language.

## Production hardening

Done in this build:

- ✅ Rate limiting on login, registration, and reports.
- ✅ Email verification (token flow + `/verify`).
- ✅ TOTP multi-factor authentication (enroll, enforce, disable).
- ✅ File upload storage + type/size validation for headshots, resumes, reels.
- ✅ Automated unit suite for `lib/*` (36 tests, incl. RFC 6238 TOTP vector).

Still open:

- End-to-end tests (Playwright) for the critical journeys.

## Ease-of-use / production-smoothness pass (G-phases)

A dedicated pass to remove every point where a real user would hit a dead end or
have to do extra work. Live status tracked in `AGENTS.md`.

- **G1 ✅** Env example templates committed; clean clone runs from the README.
- **G2 ✅** Production refuses a weak `AUTH_SECRET`; demo accounts gated off by default.
- **G3 ✅** Real email (reset + verification), forgot-password flow, 2FA recovery codes.
- **G4 ✅** Object storage for uploads; Redis-backed rate limiting.
- **G5 ✅** Branded error / 404 / loading pages; success confirmations.
- **G6** `/privacy` + `/terms`; real contact + `security.txt`.
- **G7** Accessibility (aria labels, alt text, focus, contrast).
- **G8** Knowledge-base outbound "verify independently" links.
- **G9** Full deploy + post-deploy + regression verification.
