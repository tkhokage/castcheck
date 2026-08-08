"use server";

import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { generateSecret, otpauthUri, verifyTotp } from "@/lib/totp";

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

  await db.user.update({ where: { id: session.id }, data: { mfaEnabled: true } });
  await audit({ userId: session.id, action: "mfa.enable", resource: `user:${session.id}` });
  revalidatePath("/settings");
  return { ok: true };
}

export async function disableMfa(_prev: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Not signed in." };

  const code = String(formData.get("code") || "");
  const user = await db.user.findUnique({ where: { id: session.id } });
  if (!user?.mfaEnabled || !user.mfaSecret) return { error: "MFA is not enabled." };
  if (!verifyTotp(user.mfaSecret, code)) return { error: "Enter a valid code to disable MFA." };

  await db.user.update({ where: { id: session.id }, data: { mfaEnabled: false, mfaSecret: null } });
  await audit({ userId: session.id, action: "mfa.disable", resource: `user:${session.id}` });
  revalidatePath("/settings");
  return { ok: true };
}

/** Regenerate the verification token and return the (dev) verification link. */
export async function resendVerification(): Promise<{ link: string } | { error: string }> {
  const session = await getSession();
  if (!session) return { error: "Not signed in." };

  const token = crypto.randomBytes(24).toString("hex");
  await db.user.update({ where: { id: session.id }, data: { verifyToken: token } });
  await audit({ userId: session.id, action: "email.verify_requested", resource: `user:${session.id}` });
  // No email provider in this build — surface the link directly for the demo.
  return { link: `/verify?token=${token}` };
}
