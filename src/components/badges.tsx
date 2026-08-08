import { Badge } from "./ui";
import { VERIFICATION_STATES, TRUST_LEVELS } from "@/lib/constants";
import { RISK_LEVEL_TONE } from "@/lib/risk";
import { CheckCircle2, ShieldQuestion, AlertTriangle, ShieldAlert, XCircle, Shield } from "lucide-react";

export function VerificationBadge({ state }: { state: string }) {
  const meta = VERIFICATION_STATES[state as keyof typeof VERIFICATION_STATES] ?? {
    label: state,
    tone: "neutral",
  };
  const Icon =
    state === "verified" ? CheckCircle2 :
    state === "partial" ? Shield :
    state === "needs_review" ? ShieldQuestion :
    state === "flagged" ? AlertTriangle :
    state === "high_risk" ? ShieldAlert :
    XCircle;
  return (
    <Badge tone={meta.tone}>
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </Badge>
  );
}

export function RiskBadge({ level }: { level: string }) {
  return (
    <Badge tone={RISK_LEVEL_TONE[level] ?? "neutral"}>
      {level[0].toUpperCase() + level.slice(1)} risk
    </Badge>
  );
}

export function TrustLevelBadge({ level }: { level: number }) {
  const meta = TRUST_LEVELS[level] ?? { name: "Unknown", meaning: "" };
  const tone = level >= 4 ? "success" : level === 3 ? "info" : level === 2 ? "neutral" : "warning";
  return (
    <Badge tone={tone} className="font-mono">
      L{level} · {meta.name}
    </Badge>
  );
}
