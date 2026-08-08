"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { saveUpload, type UploadKind } from "@/lib/upload";

const FIELD: Record<UploadKind, "headshotUrl" | "resumeUrl" | "demoReelUrl"> = {
  headshot: "headshotUrl",
  resume: "resumeUrl",
  reel: "demoReelUrl",
};

export async function uploadMedia(_prev: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Not signed in." };

  const kind = String(formData.get("kind")) as UploadKind;
  if (!["headshot", "resume", "reel"].includes(kind)) return { error: "Unknown upload type." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file received." };

  const res = await saveUpload(file, kind, session.id);
  if (!res.ok) return { error: res.error };

  await db.actorProfile.upsert({
    where: { userId: session.id },
    create: { userId: session.id, displayName: session.name, [FIELD[kind]]: res.url },
    update: { [FIELD[kind]]: res.url },
  });
  await audit({ userId: session.id, action: "profile.upload", resource: `user:${session.id}`, meta: { kind } });
  revalidatePath("/profile");
  return { ok: true, url: res.url };
}
