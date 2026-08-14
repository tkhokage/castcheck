import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/constants";
import { DATA_TIERS } from "@/lib/constants";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-muted">
        Plain-language summary of what CASTCHECK collects, why, and what it never touches. This is a portfolio
        demo; treat it as a template you should have reviewed by counsel before any real launch.
      </p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-bold">What we collect</h2>
          <p className="mt-2 text-muted">
            Only what a professional acting profile needs: your name, a professional email and phone, location,
            headshot, resume, demo reel, credits, skills, training, and your career goals. We also keep the
            opportunities you save, apply to, import, and track, plus support tickets and reports you submit.
          </p>
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left">
              <thead className="bg-surface-2 text-xs uppercase text-muted">
                <tr><th className="p-3">Tier</th><th className="p-3">Examples</th><th className="p-3">How it&rsquo;s handled</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {DATA_TIERS.map((t) => (
                  <tr key={t.tier}><td className="p-3 font-medium">{t.tier}</td><td className="p-3 text-muted">{t.examples}</td><td className="p-3 text-muted">{t.handling}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold">What we never collect</h2>
          <p className="mt-2 text-muted">
            CASTCHECK does <strong>not</strong> collect your Social Security number, government ID, banking
            information, or any highly sensitive data — there are no fields for them anywhere in the product. If a
            casting call or agency asks you for these, we actively warn you.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold">How we use your data</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
            <li>To power discovery, career-fit scoring, and agency matching against your goals.</li>
            <li>To run verification and risk checks and to operate support and trust &amp; safety workflows.</li>
            <li>To send account emails (verification, password reset). We don&rsquo;t sell your data.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold">Storage &amp; security</h2>
          <p className="mt-2 text-muted">
            Passwords are stored only as bcrypt hashes. Sessions use signed, httpOnly cookies. Uploaded media
            (headshot, resume, reel — all &ldquo;public&rdquo; tier) is stored in object storage. Deleting your
            account cascades to your profile, saved items, applications, and imports. See our{" "}
            <Link href="/terms" className="text-primary hover:underline">Terms</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold">Your choices</h2>
          <p className="mt-2 text-muted">
            You can edit or remove profile data anytime, enable two-factor authentication, and contact us to
            request deletion. Sensitive-tier fields (like a home address) are optional and minimized.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold">Contact</h2>
          <p className="mt-2 text-muted">
            Questions about privacy? Email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">{CONTACT_EMAIL}</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
