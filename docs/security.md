# Security

CASTCHECK is built to the security requirements in the product spec: an actor's
private data must never be exposed to another user, and no unnecessary sensitive
information is stored.

## Authentication

- Passwords hashed with **bcrypt** (cost 10) via `bcryptjs`. Plaintext is never
  stored or logged.
- Sessions are **JWTs** signed with `AUTH_SECRET` (HS256, `jose`), stored in an
  **httpOnly, SameSite=Lax** cookie, `Secure` in production, 7-day expiry.
- The session payload carries only `id`, `email`, `name`, `role` — never
  secrets.
- **MFA-ready:** the `User.mfaEnabled` flag and a session seam exist so a second
  factor can be inserted at sign-in without reworking the model.

## Authorization (RBAC)

- Seven roles: actor, casting, agency, moderator, support, grc, admin
  (`src/lib/constants.ts`).
- Access is **capability-based** (`src/lib/rbac.ts`): capabilities like
  `opportunity.moderate`, `ticket.work`, `grc.view`, `admin.manage` map to the
  roles allowed. UI and every privileged server action check `can(role, cap)`.
- **Least privilege:** each dashboard tab and each mutating action re-checks
  authorization server-side — the UI hiding a control is never the only guard.
- Users cannot change their own role or deactivate themselves.

## Input validation

- All mutating server actions validate input with **Zod** before touching the
  database. Invalid input returns a typed error, never a thrown 500.

## Sessions & data isolation

- Ownership is enforced on every user-scoped mutation (applications, tickets):
  the record's `userId` must match the session, or the action refuses.
- Ticket detail is visible only to its owner or to staff with `ticket.work`.

## Audit logging

- `src/lib/audit.ts` records login (success/failure), account creation, role
  changes, activation/deactivation, opportunity moderation, report submission,
  and ticket changes.
- Each entry stores actor, action, resource, result, timestamp — **never**
  passwords or secrets. Logging failures never break the primary flow.
- Admins review the trail at `/dashboard/audit`.

## Data handling

- **Highly sensitive data (SSN, government ID, banking, passwords) is never
  collected** — there are no such fields in the schema. See
  [privacy.md](privacy.md).
- The app actively warns users when an opportunity requests excessive personal
  information.

## Known limitations (demo build)

- Rate limiting and email verification are architectural placeholders, not yet
  enforced.
- `AUTH_SECRET` ships with a dev default — set a strong random value in
  production.
- MFA is architecturally ready but not enabled.
