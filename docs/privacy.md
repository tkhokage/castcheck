# Privacy & data classification

CASTCHECK collects only what a professional acting profile needs, and explains
when a request looks excessive.

## Data classification

| Tier | Examples | Handling |
|------|----------|----------|
| **Public** | Headshot, resume, demo reel, credits, website | Freely shared |
| **Professional** | Professional email/phone, submission history | Platform use |
| **Sensitive** | Home address, contracts, private correspondence | Optional, minimized |
| **Highly sensitive** | SSN, government ID, banking, passwords | **Never collected** |

The actor profile schema (`ActorProfile`) contains **no highly sensitive
fields**. There is nowhere to enter an SSN, ID number, or banking detail.

## Minimization in practice

- The profile page surfaces the classification table so users see how their data
  is treated.
- On any opportunity whose personal-information check is not "pass", CASTCHECK
  shows a plain-language warning:
  > This opportunity's personal-information request needs confirmation. Consider
  > verifying the organization independently before providing sensitive details.
- Automated screening (`screen.ts`) flags listings that request highly sensitive
  data or a home address.

## User guidance

The knowledge base article *"What information to avoid sharing"* tells actors to
withhold SSN, ID, banking, and passwords until they have independently verified
an organization — and reminds them CASTCHECK never asks for these.

## Data lifecycle

- Passwords are stored only as bcrypt hashes.
- Deleting a user cascades to their profile, saved items, and applications
  (`onDelete: Cascade`).
- Audit logs never contain PII beyond the acting identity already on file, and
  never contain secrets.
