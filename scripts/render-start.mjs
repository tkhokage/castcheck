import { spawnSync, spawn } from "node:child_process";

// Render free services do not provide a separate pre-deploy command. Apply
// idempotent, reviewed migrations before accepting traffic. Never seed here.
if (!/^postgres(?:ql)?:\/\//.test(process.env.DATABASE_URL || "")) {
  throw new Error("Render requires a configured PostgreSQL DATABASE_URL.");
}
process.env.APP_URL ||= process.env.RENDER_EXTERNAL_URL;
if (!process.env.APP_URL?.startsWith("https://")) {
  throw new Error("Set APP_URL to the public HTTPS URL or use Render's generated URL.");
}
const migrate = spawnSync(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "deploy"], {
  env: process.env,
  stdio: "inherit",
});
if (migrate.error || migrate.status !== 0) {
  console.error("Database migration failed; web server was not started.");
  process.exit(migrate.status || 1);
}
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "0.0.0.0", "--port", process.env.PORT || "10000"], {
  env: process.env,
  stdio: "inherit",
});
for (const signal of ["SIGTERM", "SIGINT"]) process.on(signal, () => server.kill(signal));
server.on("error", () => { console.error("Web server could not start."); process.exit(1); });
server.on("exit", code => process.exit(code ?? 1));
