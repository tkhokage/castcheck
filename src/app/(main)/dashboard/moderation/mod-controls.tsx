"use client";

import { useTransition } from "react";
import { moderateOpportunity, resolveReport } from "@/app/actions/moderation";
import { Button } from "@/components/ui";
import { Check, Flag, X } from "lucide-react";

export function ModControls({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex gap-2">
      <Button variant="outline" disabled={pending} onClick={() => start(() => void moderateOpportunity(id, "publish"))}>
        <Check className="h-4 w-4 text-success" /> Publish
      </Button>
      <Button variant="outline" disabled={pending} onClick={() => start(() => void moderateOpportunity(id, "flag"))}>
        <Flag className="h-4 w-4 text-warning" /> Flag
      </Button>
      <Button variant="outline" disabled={pending} onClick={() => start(() => void moderateOpportunity(id, "reject"))}>
        <X className="h-4 w-4 text-danger" /> Reject
      </Button>
    </div>
  );
}

export function ReportControls({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex gap-2">
      <Button variant="outline" disabled={pending} onClick={() => start(() => void resolveReport(id, "resolved"))}>
        <Check className="h-4 w-4 text-success" /> Resolve
      </Button>
      <Button variant="ghost" disabled={pending} onClick={() => start(() => void resolveReport(id, "dismissed"))}>
        Dismiss
      </Button>
    </div>
  );
}
