export const dynamic = "force-dynamic";

export function GET() {
  const email = process.env.NEXT_PUBLIC_SECURITY_EMAIL;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.endsWith(".example")) {
    return new Response("Security contact is not yet configured.", { status: 503 });
  }
  const expires = new Date(Date.now() + 180 * 86400000).toISOString();
  return new Response(`Contact: mailto:${email}\nExpires: ${expires}\nPreferred-Languages: en\nPolicy: https://github.com/tkhokage/castcheck/blob/main/docs/security.md\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" },
  });
}
