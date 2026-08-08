import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui";
import { ROLES } from "@/lib/constants";
import { MfaPanel } from "./mfa-panel";
import { VerifyPanel } from "./verify-panel";

export const metadata = { title: "Account & security" };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Account & security</h1>
      <p className="mt-1 text-muted">Manage how you sign in and keep your account safe.</p>

      <Card className="mt-6 p-5">
        <h2 className="font-semibold">Account</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div><dt className="text-muted">Name</dt><dd className="font-medium">{user.name}</dd></div>
          <div><dt className="text-muted">Email</dt><dd className="font-medium">{user.email}</dd></div>
          <div><dt className="text-muted">Role</dt><dd className="font-medium">{ROLES[user.role as keyof typeof ROLES] ?? user.role}</dd></div>
        </dl>
      </Card>

      <Card className="mt-4 p-5">
        <VerifyPanel verified={!!user.emailVerified} />
      </Card>

      <Card className="mt-4 p-5">
        <MfaPanel enabled={user.mfaEnabled} />
      </Card>
    </div>
  );
}
