# Railway release status

September 13, 2026: **not deployed**. Railway returned “Your trial has expired. Please select a plan to continue using Railway.” when creating a dedicated CASTCHECK project. Existing projects are unrelated applications and were not modified.

The repository has a standalone Next.js Docker build and `railway.json` health-check configuration. Dependencies install without running the Prisma postinstall before its schema is copied. The builder then selects PostgreSQL and generates Prisma explicitly. Public contact addresses are Docker build arguments; configure them before the build.

## Required services

Provision a dedicated Railway project and PostgreSQL database after the plan is active. Configure the variables in `.env.production.example`: signing secret, HTTPS app URL, Resend key and verified sender, Vercel Blob token, Upstash REST Redis URL/token, and monitored public contact/security addresses. Optional Anthropic credentials enable the existing AI integration. Do not reuse another project's private service credentials or deploy demo seeds.

## Migration and release sequence

1. Review and back up the target database. Rehearse migrations in a separate staging PostgreSQL database. The local SQLite checks do not verify PostgreSQL migrations.
2. Build the Dockerfile's `migrator` target and run `prisma migrate deploy` with the intended staging DATABASE_URL. The final standalone web image does not include the migration CLI; do not set an unsupported migration command on that image.
3. Exercise email delivery, durable uploads, shared rate limits and the complete account/application flows against staging. Run `npm run release:preflight` with the actual release configuration; do not substitute placeholder values to pass it.
4. Deploy the reviewed GitHub commit into the dedicated production service. Generate its public domain, set APP_URL to that domain, then rebuild if public build variables changed.
5. Apply production migrations through the separately built migrator with the backed-up production target, deploy the matching web image, and verify `/api/health`, registration/email/reset/MFA, uploads and data boundaries.
6. Record the URL, exact commit, migration results and health evidence. Roll back the web service to the last verified image if needed. For schema changes, use a forward fix or the tested database restoration procedure; never assume rolling back the web image reverses migrations.

Production missing-service behavior now fails closed for uploads and shared rate limits. Email delivery failures never expose verification/reset tokens in production responses or fallback logs. Missing contact configuration causes security.txt to return 503 instead of a fabricated address.

Discovery remains curated source links plus user-reviewed private imports. No source permission, scheduled aggregation or internet-wide casting search is implied by this release preparation.
