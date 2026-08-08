import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { PostForm } from "./post-form";
import { Card } from "@/components/ui";
import { ShieldCheck } from "lucide-react";

export const metadata = { title: "Post an opportunity" };

export default async function NewOpportunityPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!can(session.role, "opportunity.create")) redirect("/discover");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Post an opportunity</h1>
      <p className="mt-1 text-muted">Reach emerging actors. Every listing passes through verification.</p>

      <Card className="mt-6 border-primary/20 bg-primary-soft/40 p-4">
        <div className="flex items-start gap-3 text-sm">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p>
            On submit, we automatically screen for common risk patterns (upfront fees, guarantees, off-platform
            contact, sensitive-data requests). Clean listings enter the review queue; risky ones are flagged for a
            moderator. Nothing is labeled <strong>Verified</strong> until a moderator completes the checks.
          </p>
        </div>
      </Card>

      <div className="mt-8">
        <PostForm />
      </div>
    </div>
  );
}
