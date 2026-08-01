// Create and send an onboarding form. Admin only.

import { requireAdmin } from "@/lib/require-admin";
import { asString, isEmail, readJson, sameOrigin } from "@/lib/parse";
import { notifyAddress, sendEmail, siteUrl } from "@/lib/email";
import {
  createOnboarding,
  listOnboarding,
  markOnboardingSent,
} from "@/lib/onboarding/queries";

export const runtime = "nodejs";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  return Response.json({ ok: true, forms: await listOnboarding() });
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!sameOrigin(request)) {
    return Response.json({ ok: false, error: "Bad origin" }, { status: 403 });
  }

  const body = await readJson(request);
  if (!body) return Response.json({ ok: false, error: "Invalid body." }, { status: 400 });

  const email = asString(body.email);
  const businessName = asString(body.businessName) || null;
  const contactName = asString(body.contactName) || null;
  const sendNow = body.sendNow !== false;

  if (!isEmail(email)) {
    return Response.json({ ok: false, error: "A valid email is required." }, { status: 400 });
  }

  // createOnboarding links to a client record when the email matches one, and
  // leaves it null otherwise. A form can go out before anything is signed.
  const { id, rawToken } = await createOnboarding({
    businessName,
    contactName,
    email,
    expiresInDays: 60,
  });

  const url = `${siteUrl()}/onboarding/${rawToken}`;

  if (!sendNow) {
    return Response.json({ ok: true, id, url, emailed: false });
  }

  const emailed = await sendEmail({
    to: [email],
    replyTo: notifyAddress(),
    subject: `Let's set up your Callvia receptionist`,
    text: [
      contactName ? `Hi ${contactName.split(" ")[0]},` : `Hi,`,
      ``,
      `Great news, we're ready to start building your receptionist.`,
      ``,
      `Before we can, we need to know how you want your calls handled. The form below takes about three minutes and covers your hours, your service area, what your receptionist should ask callers, and where you want your call summaries sent.`,
      ``,
      `Fill it out here:`,
      url,
      ``,
      `This link is private, so please do not forward it. Questions? Just reply to this email.`,
      ``,
      `Callvia`,
      `team@callvia.io`,
    ].join("\n"),
  });

  await markOnboardingSent(id, email);

  // The raw token is returned exactly once and cannot be recovered, so the
  // admin gets the link back even when the email failed.
  return Response.json({ ok: true, id, url, emailed });
}
