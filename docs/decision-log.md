# Executive Decision Log — CASTCHECK

Architecturally & programmatically significant decisions (ADR-style). Each has
options considered, the decision, the rationale, an owner, and a date.

### DEC-001 — Hybrid (rule-based baseline + AI) risk scoring
- **Options:** AI-only · Rule-based only · Hybrid.
- **Decision:** **Hybrid.** Deterministic rules are the baseline; AI adds
  narrative summaries and confidence labels only.
- **Rationale:** explainability and predictable fallback. The product must work —
  and be defensible — with the AI key absent. Rule logic is unit-testable.
- **Owner:** Product / Security · **Date:** 2026-02

### DEC-002 — Link-out + user import instead of scraping third-party platforms
- **Options:** Scrape / credential-proxy Actors Access, Casting Networks,
  Backstage, IMDbPro · Link-out launchpad + user-initiated import · Do nothing.
- **Decision:** **Launchpad + import.** Never scrape or store third-party logins.
- **Rationale:** those platforms' ToS prohibit automated access; credential
  proxying is a security and legal liability. CASTCHECK becomes the trust +
  tracking layer over them instead. Closes risk R-04.
- **Owner:** Product / Legal · **Date:** 2026-03

### DEC-003 — Ship real TOTP MFA (resolves inconsistency I-01)
- **Context:** early docs described "MFA-ready architecture" while the target was
  real MFA — an inconsistent claim (issue I-01).
- **Options:** Keep "MFA-ready" seam only · Implement full TOTP MFA now.
- **Decision:** **Implement RFC-6238 TOTP + single-use recovery codes**, then
  reconcile README/architecture/threat-model to the delivered control.
- **Rationale:** account takeover (threat T2) warrants a real second factor; a
  portfolio must not overstate controls. Verified against the RFC-6238 vector.
- **Owner:** Security · **Date:** 2026-08

### DEC-004 — Pin Prisma to v6 (avoid v7 driver-adapter churn)
- **Options:** Adopt Prisma 7 (removed `url` from schema; driver adapters) · Pin v6.
- **Decision:** **Pin v6.** · **Rationale:** v7's breaking datasource changes added
  risk with no MVP benefit on Next 16. Managed risk R-03; documented workaround.
- **Owner:** Engineering · **Date:** 2026-08

### DEC-005 — Graceful-degradation pattern for all external integrations
- **Decision:** every optional integration (AI, email, object storage, Redis) sits
  behind an env var with a **local fallback** and, where relevant, a confidence/
  source label. · **Rationale:** the app is always runnable offline; production
  features light up when their env is set; no silent failures.
- **Owner:** Engineering / PM · **Date:** 2026-08

### DEC-006 — Data minimization for contract analysis
- **Options:** Store full pasted contract text · Store only derived findings.
- **Decision:** **Findings only** (labels + short excerpts), never the full text.
- **Rationale:** contracts are "sensitive" tier; minimizing stored data reduces
  breach impact and the security-review burden (see CR-001).
- **Owner:** Security / Product · **Date:** 2026-08

### DEC-007 — Placeholder contact/security addresses with explicit TODO
- **Options:** Invent a plausible real-looking address · Use an obvious
  placeholder + TODO · Omit contact info.
- **Decision:** **Placeholder (`.example`) + centralized TODO** in
  `constants.ts` and `security.txt`. · **Rationale:** never expose an unmonitored
  or fake-real inbox; make the "set a real one" step explicit for the operator.
- **Owner:** Ops / Legal · **Date:** 2026-08

### DEC-008 — Deploy target: Vercel + managed Postgres, one-step `vercel-build`
- **Decision:** production target is Vercel with Neon/managed Postgres; a
  `vercel-build` script switches Prisma to Postgres, migrates, and builds so the
  operator only sets env vars. · **Rationale:** lowest-friction path to a live URL
  matching the team's stack; keeps local dev on SQLite.
- **Owner:** Platform / PM · **Date:** 2026-08
