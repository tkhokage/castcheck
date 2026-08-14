import "server-only";
import { Redis } from "@upstash/redis";

// Rate limiter. Uses Upstash Redis (fixed window) when configured — so limits are
// shared across serverless instances — and falls back to an in-memory store for
// local/single-instance dev. Same call signature either way.

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

// --- In-memory fallback ------------------------------------------------------
type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();

function memoryLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = store.get(key);
  if (!bucket || bucket.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSec: 0 };
  }
  if (bucket.count >= limit) {
    return { ok: false, remaining: 0, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  bucket.count += 1;
  return { ok: true, remaining: limit - bucket.count, retryAfterSec: 0 };
}

if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of store) if (v.resetAt <= now) store.delete(k);
  }, 5 * 60_000);
  (timer as { unref?: () => void }).unref?.();
}

// --- Upstash Redis (lazy singleton) ------------------------------------------
let redis: Redis | null | undefined;
function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  // Constructed lazily so local dev never needs the credentials.
  redis = url && token ? new Redis({ url, token }) : null;
  return redis;
}

async function redisLimit(r: Redis, key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const rk = `rl:${key}`;
  const count = await r.incr(rk);
  if (count === 1) await r.pexpire(rk, windowMs);
  if (count > limit) {
    const ttl = await r.pttl(rk);
    return { ok: false, remaining: 0, retryAfterSec: Math.max(1, Math.ceil((ttl > 0 ? ttl : windowMs) / 1000)) };
  }
  return { ok: true, remaining: Math.max(0, limit - count), retryAfterSec: 0 };
}

/** Fixed-window rate limit. Async so it works over Redis in production. */
export async function rateLimit(key: string, limit = 5, windowMs = 60_000): Promise<RateLimitResult> {
  const r = getRedis();
  if (r) {
    try {
      return await redisLimit(r, key, limit, windowMs);
    } catch (e) {
      console.error("[rate-limit] redis error, falling back to memory", e);
    }
  }
  return memoryLimit(key, limit, windowMs);
}
