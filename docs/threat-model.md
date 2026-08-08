# Threat model

A lightweight STRIDE-informed model for the CASTCHECK platform.

## Assets

User accounts, actor profiles, opportunity records, agency records, support
tickets, uploaded documents, application records, authentication systems, and
database resources.

## Primary threats & mitigations

| # | Threat | Vector | Mitigation |
|---|--------|--------|------------|
| T1 | **Fake casting call** defrauds actors | Malicious submission | Verification pipeline + automated screening (`screen.ts`) + moderation + report→ticket workflow |
| T2 | **Account takeover** | Credential theft, phishing | bcrypt hashing, httpOnly signed sessions, MFA-ready design, audit of auth events |
| T3 | **Data exposure** of actor PII | Broken access control | Ownership checks on all user-scoped queries/mutations; RBAC; data minimization |
| T4 | **Privilege escalation** | Forced browsing to staff routes | Server-side `can()` checks on every dashboard route and privileged action |
| T5 | **Malicious agency** (pay-to-play) | Fraudulent directory entry | Fee-pattern detection, verification state, trust level, "Charges talent" warning |
| T6 | **Phishing** impersonating CASTCHECK | External email/site | Knowledge-base guidance; platform never requests passwords by email; incident register |
| T7 | **Injection** | Unvalidated input | Zod validation; Prisma parameterized queries |
| T8 | **Sensitive-data harvesting** by a listing | Excessive info requests | Never collect highly sensitive data; warn users; personal-info verification check |

## Trust boundaries

- **Browser ↔ server** — all authority decisions happen server-side; the client
  is never trusted for authorization.
- **User input ↔ persistence** — every write passes Zod validation.
- **Platform ↔ AI provider** — prompts contain only listing/ticket text; AI
  output is treated as a suggestion, labeled, and gated by human review.

## Residual risk

Rate limiting, email verification, and MFA enforcement are designed-for but not
active in this demo build (see [security.md](security.md)). These are tracked in
the [risk register](grc.md).
