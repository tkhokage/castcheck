# Governance, Risk & Compliance

CASTCHECK includes a working GRC surface at `/dashboard/grc` (GRC analyst and
admin). It is not decoration — the risk register and incidents are live database
records.

## The nine-question model

Every major risk assessment answers: **Asset · Threat · Vulnerability · Risk ·
Control · Evidence · Owner · Status · Remediation.**

## Risk scoring

Inherent risk = **likelihood × impact**, each on a 1–5 scale.

| Score | Level |
|-------|-------|
| 1–4 | Low |
| 5–9 | Moderate |
| 10–16 | High |
| 17–25 | Critical |

The same model scores individual opportunities (shown on each detail page as a
risk-matrix cell) and platform-level risks (the register). Thresholds live in
`src/lib/risk.ts` and are configurable. No number is shown without explanation.

## Risk register (seeded)

| Risk | L | I | Inherent | Control | Residual | Owner |
|------|---|---|----------|---------|----------|-------|
| Fake casting call | 4 | 5 | 20 | Verification workflow | 8 | Trust & safety |
| Account takeover | 3 | 5 | 15 | MFA / RBAC / sessions | 5 | IT / security |
| Data exposure | 3 | 5 | 15 | Data classification | 6 | Security |
| Bad listing | 4 | 4 | 16 | Moderation | 6 | Operations |
| Unauthorized access | 3 | 4 | 12 | RBAC / least privilege | 4 | IT |

## Control matrix

| Risk | Control |
|------|---------|
| Fake casting call | Opportunity verification |
| Scam | Risk assessment |
| Unauthorized access | RBAC |
| Account takeover | MFA |
| Data exposure | Data classification |
| Suspicious listing | Reporting workflow |
| Platform issue | IT ticketing |
| Excessive permissions | Access review |
| Data loss | Backup and recovery |

## Asset inventory

User accounts · actor profiles · opportunity records · agency records · support
tickets · uploaded documents · application records · authentication systems ·
database resources.

## Incident response

Lifecycle: **Detection → Triage → Containment → Investigation → Remediation →
Recovery → Lessons learned.**

Each incident record captures reference, category, severity, affected assets,
summary, evidence, parties, immediate + recommended actions, status, and lessons
learned. Evidence is never fabricated. Two illustrative incidents are seeded (a
reported fake casting call and a phishing attempt).
