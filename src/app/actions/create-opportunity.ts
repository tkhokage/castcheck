"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { audit } from "@/lib/audit";
import { screenOpportunity } from "@/lib/screen";
import { riskLevel } from "@/lib/risk";
import { CHECK_KEYS } from "@/lib/constants";

const schema = z.object({
  title: z.string().min(4, "Add a clear title"),
  role: z.string().min(2, "Describe the role"),
  type: z.string().min(1),
  roleType: z.string().min(1),
  location: z.string().min(1),
  compensation: z.string().min(1),
  production: z.string().optional(),
  productionCompany: z.string().optional(),
  castingEntity: z.string().optional(),
  productionType: z.string().optional(),
  experienceLevel: z.string().optional(),
  payDetails: z.string().optional(),
  unionStatus: z.string().optional(),
  description: z.string().optional(),
  submissionMethod: z.string().optional(),
  contactEmail: z.string().optional(),
  deadline: z.string().optional(),
});

export async function createOpportunity(_prev: unknown, formData: FormData) {
  const session = await getSession();
  if (!can(session?.role, "opportunity.create")) return { error: "Not authorized." };

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;

  const screen = screenOpportunity(d);
  // A trusted verified poster (agency/casting) starts corroborated; screening can downgrade.
  const trustLevel = screen.suggestedStatus === "flagged" ? 1 : 3;

  const opp = await db.opportunity.create({
    data: {
      title: d.title,
      role: d.role,
      type: d.type,
      roleType: d.roleType,
      location: d.location,
      compensation: d.compensation,
      production: d.production || null,
      productionCompany: d.productionCompany || null,
      castingEntity: d.castingEntity || session!.name,
      productionType: d.productionType || null,
      experienceLevel: d.experienceLevel || null,
      payDetails: d.payDetails || null,
      unionStatus: d.unionStatus || null,
      description: d.description || null,
      submissionMethod: d.submissionMethod || null,
      contactEmail: d.contactEmail || null,
      deadline: d.deadline ? new Date(d.deadline) : null,
      source: `${session!.name} (poster)`,
      trustLevel,
      riskLikelihood: screen.likelihood,
      riskImpact: screen.impact,
      riskLevel: riskLevel(screen.likelihood * screen.impact),
      verificationState: screen.suggestedState,
      status: screen.suggestedStatus,
      lastVerifiedAt: new Date(),
      isDemo: false,
      createdById: session!.id,
      checks: {
        create: CHECK_KEYS.filter((c) => c.key !== "personal_info").map((c) => ({
          key: c.key,
          label: c.label,
          status: "pending",
          note: "Awaiting moderator verification.",
        })),
      },
      riskIndicators: screen.indicators.length ? { create: screen.indicators } : undefined,
    },
  });

  await audit({ userId: session!.id, action: "opportunity.create", resource: `opportunity:${opp.id}`, meta: { screenedState: screen.suggestedState } });
  redirect(`/opportunities/${opp.id}`);
}
