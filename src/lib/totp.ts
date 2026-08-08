import "server-only";
import crypto from "node:crypto";

// RFC 6238 TOTP + RFC 4648 base32, implemented on Node crypto (no external dep).
// Used for the MFA-ready architecture: enroll → verify → enforce at sign-in.

const B32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateSecret(bytes = 20): string {
  const buf = crypto.randomBytes(bytes);
  let bits = "";
  for (const b of buf) bits += b.toString(2).padStart(8, "0");
  let out = "";
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    out += B32_ALPHABET[parseInt(bits.slice(i, i + 5), 2)];
  }
  return out;
}

function base32Decode(secret: string): Buffer {
  const clean = secret.replace(/=+$/, "").toUpperCase().replace(/\s/g, "");
  let bits = "";
  for (const c of clean) {
    const idx = B32_ALPHABET.indexOf(c);
    if (idx === -1) continue;
    bits += idx.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

function hotp(secret: string, counter: number, digits = 6): string {
  const key = base32Decode(secret);
  const buf = Buffer.alloc(8);
  buf.writeBigInt64BE(BigInt(counter));
  const hmac = crypto.createHmac("sha1", key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return (code % 10 ** digits).toString().padStart(digits, "0");
}

/** Verify a token, allowing ±1 time step for clock drift. */
export function verifyTotp(secret: string, token: string, step = 30, window = 1): boolean {
  if (!secret || !/^\d{6}$/.test(token.trim())) return false;
  const counter = Math.floor(Date.now() / 1000 / step);
  for (let w = -window; w <= window; w++) {
    if (hotp(secret, counter + w) === token.trim()) return true;
  }
  return false;
}

export function otpauthUri(secret: string, account: string, issuer = "CASTCHECK"): string {
  const label = encodeURIComponent(`${issuer}:${account}`);
  const params = new URLSearchParams({ secret, issuer, algorithm: "SHA1", digits: "6", period: "30" });
  return `otpauth://totp/${label}?${params.toString()}`;
}
