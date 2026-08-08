import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ProfileForm } from "./profile-form";
import { Uploader } from "./uploader";
import { DATA_TIERS } from "@/lib/constants";
import { Card } from "@/components/ui";
import { ShieldCheck } from "lucide-react";

export const metadata = { title: "Your profile" };

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Your acting profile</h1>
      <p className="mt-1 text-muted">Keep this current — it powers career-fit scoring and agency matching.</p>

      <Card className="mt-6 border-primary/20 bg-primary-soft/40 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="text-sm">
            <p className="font-semibold">Your data, minimized by design</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {DATA_TIERS.map((t) => (
                <div key={t.tier} className="flex justify-between gap-2 border-b border-border/50 pb-1">
                  <span className="font-medium">{t.tier}</span>
                  <span className="text-right text-muted">{t.handling}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-8">
        <h2 className="mb-3 font-semibold">Materials</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Uploader kind="headshot" currentUrl={user.profile?.headshotUrl} />
          <Uploader kind="resume" currentUrl={user.profile?.resumeUrl} />
          <Uploader kind="reel" currentUrl={user.profile?.demoReelUrl} />
        </div>
        <p className="mt-2 text-xs text-muted">
          Only public-tier materials (headshot, resume, demo reel) are uploaded. Files are validated by type
          and size.
        </p>
      </div>

      <div className="mt-8">
        <ProfileForm profile={user.profile as never} email={user.email} />
      </div>
    </div>
  );
}
