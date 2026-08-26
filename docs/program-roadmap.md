# Program Roadmap — CASTCHECK

The product roadmap ([roadmap.md](roadmap.md)) tracks *features by phase*. This
program view organizes the same work into **four parallel programs**, each with
its own projects — the structure a program manager would run.

> **Program:** Build a trusted opportunity platform for emerging performers.

## Program 1 — Trust Platform
Make legitimacy legible; never present unverified as verified.
| Project | Delivers | Status |
|---------|----------|:------:|
| Verification engine | Checks → verification state, trust levels | ✅ |
| Risk scoring | Likelihood × impact, thresholds, indicators | ✅ |
| Screening | Automated scam-pattern detection on submit/import | ✅ |
| Moderation | Review queue, report→ticket, decisions | ✅ |
| Evidence management | Live web re-check, freshness timestamps | ✅ |

## Program 2 — Secure Platform
Protect accounts and data; make privileged action auditable.
| Project | Delivers | Status |
|---------|----------|:------:|
| Identity | bcrypt + signed httpOnly sessions | ✅ |
| RBAC | Capability-based access control | ✅ |
| MFA | RFC-6238 TOTP + single-use recovery codes | ✅ |
| Audit | Append-only security-event log | ✅ |
| Privacy | Data classification, minimization, legal pages | ✅ |
| Recovery | Forgot-password + 2FA recovery | ✅ |

## Program 3 — Intelligent Platform
Assist human decisions; never replace them; always explain.
| Project | Delivers | Status |
|---------|----------|:------:|
| AI screening | Risk narratives with confidence labels | ✅ |
| Matching | Career-fit + agency match scoring | ✅ |
| Contract analysis | Clause explainer + AI/likeness flags | ✅ |
| AI evaluation | Deterministic-logic tests; model eval harness | 🔶 |
| Guardrails | No invented evidence; rule-based fallback | ✅ |

## Program 4 — Operations Platform
Keep users unblocked; run trust & safety and support at scale.
| Project | Delivers | Status |
|---------|----------|:------:|
| Support | Support center + tickets | ✅ |
| Knowledge base | How-tos + authoritative outbound links | ✅ |
| Incident management | Incident register + response lifecycle | ✅ |
| Admin | User management, access review, audit view | ✅ |

## Cross-program dependencies
- Trust (verification) **gates** Product (safe apply) and Operations (moderation).
- Secure (identity→RBAC) **gates** Operations (staff dashboards) and Audit.
- Intelligent (guardrails) **gates** every AI feature across all programs.
- Platform (CI/CD, data, deploy) **underpins** all four programs.

## Benefits realization (are the programs delivering the outcome?)
Tracked as OKRs in [program-okrs.md](program-okrs.md): screening coverage,
evidence-with-confidence, zero-unverified-as-verified, logged privileged actions,
match explainability, and application-tracking completion.
