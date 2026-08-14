import { notFound } from "next/navigation";
import { findAgreementByToken } from "@/lib/agreement/queries";
import { formatTrialDate, renderAgreement } from "@/lib/agreement/render";
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
    <main className="min-h-[100dvh] bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
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
      <p className="text-base leading-relaxed text-muted">
        {body}
      </p>
    </Shell>
  );
}

// A signed trial is a completed transaction, not a pending one. The PDF link
// stays live indefinitely: ESIGN requires the signer be able to retain what
// they signed, and the token is the credential for it.
function TrialSigned({
  token,
  signedAt,
  startsOn,
  endsOn,
}: {
  token: string;
  signedAt: string;
  startsOn: string | null;
  endsOn: string | null;
}) {
  return (
    <div>
      <div
        className="mb-8 flex h-14 w-14 items-center justify-center rounded-full border"
        style={{ borderColor: "rgba(124,92,252,0.35)", background: "rgba(124,92,252,0.1)" }}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
          <path
            d="M5 11.5l4 4 8-8.5"
            stroke="#9b7ffd"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h1 className="mb-4 text-3xl font-light tracking-tight" style={{ letterSpacing: "-0.025em" }}>
        Your trial is set.
      </h1>
      <p className="text-base leading-relaxed text-muted">
        Signed {signedAt}. A copy has been emailed to you.
        {startsOn && endsOn && (
          <>
            {" "}
            Your trial runs {formatTrialDate(startsOn)} through {formatTrialDate(endsOn)}.
          </>
        )}
      </p>
      <p className="mt-4 text-base leading-relaxed text-muted">
        There is nothing to pay and no card on file. We will be in touch shortly to get your
        receptionist built and your calls forwarded.
      </p>

      <a
        href={`/api/agreement/${token}/pdf`}
        className="mt-10 inline-block text-sm underline underline-offset-4 transition-colors duration-200 hover:text-white text-muted"
      >
        Download your signed copy
      </a>
    </div>
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

  const isTrial = row.kind === "trial";

  // Already signed: show the read-only state, never the sign form again.
  if (isSigned(row.status)) {
    const signedAt = row.signed_at
      ? new Date(row.signed_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      : "";

    // A signed trial is finished. There is no payment step to chase, so it gets
    // a confirmation rather than the PaymentPending prompt.
    if (isTrial) {
      return (
        <Shell>
          <TrialSigned
            token={token}
            signedAt={signedAt}
            startsOn={row.trial_starts_on}
            endsOn={row.trial_ends_on}
          />
        </Shell>
      );
    }

    return (
      <Shell>
        <PaymentPending token={token} signedName={row.signed_name ?? row.contact_name} signedAt={signedAt} />
      </Shell>
    );
  }

  // Rendered fresh from the database on every request. Nothing here comes from
  // the client, because this is what gets frozen as the signature snapshot.
  const doc = renderAgreement(row);

  // A trial has no charge, so there is nothing for an automatic-renewal
  // disclosure to disclose. Showing one would be actively misleading.
  const disclosure = isTrial
    ? ""
    : row.monthly_cents > 0
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
          isTrial={isTrial}
        />
      </div>
    </Shell>
  );
}
