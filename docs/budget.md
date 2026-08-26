# Budget — CASTCHECK (Illustrative)

> **Illustrative MVP program budget** for the case study. These are not a real
> company's funds; the point is to demonstrate cost estimation and project
> controls (planned vs. actual vs. variance), not the specific numbers.

## Program budget

| Category | Planned | Actual | Variance | Notes |
|----------|--------:|-------:|---------:|-------|
| Engineering | $85,000 | $82,000 | +$3,000 | Reuse of shared libs (risk/matching/screen) reduced rework |
| Design | $8,000 | $7,200 | +$800 | Single design system; a11y folded into build |
| QA | $15,000 | $14,000 | +$1,000 | Unit-first strategy; e2e deferred to backlog |
| Security tooling | $3,000 | $2,600 | +$400 | Open-source + built-in controls |
| Cloud infrastructure | $6,000 | $2,800 | +$3,200 | Serverless + free tiers (Neon/Upstash/Blob) during MVP |
| AI / API usage | $4,000 | $900 | +$3,100 | Rule-based fallbacks keep spend low without a key |
| Monitoring | $2,000 | $1,200 | +$800 | `/api/health` + platform metrics; APM deferred |
| **Contingency** | $12,300 | $2,000 | +$10,300 | Only the standalone/tunnel investigation drew on it |
| **Total** | **$135,300** | **$114,700** | **+$20,600** | ~15% under plan |

## Controls & interpretation

- **Under budget (~15%)** driven mainly by (a) rule-based fallbacks holding AI/API
  spend down, (b) free-tier cloud during MVP, and (c) heavy code reuse in the
  domain layer (`src/lib/*`) cutting engineering rework.
- **Contingency** was drawn only for the deployment investigation (standalone
  server entrypoint, tunnel reliability) — a controlled, logged use.
- **Forward view:** production run-rate rises modestly at go-live as paid tiers
  engage (managed Postgres, email volume, Blob storage, Redis) — tracked as the
  v1.0 operating cost, distinct from this build budget.

## Cost-avoidance decisions (traceable)

| Decision | Avoided cost | Reference |
|----------|--------------|-----------|
| Rule-based fallback for AI when no key | AI/API spend + hard vendor lock-in | [DEC-001](decision-log.md) |
| Link-out + import instead of scraping | Legal exposure + scraping infra | [DEC-002](decision-log.md) |
| Env-gated infra with local fallbacks | Dev-time paid services | G4 |
