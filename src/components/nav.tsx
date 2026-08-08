import Link from "next/link";
import { getSession } from "@/lib/auth";
import { isStaff, can } from "@/lib/rbac";
import { ROLES } from "@/lib/constants";
import { ThemeToggle } from "./theme-toggle";
import { LinkButton } from "./ui";
import { logout } from "@/app/actions/auth";
import { ShieldCheck } from "lucide-react";

const NAV_LINKS = [
  { href: "/discover", label: "Discover" },
  { href: "/agencies", label: "Agencies" },
  { href: "/tracker", label: "Tracker" },
  { href: "/knowledge", label: "Help" },
];

export async function Nav() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-fg">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="text-lg">
            CAST<span className="text-primary">CHECK</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          {session && can(session.role, "opportunity.create") && (
            <Link
              href="/opportunities/new"
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              Post
            </Link>
          )}
          {session && isStaff(session.role) && (
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              Operations
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {session ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="hidden rounded-lg px-3 py-2 text-right sm:block"
              >
                <span className="block text-sm font-semibold leading-tight">{session.name}</span>
                <span className="block text-xs text-muted">{ROLES[session.role] ?? session.role}</span>
              </Link>
              <form action={logout}>
                <button className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:text-foreground cursor-pointer">
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:text-foreground">
                Sign in
              </Link>
              <LinkButton href="/register">Get started</LinkButton>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
