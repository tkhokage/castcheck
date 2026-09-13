// Configuration validation only. Never prints credentials and never substitutes
// for service checks, browser QA or a successful deployment.
import "dotenv/config";

const env = process.env;
const checks = [];
const check = (name, ok) => checks.push({ name, ok: Boolean(ok) });
const present = key => Boolean(env[key]) && !/REPLACE|yourdomain|USER:PASSWORD|example/i.test(env[key]);
check("PostgreSQL database", present("DATABASE_URL") && /^postgres(ql)?:\/\//.test(env.DATABASE_URL));
check("Signing secret (32+ characters)", present("AUTH_SECRET") && env.AUTH_SECRET.length >= 32);
check("Demo account helper disabled", env.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS === "false");
check("Public HTTPS application URL", present("APP_URL") && /^https:\/\//.test(env.APP_URL));
check("Transactional email key", present("EMAIL_PROVIDER_API_KEY"));
check("Verified sender configured", present("EMAIL_FROM"));
check("Durable upload storage", present("BLOB_READ_WRITE_TOKEN"));
check("Shared rate limiting URL", present("UPSTASH_REDIS_REST_URL") && /^https:\/\//.test(env.UPSTASH_REDIS_REST_URL));
check("Shared rate limiting token", present("UPSTASH_REDIS_REST_TOKEN"));
check("Monitored contact inbox configured", present("NEXT_PUBLIC_CONTACT_EMAIL"));
check("Monitored security inbox configured", present("NEXT_PUBLIC_SECURITY_EMAIL"));
for (const item of checks) console.log(`${item.ok ? "PASS" : "MISSING"} ${item.name}`);
console.log("Also verify monitored contact/security addresses, real service delivery, source access and end-to-end behavior before release.");
if (checks.some(item => !item.ok)) process.exitCode = 1;
