# CASTCHECK production rebuild

## Objective
Recreate CASTCHECK as an accessible, polished actor workspace using the existing Claude implementation and latest Codex changes as the foundation. Preserve Discover → Verify → Evaluate → Apply → Track, agency matching and optional 3D, profile, authentication, support, security, operations and PM artifacts. Complete implementation and validation until the release criteria pass; finish independent work before reporting specific external blockers.

## Version comparison, September 9, 2026
| Version | Inspected evidence | Decision |
| --- | --- | --- |
| Claude / main | e43309ddc496fac607496e3830132c207835c718; source, CLAUDE.md and AGENTS.md | Preserve existing architecture and capabilities. Documentation claims alone do not prove production readiness. |
| Codex trust fix | fc75cb23f7c0f75f0cf287543b711a2fea08fa64; draft PR #1 still open and unmerged | Included in latest prototype branch. |
| Latest Codex | 4653379; codex/agency-district-prototype | Rebuild foundation. Includes optional accessible 3D; Blender and AI filter milestones remain unfinished. |

Working branch: codex/castcheck-production-rebuild. Other checkouts and uncommitted work remain preserved. No existing Sites project was returned. Existing hosting architecture is Next.js Node + PostgreSQL; a static mockup cannot substitute for deployment.

## Product contract
- Actor-first home with immediate search and next actions; clear mobile navigation and separate staff operations.
- Source URLs, explicit sample labels, deadline handling, bounded results and useful empty/error states.
- Website checks distinguish unavailable evidence from negative evidence. Restrict server-side requests against internal networks, redirect abuse, DNS rebinding, timeouts and oversized responses. A reachable site never proves legitimacy.
- Live retrieval produces source URL, retrieval time and evidence. Preview extracted information before import. Imports remain private. Scheduled discovery requires permitted, configured source adapters with deduplication, expiry and failure reporting; never bypass source sign-in or anti-bot controls.
- Preserve matching, saving, tracking, profile, contract screening, support, MFA, RBAC and audit trails. Keep career fit separate from risk.
- Preserve optional 3D with list/keyboard fallback; virtual positions do not claim physical office locations.
- AI output is grounded, validated, labeled and has useful failure handling. Astra development assistance does not automatically migrate the existing Anthropic integration.

## Verifiable release criteria
- Tests, lint, types and production build pass on the release commit.
- Source retrieval demonstrates provenance, deduplication, expiry and failed-source handling using real accessible sources.
- End-to-end signup, real verification email, login, reset, MFA, upload, search, save, tracker, imports, agency details, 3D fallback and reporting pass.
- Cross-user and staff access controls pass; no demo accounts or fabricated production opportunities.
- Production PostgreSQL migrations, durable storage, transactional email and distributed rate limiting are configured and exercised.
- Deployment health check succeeds; desktop/mobile QA, accessibility, security findings and rollback are recorded.
- No mock data, placeholder, successful build alone or untested integration is described as a completed production release.

## Goal Mode continuation
The current Work session exposes no callable Goal Mode setter. This file records the objective; it does not activate Goal Mode. In a Codex session that supports the command, submit:

```text
/goal Complete the CASTCHECK production rebuild in docs/production-goal.md on codex/castcheck-production-rebuild. Read AGENTS.md and docs/production-progress.md. Preserve the latest Claude and Codex capabilities, then implement, test, review and deploy until all release criteria pass. Work in durable commits and update the progress log. Never declare completion for a mockup, sample data, or a build alone. Finish independent work before reporting an exact external blocker.
```

Official command reference: https://learn.chatgpt.com/use-cases/follow-goals
