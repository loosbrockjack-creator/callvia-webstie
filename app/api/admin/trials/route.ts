// Create a free trial agreement. Admin only.
//
// Separate from POST /api/admin/agreements rather than a flag on it, because
// almost none of that route's body applies: a trial has no package, no prices,
// no usage terms, and does have a date window that a service agreement has no
// concept of. Sharing the route would mean a validation function full of
// "unless kind is trial".
//
// The two routes converge again at createAgreement(), which is where the shared
// client-upsert and token generation actually live.

import { requireAdmin } from "@/lib/require-admin";
import { asDigits, asString, asStringArray, isEmail, readJson, sameOrigin } from "@/lib/parse";
import { createAgreement, ensureTemplateRegistered } from "@/lib/agreement/queries";
import {
  CURRENT_TRIAL_VERSION,
  TRIAL_TEMPLATE_ID,
  assertTemplatesUnchanged,
  currentTemplate,
  templateSourceHash,
} from "@/lib/agreement/registry";
import { siteUrl } from "@/lib/email";

export const runtime = "nodejs";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// What the trial includes, shown as the trial's Schedule A. Not priced, not
// drawn from lib/packages.ts: a trial is not one of the paid tiers.
const TRIAL_INCLUDES = [
  "AI receptionist answering your calls",
  "Caller details collected and confirmed on every call",
  "Written call summaries sent to you after each call",
  "Urgent calls flagged and escalated the way you choose",
  "Setup and call forwarding help to get you live",
];

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!sameOrigin(request)) {
    return Response.json({ ok: false, error: "Bad origin" }, { status: 403 });
  }

  assertTemplatesUnchanged();

  const body = await readJson(request);
  if (!body) return Response.json({ ok: false, error: "Invalid body." }, { status: 400 });

  const businessName = asString(body.businessName);
  const contactName = asString(body.contactName);
  const email = asString(body.email);
  const phone = asDigits(body.phone);

  if (!businessName || !contactName || !isEmail(email)) {
    return Response.json(
      { ok: false, error: "Business name, contact name, and a valid email are required." },
      { status: 400 },
    );
  }

  const startsOn = asString(body.trialStartsOn);
  const endsOn = asString(body.trialEndsOn);

  if (!ISO_DATE.test(startsOn) || !ISO_DATE.test(endsOn)) {
    return Response.json(
      { ok: false, error: "Trial start and end dates are required." },
      { status: 400 },
    );
  }
  // String comparison is correct for YYYY-MM-DD and avoids parsing these into
  // Date objects, which would drag timezones into a pure calendar comparison.
  if (endsOn <= startsOn) {
    return Response.json(
      { ok: false, error: "The trial end date must be after the start date." },
      { status: 400 },
    );
  }

  const custom = asStringArray(body.includedItems);
  const includedItems = custom.length > 0 ? custom : TRIAL_INCLUDES;

  await ensureTemplateRegistered(
    TRIAL_TEMPLATE_ID,
    CURRENT_TRIAL_VERSION,
    currentTemplate("trial").title,
    templateSourceHash(TRIAL_TEMPLATE_ID, CURRENT_TRIAL_VERSION),
  );

  const { id, rawToken } = await createAgreement({
    businessName,
    contactName,
    email,
    phone: phone.length === 10 ? phone : null,
    kind: "trial",
    trialStartsOn: startsOn,
    trialEndsOn: endsOn,
    packageKey: null,
    packageName: "Callvia AI Receptionist, free trial",
    packageSummary: asString(body.packageSummary) || null,
    includedItems,
    usageTerms: null,
    // A trial is free. The has-a-price CHECK makes room for exactly this case.
    setupFeeCents: 0,
    monthlyCents: 0,
    setupFeeLabel: "No setup fee during the trial",
    monthlyLabel: "No charge during the trial",
    templateId: TRIAL_TEMPLATE_ID,
    templateVersion: CURRENT_TRIAL_VERSION,
    // The link should outlive the trial itself so the client can always reopen
    // what they signed.
    expiresInDays: 90,
  });

  return Response.json({ ok: true, id, url: `${siteUrl()}/agreement/${rawToken}` });
}
