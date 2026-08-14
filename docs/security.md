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
- **Multi-factor authentication (TOTP):** RFC 6238 time-based one-time passwords
  (`src/lib/totp.ts`, Node-crypto implementation, verified against the RFC test
  vector). Users enroll from Account & Security (QR + manual key), sign-in
  enforces the second factor, and disabling requires a valid code. All three
  transitions are audit-logged.
- **Email verification:** registration issues a verification token; the `/verify`
  flow marks the address verified. (This build has no email provider, so the link
  is surfaced in-app for the demo.)

## Rate limiting

- A fixed-window limiter (`src/lib/rate-limit.ts`) throttles **login** (5 / 15
  min per email), **registration** (5 / hr), and **reports** (10 / hr). Rate-
  limited sign-ins are audit-logged. Swap the in-memory store for Redis to scale
  across instances.

## File handling

- Profile media uploads (headshot, resume, demo reel — all *public* tier) are
  validated by MIME type and size before being written (`src/lib/upload.ts`).
  Server Action body size is capped at 12 MB. In production, swap local storage
  for object storage behind the same interface.

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

## Fail-closed production defaults

- **`AUTH_SECRET` is enforced.** In production the app refuses to boot if
  `AUTH_SECRET` is unset or set to a known weak/dev value (`src/lib/auth.ts`).
- **Demo accounts are opt-in.** The login page only shows the demo-account helper
  when `NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS=true` — a real deploy ships no working
  credentials on its public login page.

## Account recovery

- **Forgot password:** `/forgot-password` issues a single-use, 1-hour token and
  emails a reset link (`/reset-password`). Responses don't reveal whether an
  account exists. Rate-limited.
- **2FA recovery codes:** eight single-use codes are generated at MFA enrollment,
  stored only as bcrypt hashes, shown once, and accepted as an alternate second
  factor at sign-in and when disabling MFA.
- **Email delivery** goes through the provider integration (`src/lib/email.ts`,
  Resend). Without `EMAIL_PROVIDER_API_KEY` it degrades gracefully — the link is
  logged and shown in a dev-only banner, never silently dropped.

## Known limitations (demo build)

- The rate limiter is in-memory (single instance); use Redis for multi-instance.
- Uploaded media is stored on local disk and served from `/public/uploads`;
  production should use object storage.
