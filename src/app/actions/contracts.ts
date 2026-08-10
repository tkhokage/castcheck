"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { analyzeContract } from "@/lib/contract";

const schema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  source: z.enum(["agency", "production", "other"]).optional(),
  text: z.string().trim().min(40, "Paste the full contract text (at least a few sentences)."),
});

export async function analyzeContractAction(_prev: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Sign in to analyze a contract." };

  const parsed = schema.safeParse({
    title: formData.get("title") || undefined,
    source: formData.get("source") || undefined,
    text: formData.get("text"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const report = analyzeContract(parsed.data.text);

  // Persist findings only — never the raw contract text (data minimization).
  const record = await db.contractAnalysis.create({
    data: {
      userId: session.id,
      title: parsed.data.title || "Untitled contract",
      source: parsed.data.source ?? "other",
      findings: report.findings as unknown as Prisma.InputJsonValue,
      flagCount: report.flags.length,
      cautionCount: report.cautions,
      commissionPct: report.commissionPct,
      summary: report.summary,
    },
  });

  await audit({ userId: session.id, action: "contract.analyze", resource: `contract:${record.id}`, meta: { flags: report.flags.length } });
  revalidatePath("/contracts");
  redirect(`/contracts/${record.id}`);
}

export async function deleteContract(id: string) {
  const session = await getSession();
  if (!session) return { error: "Not signed in." };
  const rec = await db.contractAnalysis.findUnique({ where: { id } });
  if (!rec || rec.userId !== session.id) return { error: "Not found." };
  await db.contractAnalysis.delete({ where: { id } });
  await audit({ userId: session.id, action: "contract.delete", resource: `contract:${id}` });
  revalidatePath("/contracts");
  return { ok: true };
}
