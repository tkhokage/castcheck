# Retrospective — Phase 8: Production readiness (G-pass)

**Scope:** G1–G9 — env onboarding, fail-closed security, account recovery, object
storage, Redis, error/404/loading + confirmations, legal pages, accessibility,
knowledge-base outbound links, deploy config.

## What went well
- Running it as **nine small sub-phases with a commit each** kept scope legible
  and every change independently reviewable and revertible.
- The graceful-degradation pattern ([DEC-005](../decision-log.md)) made "wire the
  production dependency" a small, uniform change each time (email, Blob, Redis).
- Auditing WCAG contrast with a script caught four real failures that eyeballing
  would have missed — evidence-based, not vibes-based.

## What failed / was harder than expected
- Getting a **stable public demo URL** was the recurring pain: three free tunnel
  services (Cloudflare, localtunnel, localhost.run) were each intermittently
  blocked or throttled on the network. Accepted as I-03 — the permanent URL is
  the Vercel deploy, not a tunnel.

## What surprised us
- How many "production-readiness" gaps were really **ease-of-use** gaps: a missing
  reset email or a bare 404 erodes trust as fast as a security hole.

## What changed
- Reconciled the MFA doc inconsistency (I-01 → [DEC-003](../decision-log.md)):
  docs now state the *implemented* control, not an aspirational one.
- Centralized placeholder contact/security addresses with a TODO ([DEC-007](../decision-log.md)).

## What we'll do differently
- Choose the deploy target and provision the live environment **before** the final
  readiness pass, so go-live UAT (real email, persistent uploads) can run
  immediately instead of waiting on operator credentials (D-02).
