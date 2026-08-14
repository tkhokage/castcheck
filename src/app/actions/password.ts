"use server";

import crypto from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";
import { sendPasswordReset, baseUrl } from "@/lib/email";

export type ResetState = { error?: string; ok?: boolean; devLink?: string } | undefined;

const requestSchema = z.object({ email: z.string().email("Enter a valid email") });

export async function requestPasswordReset(_prev: ResetState, formData: FormData): Promise<ResetState> {
  const parsed = requestSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const email = parsed.data.email.toLowerCase();

  const limit = await rateLimit(`reset-request:${email}`, 5, 15 * 60_000);
  if (!limit.ok) return { error: `Too many requests. Try again in ${limit.retryAfterSec}s.` };

  const user = await db.user.findUnique({ where: { email } });
  // Always respond the same way whether or not the account exists (no enumeration).
  if (!user || !user.active) {
    return { ok: true };
  }

  const token = crypto.randomBytes(32).toString("hex");
  await db.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiry: new Date(Date.now() + 60 * 60_000) },
  });

  const link = `${await baseUrl()}/reset-password?token=${token}`;
  const sent = await sendPasswordReset(user.email, link);
  await audit({ userId: user.id, action: "password.reset_requested", meta: { delivered: sent.delivered } });

  // Only surface the link when email isn't actually configured (dev fallback).
  return sent.delivered ? { ok: true } : { ok: true, devLink: link };
}

const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function resetPassword(_prev: ResetState, formData: FormData): Promise<ResetState> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = await db.user.findFirst({
    where: { resetToken: parsed.data.token, resetTokenExpiry: { gt: new Date() } },
  });
  if (!user) return { error: "This reset link is invalid or has expired. Request a new one." };

  await db.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(parsed.data.password),
      resetToken: null,
      resetTokenExpiry: null,
    },
  });
  await audit({ userId: user.id, action: "password.reset_completed" });
  return { ok: true };
}
