import "server-only";
import { headers } from "next/headers";

// Transactional email via Resend (https://resend.com). Behind EMAIL_PROVIDER_API_KEY.
// Mirrors src/lib/ai.ts: when the key is absent, it degrades gracefully — logs the
// message and returns { delivered: false } so callers can surface the link in a
// dev-only banner instead of silently failing.

export function emailEnabled(): boolean {
  return !!process.env.EMAIL_PROVIDER_API_KEY;
}

const FROM = process.env.EMAIL_FROM || "CASTCHECK <onboarding@resend.dev>";

export interface SendResult {
  delivered: boolean;
  error?: string;
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendResult> {
  const key = process.env.EMAIL_PROVIDER_API_KEY;
  if (!key) {
    console.log(`[email:fallback] To: ${params.to}\nSubject: ${params.subject}\n${params.text}\n`);
    return { delivered: false };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: params.to, subject: params.subject, html: params.html, text: params.text }),
    });
    if (!res.ok) {
      console.error("[email] provider rejected send", res.status, await res.text());
      return { delivered: false, error: `provider ${res.status}` };
    }
    return { delivered: true };
  } catch (e) {
    console.error("[email] send threw", e);
    return { delivered: false, error: "exception" };
  }
}

/** Absolute base URL for links in emails (from the incoming request, or APP_URL). */
export async function baseUrl(): Promise<string> {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "http";
    if (host) return `${proto}://${host}`;
  } catch {
    /* no request context */
  }
  return "http://localhost:3100";
}

function shell(title: string, body: string, cta?: { label: string; url: string }): string {
  return `<!doctype html><html><body style="font-family:system-ui,sans-serif;background:#f7f8fb;padding:24px">
    <div style="max-width:480px;margin:0 auto;background:#fff;border:1px solid #e2e6ef;border-radius:12px;padding:24px">
      <p style="font-weight:800;letter-spacing:.02em">CAST<span style="color:#3b4ee0">CHECK</span></p>
      <h1 style="font-size:18px;margin:12px 0">${title}</h1>
      <p style="color:#5b6478;font-size:14px;line-height:1.5">${body}</p>
      ${cta ? `<p style="margin:20px 0"><a href="${cta.url}" style="background:#3b4ee0;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600;font-size:14px">${cta.label}</a></p><p style="color:#8a92a6;font-size:12px;word-break:break-all">Or paste this link: ${cta.url}</p>` : ""}
      <p style="color:#8a92a6;font-size:12px;margin-top:24px">If you didn't request this, you can ignore this email.</p>
    </div></body></html>`;
}

export async function sendPasswordReset(to: string, link: string): Promise<SendResult> {
  return sendEmail({
    to,
    subject: "Reset your CASTCHECK password",
    text: `Reset your CASTCHECK password using this link (valid for 1 hour):\n${link}\n\nIf you didn't request this, ignore this email.`,
    html: shell("Reset your password", "Use the button below to choose a new password. This link is valid for 1 hour.", { label: "Reset password", url: link }),
  });
}

export async function sendVerification(to: string, link: string): Promise<SendResult> {
  return sendEmail({
    to,
    subject: "Verify your CASTCHECK email",
    text: `Verify your CASTCHECK email address:\n${link}`,
    html: shell("Verify your email", "Confirm this is your email address to secure your account.", { label: "Verify email", url: link }),
  });
}
