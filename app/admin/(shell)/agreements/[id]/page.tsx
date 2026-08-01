import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { requireAdminPage } from "@/lib/require-admin";
import { findAgreementById, listEvents } from "@/lib/agreement/queries";
import { formatCents } from "@/lib/money";
import { formatTrialDate } from "@/lib/agreement/render";
import { trialView } from "@/lib/admin/metrics";
import { BentoCell, BentoGrid, PanelHeader } from "@/components/admin/ui/bento";
import { StatusBadge } from "@/components/admin/ui/Badge";

export const metadata = {
  title: "Agreement | Callvia",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-line py-3 last:border-b-0 sm:flex-row sm:items-baseline sm:gap-4">
      <dt className="shrink-0 text-xs uppercase tracking-widest text-dim sm:w-44">{label}</dt>
      <dd className="min-w-0 break-all text-sm text-muted">{value}</dd>
    </div>
  );
}

function when(v: unknown): string {
  return v
    ? new Date(String(v)).toISOString().replace("T", " ").replace(/\.\d+Z$/, " UTC")
    : "not yet";
}

export default async function AgreementDetailPage(props: PageProps<"/admin/agreements/[id]">) {
  await requireAdminPage();
  const { id } = await props.params;

  const row = await findAgreementById(id);
  if (!row) notFound();
  const events = await listEvents(id);

  const isTrial = row.kind === "trial";
  const trial = isTrial ? trialView(row) : null;
  const backHref = isTrial ? "/admin/trials" : "/admin/agreements";

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-white"
      >
        <ArrowLeft size={14} /> {isTrial ? "All trials" : "All agreements"}
      </Link>

      <BentoGrid className="lg:grid-cols-3">
        <BentoCell className="lg:col-span-2">
          <PanelHeader
            title={row.business_name}
            subtitle={
              isTrial ? "Free trial agreement. No payment involved." : row.package_name
            }
            trend={<StatusBadge status={row.status} />}
            action={
              row.pdf_sha256 ? (
                <a
                  href={`/api/admin/agreements/${row.id}/pdf`}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-accent px-5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
                >
                  <Download size={15} /> PDF
                </a>
              ) : undefined
            }
          />
          <dl>
            <Field label="Contact" value={row.contact_name} />
            <Field label="Email" value={row.email} />
            <Field label="Phone" value={row.phone ?? "not provided"} />
            <Field
              label="Client record"
              value={
                <Link
                  href={`/admin/clients/${row.client_id}`}
                  className="text-accent-hover hover:underline"
                >
                  Open client
                </Link>
              }
            />
          </dl>
        </BentoCell>

        <BentoCell>
          <PanelHeader title={isTrial ? "Trial" : "Plan"} />
          <dl>
            {isTrial ? (
              <>
                <Field
                  label="Starts"
                  value={row.trial_starts_on ? formatTrialDate(row.trial_starts_on) : "—"}
                />
                <Field
                  label="Ends"
                  value={row.trial_ends_on ? formatTrialDate(row.trial_ends_on) : "—"}
                />
                <Field label="State" value={trial?.state ?? "—"} />
                <Field
                  label="Converted"
                  value={
                    row.converted_to_agreement_id ? (
                      <Link
                        href={`/admin/agreements/${row.converted_to_agreement_id}`}
                        className="text-accent-hover hover:underline"
                      >
                        View paid agreement
                      </Link>
                    ) : (
                      "not yet"
                    )
                  }
                />
              </>
            ) : (
              <>
                <Field label="Package" value={row.package_name} />
                <Field label="Setup fee" value={formatCents(row.setup_fee_cents)} />
                <Field label="Monthly" value={formatCents(row.monthly_cents)} />
                <Field
                  label="Usage"
                  value={
                    row.usage_terms
                      ? `${row.usage_terms.includedMinutes} minutes included, ${formatCents(row.usage_terms.overageCentsPerMinute)} per minute after`
                      : "not applicable"
                  }
                />
              </>
            )}
            <Field label="Included" value={row.included_items.join(" | ") || "none listed"} />
          </dl>
        </BentoCell>
      </BentoGrid>

      <BentoGrid className={isTrial ? "lg:grid-cols-2" : "lg:grid-cols-3"}>
        <BentoCell className={isTrial ? undefined : "lg:col-span-2"}>
          <PanelHeader title="Signature and audit" subtitle="What makes this defensible." />
          <dl>
            <Field label="Signed by" value={row.signed_name ?? "not signed"} />
            <Field label="Signer title" value={row.signed_title ?? "not provided"} />
            <Field label="Signed at" value={when(row.signed_at)} />
            <Field label="IP address" value={row.signed_ip ?? "not recorded"} />
            <Field label="Browser" value={row.signed_user_agent ?? "not recorded"} />
            <Field label="Document hash" value={row.snapshot_sha256 ?? "not signed"} />
            <Field label="Template" value={`${row.template_id} v${row.template_version}`} />
            <Field label="Authority confirmed" value={row.signed_authority_ack ? "yes" : "no"} />
            <Field label="E-sign consent" value={row.esign_consent ? "yes" : "no"} />
            <Field label="SMS consent" value={row.sms_consent ? "YES" : "no"} />
            <Field label="PDF generated" value={when(row.pdf_generated_at)} />
            <Field label="PDF emailed" value={when(row.pdf_emailed_at)} />
            <Field label="Link ending" value={row.token_last4} />
          </dl>
        </BentoCell>

        {!isTrial && (
          <BentoCell>
            <PanelHeader title="Payment" subtitle="Driven only by Stripe webhooks." />
            <dl>
              <Field label="Paid at" value={when(row.paid_at)} />
              <Field
                label="Amount paid"
                value={
                  row.amount_paid_cents !== null ? formatCents(row.amount_paid_cents) : "not paid"
                }
              />
              <Field label="Stripe customer" value={row.stripe_customer_id ?? "none"} />
              <Field label="Subscription" value={row.stripe_subscription_id ?? "none"} />
              <Field label="Subscription status" value={row.subscription_status ?? "none"} />
            </dl>
          </BentoCell>
        )}

        <BentoCell className={isTrial ? undefined : "lg:col-span-3"}>
          <PanelHeader title="Event log" subtitle="Append-only. Never edited, never deleted." />
          <ul className="flex flex-col">
            {events.map((e) => (
              <li
                key={String(e.id)}
                className="flex flex-col gap-1 border-b border-line py-3 text-sm last:border-b-0 sm:flex-row sm:items-baseline sm:gap-4"
              >
                <span className="shrink-0 text-xs tabular-nums text-dim sm:w-52">{when(e.at)}</span>
                <span className="text-white">{e.type}</span>
                <span className="text-dim">{e.actor}</span>
                {e.ip && <span className="text-faint">{e.ip}</span>}
              </li>
            ))}
          </ul>
        </BentoCell>
      </BentoGrid>
    </div>
  );
}
