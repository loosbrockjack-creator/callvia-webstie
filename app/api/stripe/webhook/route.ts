// Stripe webhook. This is the ONLY authoritative source of payment status:
// an agreement can never reach `active` from a browser request, because a
// success redirect can be forged, replayed, or bookmarked.
//
// Deliberately outside the proxy.ts matcher. It authenticates with a Stripe
// signature over the raw body, so nothing may touch the request first.

import type Stripe from "stripe";
import { after } from "next/server";
import { formatCents } from "@/lib/money";
import { notifyAddress, sendEmail } from "@/lib/email";
import { stripe, idOf } from "@/lib/stripe";
import {
  claimStripeEvent,
  findAgreementById,
  finishStripeEvent,
  markPaid,
  releaseStripeEvent,
  revertToSigned,
  setSubscriptionStatus,
} from "@/lib/agreement/queries";

export const runtime = "nodejs";
export const maxDuration = 30;

function agreementIdOf(session: Stripe.Checkout.Session): string | null {
  return session.client_reference_id ?? session.metadata?.agreement_id ?? null;
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set; refusing to process webhooks.");
    return new Response("Not configured", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  // The RAW body is required. Parsing it first would change the bytes the
  // signature was computed over and every event would fail verification.
  const raw = await request.text();

  let event: Stripe.Event;
  try {
    event = await stripe().webhooks.constructEventAsync(raw, signature, secret);
  } catch (err) {
    console.error("Stripe signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  // Idempotency ledger first. Stripe retries, and events can arrive twice.
  const claimed = await claimStripeEvent(event.id, event.type, event.livemode, event);
  if (!claimed) return Response.json({ received: true, duplicate: true });

  try {
    await handleEvent(event);
    await finishStripeEvent(event.id);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Stripe webhook handler failed:", event.type, event.id, message);
    // Release the claim before returning 500, otherwise Stripe's retry would be
    // rejected as a duplicate and the event would be lost for good.
    await releaseStripeEvent(event.id, event.type, event.livemode, event, message).catch((e) =>
      console.error("Could not release stripe event claim:", e),
    );
    return new Response("Handler error", { status: 500 });
  }

  return Response.json({ received: true });
}

async function handleEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") return;

      const agreementId = agreementIdOf(session);
      if (!agreementId) {
        // `stripe trigger` fires synthetic sessions with no reference. Nothing
        // to reconcile, and not an error worth retrying.
        console.warn("checkout.session.completed with no agreement reference:", session.id);
        return;
      }

      const applied = await markPaid({
        agreementId,
        customerId: idOf(session.customer),
        subscriptionId: idOf(session.subscription),
        paymentIntentId: idOf(session.payment_intent),
        invoiceId: idOf(session.invoice),
        amountPaidCents: session.amount_total ?? null,
      });
      if (!applied) return; // already active

      const row = await findAgreementById(agreementId);
      if (!row) return;

      after(async () => {
        await sendEmail({
          to: [row.email],
          replyTo: notifyAddress(),
          subject: "Payment received, your Callvia service is active",
          text: [
            `Hi ${row.contact_name.split(" ")[0]},`,
            ``,
            `Your payment went through and your Callvia service is now active.`,
            ``,
            row.monthly_cents > 0
              ? `You will be charged ${formatCents(row.monthly_cents)} per month from today, automatically, until you cancel. You can cancel at any time by emailing team@callvia.io, effective at the end of your current billing cycle.`
              : `This was a one-time charge of ${formatCents(row.setup_fee_cents)}. There is no recurring billing on your plan.`,
            ``,
            `Your signed agreement was emailed to you separately and is yours to keep.`,
            ``,
            `We will be in touch shortly to get you set up.`,
            ``,
            `Callvia`,
            `team@callvia.io`,
          ].join("\n"),
        });

        await sendEmail({
          to: [notifyAddress()],
          subject: `PAID: ${row.business_name} (${formatCents(session.amount_total ?? 0)})`,
          text: [
            `${row.business_name} has paid.`,
            ``,
            `Amount:       ${formatCents(session.amount_total ?? 0)}`,
            `Package:      ${row.package_name}`,
            `Monthly:      ${formatCents(row.monthly_cents)}`,
            `Customer:     ${idOf(session.customer) ?? "n/a"}`,
            `Subscription: ${idOf(session.subscription) ?? "n/a"}`,
            `Agreement:    ${row.id}`,
          ].join("\n"),
        });
      });
      return;
    }

    // Stripe expires open sessions after 24h. The agreement stays signed and
    // binding; only the payment attempt is discarded. This is the one
    // permitted backward transition.
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const agreementId = agreementIdOf(session);
      if (agreementId) await revertToSigned(agreementId, "Stripe checkout session expired");
      return;
    }

    case "checkout.session.async_payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const agreementId = agreementIdOf(session);
      if (agreementId) await revertToSigned(agreementId, "Payment failed");
      return;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await setSubscriptionStatus(sub.id, event.type === "customer.subscription.deleted" ? "canceled" : sub.status);
      return;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string | { id: string } | null };
      const subId = idOf(invoice.subscription ?? null);
      if (subId) await setSubscriptionStatus(subId, "past_due");

      after(async () => {
        await sendEmail({
          to: [notifyAddress()],
          subject: `PAYMENT FAILED: ${invoice.customer_email ?? "unknown customer"}`,
          text: [
            `A recurring payment failed.`,
            ``,
            `Customer: ${invoice.customer_email ?? "unknown"}`,
            `Amount:   ${formatCents(invoice.amount_due ?? 0)}`,
            `Invoice:  ${invoice.id}`,
            `Sub:      ${subId ?? "n/a"}`,
            ``,
            `Stripe will retry according to your dunning settings.`,
          ].join("\n"),
        });
      });
      return;
    }

    default:
      return;
  }
}
