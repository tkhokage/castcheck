"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { audit } from "@/lib/audit";

export async function moderateOpportunity(opportunityId: string, decision: "publish" | "flag" | "reject") {
  const session = await getSession();
  if (!can(session?.role, "opportunity.moderate")) return { error: "Not authorized." };

  const map = {
    publish: { status: "published", verificationState: "partial" },
    flag: { status: "flagged", verificationState: "flagged" },
    reject: { status: "rejected", verificationState: "rejected" },
  } as const;

  await db.opportunity.update({
    where: { id: opportunityId },
    data: { ...map[decision], lastVerifiedAt: new Date() },
  });
  await audit({ userId: session!.id, action: `opportunity.${decision}`, resource: `opportunity:${opportunityId}` });
  revalidatePath("/dashboard/moderation");
  revalidatePath(`/opportunities/${opportunityId}`);
  return { ok: true };
}

export async function resolveReport(reportId: string, status: "resolved" | "dismissed") {
  const session = await getSession();
  if (!can(session?.role, "moderation.view")) return { error: "Not authorized." };

  await db.report.update({ where: { id: reportId }, data: { status } });
  await audit({ userId: session!.id, action: `report.${status}`, resource: `report:${reportId}` });
  revalidatePath("/dashboard/moderation");
  return { ok: true };
}
