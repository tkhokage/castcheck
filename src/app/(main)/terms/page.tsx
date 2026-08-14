import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata = { title: "Terms of Use" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Terms of Use</h1>
      <p className="mt-2 text-muted">
        Plain-language terms for using CASTCHECK. This is a portfolio demo; have counsel review before any real
        launch.
      </p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-bold">What CASTCHECK is — and isn&rsquo;t</h2>
          <p className="mt-2 text-muted">
            CASTCHECK is a tool that helps you find, verify, evaluate, and track casting opportunities and talent
            agencies. It is <strong>not</strong> a talent agent, casting director, employer, or law firm. It does
            not represent you, guarantee work or representation, or make hiring decisions.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold">Verification is evidence-based, not a guarantee</h2>
          <p className="mt-2 text-muted">
            Our verification states, trust levels, and risk scores reflect the evidence available at a point in
            time. A &ldquo;Verified&rdquo; label is not a promise that an opportunity or agency is legitimate, and
            the absence of warnings is not proof of safety. Always verify organizations independently before
            sending money or personal information — we tell you exactly how on each listing.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold">Contract analysis is education, not legal advice</h2>
          <p className="mt-2 text-muted">
            The contract tool explains clauses to help you understand what you&rsquo;re reading. It is not legal
            advice. For anything with real consequences, consult a qualified entertainment attorney.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold">Your responsibilities</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
            <li>Provide accurate information and keep your account secure.</li>
            <li>Don&rsquo;t post fraudulent, misleading, or scam listings, or impersonate others.</li>
            <li>Don&rsquo;t misuse the platform or attempt to access other users&rsquo; data.</li>
            <li>Report suspicious opportunities so we can review them.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold">Third-party sites</h2>
          <p className="mt-2 text-muted">
            CASTCHECK links out to external casting sites (Actors Access, Casting Networks, Backstage, IMDbPro).
            We don&rsquo;t control those sites; their terms and privacy practices are their own. We never store
            your logins for them.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold">Contact</h2>
          <p className="mt-2 text-muted">
            Questions? Email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">{CONTACT_EMAIL}</a>. See
            also our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
