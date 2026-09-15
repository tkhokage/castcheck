"use server";

import { z } from "zod";
import { getSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { fetchPublicPage, publicUrl } from "@/lib/public-web";
import { extractListing } from "@/lib/listing-extraction";
import { SignJWT } from "jose";

export async function previewListingSource(_prev: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Sign in to read a source page." };
  const limit = await rateLimit(`source-preview:${session.id}`, 5, 60_000);
  if (!limit.ok) return { error: "Please wait a minute before reading another source." };
  const parsed = z.string().url().max(2000).safeParse(formData.get("sourceUrl"));
  if (!parsed.success) return { error: "Enter the full https:// link to a public listing." };
  try {
    const sourceUrl = publicUrl(parsed.data).toString();
    const page = await fetchPublicPage(sourceUrl);
    if (page.status < 200 || page.status >= 300) return { error: `The source returned HTTP ${page.status}. You can paste the listing manually.` };
    const preview = extractListing(page.text, sourceUrl, page.finalUrl);
    if (!preview.title) return { error: "No usable title was found. Paste the listing manually." };
    const key = new TextEncoder().encode(process.env.AUTH_SECRET || "insecure-dev-secret");
    const receipt = await new SignJWT({ preview }).setSubject(session.id).setAudience("castcheck-source-import").setIssuedAt().setExpirationTime("30m").setProtectedHeader({ alg: "HS256" }).sign(key);
    return { preview, receipt };
  } catch {
    return { error: "This source could not be read. It may require sign-in, block automated access, or exceed the supported page limits. Paste the listing manually." };
  }
}
