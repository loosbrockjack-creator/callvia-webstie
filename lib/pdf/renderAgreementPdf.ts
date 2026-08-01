// Generates the signed PDF: the contract, Schedule A, the signature block, and
// an audit page.
//
// This is produced at SIGNATURE, not at payment. If a client signs and then
// abandons checkout you have a binding contract, and you need the document for
// it. It is also what lets the signer retain a copy of what they signed, which
// ESIGN requires.
//
// The document is immutable once written. Payment status deliberately does not
// appear in it: adding it later would mean regenerating the artifact, and an
// artifact that can change is not evidence.

import { PDFDocument } from "pdf-lib";
import { formatCents } from "../money";
import { formatTrialDate } from "../agreement/render";
import { Cursor, GREY, drawFooters, loadFonts } from "./layout";
import type { RenderedAgreement } from "../agreement/types";

export interface SignatureRecord {
  signedName: string;
  signedEmail: string;
  signedTitle: string | null;
  signedAt: Date;
  ip: string | null;
  userAgent: string | null;
  intentText: string;
  esignConsentText: string;
  authorityAck: boolean;
  smsConsent: boolean;
  smsConsentText: string | null;
  snapshotSha256: string;
  agreementId: string;
  tokenLast4: string;
}

function utc(d: Date): string {
  return `${d.toISOString().replace("T", " ").replace(/\.\d+Z$/, "")} UTC`;
}

export async function renderAgreementPdf(
  doc: RenderedAgreement,
  sig: SignatureRecord,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const fonts = await loadFonts(pdf);
  const c = new Cursor(pdf, fonts);

  pdf.setTitle(`${doc.title} - ${doc.party.businessName}`);
  pdf.setAuthor("Callvia");
  pdf.setSubject("Executed service agreement");
  pdf.setProducer("Callvia");
  pdf.setCreationDate(sig.signedAt);

  // Header
  c.text("CALLVIA", { size: 8, bold: true, color: GREY });
  c.space(6);
  c.text(doc.title, { size: 20, bold: true });
  c.space(4);
  c.text(`Prepared for ${doc.party.businessName}`, { size: 10, color: GREY });
  c.text(`Template version ${doc.templateVersion}, last updated ${doc.lastUpdated}`, {
    size: 8,
    color: GREY,
  });
  c.rule();
  c.space(6);

  // Contract body
  for (const section of doc.sections) {
    if (section.heading) {
      c.reserve(60);
      c.space(8);
      c.text(section.heading, { size: 11, bold: true });
      c.space(3);
    }
    for (const block of section.blocks) {
      if (block.kind === "p") {
        c.text(block.text);
        c.space(5);
      } else if (block.kind === "callout") {
        c.text(block.text, { bold: true });
        c.space(5);
      } else {
        for (const item of block.items) {
          c.text(`- ${item}`, { indent: 10 });
          c.space(2);
        }
        c.space(4);
      }
    }
  }

  // Schedule A
  c.newPage();
  const s = doc.schedule;
  const trial = s.trial;

  c.text("SCHEDULE A", { size: 8, bold: true, color: GREY });
  c.space(6);
  c.text(trial ? "Trial Scope and Term" : "Scope of Services and Fees", { size: 16, bold: true });
  c.rule();
  c.space(4);
  c.text(s.packageName, { size: 12, bold: true });
  c.space(3);
  if (s.packageSummary) {
    c.text(s.packageSummary, { color: GREY });
    c.space(8);
  }

  if (s.includedItems.length > 0) {
    c.text("Included", { size: 10, bold: true });
    c.space(4);
    for (const item of s.includedItems) {
      c.text(`- ${item}`, { indent: 10 });
      c.space(2);
    }
    c.space(8);
  }

  if (s.usageTerms) {
    c.text("Usage", { size: 10, bold: true });
    c.space(4);
    c.text(
      `Includes ${s.usageTerms.includedMinutes.toLocaleString("en-US")} minutes per month. Additional usage is billed at ${formatCents(s.usageTerms.overageCentsPerMinute)} per minute.`,
      { indent: 10 },
    );
    c.space(8);
  }

  if (trial) {
    // A trial exhibit states the term and the absence of any charge. It must
    // never print a fee row, a "Due at signing" line, or a recurring-charge
    // disclosure, because none of those are true of a trial and a document
    // implying otherwise is the whole risk being avoided by keeping Stripe out.
    c.text("Term", { size: 10, bold: true });
    c.space(8);
    c.feeRow("Trial begins", formatTrialDate(trial.startsOn));
    c.feeRow("Trial ends", formatTrialDate(trial.endsOn));
    c.feeRow("Length", `${trial.days} days`);
    c.thinRule();
    c.feeRow("Due at signing", "No charge", { emphasize: true });
    c.space(6);
    c.text(
      "No payment method is collected and no charge arises from this Agreement. Continuing after the trial requires a separate signed agreement.",
      { size: 9, bold: true },
    );
  } else {
    c.text("Fees", { size: 10, bold: true });
    c.space(8);
    if (s.setupFeeCents > 0) c.feeRow(s.setupFeeLabel, formatCents(s.setupFeeCents));
    if (s.monthlyCents > 0) c.feeRow(s.monthlyLabel, `${formatCents(s.monthlyCents)} per month`);
    c.thinRule();
    c.feeRow("Due at signing", formatCents(s.dueTodayCents), { emphasize: true });
    if (s.monthlyCents > 0) {
      c.space(6);
      c.text(
        `Recurring charge: ${formatCents(s.monthlyCents)} per month, beginning on the date of first payment, continuing automatically until cancelled.`,
        { size: 9, bold: true },
      );
    }
  }

  // Signature block, kept whole on one page.
  c.space(16);
  c.reserve(230);
  c.rule();
  c.text("SIGNATURE", { size: 8, bold: true, color: GREY });
  c.space(8);

  c.keyValue("Signed by", sig.signedName);
  if (sig.signedTitle) c.keyValue("Title", sig.signedTitle);
  c.keyValue("On behalf of", doc.party.businessName);
  c.keyValue("Email", sig.signedEmail);
  c.keyValue("Signature Date", utc(sig.signedAt));
  c.space(6);
  c.text(sig.intentText, { size: 9, color: GREY });
  c.space(4);
  c.text("Callvia | team@callvia.io | callvia.io", { size: 9, color: GREY });

  // Audit page. This is the part that makes the signature defensible.
  c.newPage();
  c.text("SIGNATURE AUDIT RECORD", { size: 8, bold: true, color: GREY });
  c.space(6);
  c.text("Electronic Signature Certificate", { size: 16, bold: true });
  c.space(4);
  c.text(
    "This record is generated automatically by Callvia and documents the electronic signature applied to the agreement in this document, in accordance with the U.S. Electronic Signatures in Global and National Commerce Act (ESIGN).",
    { size: 9, color: GREY },
  );
  c.rule();
  c.space(4);

  c.text("Document", { size: 10, bold: true });
  c.space(4);
  c.keyValue("Agreement ID", sig.agreementId);
  c.keyValue("Template", `${doc.templateId} v${doc.templateVersion}`);
  c.keyValue("Document hash (SHA-256)", sig.snapshotSha256);
  // Never the full token: this document gets emailed, and the token is a credential.
  c.keyValue("Access link", `private link ending ${sig.tokenLast4}`);
  c.space(8);

  c.text("Signer", { size: 10, bold: true });
  c.space(4);
  c.keyValue("Name typed", sig.signedName);
  c.keyValue("Email", sig.signedEmail);
  if (sig.signedTitle) c.keyValue("Title", sig.signedTitle);
  c.keyValue("Business", doc.party.businessName);
  c.keyValue("Timestamp", utc(sig.signedAt));
  c.keyValue("IP address", sig.ip ?? "not recorded");
  c.keyValue("Browser", sig.userAgent ?? "not recorded");
  c.space(8);

  c.text("Consents captured", { size: 10, bold: true });
  c.space(8);

  // Every consent renders the same way: a label, then the captured content
  // indented beneath it. Uniform structure keeps the block from reading as the
  // mix of two-column and stacked rows it used to be.
  c.consent("Intent to sign, shown next to the signature field", sig.intentText);
  c.consent("Consent to transact electronically, affirmatively checked", sig.esignConsentText);
  c.consent("Authority to bind the business", sig.authorityAck ? "Confirmed" : "Not confirmed");
  c.consent(
    "SMS marketing consent (optional, not required to sign)",
    sig.smsConsent ? "Granted" : "Not granted",
    sig.smsConsent && sig.smsConsentText ? sig.smsConsentText : undefined,
  );
  c.space(2);

  c.text(
    "Timestamps are recorded in Coordinated Universal Time by Callvia's servers. The document hash above is a SHA-256 digest of the exact agreement content presented to the signer, and can be used to verify that this document has not been altered since signature.",
    { size: 8, color: GREY },
  );

  drawFooters(c, `${doc.party.businessName} | ${doc.title} | Signed ${utc(sig.signedAt)}`);

  return pdf.save();
}
