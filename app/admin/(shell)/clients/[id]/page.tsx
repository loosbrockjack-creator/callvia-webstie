import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { requireAdminPage } from "@/lib/require-admin";
import { findClientById, listAgreementsForClient } from "@/lib/agreement/queries";
import { listOnboardingForClient } from "@/lib/onboarding/queries";
import { listRecentInvoices, type InvoiceSummary } from "@/lib/stripe";
import { trialView } from "@/lib/admin/metrics";
import { formatCents } from "@/lib/money";
import { formatTrialDate } from "@/lib/agreement/render";
import { BentoCell, BentoGrid, EmptyState, PanelHeader } from "@/components/admin/ui/bento";
import { Badge, StatusBadge } from "@/components/admin/ui/Badge";
import { RevokeSessionsButton } from "@/components/admin/RevokeSessionsButton";

export const metadata = {
  title: "Client | Callvia",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatPhone(digits: string | null): string {
  if (!digits || digits.length !== 10) return digits ?? "—";
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function shortDate(v: Date | string | null): string {
  if (!v) return "—";
  return new Date(v).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-line py-3 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-4">
      <dt className="shrink-0 text-xs uppercase tracking-widest text-dim sm:w-36">{label}</dt>
      <dd className="min-w-0 break-words text-sm text-white">{value}</dd>
    </div>
  );
}

export default async function ClientDetailPage(props: PageProps<"/admin/clients/[id]">) {
  await requireAdminPage();
  const { id } = await props.params;

  const client = await findClientById(id);
  if (!client) notFound();

  const [agreements, onboarding] = await Promise.all([
    listAgreementsForClient(id),
    listOnboardingForClient(id),
  ]);

  // Invoices are fetched live and never persisted. Stripe can be down or the
  // customer can be missing, and neither should take the page down with it.
  let invoices: InvoiceSummary[] = [];
  let invoiceError = false;
  if (client.stripe_customer_id) {
    try {
      invoices = await listRecentInvoices(client.stripe_customer_id, 8);
    } catch {
      invoiceError = true;
    }
  }

  const services = agreements.filter((a) => a.kind === "service");
  const trials = agreements.filter((a) => a.kind === "trial");
  const live = services.find((a) => a.status === "active");

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <Link
        href="/admin/clients"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-white"
      >
        <ArrowLeft size={14} /> All clients
      </Link>

      <BentoGrid className="lg:grid-cols-3">
        <BentoCell className="lg:col-span-2">
          <PanelHeader
            title={client.business_name}
            subtitle={`Client since ${shortDate(client.created_at)}.`}
            trend={
              live ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">No plan</Badge>
            }
          />
          <dl>
            <Field label="Contact" value={client.contact_name} />
            <Field label="Email" value={client.email} />
            <Field label="Phone" value={formatPhone(client.phone)} />
            <Field
              label="Current plan"
              value={
                live ? (
                  <>
                    {live.package_name} · {formatCents(live.monthly_cents)}/mo
                    {live.subscription_status && live.subscription_status !== "active" && (
                      <span className="text-warning"> ({live.subscription_status})</span>
                    )}
                  </>
                ) : (
                  <span className="text-dim">None</span>
                )
              }
            />
            <Field
              label="Stripe customer"
              value={
                client.stripe_customer_id ? (
                  <span className="font-mono text-xs">{client.stripe_customer_id}</span>
                ) : (
                  <span className="text-dim">Not created yet</span>
                )
              }
            />
          </dl>

          <div className="mt-6 border-t border-line pt-5">
            <RevokeSessionsButton clientId={client.id} />
          </div>
        </BentoCell>

        <BentoCell>
          <PanelHeader title="Recent invoices" subtitle="Fetched live from Stripe." />
          {invoiceError ? (
            <EmptyState title="Could not reach Stripe." hint="Everything else on this page is fine." />
          ) : invoices.length === 0 ? (
            <EmptyState title="No invoices yet." />
          ) : (
            <ul className="flex flex-col gap-3">
              {invoices.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-white">
                      {inv.number ?? inv.id}
                    </span>
                    <span className="text-xs text-dim">
                      {shortDate(new Date(inv.created * 1000))} · {inv.status ?? "unknown"}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="text-sm tabular-nums text-muted">
                      {formatCents(inv.amountPaidCents || inv.amountDueCents)}
                    </span>
                    {inv.hostedInvoiceUrl && (
                      <a
                        href={inv.hostedInvoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open invoice in Stripe"
                        className="text-dim transition-colors hover:text-white"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </BentoCell>
      </BentoGrid>

      <BentoGrid className="lg:grid-cols-3">
        <BentoCell>
          <PanelHeader title="Agreements" subtitle="Paid service agreements." />
          {services.length === 0 ? (
            <EmptyState title="None yet." />
          ) : (
            <ul className="flex flex-col gap-3">
              {services.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/admin/agreements/${a.id}`}
                    className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-white">{a.package_name}</span>
                      <span className="text-xs text-dim">{shortDate(a.created_at)}</span>
                    </span>
                    <StatusBadge status={a.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </BentoCell>

        <BentoCell>
          <PanelHeader title="Trials" subtitle="Free trial agreements." />
          {trials.length === 0 ? (
            <EmptyState title="None yet." />
          ) : (
            <ul className="flex flex-col gap-3">
              {trials.map((t) => {
                const v = trialView(t);
                return (
                  <li key={t.id}>
                    <Link
                      href={`/admin/agreements/${t.id}`}
                      className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-white">
                          {t.trial_starts_on && t.trial_ends_on
                            ? `${formatTrialDate(t.trial_starts_on)} to ${formatTrialDate(t.trial_ends_on)}`
                            : "Trial"}
                        </span>
                        <span className="text-xs text-dim">{v.state}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </BentoCell>

        <BentoCell>
          <PanelHeader title="Onboarding" subtitle="Setup forms sent to this client." />
          {onboarding.length === 0 ? (
            <EmptyState title="None yet." />
          ) : (
            <ul className="flex flex-col gap-3">
              {onboarding.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/onboarding/${o.id}`}
                    className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-surface"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-white">
                        {o.status === "submitted"
                          ? `${Object.keys(o.answers ?? {}).length} answers`
                          : "Not submitted"}
                      </span>
                      <span className="text-xs text-dim">
                        {shortDate(o.submitted_at ?? o.sent_at ?? o.created_at)}
                      </span>
                    </span>
                    <Badge tone={o.status === "submitted" ? "success" : "info"}>
                      {o.status === "submitted" ? "Submitted" : "Pending"}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </BentoCell>
      </BentoGrid>
    </div>
  );
}
