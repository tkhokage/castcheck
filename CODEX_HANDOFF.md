# CASTCHECK Codex handoff

Prepared September 11, 2026. Status: implemented locally, partially validated, not deployed and not pushed.

## Start here

The transfer ZIP contains the actual tracked source snapshot in `castcheck/`, this handoff, a Word handoff, a patch against the latest Codex prototype, and a manifest identifying the commits. Dependencies, build output, local databases, uploads, `.env` files and Git metadata are excluded. Environment example templates are included. The source snapshot is the simplest transfer route; do not also apply the patch to that snapshot.

1. Extract the ZIP and open `castcheck/` as the project in Codex. Select GPT6 Astra if your Codex installation offers it; this handoff cannot change the model or transfer a running session.
2. Read this file, `AGENTS.md`, `docs/production-goal.md`, `docs/production-progress.md`, and `docs/agency-district.md`. Older completion marks describe implementation, not verified production readiness.
3. Install the pinned dependencies with `npm ci`. Follow the local environment example, generate a new random signing secret, and use a fresh local SQLite database for initial development. Never use production credentials for seed or smoke commands.
4. Submit the goal below. If Goal Mode is unavailable, paste it as an ordinary task and ask Codex to maintain the progress documents. The command has not been activated in the originating session.

```text
/goal Continue the CASTCHECK production rebuild from CODEX_HANDOFF.md and the supplied source snapshot. Read AGENTS.md, docs/production-goal.md, and docs/production-progress.md. Preserve the Claude foundation and latest Codex Agency District work. Compare with current GitHub before applying changes. Complete the remaining discovery, integration, testing, and deployment work until the documented release criteria pass. Keep durable commits and update the progress log. Do not declare completion from a build, demo data, or a mockup. Finish independent work before reporting exact external blockers. Respect the recorded GitHub upload rejection; obtain explicit authorization for the concrete payload and destination before retrying.
```

Official Goal Mode reference: https://learn.chatgpt.com/use-cases/follow-goals

## Repository lineage and transfer options

- Repository: https://github.com/tkhokage/castcheck
- Claude/main foundation inspected: `e43309ddc496fac607496e3830132c207835c718`.
- Codex trust fix: `fc75cb23f7c0f75f0cf287543b711a2fea08fa64`; PR https://github.com/tkhokage/castcheck/pull/1 was open/draft/unmerged when inspected.
- Selected base: `4653379394caa1950d4a1b7122bde9631b543da0`, branch `codex/agency-district-prototype`.
- Rebuild branch: `codex/castcheck-production-rebuild`.
- Main implementation commit: `615283939c5190c59ebea4550c6bb0c93e7fd13d`. The transfer manifest records the final checkpoint, including smoke-harness and documentation updates.
- Original working checkout `/workspace/sites/castcheck`; paths refer to the old session and are not required in the new environment.

For an existing GitHub checkout, preserve local edits first and compare its current branch with the selected base. The patch is intended for that exact base; run `git apply --check` before applying it on an isolated branch. Do not reset or overwrite newer work. Alternatively use the complete snapshot as a separate local project, initialize Git, and review its changes against the remote before publishing. The archive has no Git history.

Automatic approval review rejected the attempted GitHub push: explicit authorization to publish this repository payload to the destination was not established and the destination was not verified as trusted. No push or deployment succeeded. The user subsequently requested this handoff package. Do not evade the rejection with a different connector; a future push needs explicit authorization for the reviewed payload and destination.

## Implemented in this pass

- Actor workspace home, direct search, market shortcuts, next actions, mobile navigation, skip link, forest-green visual palette, reduced-motion support and simpler navigation.
- Discovery excludes demos and known past deadlines by default, supports explicit sample mode, source/date labels, 24-result pagination and newest/deadline sorting. Unknown deadlines do not imply confirmed availability.
- User-selected public URL reading with a review step: single JSON-LD JobPosting or page title/description extraction. Missing pay, location or eligibility is not inferred.
- Public IPv4 validation, vetted DNS addresses pinned to the socket, manual redirect checks, HTTPS downgrade rejection, eight-second timeout, HTML-only and 200 KB response limits. IPv6-only, restricted and oversized sources require manual entry.
- Signed, actor-bound, 30-minute preview receipts and stored provenance: original/final URL, retrieval time, content hash and an explicitly sourced deadline where available.
- Atomic private import and tracker creation, actor/source deduplication, and no automatic verification claim merely because a page was fetched.
- Website failures are inconclusive rather than fraud evidence. Exact normalized host comparison avoids treating unrelated co.uk hosts as identical.
- Shared opportunity access policy for details, save, track, report and live checks. Private drafts/imports/rejected records remain restricted; sessions consult current role and active state. HS256 and a production secret minimum of 32 characters are enforced.
- Existing Anthropic integration preserved, with bounded timeout/retries and validated ticket-classification output. The app has not been migrated to an OpenAI model; Astra refers to development assistance.
- PostgreSQL source-evidence/import-key migration, release preflight, local HTTP smoke harness, CI lint and deployment/progress documentation corrections.
- Existing optional accessible Agency District 3D retained. New Blender art and AI-filter milestones remain incomplete.

## Files to inspect first

| Area | Files |
| --- | --- |
| Product and release contract | `docs/production-goal.md`, `docs/production-progress.md` |
| Home and discovery | `src/app/page.tsx`, `src/app/discover/`, shared navigation/components |
| Public source reading | `src/lib/public-web.ts`, `src/lib/listing-extraction.ts` |
| Preview/import | `src/app/actions/source-preview.ts`, `src/app/actions/import.ts`, `src/components/source-import.tsx` |
| Access and sessions | `src/lib/opportunity-access.ts`, `src/lib/auth.ts` |
| Data migration | `prisma/schema.prisma`, `prisma/migrations/20260909_source_evidence/migration.sql` |
| Release tools | `scripts/release-preflight.mjs`, `scripts/production-smoke.mjs`, `.github/workflows/` |
| Preserved 3D scope | `docs/agency-district.md` |

## Validation and its limits

| Check | Recorded result |
| --- | --- |
| Unit tests | 97 passed across 14 files; network tests use mocked transports. |
| Lint | Passed; final smoke-script lint and whitespace checks passed. |
| Production build and types | Passed on final application source; later edits are harness/docs only. |
| SQLite schema | Applied to a fresh local test database only. |
| Production HTTP smoke | Blocked at startup: `uv_interface_addresses returned Unknown system error 1`; no route success claimed. |
| Production preflight | Expected failure: production services and public URL absent. |
| Browser, live services, staging PostgreSQL, deployment | Not completed. |

Stack at checkpoint: Next.js 16.3.0, React 19.2.8, Prisma 6.19.3, TypeScript, Vitest 4.1.10. Read the installed Next.js documentation required by AGENTS.md before coding.

## Local setup and checks

Use the repository's environment examples and setup documentation. A minimal local sequence is:

```bash
npm ci
cp .env.example .env
npm run db:use:sqlite
# Edit .env: fresh local DATABASE_URL, random AUTH_SECRET, demo helper disabled.
npx prisma generate
npm run db:push
npm test
npm run lint
npm run build
```

The local smoke harness expects `prisma/rebuild-validation.db` and requires a SQLite DATABASE_URL; create that dedicated test schema before running `node scripts/production-smoke.mjs`. It starts production Next on port 3127, probes public routes and unauthenticated redirects, and currently failed at environment startup. It is not an end-to-end suite. Database provider switching modifies schema configuration; review that change before committing.

Run `npm run release:preflight` with staging/production configuration to identify missing services. Do not fabricate values just to make it pass. `npm run vercel-build` switches to PostgreSQL and applies migrations before building; run it only against the intended staging or production database after reviewing migrations.

## Remaining production work in order

1. Establish a running local environment and browser QA. Exercise signup, verification, login, reset, MFA/recovery, profile/upload, search, save, tracker, import, agency details, optional 3D fallback, reporting and staff access. Test cross-user boundaries and mobile/keyboard accessibility. Resolve actual failures.
2. Agree the final discovery scope and implement permitted source adapters, scheduling, moderation, deduplication, refresh/expiry and failed-source visibility. The implemented single-page reader is not internet-wide search. Texas Film Commission pages were researched only; no scraper was built or approved. Its site policies restrict commercial reproduction: https://gov.texas.gov/site-policies . Confirm source permissions before automated aggregation.
3. Finish the outstanding Agency District art and AI-filter milestones where still required by the product contract. Preserve the accessible list fallback and avoid claiming virtual locations are real offices.
4. Connect Node-compatible hosting and staging PostgreSQL, real transactional email/verified sender, durable object storage, Redis, public HTTPS URL, strong signing secret and monitored contact/security addresses. Set credentials through the environment or host secret manager, never in Git or this handoff. The optional AI service also needs valid credentials for live validation.
5. Apply and verify migrations in staging. Exercise email delivery, object persistence, shared rate limits, source reading against allowed live pages, health checks and rollback. Existing architecture is Node Next.js plus PostgreSQL; no Sites project or compatible Worker deployment was established. Vercel was available for discovery but not connected.
6. Review the exact source diff and destination, resolve the recorded upload authorization issue, then publish/deploy through the selected host. Record URL, deployed commit, migration outcome, health, end-to-end results and rollback before declaring production completion.

All release criteria are in `docs/production-goal.md`. Maintain that contract and a truthful progress log. A successful build, seeded data or polished screenshot alone does not satisfy the user's production goal.
