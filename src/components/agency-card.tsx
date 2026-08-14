import Link from "next/link";
import { Card, Badge } from "./ui";
import { VerificationBadge } from "./badges";
import { LiveCheck } from "./live-check";
import { asList } from "@/lib/utils";
import { MapPin, Briefcase } from "lucide-react";

export interface AgencyCardData {
  id: string;
  name: string;
  location: string;
  representationSpecialties: unknown;
  verificationState: string;
  fees?: string | null;
  matchScore?: number | null;
}

export function AgencyCard({ agency }: { agency: AgencyCardData }) {
  const specialties = asList(agency.representationSpecialties).map(String);
  const feeWarning = agency.fees && /upfront|mandatory|photo package|pay/i.test(agency.fees) && !/no upfront/i.test(agency.fees);

  return (
    <Card className="flex flex-col p-5 transition-shadow hover:shadow-md">
      <span className="mb-2 inline-flex w-fit items-center gap-1 rounded bg-accent-soft px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
        <Briefcase className="h-3 w-3" /> Agency
      </span>
      <div className="flex items-start justify-between gap-2">
        <Link href={`/agencies/${agency.id}`} className="font-semibold leading-snug hover:text-primary">
          {agency.name}
        </Link>
        {typeof agency.matchScore === "number" && agency.matchScore > 0 && (
          <span className="shrink-0 text-lg font-extrabold text-primary">{agency.matchScore}%</span>
        )}
      </div>

      <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted">
        <MapPin className="h-3.5 w-3.5" /> {agency.location}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {specialties.slice(0, 4).map((s) => (
          <Badge key={s} tone="neutral">
            <Briefcase className="h-3 w-3" /> {s}
          </Badge>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <VerificationBadge state={agency.verificationState} />
        {feeWarning && <Badge tone="danger">Charges talent</Badge>}
      </div>

      <LiveCheck agencyId={agency.id} />
    </Card>
  );
}
