# Architecture

## Overview

CASTCHECK is a single full-stack Next.js 16 application using the App Router.
Rendering and data access happen on the server (React Server Components + Server
Actions); the browser runs only the interactive islands (filters, forms,
dialogs, theme toggle).

```
Browser ──HTTP──▶ Next.js (App Router)
                   ├─ Server Components ── query ──▶ Prisma ──▶ SQLite/Postgres
                   └─ Server Actions ── mutate/validate (Zod) ──▶ Prisma
                          └─ audit log, revalidatePath
```

## Layers

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Presentation | `src/app/**/page.tsx`, `src/components` | Layout, UI, role-aware nav |
| Application | `src/app/actions/*` | Mutations, validation, authz, auditing |
| Domain | `src/lib/{risk,matching,screen}.ts` | Pure business logic, framework-free |
| Platform | `src/lib/{db,auth,rbac,ai,audit}.ts` | DB client, sessions, RBAC, AI, logging |
| Data | `prisma/schema.prisma` | Schema for all phases |

Keeping risk scoring, matching, and screening as **pure functions** means they
are deterministic, unit-testable, and independent of the web framework.

## Route groups

- `(main)` — everything with the app shell (nav + footer): landing, discover,
  opportunities, agencies, profile, tracker, saved, knowledge, support, and the
  role-gated `dashboard`.
- `(auth)` — login and register, rendered without the app chrome.

`dashboard/layout.tsx` enforces staff-only access and renders a capability-aware
sub-navigation, so each role sees only the tabs it may use.

## Data model (Prisma)

Key entities and relationships:

- **User** 1─1 **ActorProfile**; 1─n saved, applications, reports, tickets,
  created opportunities, audit logs.
- **Opportunity** 1─n **VerificationCheck**, **RiskIndicator**,
  **SavedOpportunity**, **Application**, **Report**.
- **Agency** — standalone directory entity with verification state + trust level.
- **Ticket** — support items; a **Report** also spawns a trust & safety ticket.
- **KnowledgeArticle** — knowledge base.
- **RiskRegisterEntry**, **Incident** — GRC operational records.
- **AuditLog** — append-only security-event trail.

List/array fields (skills, markets, requirements, credits…) use Prisma `Json`,
which SQLite stores as text and Postgres stores natively — so the same schema
works in both. `src/lib/utils.ts#asList` reads them safely.

## Request flow example — reporting a listing

1. Actor submits the report dialog → `submitReport` server action.
2. Zod validates input; a `Report` row is created.
3. The same action creates a **Ticket** (trust & safety) — a report *becomes* a
   ticket.
4. `audit()` records the event; `revalidatePath` refreshes the detail + queues.
5. The listing appears in the moderator's queue and the ticket in the support
   and moderation views.

## Why these choices

- **Server Actions over a REST layer** — less boilerplate, type-safe end to end,
  and mutations live next to the pages that use them.
- **Custom auth over a library** — full control of the session shape and RBAC on
  bleeding-edge Next 16, and a clean MFA-ready seam.
- **SQLite locally, Postgres in prod** — zero-config preview; one-line switch.
