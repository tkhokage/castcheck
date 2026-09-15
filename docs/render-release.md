# Free Render deployment

The user authorized an alternative free host on September 15, 2026. `render.yaml` creates only a free Node web service, from the existing production-rebuild branch, with automatic deploys disabled. No paid resource is requested and no production data is seeded.

Render is currently at its sign-in screen in this Codex task; there is no connected Render account or CLI credential. Deployment awaits account access and actual database/provider configuration. This configuration is not a live deployment.

Use Render's Blueprint import for this repository and select `codex/castcheck-production-rebuild`, where `render.yaml` lives. Review the plan summary and confirm every resource remains free. The blueprint generates a signing secret and prompts for PostgreSQL, transactional email, Blob, Redis and public contact values. Keep secrets in Render's dashboard. APP_URL comes from RENDER_EXTERNAL_URL at runtime unless explicitly configured.

The native build installs the pinned dependencies including Prisma's CLI, selects PostgreSQL, generates the client and builds Next.js. Startup applies reviewed migrations and refuses to start on migration failure. Rehearse these migrations against a new staging database before applying them to an existing production database. The local SQLite environment does not validate PostgreSQL migrations.

Free service limitations: Render spins the service down after 15 minutes without requests, so the next request experiences a cold start. Free Render PostgreSQL expires after 30 days; it is not included in this blueprint. Supply a durable external PostgreSQL service, for example a separately verified Neon free plan. Review the chosen database provider's current quotas before creating it. Free compute has limited memory and usage quotas; do not describe this as an always-on production service.

After deployment, verify the public HTTPS URL, /api/health, migrations, email delivery, account and MFA flows, durable uploads, Redis limits, private imports, and desktop/mobile scroll behavior. Missing services remain subject to the application's production safeguards.

References: https://render.com/docs/free, https://render.com/docs/blueprint-spec, https://render.com/docs/deploy-nextjs-app.
