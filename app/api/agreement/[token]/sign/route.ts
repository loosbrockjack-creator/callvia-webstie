// Records a signature. This is the single most important route in the system.
//
// Before responding it must, durably:
//   1. compare-and-swap the row to `signed`, writing the audit fields and the
//      frozen snapshot
//   2. generate the PDF and store the bytes
// Only then are the emails sent, via after(), because an email failure must
// never cost a signature. That extends the policy the existing onboarding
// route already established.

import { after } from "next/server";
import { asBool, asString, clientIp, isEmail, readJson, userAgent } from "@/lib/parse";
import { formatCents } from "@/lib/money";
import { notifyAddress, sendEmail } from "@/lib/email";
import {
  AUTHORITY_ACK_TEXT,
  ESIGN_CONSENT_TEXT,
  INTENT_TO_SIGN_TEXT,
  SMS_CONSENT_TEXT,
  oneTimeDisclosure,
  recurringDisclosure,
} from "@/lib/agreement/consent";
import {
  attachPdf,
  findAgreementByToken,
  markPdfEmailed,
  signAgreement,
} from "@/lib/agreement/queries";
import { renderAgreement } from "@/lib/agreement/render";
import { isExpired, isSigned } from "@/lib/agreement/status";
import { renderAgreementPdf } from "@/lib/pdf/renderAgreementPdf";

export const runtime = "nodejs";
// PDF generation is 50-150ms, but a cold start plus a Neon resume plus Resend
// needs headroom.
export const maxDuration = 30;

export async function POST(request: Request, ctx: RouteContext<"/api/agreement/[token]/sign">) {
  const { token } = await ctx.params;

  const row = await findAgreementByToken(token);
  if (!row) return Response.json({ ok: false, error: "Not found." }, { status: 404 });

  if (row.status === "void") {
    return Response.json({ ok: false, error: "This agreement is no longer active." }, { status: 409 });
  }
  if (isSigned(row.status)) {
    // A double-clicked submit lands here. Report the existing state rather than
    // an error, so the client can proceed straight to checkout.
    return Response.json({ ok: true, alreadySigned: true });
  }
  if (isExpired(row.status, row.expires_at ? new Date(row.expires_at) : null)) {
    return Response.json({ ok: false, error: "This link has expired." }, { status: 410 });
  }

  const body = await readJson(request);
  if (!body) return Response.json({ ok: false, error: "Invalid body." }, { status: 400 });

  const typedName = asString(body.typedName);
  const signerEmail = asString(body.email) || row.email;
  const title = asString(body.title) || null;
  const esignConsent = asBool(body.esignConsent);
  const authorityAck = asBool(body.authorityAck);
  const smsConsent = asBool(body.smsConsent);

  if (typedName.length < 2) {
    return Response.json({ ok: false, error: "Please type your full name to sign." }, { status: 400 });
  }
  if (!isEmail(signerEmail)) {
    return Response.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  }
  // Both are affirmative acts required for a defensible signature, so they gate
  // submission. SMS consent deliberately does not.
  if (!esignConsent || !authorityAck) {
    return Response.json(
      { ok: false, error: "Please confirm both checkboxes before signing." },
      { status: 400 },
    );
  }

  // Rebuilt from the database, never from the request. This is what gets frozen.
  const doc = renderAgreement(row);
  const authorityText = AUTHORITY_ACK_TEXT.replace("the business named above", row.business_name);

  const signed = await signAgreement({
    agreementId: row.id,
    snapshot: doc,
    signedName: typedName,
    signedEmail: signerEmail,
    signedTitle: title,
    ip: clientIp(request),
    userAgent: userAgent(request),
    intentText: `${INTENT_TO_SIGN_TEXT} ${authorityText}`,
    authorityAck,
    esignConsent,
    esignConsentText: ESIGN_CONSENT_TEXT,
    smsConsent,
    smsConsentText: smsConsent ? SMS_CONSENT_TEXT : "",
  });

  // Zero rows from the guarded update: someone else signed it first.
  if (!signed) return Response.json({ ok: true, alreadySigned: true });

  const pdfBytes = await renderAgreementPdf(doc, {
    signedName: signed.signed_name ?? typedName,
    signedEmail: signerEmail,
    signedTitle: title,
    signedAt: new Date(signed.signed_at ?? Date.now()),
    ip: signed.signed_ip,
    userAgent: signed.signed_user_agent,
    intentText: signed.signed_intent_text ?? INTENT_TO_SIGN_TEXT,
    esignConsentText: ESIGN_CONSENT_TEXT,
    authorityAck,
    smsConsent,
    smsConsentText: smsConsent ? SMS_CONSENT_TEXT : null,
    snapshotSha256: signed.snapshot_sha256 ?? "",
    agreementId: signed.id,
    tokenLast4: signed.token_last4,
  });

  await attachPdf(signed.id, pdfBytes);

  const base64 = Buffer.from(pdfBytes).toString("base64");
  const filename = `Callvia-Service-Agreement-${row.business_name.replace(/[^a-zA-Z0-9]+/g, "-")}.pdf`;
  const disclosure =
    row.monthly_cents > 0
      ? (recurringDisclosure(row.monthly_cents, row.setup_fee_cents) ?? "")
      : oneTimeDisclosure(row.setup_fee_cents);

  // Side effects only past this point. after() runs them once the response has
  // been sent, so a slow or failing Resend call cannot break signing.
  after(async () => {
    const clientMail = await sendEmail({
      to: [signerEmail],
      replyTo: notifyAddress(),
      subject: `Your signed Callvia agreement`,
      text: [
        `Hi ${typedName.split(" ")[0]},`,
        ``,
        `Thanks for signing. Your countersigned agreement is attached for your records.`,
        ``,
        disclosure,
        ``,
        `Your plan: ${row.package_name}`,
        row.setup_fee_cents > 0 ? `${row.setup_fee_label}: ${formatCents(row.setup_fee_cents)}` : "",
        row.monthly_cents > 0 ? `${row.monthly_label}: ${formatCents(row.monthly_cents)} per month` : "",
        ``,
        `Your service starts as soon as your first payment goes through. If you closed the payment page, you can reopen your agreement link to finish.`,
        ``,
        `Questions? Just reply to this email.`,
        ``,
        `Callvia`,
        `team@callvia.io`,
      ]
        .filter((line) => line !== "")
        .join("\n"),
      attachments: [{ filename, content: base64 }],
    });

    await sendEmail({
      to: [notifyAddress()],
      subject: `SIGNED: ${row.business_name} (${formatCents(row.setup_fee_cents + row.monthly_cents)} due)`,
      text: [
        `${row.business_name} signed their agreement.`,
        ``,
        `Signed by:  ${typedName}${title ? `, ${title}` : ""}`,
        `Email:      ${signerEmail}`,
        `Package:    ${row.package_name}`,
        `Setup fee:  ${formatCents(row.setup_fee_cents)}`,
        `Monthly:    ${formatCents(row.monthly_cents)}`,
        ``,
        `--- Audit ---`,
        `Timestamp:  ${signed.signed_at}`,
        `IP:         ${signed.signed_ip ?? "not recorded"}`,
        `User agent: ${signed.signed_user_agent ?? "not recorded"}`,
        `Doc hash:   ${signed.snapshot_sha256}`,
        `SMS consent: ${smsConsent ? "YES" : "no"}`,
        ``,
        `Payment is NOT yet confirmed. Watch the dashboard.`,
      ].join("\n"),
      attachments: [{ filename, content: base64 }],
    });

    if (clientMail) await markPdfEmailed(signed.id);
  });

  return Response.json({ ok: true });
}
