# Production rebuild progress

## September 13 continuation

The current user explicitly requested completion, GitHub updates and Railway deployment. Compared the connected repository with the transfer: main remains e43309d and the Agency District branch remains 4653379. Restored the transfer on a separate production-rebuild branch from 4653379. The historical upload rejection below describes the originating session; no current-session upload approval rejection has occurred.

Implemented the original scroll-driven world landing page and retained the signed-in actor workspace. Created and visually inspected a Blender scene through Higgsfield, exported its 1.09 MB GLB and static fallback, and verified desktop, arrival, mobile, pause and reduced-motion behavior. See `docs/scroll-world.md`. Mobbin search required a paid plan and supplied no design references.

Fixed production email token disclosure in reset and verification action results and fallback logs; constrained production link origins to APP_URL; added an email timeout; prevented active MFA from being silently reset through re-enrollment; rate-limited MFA confirmation/disable and verification resend; made Redis increments/expiry atomic and production limiter failures fail closed; prevented production uploads from silently using ephemeral disk. Registration for casting/agency accounts now opens their posting workflow instead of staff-only operations.

Added Railway health configuration, fixed Docker dependency installation before the schema exists, and made public contact addresses configurable. Missing security contact returns 503. See `docs/railway-release.md` for migration and deployment sequencing.

Validation on this checkout: 103 unit tests across 16 files pass; lint and production build/types pass. Browser actor checks pass signup, local verification token consumption, private import/tracker, cross-user access restriction, staff restriction, MFA enrollment and recovery-code login. Browser landing checks pass 3D load/arrival/pause, mobile width, reduced motion, and discovery navigation. Local verification used a disposable database token, not real email delivery.

External blockers: Railway rejected dedicated-project creation because the account trial expired. A plan must be activated. Real PostgreSQL, verified transactional sender, durable Blob storage, Upstash Redis, HTTPS APP_URL, and monitored contact/security inboxes are not configured. The preflight correctly fails. PostgreSQL migrations, real email/storage/Redis, allowed casting source integrations, complete upload/reset/report flows, deployment and rollback still require verification. No production completion is claimed.

Date: September 11, 2026. Status: **release work in progress; not deployed**.

## Completed implementation
- Compared Claude-era main, Codex trust fix and the newer Agency District prototype. Selected `4653379` as the foundation and preserved the optional 3D view.
- Replaced the long marketing home with an actor workspace, direct search, market shortcuts and application actions. Added mobile navigation and a skip link; simplified primary navigation while keeping secondary tools in the footer.
- Excluded sample listings and known past deadlines from default discovery. Added sample labels, source links, recorded-check dates, bounded pagination and sorting. Unknown deadlines are not represented as confirmed open calls.
- Added public URL reading with structured JobPosting or page-metadata extraction. The actor reviews fields before saving. No missing pay, location or eligibility is inferred.
- Signed preview receipts bind source URL, final URL, content hash, retrieval time and deadline to the actor. Receipts expire after 30 minutes. Source evidence is saved separately from verification status.
- Imports and tracker records are saved in one transaction, with an actor/source key for deduplication. Imported records are private and do not become verified merely because they were fetched.
- Hardened web requests: public IPv4 validation, vetted DNS addresses pinned to the socket, redirect validation, HTTPS downgrade rejection, eight-second overall timeout, HTML-only responses and 200 KB response cap. IPv6-only and oversized pages currently need manual entry.
- Website failures are inconclusive; exact normalized host comparison avoids matching unrelated co.uk domains.
- Unified opportunity visibility for details, save, track, report and live checks. Drafts/imports/rejected records remain restricted. Existing sessions consult current account activation and role. Production signing secrets require 32+ characters.
- Added validated AI ticket classification and bounded API timeout/retries while preserving the existing provider and rule-based fallback.
- Added release configuration checks and PostgreSQL migration for source evidence and deduplication. Corrected an unsupported production-ready claim in deployment documentation.

## Validation evidence
- Unit tests: 97 passing across 14 files, including source extraction, private record policy, session deactivation/role changes, and network restrictions with mocked transports.
- Lint: passed; final smoke-script lint and Git whitespace checks also passed.
- Production build and TypeScript: passed on the final application source. Subsequent changes affect only the smoke harness and handoff documentation.
- Local production HTTP smoke: blocked before readiness. Next startup reported `uv_interface_addresses returned Unknown system error 1` from the environment's network-interface lookup. No runtime route success is claimed.
- Local SQLite schema application: passed on a new test database; no existing or production database was changed.
- Production preflight: expected failure. PostgreSQL, public app URL, email key/sender, durable storage, and shared rate-limit credentials are absent. Local generated auth secret and hidden demo helper pass.
- No browser end-to-end checks, live provider requests, real email, production PostgreSQL migration, or deployment success has been established.

## Remaining work and external dependencies
1. Connect the existing Node deployment path. Vercel was found but is not installed/connected in this session. No Sites project was found, and this app is not a Worker-compatible build.
2. Supply production PostgreSQL, transactional email with a verified sender, durable object storage, Redis, public app URL, strong signing secret and monitored contact/security addresses through the host's secret manager. Never paste secrets into Git or documentation.
3. Configure permitted data sources and finish scheduled multi-source discovery, moderation, refresh/expiry and operational failure monitoring. The implemented reader handles one user-selected public page; it is not an internet-wide casting crawler. Source access has not been validated against live casting providers.
4. Run browser end-to-end and responsive/accessibility checks. Exercise auth/reset/MFA/upload/save/tracker/import/3D/report flows and cross-account boundaries with dedicated test users.
5. Validate the new migration against a staging PostgreSQL database, then exercise live service delivery, rollback and production health checks before declaring release.
6. Complete any subsequent 3D art/hero evolution and AI-filter milestones against the product contract; these were not silently represented as finished by this pass.

## Transfer checkpoint
- The user requested a Codex handoff on September 11. See `CODEX_HANDOFF.md` for setup and continuation instructions.
- The rebuild is locally committed. Automatic approval review rejected the GitHub push because explicit authorization for the payload/destination was not established. Nothing from this rebuild was pushed or deployed; do not bypass the rejection through another upload route.
- Texas Film Commission pages were researched only. No adapter was implemented or approved: its site policies restrict commercial reproduction. Confirm provider terms before automated aggregation.

## Goal continuation
Read `docs/production-goal.md`. Goal Mode is not activated in this Work session; submit its saved `/goal` command in a Codex session that exposes the feature. Continue on `codex/castcheck-production-rebuild`, preserving this branch's work and updating this log with actual evidence.
