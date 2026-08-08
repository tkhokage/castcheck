import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { db } from "@/lib/db";
import { Card, Badge } from "@/components/ui";

export const metadata = { title: "Audit log" };

export default async function AuditPage() {
  const session = await getSession();
  if (!can(session?.role, "admin.manage")) redirect("/dashboard");

  const logs = await db.auditLog.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <h2 className="mb-1 font-semibold">Audit log</h2>
      <p className="mb-4 text-sm text-muted">Security-relevant events. Passwords and secrets are never logged.</p>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-border bg-surface-2 text-left text-xs uppercase text-muted">
            <tr>
              <th className="p-3">Time</th><th className="p-3">Actor</th><th className="p-3">Action</th>
              <th className="p-3">Resource</th><th className="p-3">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {logs.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-muted">No audit events yet.</td></tr>
            ) : logs.map((l) => (
              <tr key={l.id}>
                <td className="p-3 whitespace-nowrap text-xs text-muted">{l.createdAt.toLocaleString("en-US")}</td>
                <td className="p-3 text-xs">{l.user?.name ?? "system"}</td>
                <td className="p-3"><span className="font-mono text-xs">{l.action}</span></td>
                <td className="p-3 text-xs text-muted">{l.resource ?? "—"}</td>
                <td className="p-3"><Badge tone={l.result === "success" ? "success" : "danger"}>{l.result}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
