import { Card } from "./ui";
import { relativeDeadline } from "@/lib/utils";
import { Send, Mail, ExternalLink, ListChecks, Clock, AlertTriangle } from "lucide-react";

const BTN = "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors";

export function SubmitPanel({
  title,
  submissionMethod,
  submissionUrl,
  contactEmail,
  contactName,
  sourceUrl,
  originalLabel,
  requirements = [],
  deadline,
}: {
  title: string;
  submissionMethod?: string | null;
  submissionUrl?: string | null;
  contactEmail?: string | null;
  contactName?: string | null;
  sourceUrl?: string | null;
  originalLabel: string;
  requirements?: string[];
  deadline?: Date | string | null;
}) {
  const mailto = contactEmail
    ? `mailto:${contactEmail}?subject=${encodeURIComponent(`Submission — ${title}`)}`
    : null;
  const hasWay = !!(submissionUrl || mailto);

  return (
    <Card className="border-primary/20 p-5">
      <h2 className="flex items-center gap-2 font-semibold"><Send className="h-4 w-4 text-primary" /> How to submit</h2>

      {submissionMethod && <p className="mt-2 text-sm text-muted">{submissionMethod}</p>}

      {requirements.length > 0 && (
        <div className="mt-3">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted"><ListChecks className="h-3.5 w-3.5" /> You&rsquo;ll need</p>
          <ul className="mt-1 space-y-0.5 text-sm">
            {requirements.map((r) => (
              <li key={r} className="flex items-center gap-2 text-muted"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> {r}</li>
            ))}
          </ul>
        </div>
      )}

      {deadline && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium"><Clock className="h-3.5 w-3.5 text-muted" /> {relativeDeadline(deadline)}</p>
      )}

      <div className="mt-4 flex flex-col gap-2">
        {submissionUrl && (
          <a href={submissionUrl} target="_blank" rel="noreferrer" className={`${BTN} bg-primary text-primary-fg hover:bg-primary-hover`}>
            <Send className="h-4 w-4" /> Submit / Apply
          </a>
        )}
        {mailto && (
          <a href={mailto} className={`${BTN} ${submissionUrl ? "border border-border-strong text-foreground hover:bg-surface-2" : "bg-primary text-primary-fg hover:bg-primary-hover"}`}>
            <Mail className="h-4 w-4" /> Email {contactName ? contactName : "to submit"}
          </a>
        )}
        {sourceUrl && (
          <a href={sourceUrl} target="_blank" rel="noreferrer" className={`${BTN} border border-border-strong text-foreground hover:bg-surface-2`}>
            <ExternalLink className="h-4 w-4" /> {originalLabel}
          </a>
        )}
      </div>

      {!hasWay && !sourceUrl && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-warning-soft p-3 text-xs text-warning">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>No submission link or email is listed. A legitimate opportunity gives you a clear, professional way to apply — treat the absence of one as a warning sign.</span>
        </div>
      )}
    </Card>
  );
}
