import Link from "next/link";
import { ArrowRight, Clock, FileText, Hourglass, Inbox, Users, Wallet } from "lucide-react";
import { requireAdminPage } from "@/lib/require-admin";
import { listAgreements, listRecentEvents } from "@/lib/agreement/queries";
import {
  computeMetrics,
  funnelByWeek,
  revenueByWeek,
  type TrialView,
} from "@/lib/admin/metrics";
import { formatCents } from "@/lib/money";
import { BentoCell, BentoGrid, EmptyState, PanelHeader } from "@/components/admin/ui/bento";
import { StatTile } from "@/components/admin/ui/StatTile";
import { RevenueChart } from "@/components/admin/charts/RevenueChart";
import { FunnelChart } from "@/components/admin/charts/FunnelChart";
import { ActivityFeed } from "@/components/admin/ActivityFeed";

export const metadata = {
  title: "Overview | Callvia",
  robots: { index: false, follow: false },
};

// Always read live: a dashboard that shows a cached payment status is worse
// than no dashboard.
export const dynamic = "force-dynamic";

function daysSince(iso: Date | null): number {
  if (!iso) return 0;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

function ageColor(days: number): string {
  if (days >= 7) return "text-danger";
  if (days >= 3) return "text-warning";
  return "text-dim";
}

function trialTone(t: TrialView): string {
  if (t.state === "ended") return "text-danger";
  if (t.state === "ending") return "text-warning";
  return "text-dim";
}

function trialWhen(t: TrialView): string {
  if (t.state === "ended") {
    const d = Math.abs(t.daysLeft);
    return `ended ${d === 0 ? "today" : `${d}d ago`}`;
  }
  if (t.daysLeft === 0) return "ends today";
  return `${t.daysLeft}d left`;
}

export default async function OverviewPage() {
  await requireAdminPage();

  const [rows, events] = await Promise.all([listAgreements(), listRecentEvents(10)]);

  const m = computeMetrics(rows);
  const service = rows.filter((r) => r.kind === "service");
  const revenue = revenueByWeek(service);
  const funnel = funnelByWeek(service);

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {/* ------------------------------------------------------- stats --- */}
      <BentoGrid className="sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Monthly recurring"
          value={formatCents(m.mrrCents)}
          deltaPct={m.mrrDeltaPct}
          hint={m.mrrCents === 0 ? "No live subscriptions" : "No prior week to compare"}
          icon={<Wallet size={15} />}
        />
        <StatTile
          label="Active clients"
          value={String(m.activeClients)}
          deltaPct={null}
          hint={m.activeClients === 1 ? "1 business paying" : `${m.activeClients} businesses paying`}
          icon={<Users size={15} />}
        />
        <StatTile
          label="Awaiting payment"
          value={formatCents(m.awaitingCents)}
          deltaPct={null}
          hint={
            m.awaitingCount === 0
              ? "Nothing outstanding"
              : `${m.awaitingCount} signed, not yet paid`
          }
          icon={<Clock size={15} />}
        />
        <StatTile
          label="Trials running"
          value={String(m.trialsRunning)}
          deltaPct={m.signedDeltaPct}
          deltaLabel="signings vs last week"
          hint={m.trialsRunning === 0 ? "No trials in flight" : undefined}
          icon={<Hourglass size={15} />}
        />
      </BentoGrid>

      {/* ------------------------------------------------------ charts --- */}
      <BentoGrid className="lg:grid-cols-2">
        <BentoCell>
          <PanelHeader
            title="Revenue collected"
            subtitle="Payments received per week, last 8 weeks."
          />
          <RevenueChart data={revenue} />
        </BentoCell>
        <BentoCell>
          <PanelHeader
            title="Sent vs signed"
            subtitle="Agreements sent and signed per week, last 8 weeks."
          />
          <FunnelChart data={funnel} />
        </BentoCell>
      </BentoGrid>

      {/* ------------------------------------------------------ panels --- */}
      <BentoGrid className="lg:grid-cols-3">
        <BentoCell>
          <PanelHeader
            title="Awaiting payment"
            subtitle="Signed, but checkout not completed."
          />
          {m.awaiting.length === 0 ? (
            <EmptyState icon={<FileText size={20} />} title="Nothing outstanding." />
          ) : (
            <ul className="flex flex-col gap-3">
              {m.awaiting.slice(0, 6).map((a) => {
                const days = daysSince(a.signed_at);
                return (
                  <li key={a.id}>
                    <Link
                      href={`/admin/agreements/${a.id}`}
                      className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-white">
                          {a.business_name}
                        </span>
                        <span className="text-xs text-dim">
                          {formatCents(a.setup_fee_cents + a.monthly_cents)} due
                        </span>
                      </span>
                      <span className={`shrink-0 text-xs tabular-nums ${ageColor(days)}`}>
                        {days === 0 ? "today" : `${days}d`}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </BentoCell>

        <BentoCell>
          <PanelHeader
            title="Trials needing attention"
            subtitle="Ending within a week, or already ended."
          />
          {m.trialsNeedingAttention.length === 0 ? (
            <EmptyState icon={<Clock size={20} />} title="No trials need chasing." />
          ) : (
            <ul className="flex flex-col gap-3">
              {m.trialsNeedingAttention.slice(0, 6).map((t) => (
                <li key={t.row.id}>
                  <Link
                    href={`/admin/agreements/${t.row.id}`}
                    className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-white">
                        {t.row.business_name}
                      </span>
                      <span className="text-xs text-dim">{t.row.contact_name}</span>
                    </span>
                    <span className={`shrink-0 text-xs tabular-nums ${trialTone(t)}`}>
                      {trialWhen(t)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/admin/trials"
            className="mt-5 inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-white"
          >
            All trials <ArrowRight size={13} />
          </Link>
        </BentoCell>

        <BentoCell>
          <PanelHeader title="Activity" subtitle="Latest events across every agreement." />
          {events.length === 0 ? (
            <EmptyState icon={<Inbox size={20} />} title="Nothing has happened yet." />
          ) : (
            <ActivityFeed events={events} />
          )}
        </BentoCell>
      </BentoGrid>
    </div>
  );
}
