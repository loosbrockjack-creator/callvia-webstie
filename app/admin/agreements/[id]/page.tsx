import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/require-admin";
import { findAgreementById, listEvents } from "@/lib/agreement/queries";
import { formatCents } from "@/lib/money";
import { statusLabel } from "@/lib/agreement/status";

export const metadata = {
  title: "Agreement | Callvia",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-1 py-3 border-b" style={{ borderColor: "#1f1f1f" }}>
      <span className="text-xs tracking-widest uppercase w-52 shrink-0" style={{ color: "#555555" }}>
        {label}
      </span>
      <span className="text-sm break-all" style={{ color: "#999999" }}>
        {value}
      </span>
    </div>
  );
}

function when(v: unknown): string {
  return v ? new Date(String(v)).toISOString().replace("T", " ").replace(/\.\d+Z$/, " UTC") : "not yet";
}

export default async function AgreementDetailPage(props: PageProps<"/admin/agreements/[id]">) {
  await requireAdminPage();
  const { id } = await props.params;

  const row = await findAgreementById(id);
  if (!row) notFound();
  const events = await listEvents(id);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <a href="/admin" className="text-xs tracking-widest uppercase mb-12 inline-block" style={{ color: "#555555" }}>
          Back to agreements
        </a>

        <h1 className="text-3xl font-light tracking-tight mb-2" style={{ letterSpacing: "-0.025em" }}>
          {row.business_name}
        </h1>
        <p className="text-sm mb-12" style={{ color: "#999999" }}>
          {statusLabel(row.status)}
        </p>

        {row.pdf_sha256 && (
          <a
            href={`/api/admin/agreements/${row.id}/pdf`}
            className="inline-flex items-center justify-center px-7 py-3 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-full transition-all duration-200 mb-14"
          >
            Download signed PDF
          </a>
        )}

        <section className="mb-14">
          <h2 className="text-sm tracking-widest uppercase mb-4" style={{ color: "#555555" }}>
            Client
          </h2>
          <Field label="Contact" value={row.contact_name} />
          <Field label="Email" value={row.email} />
          <Field label="Phone" value={row.phone ?? "not provided"} />
        </section>

        <section className="mb-14">
          <h2 className="text-sm tracking-widest uppercase mb-4" style={{ color: "#555555" }}>
            Plan
          </h2>
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
          <Field label="Included" value={row.included_items.join(" | ") || "none listed"} />
        </section>

        <section className="mb-14">
          <h2 className="text-sm tracking-widest uppercase mb-4" style={{ color: "#555555" }}>
            Signature and audit
          </h2>
          <Field label="Signed by" value={row.signed_name ?? "not signed"} />
          <Field label="Signer title" value={row.signed_title ?? "not provided"} />
          <Field label="Signed at" value={when(row.signed_at)} />
          <Field label="IP address" value={row.signed_ip ?? "not recorded"} />
          <Field label="Browser" value={row.signed_user_agent ?? "not recorded"} />
          <Field label="Document hash" value={row.snapshot_sha256 ?? "not signed"} />
          <Field label="Template version" value={`v${row.template_version}`} />
          <Field label="Authority confirmed" value={row.signed_authority_ack ? "yes" : "no"} />
          <Field label="E-sign consent" value={row.esign_consent ? "yes" : "no"} />
          <Field label="SMS consent" value={row.sms_consent ? "YES" : "no"} />
          <Field label="PDF generated" value={when(row.pdf_generated_at)} />
          <Field label="PDF emailed" value={when(row.pdf_emailed_at)} />
        </section>

        <section className="mb-14">
          <h2 className="text-sm tracking-widest uppercase mb-4" style={{ color: "#555555" }}>
            Payment
          </h2>
          <Field label="Paid at" value={when(row.paid_at)} />
          <Field label="Amount paid" value={row.amount_paid_cents !== null ? formatCents(row.amount_paid_cents) : "not paid"} />
          <Field label="Stripe customer" value={row.stripe_customer_id ?? "none"} />
          <Field label="Stripe subscription" value={row.stripe_subscription_id ?? "none"} />
          <Field label="Subscription status" value={row.subscription_status ?? "none"} />
        </section>

        <section>
          <h2 className="text-sm tracking-widest uppercase mb-4" style={{ color: "#555555" }}>
            Event log
          </h2>
          <div className="flex flex-col">
            {events.map((e) => (
              <div key={String(e.id)} className="flex flex-wrap gap-x-6 py-3 border-b text-sm" style={{ borderColor: "#1f1f1f" }}>
                <span className="w-52 shrink-0" style={{ color: "#555555" }}>
                  {when(e.at)}
                </span>
                <span className="text-white">{e.type}</span>
                <span style={{ color: "#555555" }}>{e.actor}</span>
                {e.ip && <span style={{ color: "#555555" }}>{e.ip}</span>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
