import { Nav } from "@/components/nav";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/constants";

export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Nav />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <p className="font-bold">
              CAST<span className="text-primary">CHECK</span>
            </p>
            <p className="mt-2 text-sm text-muted">Find it. Verify it. Pursue it.</p>
            <p className="mt-4 text-xs text-muted-2">
              Demo data. Not affiliated with any casting service. CASTCHECK provides evidence-based guidance,
              not legal advice.
            </p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="mt-3 inline-block text-xs font-medium text-primary hover:underline">
              {CONTACT_EMAIL}
            </a>
          </div>
          <FooterCol title="Discover" links={[["/discover", "Opportunities"], ["/agencies", "Agencies"], ["/tracker", "Application tracker"]]} />
          <FooterCol title="Trust & safety" links={[["/knowledge/how-verification-works", "How verification works"], ["/knowledge/information-to-avoid-sharing", "What not to share"], ["/knowledge/how-to-evaluate-a-talent-agency", "Evaluate an agency"]]} />
          <FooterCol title="Support" links={[["/support", "Support center"], ["/knowledge", "Knowledge base"], ["/support/new", "Open a ticket"]]} />
        </div>
        <div className="flex flex-col items-center gap-2 border-t border-border py-4 text-center text-xs text-muted-2">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms of Use</Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-foreground">Contact</a>
            <a href="/.well-known/security.txt" className="hover:text-foreground">Security</a>
          </div>
          <p>© {new Date().getFullYear()} CASTCHECK — portfolio project demonstrating product, trust & safety, IT support, security, and GRC.</p>
        </div>
      </footer>
    </>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <ul className="mt-2 space-y-1.5">
        {links.map(([href, label]) => (
          <li key={href}>
            <Link href={href} className="text-sm text-muted hover:text-foreground">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
