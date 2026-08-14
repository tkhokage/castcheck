import Link from "next/link";
import { Card } from "./ui";
import { VerificationBadge, RiskBadge } from "./badges";
import { relativeDeadline } from "@/lib/utils";
import { MapPin, DollarSign, Clock, Film } from "lucide-react";

export interface OppCardData {
  id: string;
  title: string;
  production?: string | null;
  role: string;
  location: string;
  type: string;
  compensation: string;
  payDetails?: string | null;
  deadline?: Date | string | null;
  verificationState: string;
  riskLevel: string;
  checks?: { status: string }[];
  fitScore?: number | null;
}

function compLabel(c: string, pay?: string | null) {
  if (pay) return pay;
  return c[0].toUpperCase() + c.slice(1);
}

export function OpportunityCard({ opp }: { opp: OppCardData }) {
  const total = opp.checks?.length ?? 0;
  const passed = opp.checks?.filter((c) => c.status === "pass").length ?? 0;

  return (
    <Card className="group flex flex-col p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="inline-flex w-fit items-center gap-1 rounded bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
            <Film className="h-3 w-3" /> Casting call
          </span>
          <span className="text-xs font-medium uppercase tracking-wide text-muted">{opp.type}</span>
        </div>
        <RiskBadge level={opp.riskLevel} />
      </div>

      <Link href={`/opportunities/${opp.id}`} className="mt-2">
        <h3 className="font-semibold leading-snug group-hover:text-primary">{opp.title}</h3>
      </Link>
      <p className="mt-1 text-sm text-muted">
        {opp.role}
        {opp.production ? ` · ${opp.production}` : ""}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <span className="inline-flex items-center gap-1.5 text-muted">
          <MapPin className="h-3.5 w-3.5" /> {opp.location}
        </span>
        <span className="inline-flex items-center gap-1.5 text-muted">
          <DollarSign className="h-3.5 w-3.5" /> {compLabel(opp.compensation, opp.payDetails)}
        </span>
        <span className="inline-flex items-center gap-1.5 text-muted">
          <Clock className="h-3.5 w-3.5" /> {relativeDeadline(opp.deadline)}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
        <VerificationBadge state={opp.verificationState} />
        <div className="flex items-center gap-3 text-xs text-muted">
          {total > 0 && (
            <span className="font-medium">
              {passed}/{total} checks
            </span>
          )}
          {typeof opp.fitScore === "number" && opp.fitScore > 0 && (
            <span className="font-semibold text-primary">Fit {opp.fitScore}%</span>
          )}
        </div>
      </div>
    </Card>
  );
}
