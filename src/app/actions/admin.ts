"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { audit } from "@/lib/audit";
import { ROLES } from "@/lib/constants";

export async function changeRole(userId: string, role: string) {
  const session = await getSession();
  if (!can(session?.role, "admin.manage")) return { error: "Not authorized." };
  if (!(role in ROLES)) return { error: "Invalid role." };
  if (userId === session!.id) return { error: "You cannot change your own role." };

  await db.user.update({ where: { id: userId }, data: { role } });
  await audit({ userId: session!.id, action: "role.change", resource: `user:${userId}`, meta: { role } });
  revalidatePath("/dashboard/users");
  return { ok: true };
}

export async function toggleActive(userId: string) {
  const session = await getSession();
  if (!can(session?.role, "admin.manage")) return { error: "Not authorized." };
  if (userId === session!.id) return { error: "You cannot deactivate yourself." };

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "Not found." };
  await db.user.update({ where: { id: userId }, data: { active: !user.active } });
  await audit({ userId: session!.id, action: user.active ? "user.deactivate" : "user.activate", resource: `user:${userId}` });
  revalidatePath("/dashboard/users");
  return { ok: true };
}
