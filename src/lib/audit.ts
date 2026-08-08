import "server-only";
import { db } from "./db";

// Audit logging (spec §23). Never logs passwords or secrets.
export async function audit(params: {
  userId?: string | null;
  action: string;
  resource?: string;
  result?: string;
  meta?: Record<string, unknown>;
}): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        resource: params.resource,
        result: params.result ?? "success",
        meta: params.meta ? (params.meta as object) : undefined,
      },
    });
  } catch {
    // Audit logging must never break the primary flow.
  }
}
