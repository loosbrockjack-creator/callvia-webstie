// Email via the Resend REST API, generalizing the raw-fetch pattern already
// used in app/api/leads/route.ts. No SDK.
//
// Policy carried over from the existing routes: a send failure never fails the
// caller's operation. It logs the full payload (recoverable from Vercel
// function logs) and reports false. A signature must never be lost because an
// email bounced. The admin dashboard surfaces any agreement whose PDF was
// never emailed, so a silent failure stays visible.

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export function notifyAddress(): string {
  return process.env.CALLVIA_NOTIFY_EMAIL ?? "team@callvia.io";
}

export function fromAddress(): string {
  // The resend.dev sandbox sender only delivers to the account owner, so a
  // verified domain sender is required before any client-facing mail works.
  return process.env.RESEND_FROM ?? "Callvia <onboarding@resend.dev>";
}

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://callvia.io";
}

export interface Attachment {
  filename: string;
  content: string; // base64
}

export interface SendInput {
  to: string[];
  subject: string;
  text: string;
  replyTo?: string;
  attachments?: Attachment[];
}

export async function sendEmail(input: SendInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("EMAIL NOT SENT (RESEND_API_KEY not set):", JSON.stringify({ ...input, attachments: undefined }));
    return false;
  }
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: fromAddress(),
        to: input.to,
        subject: input.subject,
        text: input.text,
        reply_to: input.replyTo,
        attachments: input.attachments,
      }),
    });
    if (!res.ok) {
      console.error("EMAIL SEND FAILED:", res.status, await res.text(), input.subject, input.to);
      return false;
    }
    return true;
  } catch (err) {
    console.error("EMAIL SEND THREW:", err, input.subject, input.to);
    return false;
  }
}
