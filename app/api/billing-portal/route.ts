// Client "login": emails a secure Stripe billing portal link to the address on
// file. Deliberately does NOT redirect the browser straight into the portal on
// email entry, which would let anyone who knows a client's email manage that
// client's subscription. Only the owner of the inbox receives the link.
//
// The response is always a generic success, whether or not the email matches a
// paying client, so this endpoint cannot be used to enumerate customers.

import { asString, isEmail, readJson, sameOrigin } from "@/lib/parse";
import { findBillingCustomerByEmail } from "@/lib/agreement/queries";
import { sendEmail, siteUrl } from "@/lib/email";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return Response.json({ ok: false, error: "Invalid origin." }, { status: 403 });
  }

  const body = await readJson(request);
  const email = asString(body?.email);
  if (!isEmail(email)) {
    return Response.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  }

  try {
    const found = await findBillingCustomerByEmail(email);
    if (found) {
      const session = await stripe().billingPortal.sessions.create({
        customer: found.customerId,
        return_url: `${siteUrl()}/`,
      });
      await sendEmail({
        to: [email],
        subject: "Manage your Callvia billing",
        text: [
          `Hi,`,
          ``,
          `Here is your secure link to manage billing for ${found.businessName}. Use it to update your payment method, view invoices, or cancel your plan:`,
          ``,
          session.url,
          ``,
          `This link is personal to your account. If you did not request it, you can ignore this email.`,
          ``,
          `Callvia`,
          `team@callvia.io`,
        ].join("\n"),
      });
    }
  } catch (err) {
    // Log and fall through to the generic response. A misconfigured Stripe
    // portal or a mail failure must not reveal whether the email matched.
    console.error("BILLING PORTAL error:", err);
  }

  return Response.json({ ok: true });
}
