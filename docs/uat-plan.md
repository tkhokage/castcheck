# UAT Plan — CASTCHECK

User Acceptance Testing scenarios by role. Result values: **Pass / Fail /
Blocked / Defect**. "Verified" notes cases exercised during the build; the full
suite is re-run against the production instance at go-live (see
[release-management.md](release-management.md)).

## Entry / exit criteria
- **Entry:** feature merged, unit suite + build green (CI), test data seeded.
- **Exit:** all P1 scenarios Pass; no open Sev-1/Sev-2 defects; sign-off logged.

## Scenarios

### Actor
| ID | Scenario | Expected result | Result |
|----|----------|-----------------|--------|
| UAT-001 | Submit / import a questionable casting opportunity | Screened; risk signals shown; user warned; **cannot** reach "verified" without review | **Pass** (verified: imported gift-card/Telegram listing → Critical 25/25) |
| UAT-002 | View a legitimate listing & check the source | Verification checks, risk matrix, career-fit, and a live website check are available; contact/submission surfaced | **Pass** (verified: live check passed on a real agency site) |
| UAT-003 | Register a new account | Account created; verification email sent (or dev link shown); consent to Terms/Privacy recorded | **Pass** |
| UAT-004 | Recover a forgotten password | Reset email/link issued (single-use, 1h); new password works; no account enumeration | **Pass** (verified end-to-end) |
| UAT-005 | Enable 2FA, then sign in with a recovery code | 8 codes shown once; a recovery code authenticates when the authenticator is unavailable; code is consumed | **Pass** (TOTP verified vs RFC-6238; recovery path implemented) |
| UAT-006 | Save + track an opportunity through statuses | Appears in Saved and Tracker; status updates persist | **Pass** |
| UAT-007 | Upload a headshot | Validated by type/size; persists (object storage in prod) and displays | **Pass** (validation + write path unit-tested) |
| UAT-008 | Analyze an agency contract | Clause-by-clause explanation with AI/likeness flags; "not legal advice"; raw text not stored | **Pass** |

### Moderator
| ID | Scenario | Expected result | Result |
|----|----------|-----------------|--------|
| UAT-010 | Review a high-risk listing | Evidence accessible; risk score visible; decision logged; audit trail created | **Pass** |
| UAT-011 | Act on a user report | Report appears in the moderation queue; resolve/flag/reject updates state; private imports never appear | **Pass** |

### Support analyst
| ID | Scenario | Expected result | Result |
|----|----------|-----------------|--------|
| UAT-020 | Triage an incoming ticket | Auto category + priority proposed with confidence; resolution checklist shown; changes audited | **Pass** |

### Admin
| ID | Scenario | Expected result | Result |
|----|----------|-----------------|--------|
| UAT-030 | Change a user role / deactivate | Change takes effect and is written to the audit log; cannot self-demote/deactivate | **Pass** |
| UAT-031 | Review the audit log | Security-relevant events listed; no passwords/secrets present | **Pass** |

### Anonymous / resilience
| ID | Scenario | Expected result | Result |
|----|----------|-----------------|--------|
| UAT-040 | Hit a bad URL | Branded 404 with nav + links back to Discover/Support (never a bare framework page) | **Pass** (verified) |
| UAT-041 | Reach Privacy & Terms before signing up | `/privacy` and `/terms` reachable from footer and register consent line | **Pass** (verified: both serve 200) |
| UAT-042 | Keyboard & contrast | Visible focus on all controls; badge tones meet WCAG AA in light & dark | **Pass** (contrast audited & fixed, G7) |

## Go-live UAT (against the deployed instance — pending D-02)
Re-run UAT-003/004/005/007 to confirm a **real** verification email arrives, a
reset email sends, and an uploaded headshot **survives a redeploy** on object
storage. These require the production environment (email + Blob), so they are
executed once the operator completes the deploy.

## Defect log
_No open Sev-1/Sev-2 defects. Closed: I-01 (MFA doc inconsistency), I-02
(standalone start entrypoint) — see [raid-log.md](raid-log.md)._
