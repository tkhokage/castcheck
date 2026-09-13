import { isStaff } from "./rbac";

export function canReadOpportunity(
  opportunity: { status: string; createdById: string | null } | null,
  user: { id: string; role: string } | null,
): boolean {
  if (!opportunity) return false;
  return ["published", "flagged"].includes(opportunity.status) ||
    !!user && (opportunity.createdById === user.id || isStaff(user.role));
}
