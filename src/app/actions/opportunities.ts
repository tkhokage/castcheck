"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";

export async function toggleSave(opportunityId: string) {
  const session = await getSession();
  if (!session) return { error: "Sign in to save opportunities." };

  const existing = await db.savedOpportunity.findUnique({
    where: { userId_opportunityId: { userId: session.id, opportunityId } },
  });

  if (existing) {
    await db.savedOpportunity.delete({ where: { id: existing.id } });
  } else {
    await db.savedOpportunity.create({ data: { userId: session.id, opportunityId } });
  }
  revalidatePath("/discover");
  revalidatePath("/saved");
  revalidatePath(`/opportunities/${opportunityId}`);
  return { saved: !existing };
}

export async function startApplication(opportunityId: string, status = "planning") {
  const session = await getSession();
  if (!session) return { error: "Sign in to track applications." };

  const opp = await db.opportunity.findUnique({ where: { id: opportunityId } });
  await db.application.upsert({
    where: { userId_opportunityId: { userId: session.id, opportunityId } },
    create: { userId: session.id, opportunityId, status, deadline: opp?.deadline ?? null },
    update: { status },
  });
  await audit({ userId: session.id, action: "application.track", resource: `opportunity:${opportunityId}`, meta: { status } });
  revalidatePath("/tracker");
  revalidatePath(`/opportunities/${opportunityId}`);
  return { ok: true };
}

const updateSchema = z.object({
  id: z.string(),
  status: z.string().optional(),
  notes: z.string().optional(),
  followUpDate: z.string().optional(),
  auditionDate: z.string().optional(),
});

export async function updateApplication(_prev: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Not signed in." };

  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status") || undefined,
    notes: formData.get("notes") || undefined,
    followUpDate: formData.get("followUpDate") || undefined,
    auditionDate: formData.get("auditionDate") || undefined,
  });
  if (!parsed.success) return { error: "Invalid input." };

  const app = await db.application.findUnique({ where: { id: parsed.data.id } });
  if (!app || app.userId !== session.id) return { error: "Not found." };

  await db.application.update({
    where: { id: parsed.data.id },
    data: {
      status: parsed.data.status ?? app.status,
      notes: parsed.data.notes ?? app.notes,
      followUpDate: parsed.data.followUpDate ? new Date(parsed.data.followUpDate) : app.followUpDate,
      auditionDate: parsed.data.auditionDate ? new Date(parsed.data.auditionDate) : app.auditionDate,
    },
  });
  revalidatePath("/tracker");
  return { ok: true };
}

export async function removeApplication(id: string) {
  const session = await getSession();
  if (!session) return { error: "Not signed in." };
  const app = await db.application.findUnique({ where: { id } });
  if (!app || app.userId !== session.id) return { error: "Not found." };
  await db.application.delete({ where: { id } });
  revalidatePath("/tracker");
  return { ok: true };
}

const reportSchema = z.object({
  opportunityId: z.string(),
  reason: z.string().min(1),
  details: z.string().optional(),
});

export async function submitReport(_prev: unknown, formData: FormData) {
  const session = await getSession();
  const parsed = reportSchema.safeParse({
    opportunityId: formData.get("opportunityId"),
    reason: formData.get("reason"),
    details: formData.get("details") || undefined,
  });
  if (!parsed.success) return { error: "Choose a reason." };

  const limit = await rateLimit(`report:${session?.id ?? parsed.data.opportunityId}`, 10, 60 * 60_000);
  if (!limit.ok) return { error: `Too many reports. Try again in ${limit.retryAfterSec}s.` };

  await db.report.create({
    data: {
      opportunityId: parsed.data.opportunityId,
      userId: session?.id ?? null,
      reason: parsed.data.reason,
      details: parsed.data.details,
      status: "open",
    },
  });

  // A report becomes a trust & safety ticket.
  await db.ticket.create({
    data: {
      userId: session?.id ?? null,
      category: "Suspicious opportunities",
      priority: /scam|payment|impersonation|personal/i.test(parsed.data.reason) ? "high" : "medium",
      status: "open",
      subject: `Report: ${parsed.data.reason}`,
      description: parsed.data.details,
    },
  });

  await audit({ userId: session?.id, action: "report.submit", resource: `opportunity:${parsed.data.opportunityId}`, meta: { reason: parsed.data.reason } });
  revalidatePath(`/opportunities/${parsed.data.opportunityId}`);
  return { ok: true };
}
