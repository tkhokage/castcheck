import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "./db";
import type { Role } from "./constants";

const COOKIE = "castcheck_session";

// Fail closed: refuse to run in production with a missing or weak signing secret.
// (Skipped during `next build`, which has no runtime secrets.)
const DEV_FALLBACK = "insecure-dev-secret";
const WEAK_SECRETS = new Set([DEV_FALLBACK, "dev-only-change-me", "change-me", "insecure-dev-secret", ""]);
const rawSecret = process.env.AUTH_SECRET;
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

if (process.env.NODE_ENV === "production" && !isBuildPhase && (!rawSecret || WEAK_SECRETS.has(rawSecret))) {
  throw new Error(
    "AUTH_SECRET is missing or set to a known weak value. Set a strong, unique secret before running in production:\n" +
      '  node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64url\'))"',
  );
}

const secret = new TextEncoder().encode(rawSecret || DEV_FALLBACK);

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 10);
}

export async function verifyPassword(pw: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pw, hash);
}

export async function createSession(user: SessionUser): Promise<void> {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

/** Full user record from DB for the current session (or null). */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await db.user.findUnique({
    where: { id: session.id },
    include: { profile: true },
  });
  if (!user || !user.active) return null;
  return user;
}

export async function requireUser(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  return session;
}
