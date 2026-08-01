// Resend an onboarding form.
//
// Rotates the token first, which kills the previous link. Same trade-off as
// resending an agreement: the old link may have been forwarded, and there is no
// way to know, so the safe move is to invalidate it.

import { requireAdmin } from "@/lib/require-admin";
import { sameOrigin } from "@/lib/parse";
import { notifyAddress, sendEmail, siteUrl } from "@/lib/email";
import {
  findOnboardingById,
  markOnboardingSent,
  rotateOnboardingToken,
} from "@/lib/onboarding/queries";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!sameOrigin(request)) {
    return Response.json({ ok: false, error: "Bad origin" }, { status: 403 });
  }

  const { id } = await params;
  const row = await findOnboardingById(id);
  if (!row) return Response.json({ ok: false, error: "Not found." }, { status: 404 });

  if (row.status === "submitted") {
    return Response.json(
      { ok: false, error: "That form has already been submitted." },
      { status: 409 },
    );
  }
  if (row.status === "void") {
    return Response.json({ ok: false, error: "That form is void." }, { status: 409 });
  }

  const rawToken = await rotateOnboardingToken(id);
  if (!rawToken) {
    return Response.json({ ok: false, error: "Could not issue a new link." }, { status: 409 });
  }

  const url = `${siteUrl()}/onboarding/${rawToken}`;
  const firstName = row.contact_name?.trim().split(" ")[0];

  const emailed = await sendEmail({
    to: [row.email],
    replyTo: notifyAddress(),
    subject: `Your Callvia setup form`,
    text: [
      firstName ? `Hi ${firstName},` : `Hi,`,
      ``,
      `Here is your setup form again. It takes about three minutes, and it is what we use to build your receptionist.`,
      ``,
      url,
      ``,
      `Note that this replaces any earlier link, so please use this one. Questions? Just reply to this email.`,
      ``,
      `Callvia`,
      `team@callvia.io`,
    ].join("\n"),
  });

  await markOnboardingSent(id, row.email);

  return Response.json({ ok: true, url, emailed });
}
