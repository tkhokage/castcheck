import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { isStaff, can } from "@/lib/rbac";
import { ROLES } from "@/lib/constants";
import { Badge } from "@/components/ui";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isStaff(session.role)) redirect("/discover");

  const links: { href: string; label: string; show: boolean }[] = [
    { href: "/dashboard", label: "Overview", show: true },
    { href: "/dashboard/moderation", label: "Moderation", show: can(session.role, "moderation.view") },
    { href: "/dashboard/tickets", label: "Tickets", show: can(session.role, "ticket.work") },
    { href: "/dashboard/grc", label: "GRC", show: can(session.role, "grc.view") },
    { href: "/dashboard/users", label: "Users", show: can(session.role, "admin.manage") },
    { href: "/dashboard/audit", label: "Audit log", show: can(session.role, "admin.manage") },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight">Operations</h1>
        <Badge tone="primary">Signed in as {ROLES[session.role] ?? session.role}</Badge>
      </div>

      <nav className="mt-4 flex flex-wrap gap-1 border-b border-border">
        {links.filter((l) => l.show).map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-t-lg px-4 py-2 text-sm font-medium text-muted hover:bg-surface-2 hover:text-foreground"
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="py-6">{children}</div>
    </div>
  );
}
