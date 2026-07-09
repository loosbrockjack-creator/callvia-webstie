// Onboarding form submissions: emailed to team@callvia.io via the Resend REST API.
// Requires RESEND_API_KEY in env. Optionally RESEND_FROM for a verified sender
// (defaults to Resend's sandbox sender, which only delivers to the account owner).
//
// Policy: this route NEVER blocks the Stripe payment redirect. If the email send
// fails, the full payload is logged (recoverable in Vercel function logs) and the
// route still returns ok.

const NOTIFY_TO = "team@callvia.io";

// Keep in sync with the checkbox copy in components/OnboardingForm.tsx.
// Included in the notification email as a TCR/TCPA consent audit trail.
const SMS_CONSENT_TEXT =
  "I consent to receive SMS text messages from Callvia at the phone number provided above. Message frequency varies. Message & data rates may apply. Reply STOP to opt out at any time, reply HELP for help.";

interface Submission {
  fullName: string;
  email: string;
  phone: string;
  business: string;
  agreedToServiceAgreement: boolean;
  smsConsent: boolean;
}

function parseSubmission(body: unknown): Submission | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;
  const fullName = typeof b.fullName === "string" ? b.fullName.trim() : "";
  const email = typeof b.email === "string" ? b.email.trim() : "";
  const phone = typeof b.phone === "string" ? b.phone.replace(/\D/g, "") : "";
  const business = typeof b.business === "string" ? b.business.trim() : "";
  // SMS consent is explicitly NOT required. Only the service agreement is.
  if (!fullName || !email || !business || phone.length !== 10 || b.agreedToServiceAgreement !== true) {
    return null;
  }
  return {
    fullName,
    email,
    phone,
    business,
    agreedToServiceAgreement: true,
    smsConsent: b.smsConsent === true,
  };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const sub = parseSubmission(body);
  if (!sub) {
    return Response.json({ ok: false, error: "Missing or invalid fields." }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const timestamp = new Date().toISOString();

  const record = { ...sub, timestamp, ip, smsConsentTextShown: SMS_CONSENT_TEXT };

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("ONBOARDING SUBMISSION (RESEND_API_KEY not set, delivery skipped):", JSON.stringify(record));
    return Response.json({ ok: true });
  }

  const text = [
    `New Callvia onboarding submission`,
    ``,
    `Full name:      ${sub.fullName}`,
    `Email:          ${sub.email}`,
    `Phone:          ${sub.phone}`,
    `Business:       ${sub.business}`,
    ``,
    `Service Agreement accepted: yes`,
    `SMS consent:    ${sub.smsConsent ? "YES" : "no"}`,
    ``,
    `--- Consent audit trail ---`,
    `Timestamp (UTC): ${timestamp}`,
    `Requester IP:    ${ip}`,
    `Consent text shown to user:`,
    SMS_CONSENT_TEXT,
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM ?? "Callvia Onboarding <onboarding@resend.dev>",
        to: [NOTIFY_TO],
        subject: `New Callvia onboarding: ${sub.business}`,
        text,
      }),
    });
    if (!res.ok) {
      console.error("ONBOARDING SUBMISSION (Resend send failed):", res.status, await res.text(), JSON.stringify(record));
    }
  } catch (err) {
    console.error("ONBOARDING SUBMISSION (Resend request threw):", err, JSON.stringify(record));
  }

  return Response.json({ ok: true });
}
