"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { screenOpportunity } from "@/lib/screen";
import { riskLevel } from "@/lib/risk";
import { CHECK_KEYS } from "@/lib/constants";

const schema = z.object({
  title: z.string().trim().min(3, "Add the role/title from the listing."),
  platform: z.string().optional(),
  url: z.string().trim().optional(),
  type: z.string().optional(),
  location: z.string().optional(),
  compensation: z.string().optional(),
  role: z.string().optional(),
  description: z.string().trim().optional(),
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

  const screen = screenOpportunity({
    description: d.description,
    submissionMethod: d.url,
    productionCompany: null,
    compensation: d.compensation,
  });

  const opp = await db.opportunity.create({
    data: {
      title: d.title,
      role: d.role || "See listing",
      type: d.type || "other",
      roleType: "featured",
      location: d.location || "Unknown",
      compensation: d.compensation || "unknown",
      description: d.description || null,
      sourceUrl: d.url || null,
      source: d.platform ? `Imported from ${d.platform}` : "Imported by actor",
      status: "imported",
      createdById: session.id,
      isDemo: false,
      trustLevel: 1,
      riskLikelihood: screen.likelihood,
      riskImpact: screen.impact,
      riskLevel: riskLevel(screen.likelihood * screen.impact),
      verificationState: screen.suggestedState,
      lastVerifiedAt: new Date(),
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
  await db.application.upsert({
    where: { userId_opportunityId: { userId: session.id, opportunityId: opp.id } },
    create: { userId: session.id, opportunityId: opp.id, status: "planning" },
    update: {},
  });

  await audit({ userId: session.id, action: "opportunity.import", resource: `opportunity:${opp.id}`, meta: { platform: d.platform } });
  revalidatePath("/tracker");
  redirect(`/opportunities/${opp.id}`);
}
