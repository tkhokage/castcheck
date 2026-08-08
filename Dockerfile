# syntax=docker/dockerfile:1

# ---- Base -------------------------------------------------------------------
FROM node:22-slim AS base
# OpenSSL is required by Prisma's query engine.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# ---- Dependencies -----------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- Builder ----------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Production runs on PostgreSQL.
RUN node scripts/set-db-provider.mjs postgresql && npx prisma generate
# DATABASE_URL is not needed to build; a placeholder keeps env validation happy.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- Migrator (used by docker-compose to apply migrations) ------------------
FROM builder AS migrator
CMD ["npx", "prisma", "migrate", "deploy"]

# ---- Runner (standalone production server) ----------------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Next.js standalone output + static assets + public dir.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Prisma client + engine (traced by standalone, copied explicitly to be safe).
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
