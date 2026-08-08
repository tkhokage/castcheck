import { describe, it, expect, vi, afterEach } from "vitest";
import { verifyTotp, generateSecret, otpauthUri } from "./totp";

// RFC 6238 test vector: ASCII secret "12345678901234567890" → base32 below.
// At Unix time 59s (SHA-1), the 6-digit TOTP is 287082.
const RFC_SECRET = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";

afterEach(() => vi.useRealTimers());

describe("verifyTotp", () => {
  it("matches the RFC 6238 reference vector", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(59 * 1000));
    expect(verifyTotp(RFC_SECRET, "287082")).toBe(true);
  });

  it("rejects a wrong code", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(59 * 1000));
    expect(verifyTotp(RFC_SECRET, "000000")).toBe(false);
  });

  it("rejects malformed input", () => {
    expect(verifyTotp(RFC_SECRET, "abc")).toBe(false);
    expect(verifyTotp("", "287082")).toBe(false);
  });

  it("accepts a code from the adjacent time step (drift window)", () => {
    vi.useFakeTimers();
    // 30s later is the next step; a code for T=59 should still pass at T=89.
    vi.setSystemTime(new Date(89 * 1000));
    expect(verifyTotp(RFC_SECRET, "287082")).toBe(true);
  });
});

describe("generateSecret", () => {
  it("produces a base32 secret", () => {
    const s = generateSecret();
    expect(s).toMatch(/^[A-Z2-7]+$/);
    expect(s.length).toBeGreaterThanOrEqual(32);
  });
});

describe("otpauthUri", () => {
  it("builds a valid otpauth URI", () => {
    const uri = otpauthUri("ABC234", "actor@castcheck.app");
    expect(uri).toMatch(/^otpauth:\/\/totp\/CASTCHECK%3Aactor%40castcheck\.app\?/);
    expect(uri).toContain("secret=ABC234");
    expect(uri).toContain("issuer=CASTCHECK");
    expect(uri).toContain("period=30");
  });
});
