import type { Role } from "./constants";

// Capability-based access control. Each capability maps to the roles allowed.
export const CAPABILITIES = {
  "opportunity.create": ["casting", "agency", "moderator", "admin"],
  "opportunity.moderate": ["moderator", "admin"],
  "agency.manage": ["agency", "moderator", "admin"],
  "ticket.work": ["support", "admin"],
  "grc.view": ["grc", "admin"],
  "moderation.view": ["moderator", "admin"],
  "admin.manage": ["admin"],
  "dashboard.ops": ["moderator", "support", "grc", "admin"],
} as const;

export type Capability = keyof typeof CAPABILITIES;

export function can(role: Role | undefined | null, cap: Capability): boolean {
  if (!role) return false;
  return (CAPABILITIES[cap] as readonly string[]).includes(role);
}

// Navigation visibility helper.
export function isStaff(role: Role | undefined | null): boolean {
  return !!role && ["moderator", "support", "grc", "admin"].includes(role);
}
