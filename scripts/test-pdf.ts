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

const template = currentTemplate("service");
const vars = {
  businessName: "O’Brien Plumbing & Heating",
  contactName: "Dana O’Brien",
  packageName: "AI Receptionist, Growth",
  monthlyAmount: "$597.00",
  setupFeeAmount: "$500.00",
  dueTodayAmount: "$1,097.00",
  includedMinutes: "750 minutes",
  overageRate: "$0.40 per minute",
  trialStartDate: "",
  trialEndDate: "",
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

// The trial variant. The point of rendering it here is to confirm the Schedule
// A exhibit prints a term instead of a fee table, and that no "Due at signing"
// amount or recurring-charge line survives on a document with no price.
const trialTemplate = currentTemplate("trial");
const trialVars = {
  businessName: "O’Brien Plumbing & Heating",
  contactName: "Dana O’Brien",
  packageName: "Callvia AI Receptionist, free trial",
  monthlyAmount: "$0.00",
  setupFeeAmount: "$0.00",
  dueTodayAmount: "$0.00",
  includedMinutes: "not applicable",
  overageRate: "not applicable",
  trialStartDate: "July 23, 2026",
  trialEndDate: "August 6, 2026",
};

const trialDoc: RenderedAgreement = {
  templateId: trialTemplate.templateId,
  templateVersion: trialTemplate.version,
  title: trialTemplate.title,
  lastUpdated: trialTemplate.lastUpdated,
  sections: interpolateSections(trialTemplate, trialVars),
  schedule: {
    packageKey: null,
    packageName: "Callvia AI Receptionist, free trial",
    packageSummary: null,
    includedItems: [
      "AI receptionist answering your calls",
      "Caller details collected and confirmed on every call",
      "Written call summaries sent to you after each call",
      "Urgent calls flagged and escalated the way you choose",
      "Setup and call forwarding help to get you live",
    ],
    usageTerms: null,
    currency: "usd",
    setupFeeCents: 0,
    monthlyCents: 0,
    setupFeeLabel: "No setup fee during the trial",
    monthlyLabel: "No charge during the trial",
    dueTodayCents: 0,
    trial: { startsOn: "2026-07-23", endsOn: "2026-08-06", days: 14 },
  },
  party: {
    businessName: "O’Brien Plumbing & Heating",
    contactName: "Dana O’Brien",
    email: "dana@obrienplumbing.example",
  },
  vars: trialVars,
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

  const trialBytes = await renderAgreementPdf(trialDoc, {
    signedName: "Dana O’Brien — Owner",
    signedEmail: "dana@obrienplumbing.example",
    signedTitle: "Owner",
    signedAt: new Date("2026-07-23T15:04:05Z"),
    ip: "203.0.113.42",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
    intentText: INTENT_TO_SIGN_TEXT,
    esignConsentText: ESIGN_CONSENT_TEXT,
    authorityAck: true,
    smsConsent: false,
    smsConsentText: null,
    snapshotSha256: "a1b2c3d4e5f60718293a4b5c6d7e8f901a2b3c4d5e6f708192a3b4c5d6e7f801",
    agreementId: "7a2e3d4c-5b6f-4071-8b9c-0d1e2f3a4b5c",
    tokenLast4: "k4Tz",
  });

  writeFileSync("/tmp/callvia-trial-sample.pdf", trialBytes);
  console.log(`OK: ${trialBytes.length} bytes -> /tmp/callvia-trial-sample.pdf`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
