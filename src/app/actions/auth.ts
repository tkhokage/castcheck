"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword, createSession, destroySession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { Prisma } from "@prisma/client";
import { rateLimit } from "@/lib/rate-limit";
import { verifyTotp } from "@/lib/totp";
import { consumeRecoveryCode } from "@/lib/recovery";
import { asList } from "@/lib/utils";
import { sendVerification, baseUrl } from "@/lib/email";

const registerSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["actor", "casting", "agency"]).default("actor"),
});

export type AuthState = { error?: string; mfaRequired?: boolean } | undefined;

export async function register(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") || "actor",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { name, email, password, role } = parsed.data;

  const limit = await rateLimit(`register:${email.toLowerCase()}`, 5, 60 * 60_000);
  if (!limit.ok) return { error: `Too many attempts. Try again in ${limit.retryAfterSec}s.` };

  const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return { error: "An account with that email already exists." };

  const verifyToken = crypto.randomBytes(24).toString("hex");
  const user = await db.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash: await hashPassword(password),
      role,
      verifyToken,
      profile:
        role === "actor"
          ? { create: { displayName: name, experienceLevel: "emerging" } }
          : undefined,
    },
  });

  await audit({ userId: user.id, action: "account.create", resource: `user:${user.id}` });
  // Fire off a verification email (no-op-safe when no provider is configured).
  await sendVerification(user.email, `${await baseUrl()}/verify?token=${verifyToken}`);
  await createSession({ id: user.id, email: user.email, name: user.name, role: user.role as never });
  redirect(role === "actor" ? "/profile" : "/dashboard");
}

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
  code: z.string().optional(),
});

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    code: formData.get("code") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const limit = await rateLimit(`login:${parsed.data.email.toLowerCase()}`, 5, 15 * 60_000);
  if (!limit.ok) {
    await audit({ action: "auth.login", result: "rate_limited", meta: { email: parsed.data.email.toLowerCase() } });
    return { error: `Too many sign-in attempts. Try again in ${limit.retryAfterSec}s.` };
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || !user.active || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    await audit({ userId: user?.id, action: "auth.login", result: "failure" });
    return { error: "Invalid email or password." };
  }

  // Second factor, when enabled — accept the authenticator code or a recovery code.
  if (user.mfaEnabled && user.mfaSecret) {
    if (!parsed.data.code) return { mfaRequired: true };

    let ok = verifyTotp(user.mfaSecret, parsed.data.code);
    if (!ok) {
      const hashes = asList<string>(user.mfaRecoveryCodes);
      const res = await consumeRecoveryCode(hashes, parsed.data.code);
      if (res.matched) {
        ok = true;
        await db.user.update({
          where: { id: user.id },
          data: { mfaRecoveryCodes: res.remaining.length ? (res.remaining as unknown as Prisma.InputJsonValue) : Prisma.DbNull },
        });
        await audit({ userId: user.id, action: "auth.mfa_recovery", meta: { remaining: res.remaining.length } });
      }
    }
    if (!ok) {
      await audit({ userId: user.id, action: "auth.mfa", result: "failure" });
      return { mfaRequired: true, error: "Invalid authentication or recovery code." };
    }
    await audit({ userId: user.id, action: "auth.mfa" });
  }

  await audit({ userId: user.id, action: "auth.login" });
  await createSession({ id: user.id, email: user.email, name: user.name, role: user.role as never });
  redirect("/discover");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
