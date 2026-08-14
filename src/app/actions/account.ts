"use server";

import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import QRCode from "qrcode";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { generateSecret, otpauthUri, verifyTotp } from "@/lib/totp";
import { generateRecoveryCodes, hashRecoveryCodes, consumeRecoveryCode } from "@/lib/recovery";
import { sendVerification, baseUrl } from "@/lib/email";
import { asList } from "@/lib/utils";

/** Create (or reset) a pending MFA secret and return enrollment material. */
export async function beginMfa(): Promise<
  { secret: string; qr: string; uri: string } | { error: string }
> {
  const session = await getSession();
  if (!session) return { error: "Not signed in." };

  const secret = generateSecret();
  await db.user.update({ where: { id: session.id }, data: { mfaSecret: secret, mfaEnabled: false } });

  const uri = otpauthUri(secret, session.email);
  const qr = await QRCode.toDataURL(uri, { margin: 1, width: 200 });
  return { secret, qr, uri };
}

export async function confirmMfa(_prev: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Not signed in." };

  const code = String(formData.get("code") || "");
  const user = await db.user.findUnique({ where: { id: session.id } });
  if (!user?.mfaSecret) return { error: "Start enrollment first." };
  if (!verifyTotp(user.mfaSecret, code)) return { error: "That code didn't match. Try again." };

  // Generate one-time recovery codes; store only their hashes, show plaintext once.
  const recoveryCodes = generateRecoveryCodes(8);
  const hashes = await hashRecoveryCodes(recoveryCodes);

  await db.user.update({
    where: { id: session.id },
    data: { mfaEnabled: true, mfaRecoveryCodes: hashes as unknown as Prisma.InputJsonValue },
  });
  await audit({ userId: session.id, action: "mfa.enable", resource: `user:${session.id}` });
  revalidatePath("/settings");
  return { ok: true, recoveryCodes };
}

export async function disableMfa(_prev: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Not signed in." };

  const code = String(formData.get("code") || "");
  const user = await db.user.findUnique({ where: { id: session.id } });
  if (!user?.mfaEnabled || !user.mfaSecret) return { error: "MFA is not enabled." };

  // Accept either the authenticator code or a single-use recovery code.
  let allowed = verifyTotp(user.mfaSecret, code);
  if (!allowed) {
    const hashes = asList<string>(user.mfaRecoveryCodes);
    const res = await consumeRecoveryCode(hashes, code);
    allowed = res.matched;
  }
  if (!allowed) return { error: "Enter a valid authenticator code or recovery code to disable MFA." };

  await db.user.update({
    where: { id: session.id },
    data: { mfaEnabled: false, mfaSecret: null, mfaRecoveryCodes: Prisma.DbNull },
  });
  await audit({ userId: session.id, action: "mfa.disable", resource: `user:${session.id}` });
  revalidatePath("/settings");
  return { ok: true };
}

/** Regenerate the verification token and send the link by email (dev fallback surfaces it). */
export async function resendVerification(): Promise<{ delivered: boolean; link?: string } | { error: string }> {
  const session = await getSession();
  if (!session) return { error: "Not signed in." };

  const token = crypto.randomBytes(24).toString("hex");
  await db.user.update({ where: { id: session.id }, data: { verifyToken: token } });

  const link = `${await baseUrl()}/verify?token=${token}`;
  const sent = await sendVerification(session.email, link);
  await audit({ userId: session.id, action: "email.verify_requested", meta: { delivered: sent.delivered } });

  // Only surface the raw link when email isn't configured (dev fallback).
  return sent.delivered ? { delivered: true } : { delivered: false, link: `/verify?token=${token}` };
}
