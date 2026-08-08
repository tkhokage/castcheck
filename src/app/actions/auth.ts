"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword, createSession, destroySession } from "@/lib/auth";
import { audit } from "@/lib/audit";

const registerSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["actor", "casting", "agency"]).default("actor"),
});

export type AuthState = { error?: string } | undefined;

export async function register(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") || "actor",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const { name, email, password, role } = parsed.data;

  const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return { error: "An account with that email already exists." };

  const user = await db.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash: await hashPassword(password),
      role,
      profile:
        role === "actor"
          ? { create: { displayName: name, experienceLevel: "emerging" } }
          : undefined,
    },
  });

  await audit({ userId: user.id, action: "account.create", resource: `user:${user.id}` });
  await createSession({ id: user.id, email: user.email, name: user.name, role: user.role as never });
  redirect(role === "actor" ? "/profile" : "/dashboard");
}

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || !user.active || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    await audit({ userId: user?.id, action: "auth.login", result: "failure" });
    return { error: "Invalid email or password." };
  }

  await audit({ userId: user.id, action: "auth.login" });
  await createSession({ id: user.id, email: user.email, name: user.name, role: user.role as never });
  redirect("/discover");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
