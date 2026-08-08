import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { db } from "@/lib/db";
import { Card } from "@/components/ui";
import { UserRow, type UserRowData } from "./user-row";

export const metadata = { title: "User management" };

export default async function UsersPage() {
  const session = await getSession();
  if (!can(session?.role, "admin.manage")) redirect("/dashboard");

  const users = await db.user.findMany({ orderBy: { createdAt: "asc" } });
  const rows: UserRowData[] = users.map((u) => ({
    id: u.id, name: u.name, email: u.email, role: u.role, active: u.active,
    createdAt: u.createdAt.toISOString(), isSelf: u.id === session!.id,
  }));

  return (
    <div>
      <h2 className="mb-1 font-semibold">User management</h2>
      <p className="mb-4 text-sm text-muted">Assign roles and manage access. Role and status changes are audit-logged (least privilege).</p>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-border bg-surface-2 text-left text-xs uppercase text-muted">
            <tr>
              <th className="p-3">User</th><th className="p-3">Role</th><th className="p-3">Joined</th>
              <th className="p-3">Status</th><th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((u) => <UserRow key={u.id} user={u} />)}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
