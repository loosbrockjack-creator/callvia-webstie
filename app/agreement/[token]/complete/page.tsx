import { notFound } from "next/navigation";
import { findAgreementByToken, markPaid } from "@/lib/agreement/queries";
import { idOf, stripe } from "@/lib/stripe";
import { formatCents } from "@/lib/money";
import { CompleteStatus } from "@/components/agreement/CompleteStatus";

export const metadata = {
  title: "Payment received | Callvia",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CompletePage(props: PageProps<"/agreement/[token]/complete">) {
  const { token } = await props.params;
  const { session_id: sessionId } = await props.searchParams;

  let row = await findAgreementByToken(token);
  if (!row) notFound();

  // Reconciliation safety net. The status shown here is read from OUR database,
  // never inferred from the fact that Stripe redirected here, because a success
  // URL can be forged or replayed. But if the webhook is merely slow or was
  // dropped, verify the session with Stripe directly and apply the same
  // idempotent markPaid() the webhook uses. The webhook stays authoritative;
  // this is just a second path into the same function.
  if (row.status === "payment_pending" && typeof sessionId === "string" && sessionId) {
    try {
      const session = await stripe().checkout.sessions.retrieve(sessionId);
      const paid = session.payment_status === "paid" || session.payment_status === "no_payment_required";
      const belongsToThis = session.client_reference_id === row.id;
      if (paid && belongsToThis) {
        await markPaid({
          agreementId: row.id,
          customerId: idOf(session.customer),
          subscriptionId: idOf(session.subscription),
          paymentIntentId: idOf(session.payment_intent),
          invoiceId: idOf(session.invoice),
          amountPaidCents: session.amount_total ?? null,
        });
        row = (await findAgreementByToken(token)) ?? row;
      }
    } catch (err) {
      console.error("Checkout reconciliation failed:", err);
    }
  }

  const active = row.status === "active";

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <p className="text-xs tracking-widest uppercase mb-12" style={{ color: "#555555" }}>
          Callvia
        </p>

        {active ? (
          <>
            <h1 className="text-4xl font-light tracking-tight mb-4" style={{ letterSpacing: "-0.025em" }}>
              You are all set.
            </h1>
            <p className="text-base leading-relaxed mb-10" style={{ color: "#999999" }}>
              Payment received and your Callvia service is active. Your signed agreement is in your
              inbox, and we will be in touch shortly to get you configured.
            </p>
            {row.monthly_cents > 0 && (
              <p className="text-sm leading-relaxed mb-10" style={{ color: "#555555" }}>
                You will be charged {formatCents(row.monthly_cents)} per month from today,
                automatically, until you cancel. Cancel any time by emailing team@callvia.io.
              </p>
            )}
            <a
              href={`/api/agreement/${token}/pdf`}
              className="text-sm transition-colors duration-200 hover:text-white underline underline-offset-4"
              style={{ color: "#999999" }}
            >
              Download your signed agreement
            </a>
          </>
        ) : (
          <CompleteStatus token={token} />
        )}
      </div>
    </main>
  );
}
