import Link from "next/link";
import type { RecentEvent } from "@/lib/agreement/queries";

// agreement_events already records every meaningful thing that happens. This is
// the first place it is read across all agreements rather than one at a time.

const LABEL: Record<string, string> = {
  created: "created",
  sent: "sent",
  viewed: "opened the link",
  signed: "signed",
  checkout_created: "started checkout",
  paid: "paid",
  checkout_expired: "abandoned checkout",
  payment_failed: "payment failed",
  pdf_generated: "PDF generated",
  pdf_emailed: "PDF emailed",
  voided: "voided",
  converted: "converted to paid",
  subscription_updated: "subscription updated",
  admin_note: "note added",
};

// Only the events worth colouring get colour. Everything else is plain text,
// so the two that mean money stand out without a legend.
const TONE: Record<string, string> = {
  paid: "text-success",
  signed: "text-success",
  payment_failed: "text-danger",
  voided: "text-danger",
  checkout_expired: "text-warning",
};

function ago(at: Date): string {
  const secs = Math.floor((Date.now() - new Date(at).getTime()) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  return new Date(at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ActivityFeed({ events }: { events: RecentEvent[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {events.map((e) => (
        <li key={e.id}>
          <Link
            href={`/admin/agreements/${e.agreement_id}`}
            className="-mx-2 flex items-baseline justify-between gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface"
          >
            <span className="min-w-0 text-sm">
              <span className="text-white">{e.business_name}</span>{" "}
              <span className={TONE[e.type] ?? "text-muted"}>
                {LABEL[e.type] ?? e.type}
              </span>
              {e.kind === "trial" && <span className="text-dim"> (trial)</span>}
            </span>
            <span className="shrink-0 text-xs tabular-nums text-faint">{ago(e.at)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
