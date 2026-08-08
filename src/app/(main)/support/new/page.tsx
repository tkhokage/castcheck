import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { TicketForm } from "./ticket-form";
import { Card } from "@/components/ui";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Open a ticket" };

export default async function NewTicketPage() {
  if (!(await getSession())) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/support" className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Support center
      </Link>
      <h1 className="text-3xl font-extrabold tracking-tight">Open a ticket</h1>
      <p className="mt-1 text-muted">Tell us what&rsquo;s going on. We&rsquo;ll categorize and prioritize it automatically.</p>
      <Card className="mt-6 p-6">
        <TicketForm />
      </Card>
    </div>
  );
}
