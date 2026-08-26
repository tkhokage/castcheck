# Program OKRs — CASTCHECK

Objectives and Key Results move the conversation from *"did we ship it?"* to
*"did the program create the intended outcome?"* Each KR notes how it's measured
and where it's enforced in the build.

## Objective 1 — Create a trustworthy opportunity-discovery platform
| KR | Target | Measure / evidence | Status |
|----|--------|--------------------|:------:|
| KR1.1 | ≥95% of submitted opportunities receive automated screening | `screen.ts` runs on every post/import; screening indicators recorded | ✅ On track |
| KR1.2 | 100% of high-risk opportunities route to human review | ≥2 high signals → `flagged`/`high_risk` → moderation queue | ✅ |
| KR1.3 | Zero opportunities presented as "verified" without evidence | `deriveVerificationState()` requires all checks pass; unit-tested | ✅ |

## Objective 2 — Establish secure, auditable operations
| KR | Target | Measure / evidence | Status |
|----|--------|--------------------|:------:|
| KR2.1 | 100% of privileged actions logged | `audit()` on auth, role/user changes, moderation, tickets, reports | ✅ |
| KR2.2 | 100% of critical controls documented | [security.md](security.md), [threat-model.md](threat-model.md) | ✅ |
| KR2.3 | Critical security findings resolved before production | Fail-closed AUTH_SECRET; demo gate; recovery paths (G2/G3) | ✅ |
| KR2.4 | Users can self-recover access without manual DB edits | Forgot-password + 2FA recovery codes | ✅ |

## Objective 3 — Build scalable, explainable discovery
| KR | Target | Measure / evidence | Status |
|----|--------|--------------------|:------:|
| KR3.1 | Match explanations generated for ≥90% of eligible users | `careerFit()`/`agencyMatch()` return per-dimension breakdowns for any completed profile | ✅ Logic in place |
| KR3.2 | Duplicate opportunities reduced below target | Duplicate detection (Phase 6 real-data) | ⬜ Planned |
| KR3.3 | Application-tracking completion rate reaches target | 11-status tracker + reminders (KR instrumentation is Phase 6) | 🔶 Feature done; metric pending analytics |

## Objective 4 — Reach production reliably
| KR | Target | Measure / evidence | Status |
|----|--------|--------------------|:------:|
| KR4.1 | CI green on every PR | `.github/workflows/ci.yml` | ✅ |
| KR4.2 | One-command production build | `vercel-build` (provider switch → migrate → build) | ✅ |
| KR4.3 | Live instance passes health + go-live UAT | `/api/health` + UAT re-run against prod | 🔶 Awaiting operator deploy (D-02) |

## Notes on measurement
Several KRs (KR3.2, KR3.3, dashboard rates) require production analytics not yet
instrumented — they're tracked as Phase-6 work, not claimed as met. Everything
marked ✅ is enforced by code or tests in this repository today.
