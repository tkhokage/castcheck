"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { audit } from "@/lib/audit";

function csv(v: FormDataEntryValue | null): string[] {
  return String(v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
function many(formData: FormData, key: string): string[] {
  return formData.getAll(key).map(String).filter(Boolean);
}

export async function saveProfile(_prev: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: "Not signed in." };

  const data = {
    displayName: String(formData.get("displayName") || session.name),
    professionalEmail: String(formData.get("professionalEmail") || "") || null,
    professionalPhone: String(formData.get("professionalPhone") || "") || null,
    location: String(formData.get("location") || "") || null,
    bio: String(formData.get("bio") || "") || null,
    // headshotUrl / resumeUrl / demoReelUrl are owned by the Uploader (actions/upload.ts).
    experienceLevel: String(formData.get("experienceLevel") || "") || null,
    careerGoals: String(formData.get("careerGoals") || "") || null,
    compensationPref: String(formData.get("compensationPref") || "") || null,
    availability: String(formData.get("availability") || "") || null,
    representationGoals: String(formData.get("representationGoals") || "") || null,
    willingToTravel: formData.get("willingToTravel") === "on",
    skills: csv(formData.get("skills")),
    specialSkills: csv(formData.get("specialSkills")),
    training: csv(formData.get("training")),
    languages: csv(formData.get("languages")),
    preferredMediums: many(formData, "preferredMediums"),
    desiredMarkets: many(formData, "desiredMarkets"),
    roleTypes: many(formData, "roleTypes"),
    productionTypePref: many(formData, "productionTypePref"),
  };

  await db.actorProfile.upsert({
    where: { userId: session.id },
    create: { userId: session.id, ...data },
    update: data,
  });
  await audit({ userId: session.id, action: "profile.update", resource: `user:${session.id}` });
  revalidatePath("/profile");
  return { ok: true };
}
