import { Badge } from "./ui";

const PRIORITY_TONE: Record<string, string> = { low: "neutral", medium: "info", high: "warning", critical: "danger" };
const STATUS_TONE: Record<string, string> = {
  open: "warning", in_progress: "info", waiting: "neutral", resolved: "success", closed: "neutral",
};
const STATUS_LABEL: Record<string, string> = {
  open: "Open", in_progress: "In progress", waiting: "Waiting", resolved: "Resolved", closed: "Closed",
};

export function PriorityBadge({ priority }: { priority: string }) {
  return <Badge tone={PRIORITY_TONE[priority] ?? "neutral"}>{priority[0].toUpperCase() + priority.slice(1)}</Badge>;
}
export function TicketStatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONE[status] ?? "neutral"}>{STATUS_LABEL[status] ?? status}</Badge>;
}
