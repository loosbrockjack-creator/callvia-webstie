// Smoke test for PDF generation. Renders a sample signed agreement to
// /tmp/callvia-sample.pdf so the layout, wrapping, and audit page can be
// eyeballed without a database or a Stripe account.
//
//   npx tsx scripts/test-pdf.ts
//
// The signer name deliberately contains a curly apostrophe and an em dash:
// the standard-14 fonts cannot encode either, and pdf-lib throws rather than
// substituting, so this is the case that would break in production.

import { writeFileSync } from "node:fs";
import { interpolateSections } from "../lib/agreement/interpolate";
import { currentTemplate } from "../lib/agreement/registry";
import { renderAgreementPdf } from "../lib/pdf/renderAgreementPdf";
import { INTENT_TO_SIGN_TEXT, ESIGN_CONSENT_TEXT, SMS_CONSENT_TEXT } from "../lib/agreement/consent";
import type { RenderedAgreement } from "../lib/agreement/types";

const template = currentTemplate();
const vars = {
  businessName: "O’Brien Plumbing & Heating",
  contactName: "Dana O’Brien",
  packageName: "AI Receptionist, Growth",
  monthlyAmount: "$597.00",
  setupFeeAmount: "$500.00",
  dueTodayAmount: "$1,097.00",
  includedMinutes: "750 minutes",
  overageRate: "$0.40 per minute",
};

const doc: RenderedAgreement = {
  templateId: template.templateId,
  templateVersion: template.version,
  title: template.title,
  lastUpdated: template.lastUpdated,
  sections: interpolateSections(template, vars),
  schedule: {
    packageKey: "growth",
    packageName: "AI Receptionist, Growth",
    packageSummary: "Everything in Starter, plus live call routing and appointment booking.",
    includedItems: [
      "AI receptionist answering your inbound calls 24/7",
      "Caller information collected and confirmed on every call",
      "Request type and urgency identified automatically",
      "Call summaries sent to you by SMS and email",
      "Custom call-handling instructions, hours, and greeting",
      "Live call routing and warm transfers",
      "Appointment booking into your calendar",
      "Priority support",
    ],
    usageTerms: { includedMinutes: 750, overageCentsPerMinute: 40 },
    currency: "usd",
    setupFeeCents: 50000,
    monthlyCents: 59700,
    setupFeeLabel: "One-time setup fee",
    monthlyLabel: "AI Receptionist, Growth, monthly service",
    dueTodayCents: 109700,
  },
  party: {
    businessName: "O’Brien Plumbing & Heating",
    contactName: "Dana O’Brien",
    email: "dana@obrienplumbing.example",
  },
  vars,
};

async function main() {
const bytes = await renderAgreementPdf(doc, {
  signedName: "Dana O’Brien — Owner",
  signedEmail: "dana@obrienplumbing.example",
  signedTitle: "Owner",
  signedAt: new Date("2026-07-21T15:04:05Z"),
  ip: "203.0.113.42",
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
  intentText: INTENT_TO_SIGN_TEXT,
  esignConsentText: ESIGN_CONSENT_TEXT,
  authorityAck: true,
  smsConsent: true,
  smsConsentText: SMS_CONSENT_TEXT,
  snapshotSha256: "3f786850e387550fdab836ed7e6dc881de23001b7f7f0d5b3f6bd0f1f0d5a2c1",
  agreementId: "6f1d2c3b-4a5e-4f60-9a7b-8c9d0e1f2a3b",
  tokenLast4: "x9Qa",
});

  writeFileSync("/tmp/callvia-sample.pdf", bytes);
  console.log(`OK: ${bytes.length} bytes -> /tmp/callvia-sample.pdf`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
