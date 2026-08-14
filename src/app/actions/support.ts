"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { audit } from "@/lib/audit";
import { triageTicket } from "@/lib/ai";

const createSchema = z.object({
  subject: z.string().min(3, "Add a short subject"),
  category: z.string().min(1),
  description: z.string().min(5, "Describe the problem"),
});

export async function createTicket(_prev: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Sign in to open a ticket." };

  const parsed = createSchema.safeParse({
    subject: formData.get("subject"),
    category: formData.get("category"),
    description: formData.get("description"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const triage = await triageTicket(parsed.data.subject, parsed.data.description);
  const ticket = await db.ticket.create({
    data: {
      userId: session.id,
      subject: parsed.data.subject,
      category: parsed.data.category || triage.data.category,
      description: parsed.data.description,
      priority: triage.data.priority,
      status: "open",
      internalNotes: `AI triage (${triage.source}, ${triage.confidence} confidence): ${triage.data.reason}`,
    },
  });
  await audit({ userId: session.id, action: "ticket.create", resource: `ticket:${ticket.id}` });
  redirect(`/support/${ticket.id}?created=1`);
}

const updateSchema = z.object({
  id: z.string(),
  status: z.string().optional(),
  priority: z.string().optional(),
  resolution: z.string().optional(),
  internalNotes: z.string().optional(),
});

export async function updateTicket(_prev: unknown, formData: FormData) {
  const session = await getSession();
  if (!can(session?.role, "ticket.work")) return { error: "Not authorized." };

  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status") || undefined,
    priority: formData.get("priority") || undefined,
    resolution: formData.get("resolution") || undefined,
    internalNotes: formData.get("internalNotes") || undefined,
  });
  if (!parsed.success) return { error: "Invalid input." };

  const t = await db.ticket.findUnique({ where: { id: parsed.data.id } });
  if (!t) return { error: "Not found." };

  const closing = parsed.data.status === "closed" || parsed.data.status === "resolved";
  await db.ticket.update({
    where: { id: parsed.data.id },
    data: {
      status: parsed.data.status ?? t.status,
      priority: parsed.data.priority ?? t.priority,
      resolution: parsed.data.resolution ?? t.resolution,
      internalNotes: parsed.data.internalNotes ?? t.internalNotes,
      assignedId: t.assignedId ?? session!.id,
      closedAt: closing && !t.closedAt ? new Date() : t.closedAt,
    },
  });
  await audit({ userId: session!.id, action: "ticket.update", resource: `ticket:${parsed.data.id}`, meta: { status: parsed.data.status } });
  revalidatePath(`/support/${parsed.data.id}`);
  revalidatePath("/dashboard/tickets");
  return { ok: true };
}
