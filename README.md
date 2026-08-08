# CASTCHECK

**Find it. Verify it. Pursue it.**

CASTCHECK is an AI-assisted actor opportunity discovery and trust platform. It
helps emerging actors find film, television, theater, commercial, and
independent casting calls and auditions — while providing evidence-based
verification, risk assessment, privacy guidance, résumé-based agency matching,
application tracking, and support workflows.

It is built as a pipeline, not a bulletin board:

```
DISCOVER → VERIFY → EVALUATE → APPLY → TRACK
```

> ⚠️ **Demo data.** All opportunities and agencies in this build are illustrative
> demo data. CASTCHECK is not affiliated with any real casting service and does
> not scrape casting boards. See [Real data strategy](#real-data-strategy).

---

## What it demonstrates

CASTCHECK is a portfolio project that brings several disciplines together in one
coherent product:

- **Product** — a real user journey for emerging actors, end to end.
- **Trust & safety** — evidence-based verification, a 4-level trust model, risk
  scoring, and a report → ticket workflow.
- **IT support** — a support center, auto-triaged tickets, resolution
  workflows, and a knowledge base.
- **Security** — custom auth, RBAC, MFA-ready sessions, audit logging, input
  validation, and data minimization.
- **GRC** — a risk register, control matrix, asset inventory, and incident
  register with the nine-question risk model.
- **AI** — opportunity screening, risk narratives, career-fit explanations, and
  ticket triage — always with a confidence label, and always assisting (never
  replacing) human decisions.

---

## Quick start

```bash
npm install
cp .env.example .env      # then edit if you like
npm run db:push           # create the SQLite schema
npm run db:seed           # load demo data + accounts
npm run dev               # http://localhost:3000
```

### Demo accounts

All accounts use the password **`demo1234`**:

| Email | Role | Sees |
|-------|------|------|
| `actor@castcheck.app` | Actor | Discover, profile, career fit, tracker, saved |
| `casting@castcheck.app` | Casting professional | Post opportunities (auto-screened) |
| `agency@castcheck.app` | Agency | Post opportunities |
| `moderator@castcheck.app` | Moderator | Moderation queue, reports |
| `support@castcheck.app` | Support analyst | Ticket queue, resolution tools |
| `grc@castcheck.app` | GRC analyst | Risk register, controls, incidents |
| `admin@castcheck.app` | Administrator | Everything + user management + audit log |

---

## Tech stack

- **Next.js 16** (App Router, Server Components, Server Actions)
- **TypeScript** + **Tailwind CSS v4** (light/dark themes)
- **Prisma 6** ORM with **SQLite** locally (swap to Postgres for production)
- **Custom auth** — `bcryptjs` password hashing + `jose` JWT session cookies
  (httpOnly, MFA-ready architecture)
- **Zod** for input validation
- **Anthropic SDK** for the optional AI layer (rule-based fallbacks when no key)
- **lucide-react** icons

---

## Architecture

```
src/
├─ app/
│  ├─ (main)/            # public + actor app (nav + footer shell)
│  │  ├─ page.tsx        # landing
│  │  ├─ discover/       # feed + filters
│  │  ├─ opportunities/  # detail + "post" (create)
│  │  ├─ agencies/       # directory + profiles + matching
│  │  ├─ profile/ tracker/ saved/
│  │  ├─ knowledge/ support/
│  │  └─ dashboard/      # role-gated ops: moderation, tickets, grc, users, audit
│  ├─ (auth)/            # login + register (no app chrome)
│  └─ actions/           # server actions (auth, opportunities, support, moderation, admin, profile)
├─ components/           # UI kit + domain components (badges, cards, controls)
└─ lib/                  # db, auth, rbac, risk, matching, screen, ai, audit, constants
```

See [`docs/architecture.md`](docs/architecture.md) for detail.

### Core domain logic (framework-independent, in `src/lib`)

- **`risk.ts`** — inherent risk = likelihood × impact; level thresholds; check →
  verification-state derivation.
- **`matching.ts`** — deterministic, explainable career-fit and agency-match
  scoring. Career fit never overrides a risk warning.
- **`screen.ts`** — automated screening of submitted opportunities for common
  scam patterns (fees, gift cards, guarantees, off-platform contact,
  sensitive-data requests).
- **`ai.ts`** — Anthropic wrapper. Every result carries a `source`
  (`ai` | `rule-based`) and a `confidence`; falls back to rules with no API key.

---

## The AI layer

Set `ANTHROPIC_API_KEY` in `.env` to enable AI assistance. Without it, every AI
feature falls back to a transparent rule-based implementation, so the app is
fully functional offline.

The AI layer **never** invents agencies, casting calls, production companies, or
verification evidence; never guarantees legitimacy, representation, or
employment; and never presents assumptions as facts. Every assessment is labeled
with its source and confidence and is framed as assisting human review. See
[`docs/ai-limitations.md`](docs/ai-limitations.md).

---

## Real data strategy

This build runs on realistic **demo data** and supports **verified posters**
(casting professionals and agencies post listings that pass through the
verification pipeline). No casting boards are scraped.

The path to real data (Phase 6) is a **curator + verified-poster model**:
permitted sources only, with attribution, verification timestamps, freshness,
duplicate detection, and source-reliability signals. Nothing is presented as
live until it genuinely is. See [`docs/roadmap.md`](docs/roadmap.md).

---

## Documentation

| Doc | Covers |
|-----|--------|
| [architecture.md](docs/architecture.md) | System design, data model, request flow |
| [threat-model.md](docs/threat-model.md) | Assets, threats, mitigations |
| [security.md](docs/security.md) | Auth, RBAC, sessions, validation, audit |
| [privacy.md](docs/privacy.md) | Data classification & minimization |
| [grc.md](docs/grc.md) | Risk register, controls, incident response |
| [support-workflow.md](docs/support-workflow.md) | Ticketing, priorities, resolution |
| [ai-limitations.md](docs/ai-limitations.md) | What the AI does and never does |
| [roadmap.md](docs/roadmap.md) | Phases 1–6 |
| [testing.md](docs/testing.md) | How this build was verified |

---

## Deploying to production

1. Provision Postgres and set `DATABASE_URL`.
2. Change the datasource `provider` in `prisma/schema.prisma` to `postgresql`.
3. Set a strong random `AUTH_SECRET`.
4. `npx prisma migrate deploy` (or `prisma db push`), then seed if desired.
5. Deploy to any Node host (Vercel recommended): `npm run build && npm start`.

---

_© CASTCHECK — portfolio project. Demo data; not legal advice._
