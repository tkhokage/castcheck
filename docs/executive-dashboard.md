# Executive Dashboard — CASTCHECK Program Health

_A 30-second read for a VP/Director. Updated at each phase gate._
**As of:** end of production-readiness pass (v0.9). **Reporting period:** Phase 8.

## Program health

| Dimension | Status | Note |
|-----------|:------:|------|
| **Overall** | 🟢 On Track | MVP + all delivery phases + G1–G8 shipped |
| Schedule | 🟢 | Phases 1–8 complete on the 16-week plan |
| Budget | 🟢 | Within plan incl. contingency (illustrative) |
| Scope | 🟡 | Controlled growth via CRs (contracts, launchpad, G-pass) — all approved |
| Security | 🟢 | RBAC + TOTP MFA + audit + fail-closed; threat model documented |
| AI | 🟡 | Shipped with guardrails + fallbacks; automated eval is backlog |
| Quality | 🟢 | 51 unit tests + CI green on every build; key flows UAT-passed |
| **Go-live** | 🟡 | v1.0 config ready; **blocked on operator cloud credentials (D-02)** |

## Milestones

| Milestone | Target | Status |
|-----------|--------|:------:|
| M2 Core platform (MVP) | Wk 5 | ✅ |
| M3 Trust & Safety | Wk 8 | ✅ |
| M4 Security & GRC | Wk 9 | ✅ |
| M5 AI | Wk 11 | ✅ |
| M6 Operations | Wk 12 | ✅ |
| M7 Testing / UAT | Wk 14 | ✅ |
| M8 Production readiness | Wk 16 | ✅ (code) |
| **M9 Live in production** | — | 🔶 awaiting operator |

## Top 5 risks (see [raid-log.md](raid-log.md))

1. **D-02** Operator cloud credentials needed for go-live — *blocking* (H/H).
2. **R-01** AI misclassification — mitigated by rule-based baseline + human review (M/H).
3. **R-02** Stale verification evidence — freshness + live re-check (M/H).
4. **D-03** Email domain verification for arbitrary-recipient emails (M/M).
5. **R-05** Real-business representation risk — L2 "publicly observable", no risk flags (L/H).

## Open issues
- **I-03** free tunnels unreliable for a public demo URL — accepted; permanent URL is the Vercel deploy.

## Upcoming decisions
- Go/no-go for **v1.0 live** once operator completes the deploy.
- Phase-6 real-data source strategy (curator + verified-poster vs permitted API).
- Replace placeholder contact/security inboxes with real monitored addresses (D-04).

## Blocked work
- **v1.0 live deploy** — blocked on D-02 (Vercel/Postgres/email accounts).

## Release readiness

| Gate | Ready? |
|------|:------:|
| Build + tests green (CI) | ✅ |
| Security posture documented + tested | ✅ |
| Account recovery works | ✅ |
| Error/404/legal/a11y in place | ✅ |
| One-step production build (`vercel-build`) | ✅ |
| Live env (email/Blob/Redis/Postgres) provisioned | ⬜ operator |

**Bottom line:** the product and its controls are built, tested, and
deploy-ready; the only thing between here and a live v1.0 is the operator running
the documented Vercel deploy with their own accounts.
