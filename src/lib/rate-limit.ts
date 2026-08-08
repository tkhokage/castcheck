import "server-only";

// Fixed-window in-memory rate limiter. Sufficient for a single-instance demo.
// For multi-instance production, back this with Redis/Upstash using the same API.

type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

export function rateLimit(key: string, limit = 5, windowMs = 60_000): RateLimitResult {
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

// Best-effort cleanup so the map doesn't grow unbounded.
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of store) if (v.resetAt <= now) store.delete(k);
  }, 5 * 60_000);
  // Don't keep the process alive just for cleanup.
  (timer as { unref?: () => void }).unref?.();
}
