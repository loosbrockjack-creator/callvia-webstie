// Authenticated client opens the Stripe-hosted Billing Portal to change their
// card, view invoices, or cancel. Same Stripe call the old email-a-link flow
// made, but the client is already logged in so we redirect them straight there.

import { requireClient } from "@/lib/require-client";
import { sameOrigin } from "@/lib/parse";
import { getClientById } from "@/lib/clients/queries";
import { stripe } from "@/lib/stripe";
import { siteUrl } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return Response.json({ ok: false, error: "Invalid origin." }, { status: 403 });
  }

  const auth = await requireClient();
  if (auth instanceof Response) return auth;

  const client = await getClientById(auth.clientId);
  if (!client?.stripe_customer_id) {
    return Response.json(
      { ok: false, error: "Billing is not set up on your account yet." },
      { status: 400 },
    );
  }

  try {
    const session = await stripe().billingPortal.sessions.create({
      customer: client.stripe_customer_id,
      return_url: `${siteUrl()}/account`,
    });
    return Response.json({ ok: true, url: session.url });
  } catch (err) {
    console.error("ACCOUNT billing-portal error:", err);
    return Response.json({ ok: false, error: "Could not open billing. Try again." }, { status: 500 });
  }
}
