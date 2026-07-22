// Send or re-send an agreement link to the client.
//
// Because only a hash of the token is stored, this issues a FRESH token every
// time and emails that. The previous link stops working, which is what you
// want if a link went to the wrong address.

import { requireAdmin } from "@/lib/require-admin";
import { sameOrigin } from "@/lib/parse";
import { formatCents } from "@/lib/money";
import { sendEmail, siteUrl, notifyAddress } from "@/lib/email";
import { findAgreementById, markSent, rotateToken } from "@/lib/agreement/queries";
import { isSigned } from "@/lib/agreement/status";

export const runtime = "nodejs";

export async function POST(request: Request, ctx: RouteContext<"/api/admin/agreements/[id]/send">) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!sameOrigin(request)) {
    return Response.json({ ok: false, error: "Bad origin" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const row = await findAgreementById(id);
  if (!row) return Response.json({ ok: false, error: "Not found" }, { status: 404 });
  if (row.status === "void") {
    return Response.json({ ok: false, error: "Agreement is void." }, { status: 409 });
  }

  const rawToken = await rotateToken(id);
  if (!rawToken) return Response.json({ ok: false, error: "Could not issue a link." }, { status: 409 });

  const url = `${siteUrl()}/agreement/${rawToken}`;
  const alreadySigned = isSigned(row.status);

  const dueToday = row.setup_fee_cents + row.monthly_cents;
  const priceLines = [
    row.setup_fee_cents > 0 ? `${row.setup_fee_label}: ${formatCents(row.setup_fee_cents)}` : null,
    row.monthly_cents > 0 ? `${row.monthly_label}: ${formatCents(row.monthly_cents)} per month` : null,
    `Due today: ${formatCents(dueToday)}`,
  ].filter(Boolean);

  const text = alreadySigned
    ? [
        `Hi ${row.contact_name},`,
        ``,
        `Thanks for signing your Callvia agreement. The last step is payment, and your service starts once it goes through.`,
        ``,
        ...priceLines,
        ``,
        `Complete payment here:`,
        url,
        ``,
        `Your signed copy is attached to the confirmation email you received, and is also available from the link above.`,
        ``,
        `Callvia`,
        `team@callvia.io`,
      ].join("\n")
    : [
        `Hi ${row.contact_name},`,
        ``,
        `Here is your Callvia service agreement for ${row.business_name}. It takes about two minutes: review the terms, sign, and complete payment on the same page.`,
        ``,
        `${row.package_name}`,
        ...priceLines,
        ``,
        `Review and sign here:`,
        url,
        ``,
        `This link is private, so please do not forward it. Questions? Just reply to this email.`,
        ``,
        `Callvia`,
        `team@callvia.io`,
      ].join("\n");

  const sent = await sendEmail({
    to: [row.email],
    replyTo: notifyAddress(),
    subject: alreadySigned
      ? `Complete your Callvia payment`
      : `Your Callvia service agreement for ${row.business_name}`,
    text,
  });

  if (!alreadySigned) await markSent(id, row.email);

  // The link is returned regardless so it can be copied and sent by hand if
  // email delivery is not configured yet.
  return Response.json({ ok: true, url, emailed: sent });
}
