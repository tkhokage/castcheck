import "server-only";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

// Single-use 2FA recovery codes. Stored only as bcrypt hashes; shown in plaintext
// exactly once (right after MFA enrollment). Accepted as an alternate second
// factor at sign-in and when disabling MFA, then consumed.

export function generateRecoveryCodes(n = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < n; i++) {
    const raw = crypto.randomBytes(5).toString("hex").toUpperCase(); // 10 hex chars
    codes.push(`${raw.slice(0, 5)}-${raw.slice(5, 10)}`);
  }
  return codes;
}

function normalize(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export async function hashRecoveryCodes(codes: string[]): Promise<string[]> {
  return Promise.all(codes.map((c) => bcrypt.hash(normalize(c), 10)));
}

/** Try to match+consume a submitted code. Returns the reduced hash list on success. */
export async function consumeRecoveryCode(
  hashes: string[],
  submitted: string,
): Promise<{ matched: boolean; remaining: string[] }> {
  const norm = normalize(submitted);
  if (norm.length < 8) return { matched: false, remaining: hashes };
  for (let i = 0; i < hashes.length; i++) {
    if (await bcrypt.compare(norm, hashes[i])) {
      return { matched: true, remaining: hashes.filter((_, idx) => idx !== i) };
    }
  }
  return { matched: false, remaining: hashes };
}
