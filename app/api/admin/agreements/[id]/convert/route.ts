// Convert a signed trial into a paid service agreement.
//
// Creates a fresh draft service agreement carrying the trial's client details,
// then stamps the trial with a pointer to it. The trial is never mutated into
// an agreement: it stays exactly as signed, because it is a separate executed
// contract and the client's copy has to keep matching the record.

import { requireAdmin } from "@/lib/require-admin";
import { asString, asStringArray, readJson, sameOrigin } from "@/lib/parse";
import { parseDollarsToCents } from "@/lib/money";
import { findPackage } from "@/lib/packages";
import {
  createAgreement,
  ensureTemplateRegistered,
  findAgreementById,
  markTrialConverted,
} from "@/lib/agreement/queries";
import {
  CURRENT_TEMPLATE_VERSION,
  TEMPLATE_ID,
  assertTemplatesUnchanged,
  currentTemplate,
  templateSourceHash,
} from "@/lib/agreement/registry";
import { isSigned } from "@/lib/agreement/status";
import { siteUrl } from "@/lib/email";
import type { UsageTermsSnapshot } from "@/lib/agreement/types";

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

  assertTemplatesUnchanged();

  const { id } = await params;
  const trial = await findAgreementById(id);

  if (!trial || trial.kind !== "trial") {
    return Response.json({ ok: false, error: "Trial not found." }, { status: 404 });
  }
  if (!isSigned(trial.status)) {
    return Response.json(
      { ok: false, error: "That trial has not been signed yet." },
      { status: 409 },
    );
  }
  if (trial.converted_to_agreement_id) {
    return Response.json(
      {
        ok: false,
        error: "That trial has already been converted.",
        agreementId: trial.converted_to_agreement_id,
      },
      { status: 409 },
    );
  }

  const body = await readJson(request);
  if (!body) return Response.json({ ok: false, error: "Invalid body." }, { status: 400 });

  const packageKey = asString(body.packageKey) || null;
  const preset = packageKey ? findPackage(packageKey) : null;

  const setupFeeCents = parseDollarsToCents(asString(body.setupFee) || "0");
  const monthlyCents = parseDollarsToCents(asString(body.monthly) || "0");
  if (setupFeeCents === null || monthlyCents === null) {
    return Response.json(
      { ok: false, error: "Prices must be plain dollar amounts." },
      { status: 400 },
    );
  }
  if (setupFeeCents === 0 && monthlyCents === 0) {
    return Response.json(
      { ok: false, error: "An agreement needs at least one non-zero price." },
      { status: 400 },
    );
  }

  const packageName = asString(body.packageName) || preset?.name || "Callvia AI Receptionist";
  const custom = asStringArray(body.includedItems);
  const includedItems = custom.length > 0 ? custom : (preset?.includedItems ?? []);

  let usageTerms: UsageTermsSnapshot | null = preset?.usageTerms ?? null;
  const includedMinutes = asString(body.includedMinutes);
  const overageRate = asString(body.overageRate);
  if (includedMinutes && overageRate) {
    const overageCents = parseDollarsToCents(overageRate);
    const minutes = Number(includedMinutes.replace(/\D/g, ""));
    if (overageCents !== null && Number.isFinite(minutes) && minutes > 0) {
      usageTerms = { includedMinutes: minutes, overageCentsPerMinute: overageCents };
    }
  }

  await ensureTemplateRegistered(
    TEMPLATE_ID,
    CURRENT_TEMPLATE_VERSION,
    currentTemplate("service").title,
    templateSourceHash(TEMPLATE_ID, CURRENT_TEMPLATE_VERSION),
  );

  // The client details come from the trial row, not from the request: this is
  // the whole point of "convert" rather than "create a new one and retype it".
  const { id: newId, rawToken } = await createAgreement({
    businessName: trial.business_name,
    contactName: trial.contact_name,
    email: trial.email,
    phone: trial.phone,
    packageKey,
    packageName,
    packageSummary: asString(body.packageSummary) || preset?.summary || null,
    includedItems,
    usageTerms,
    setupFeeCents,
    monthlyCents,
    setupFeeLabel: "One-time setup fee",
    monthlyLabel: `${packageName}, monthly service`,
    templateId: TEMPLATE_ID,
    templateVersion: CURRENT_TEMPLATE_VERSION,
    expiresInDays: 30,
  });

  // Compare-and-swap: if two clicks race, the second one loses here and its
  // agreement is reported so it can be voided rather than silently orphaned.
  const claimed = await markTrialConverted(trial.id, newId);
  if (!claimed) {
    return Response.json(
      {
        ok: false,
        error: "That trial was converted by another request. Void the extra agreement.",
        strayAgreementId: newId,
      },
      { status: 409 },
    );
  }

  return Response.json({
    ok: true,
    id: newId,
    url: `${siteUrl()}/agreement/${rawToken}`,
  });
}
