"use server";

import { createHash, randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { screenOpportunity } from "@/lib/screen";
import { riskLevel } from "@/lib/risk";
import { jwtVerify } from "jose";
import { rateLimit } from "@/lib/rate-limit";
import { publicUrl } from "@/lib/public-web";
import type { Prisma } from "@prisma/client";
import { CHECK_KEYS } from "@/lib/constants";

const schema = z.object({
  title: z.string().trim().min(3, "Add the role/title from the listing.").max(300),
  platform: z.string().optional(),
  url: z.string().trim().url().max(2000).optional(),
  type: z.string().optional(),
  location: z.string().optional(),
  compensation: z.string().optional(),
  role: z.string().optional(),
  description: z.string().trim().max(15000).optional(),
});

// Imports a casting call the actor found elsewhere. It becomes a PRIVATE listing
// (status "imported", owned by the importer) that runs through the same screening
// + verification the platform uses, and is added to their tracker.
export async function importListing(_prev: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Sign in to import a listing." };

  const parsed = schema.safeParse({
    title: formData.get("title"),
    platform: formData.get("platform") || undefined,
    url: formData.get("url") || undefined,
    type: formData.get("type") || undefined,
    location: formData.get("location") || undefined,
    compensation: formData.get("compensation") || undefined,
    role: formData.get("role") || undefined,
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  if (!(await rateLimit(`import:${session.id}`, 10, 60_000)).ok) return { error: "Please wait a minute before importing more calls." };
  if (d.url) {
    try { d.url = publicUrl(d.url).toString(); }
    catch { return { error: "Use a public HTTP(S) source URL without credentials or custom ports." }; }
  }
  let sourceEvidence: Prisma.InputJsonValue | undefined;
  let sourceDeadline: Date | undefined;
  const receipt = formData.get("sourceReceipt");
  if (typeof receipt === "string" && receipt) {
    try {
      const key = new TextEncoder().encode(process.env.AUTH_SECRET || "insecure-dev-secret");
      const { payload } = await jwtVerify(receipt, key, { algorithms: ["HS256"], audience: "castcheck-source-import", subject: session.id });
      const preview = z.object({ sourceUrl: z.string(), finalUrl: z.string(), fetchedAt: z.string().datetime(), contentHash: z.string().length(64), extraction: z.enum(["structured", "page_metadata"]), deadline: z.string().datetime().nullable() }).parse(payload.preview);
      if (preview.sourceUrl !== d.url) return { error: "The URL changed. Read the new source first, or reset to a manual import." };
      sourceEvidence = preview;
      sourceDeadline = preview.deadline ? new Date(preview.deadline) : undefined;
    } catch { return { error: "The source preview expired or is invalid. Read the source again before saving." }; }
  }
  if (d.url) {
    const existing = await db.opportunity.findFirst({ where: { createdById: session.id, status: "imported", sourceUrl: d.url }, select: { id: true } });
    if (existing) redirect(`/opportunities/${existing.id}`);
  }

  const screen = screenOpportunity({
    description: d.description,
    submissionMethod: d.url,
    productionCompany: null,
    compensation: d.compensation,
  });

  const importKey = d.url ? createHash("sha256").update(`${session.id}\n${d.url}`).digest("hex") : randomUUID();
  const opp = await db.$transaction(async tx => {
  const created = await tx.opportunity.upsert({
    where: { importKey },
    update: {},
    create: {
      importKey,
      title: d.title,
      role: d.role || "See listing",
      type: d.type || "other",
      roleType: "unknown",
      location: d.location || "Unknown",
      compensation: d.compensation || "unknown",
      description: d.description || null,
      sourceUrl: d.url || null,
      sourceEvidence,
      deadline: sourceDeadline,
      source: d.platform ? `Imported from ${d.platform}` : "Imported by actor",
      status: "imported",
      createdById: session.id,
      isDemo: false,
      trustLevel: 1,
      riskLikelihood: screen.likelihood,
      riskImpact: screen.impact,
      riskLevel: riskLevel(screen.likelihood * screen.impact),
      verificationState: screen.suggestedState,
      lastVerifiedAt: null,
      checks: {
        create: CHECK_KEYS.filter((c) => c.key !== "personal_info").map((c) => ({
          key: c.key,
          label: c.label,
          status: "pending",
          note: "Imported listing — verify the source yourself.",
        })),
      },
      riskIndicators: screen.indicators.length ? { create: screen.indicators } : undefined,
    },
  });

  // Add straight to the tracker so it's not lost.
  await tx.application.upsert({
    where: { userId_opportunityId: { userId: session.id, opportunityId: created.id } },
    create: { userId: session.id, opportunityId: created.id, deadline: sourceDeadline, status: "planning" },
    update: {},
  });

  return created;
  });

  await audit({ userId: session.id, action: "opportunity.import", resource: `opportunity:${opp.id}`, meta: { platform: d.platform } });
  revalidatePath("/tracker");
  redirect(`/opportunities/${opp.id}`);
}
