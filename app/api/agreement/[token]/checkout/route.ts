// Creates (or reuses) the Stripe Checkout Session for a signed agreement.
//
// Only reachable once the agreement is signed. An unsigned agreement can never
// reach payment, which is the whole ordering guarantee: signature first, and
// durable, before any money moves.

import { siteUrl } from "@/lib/email";
import { findAgreementByToken, markCheckoutCreated } from "@/lib/agreement/queries";
import { isSigned } from "@/lib/agreement/status";
import { buildCheckoutParams, stripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(_request: Request, ctx: RouteContext<"/api/agreement/[token]/checkout">) {
  const { token } = await ctx.params;

  const row = await findAgreementByToken(token);
  if (!row) return Response.json({ ok: false, error: "Not found." }, { status: 404 });
  if (row.status === "void") {
    return Response.json({ ok: false, error: "This agreement is no longer active." }, { status: 409 });
  }
  if (!isSigned(row.status)) {
    return Response.json({ ok: false, error: "Sign the agreement first." }, { status: 409 });
  }
  if (row.status === "active") {
    return Response.json({ ok: false, error: "This agreement is already paid." }, { status: 409 });
  }
  // Belt and braces against a race producing a second subscription for the
  // same agreement, which would mean charging the client twice a month.
  if (row.stripe_subscription_id) {
    return Response.json({ ok: false, error: "A subscription already exists for this agreement." }, { status: 409 });
  }

  const s = stripe();

  // Reuse an open session rather than minting a second one. A client who
  // clicks twice, or comes back a day later, should land on the same checkout.
  if (row.stripe_checkout_session_id) {
    try {
      const existing = await s.checkout.sessions.retrieve(row.stripe_checkout_session_id);
      if (existing.status === "open" && existing.url) {
        return Response.json({ ok: true, url: existing.url });
      }
    } catch {
      // Session no longer retrievable (expired, or created against different
      // keys). Fall through and create a fresh one.
    }
  }

  const successUrl = `${siteUrl()}/agreement/${token}/complete?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${siteUrl()}/agreement/${token}`;

  // Bucketed by 10 minutes rather than fixed: a fixed key would make Stripe
  // replay the original (possibly expired) session for a full 24 hours, so a
  // client returning to pay the next day could never get a live checkout. The
  // bucket is still far wider than the double-click it exists to absorb.
  const bucket = Math.floor(Date.now() / 600_000);
  const session = await s.checkout.sessions.create(buildCheckoutParams(row, successUrl, cancelUrl), {
    idempotencyKey: `checkout:${row.id}:${bucket}`,
  });

  if (!session.url) {
    return Response.json({ ok: false, error: "Stripe did not return a checkout URL." }, { status: 502 });
  }

  await markCheckoutCreated(row.id, session.id);
  return Response.json({ ok: true, url: session.url });
}
