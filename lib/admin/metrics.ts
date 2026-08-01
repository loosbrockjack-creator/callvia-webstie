// Dashboard aggregation.
//
// Everything here is computed in memory from the rows listAgreements() already
// returns, so the Overview page costs exactly the queries it was already
// making. If the 200-row cap in listAgreements ever becomes the binding
// constraint on these numbers, that is the moment to push the aggregation into
// SQL, not before.

import type { AgreementRow } from "../agreement/queries";
import { isSigned } from "../agreement/status";

// Subscription states Stripe considers live. 'past_due' counts: the client is
// still subscribed and still owes, and dropping them from MRR would make a
// failed card look like a cancellation.
const LIVE_SUB = new Set(["active", "trialing", "past_due"]);

const DAY_MS = 86_400_000;

export interface TrialView {
  row: AgreementRow;
  /** Whole days until the trial ends. Negative once it has ended. */
  daysLeft: number;
  state: "unsigned" | "running" | "ending" | "ended" | "converted";
}

export interface Metrics {
  mrrCents: number;
  activeClients: number;
  awaitingCount: number;
  awaitingCents: number;
  trialsRunning: number;

  /** Week-over-week deltas, null when there is no prior week to compare to. */
  mrrDeltaPct: number | null;
  signedDeltaPct: number | null;

  awaiting: AgreementRow[];
  trials: TrialView[];
  trialsNeedingAttention: TrialView[];
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return null; // 0 -> anything is not a percentage
  return ((current - previous) / previous) * 100;
}

// Calendar-day difference between two YYYY-MM-DD dates, done on the date parts
// rather than on Date objects: `new Date('2026-08-06')` is UTC midnight, which
// is the previous day in every US timezone, so a naive diff is off by one for
// half the country.
function daysUntil(isoDate: string): number {
  const [y, m, d] = isoDate.split("-").map(Number);
  const target = Date.UTC(y, m - 1, d);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / DAY_MS);
}

export function trialView(row: AgreementRow): TrialView {
  const daysLeft = row.trial_ends_on ? daysUntil(row.trial_ends_on) : 0;

  let state: TrialView["state"];
  if (row.converted_to_agreement_id) state = "converted";
  else if (!isSigned(row.status)) state = "unsigned";
  else if (daysLeft < 0) state = "ended";
  else if (daysLeft <= 7) state = "ending";
  else state = "running";

  return { row, daysLeft, state };
}

export function computeMetrics(rows: AgreementRow[]): Metrics {
  const now = Date.now();
  const weekAgo = now - 7 * DAY_MS;
  const twoWeeksAgo = now - 14 * DAY_MS;

  const service = rows.filter((r) => r.kind === "service");
  const trials = rows.filter((r) => r.kind === "trial").map(trialView);

  const live = service.filter(
    (r) => r.status === "active" && LIVE_SUB.has(r.subscription_status ?? "active"),
  );

  const mrrCents = live.reduce((sum, r) => sum + r.monthly_cents, 0);

  // Distinct businesses, not agreements: one client on two plans is one client.
  const activeClients = new Set(live.map((r) => r.client_id)).size;

  const awaiting = service
    .filter((r) => r.status === "signed" || r.status === "payment_pending")
    .sort((a, b) => new Date(a.signed_at ?? 0).getTime() - new Date(b.signed_at ?? 0).getTime());

  const awaitingCents = awaiting.reduce(
    (sum, r) => sum + r.setup_fee_cents + r.monthly_cents,
    0,
  );

  // MRR a week ago, reconstructed from when each subscription started paying.
  const mrrLastWeek = live
    .filter((r) => r.paid_at !== null && new Date(r.paid_at).getTime() <= weekAgo)
    .reduce((sum, r) => sum + r.monthly_cents, 0);

  const signedThisWeek = service.filter(
    (r) => r.signed_at !== null && new Date(r.signed_at).getTime() > weekAgo,
  ).length;
  const signedLastWeek = service.filter((r) => {
    if (!r.signed_at) return false;
    const t = new Date(r.signed_at).getTime();
    return t > twoWeeksAgo && t <= weekAgo;
  }).length;

  const trialsNeedingAttention = trials
    .filter((t) => t.state === "ending" || t.state === "ended")
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return {
    mrrCents,
    activeClients,
    awaitingCount: awaiting.length,
    awaitingCents,
    trialsRunning: trials.filter((t) => t.state === "running" || t.state === "ending").length,

    mrrDeltaPct: pctChange(mrrCents, mrrLastWeek),
    signedDeltaPct: pctChange(signedThisWeek, signedLastWeek),

    awaiting,
    trials,
    trialsNeedingAttention,
  };
}

// ---------------------------------------------------------------------------
// Chart series
// ---------------------------------------------------------------------------

export interface RevenuePoint {
  label: string;
  cents: number;
}

export interface FunnelPoint {
  label: string;
  sent: number;
  signed: number;
}

function weekStart(d: Date): Date {
  const out = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  out.setDate(out.getDate() - out.getDay()); // Sunday
  return out;
}

function weekLabel(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Buckets are built from the calendar first and then filled, so a week with no
// activity renders as a real zero rather than vanishing and making the gap
// between two bars silently mean different things.
function lastNWeeks(n: number): { start: Date; label: string }[] {
  const thisWeek = weekStart(new Date());
  const out: { start: Date; label: string }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const s = new Date(thisWeek);
    s.setDate(s.getDate() - i * 7);
    out.push({ start: s, label: weekLabel(s) });
  }
  return out;
}

export function revenueByWeek(rows: AgreementRow[], weeks = 8): RevenuePoint[] {
  const buckets = lastNWeeks(weeks);
  const series = buckets.map((b) => ({ label: b.label, cents: 0 }));

  for (const r of rows) {
    if (!r.paid_at || !r.amount_paid_cents) continue;
    const paidWeek = weekStart(new Date(r.paid_at)).getTime();
    const idx = buckets.findIndex((b) => b.start.getTime() === paidWeek);
    if (idx !== -1) series[idx].cents += r.amount_paid_cents;
  }

  return series;
}

export function funnelByWeek(rows: AgreementRow[], weeks = 8): FunnelPoint[] {
  const buckets = lastNWeeks(weeks);
  const series = buckets.map((b) => ({ label: b.label, sent: 0, signed: 0 }));

  const bucketFor = (d: Date) =>
    buckets.findIndex((b) => b.start.getTime() === weekStart(d).getTime());

  for (const r of rows) {
    if (r.sent_at) {
      const i = bucketFor(new Date(r.sent_at));
      if (i !== -1) series[i].sent += 1;
    }
    if (r.signed_at) {
      const i = bucketFor(new Date(r.signed_at));
      if (i !== -1) series[i].signed += 1;
    }
  }

  return series;
}
