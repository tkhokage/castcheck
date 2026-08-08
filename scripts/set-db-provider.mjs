// Rewrites the datasource provider in prisma/schema.prisma.
// Local dev uses SQLite; production (Docker / CI / cloud) uses PostgreSQL.
//
//   node scripts/set-db-provider.mjs postgresql
//   node scripts/set-db-provider.mjs sqlite
//
// The production Dockerfile runs this before `prisma generate` / `migrate deploy`.

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const target = process.argv[2];
if (!["sqlite", "postgresql"].includes(target)) {
  console.error("Usage: set-db-provider.mjs <sqlite|postgresql>");
  process.exit(1);
}

const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
const src = await readFile(schemaPath, "utf8");
const next = src.replace(/provider\s*=\s*"(sqlite|postgresql)"/, `provider = "${target}"`);

if (next === src && !src.includes(`provider = "${target}"`)) {
  console.error("Could not find a datasource provider line to rewrite.");
  process.exit(1);
}

await writeFile(schemaPath, next);
console.log(`Prisma datasource provider set to ${target}.`);
