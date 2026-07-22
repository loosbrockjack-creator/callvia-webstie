import { notFound } from "next/navigation";
import { findAgreementByToken } from "@/lib/agreement/queries";
import { renderAgreement } from "@/lib/agreement/render";
import { isExpired, isSigned } from "@/lib/agreement/status";
import { oneTimeDisclosure, recurringDisclosure } from "@/lib/agreement/consent";
import { OrderSummary } from "@/components/agreement/OrderSummary";
import { AgreementBody } from "@/components/agreement/AgreementBody";
import { SignAgreement } from "@/components/agreement/SignAgreement";
import { PaymentPending } from "@/components/agreement/PaymentPending";

export const metadata = {
  title: "Your Callvia Agreement",
  robots: { index: false, follow: false },
};

// Never cached: the page content depends on a private token and on live status.
export const dynamic = "force-dynamic";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <p className="text-xs tracking-widest uppercase mb-12" style={{ color: "#555555" }}>
          Callvia
        </p>
        {children}
      </div>
    </main>
  );
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <Shell>
      <h1 className="text-3xl font-light tracking-tight mb-4" style={{ letterSpacing: "-0.025em" }}>
        {title}
      </h1>
      <p className="text-base leading-relaxed" style={{ color: "#999999" }}>
        {body}
      </p>
    </Shell>
  );
}

export default async function AgreementPage(props: PageProps<"/agreement/[token]">) {
  const { token } = await props.params;

  const row = await findAgreementByToken(token);
  // A bad token gets a plain 404, with no hint about whether it ever existed.
  if (!row) notFound();

  if (row.status === "void") {
    return (
      <Notice
        title="This agreement is no longer active."
        body="If you think this is a mistake, email team@callvia.io and we will sort it out."
      />
    );
  }

  if (isExpired(row.status, row.expires_at ? new Date(row.expires_at) : null)) {
    return (
      <Notice
        title="This link has expired."
        body="Agreement links are time-limited for security. Email team@callvia.io and we will send you a fresh one."
      />
    );
  }

  if (row.status === "active") {
    return (
      <Notice
        title="You are all set."
        body="This agreement is signed and paid. Your signed copy was emailed to you. Questions? Email team@callvia.io."
      />
    );
  }

  // Already signed: show the read-only state, never the sign form again.
  if (isSigned(row.status)) {
    const signedAt = row.signed_at
      ? new Date(row.signed_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      : "";
    return (
      <Shell>
        <PaymentPending token={token} signedName={row.signed_name ?? row.contact_name} signedAt={signedAt} />
      </Shell>
    );
  }

  // Rendered fresh from the database on every request. Nothing here comes from
  // the client, because this is what gets frozen as the signature snapshot.
  const doc = renderAgreement(row);

  const disclosure =
    row.monthly_cents > 0
      ? (recurringDisclosure(row.monthly_cents, row.setup_fee_cents) ?? "")
      : oneTimeDisclosure(row.setup_fee_cents);

  return (
    <Shell>
      <h1 className="text-4xl font-light tracking-tight mb-3" style={{ letterSpacing: "-0.025em" }}>
        {doc.title}
      </h1>
      <p className="text-sm mb-16" style={{ color: "#555555" }}>
        Prepared for {row.business_name} | Last updated {doc.lastUpdated}
      </p>

      <OrderSummary schedule={doc.schedule} />

      <AgreementBody sections={doc.sections} />

      <div className="mt-20 pt-16 border-t" style={{ borderColor: "#1f1f1f" }}>
        <h2 className="text-2xl font-light tracking-tight mb-10" style={{ letterSpacing: "-0.025em" }}>
          Sign
        </h2>
        <SignAgreement
          token={token}
          businessName={row.business_name}
          contactName={row.contact_name}
          email={row.email}
          disclosure={disclosure}
          hasPhone={row.phone !== null}
        />
      </div>
    </Shell>
  );
}
