// Contact-form submissions, emailed to team@callvia.io via Resend.
//
// Same policy as the rest of the site's mail: this route is best-effort. A send
// failure is logged with the full payload (recoverable from Vercel function
// logs) and still reported to the sender so the form can degrade to the direct
// email address shown beside it.

import { asString, isEmail, readJson, sameOrigin } from "@/lib/parse";
import { notifyAddress, sendEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return Response.json({ ok: false, error: "Invalid origin." }, { status: 403 });
  }

  const body = await readJson(request);
  if (!body) return Response.json({ ok: false, error: "Invalid body." }, { status: 400 });

  const name = asString(body.name);
  const email = asString(body.email);
  const business = asString(body.business);
  const message = asString(body.message);

  if (name.length < 2 || !isEmail(email) || message.length < 5) {
    return Response.json({ ok: false, error: "Please fill in the required fields." }, { status: 400 });
  }

  const ok = await sendEmail({
    to: [notifyAddress()],
    replyTo: email,
    subject: `New contact form: ${name}${business ? ` (${business})` : ""}`,
    text: [
      `New message from the Callvia contact form.`,
      ``,
      `Name:     ${name}`,
      `Email:    ${email}`,
      business ? `Business: ${business}` : "",
      ``,
      `Message:`,
      message,
    ]
      .filter((line) => line !== "")
      .join("\n"),
  });

  if (!ok) {
    console.error("CONTACT FORM (delivery failed):", JSON.stringify({ name, email, business, message }));
  }

  // Always ok: the message is captured in logs even if delivery failed, and the
  // sender should not see a scary error for a best-effort notification.
  return Response.json({ ok: true });
}
