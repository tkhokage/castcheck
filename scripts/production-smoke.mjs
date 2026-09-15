// Run against the local production build and an explicitly supplied test DB.
import "dotenv/config";
import { spawn } from "node:child_process";
import path from "node:path";
import { get } from "node:http";

if (!process.env.DATABASE_URL?.startsWith("file:")) throw new Error("Smoke checks require a local SQLite test database.");
const port = 3127;
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--port", String(port)], {
  env: { ...process.env, NODE_ENV: "production", DATABASE_URL: `file:${path.resolve("prisma/rebuild-validation.db")}` },
  stdio: ["ignore", "ignore", "pipe"],
});
let serverLog = "";
child.stderr.on("data", chunk => { serverLog = (serverLog + chunk.toString()).slice(-2000); });
const origin = `http://127.0.0.1:${port}`;
function read(route) {
  return new Promise((resolve, reject) => {
    const request = get(`${origin}${route}`, { timeout: 5000 }, response => {
      let body = "";
      response.on("data", chunk => { body += chunk.toString(); });
      response.on("end", () => resolve({ status: response.statusCode, ok: response.statusCode === 200, body, location: response.headers.location }));
    });
    request.on("timeout", () => request.destroy(new Error("HTTP check timed out.")));
    request.on("error", reject);
  });
}
try {
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    if (child.exitCode !== null) throw new Error("Production process exited before health check.");
    try { const response = await read("/api/health"); ready = response.ok; } catch { /* booting */ }
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  if (!ready) throw new Error(`Production health check did not become ready. ${serverLog}`);
  for (const route of ["/", "/discover", "/agencies", "/find", "/login", "/privacy", "/api/health"]) {
    const response = await read(route);
    if (response.status !== 200) throw new Error(`${route}: HTTP ${response.status}`);
    const body = response.body;
    if (route === "/" && !body.includes("Your next role.")) throw new Error("Public home did not render.");
    if (route === "/api/health" && !body.includes('"db":"up"')) throw new Error("Database not ready.");
    console.log(`PASS ${route} HTTP 200`);
  }
  for (const route of ["/tracker", "/find/import", "/dashboard"]) {
    const response = await read(route);
    const httpRedirect = [303, 307, 308].includes(response.status) && response.location?.startsWith("/login");
    const streamedRedirect = response.status === 200 && /<meta id="__next-page-redirect" http-equiv="refresh" content="\d+;url=\/login(?:\?[^"<>]*)?"\s*\/>/.test(response.body);
    if (!httpRedirect && !streamedRedirect) throw new Error(`${route}: missing login boundary`);
    console.log(`PASS ${route} requires login`);
  }
} finally {
  if (child.exitCode === null) {
    const exited = new Promise(resolve => child.once("exit", resolve));
    child.kill("SIGTERM");
    await exited;
  }
}
