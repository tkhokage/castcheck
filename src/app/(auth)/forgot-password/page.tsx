import Link from "next/link";
import { ForgotForm } from "./forgot-form";
import { Card } from "@/components/ui";
import { ShieldCheck } from "lucide-react";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-bold">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-fg">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <span className="text-xl">CAST<span className="text-primary">CHECK</span></span>
      </Link>
      <Card className="p-6">
        <h1 className="text-xl font-bold">Forgot your password?</h1>
        <p className="mt-1 mb-6 text-sm text-muted">Enter your email and we&rsquo;ll send you a link to reset it.</p>
        <ForgotForm />
      </Card>
    </div>
  );
}
