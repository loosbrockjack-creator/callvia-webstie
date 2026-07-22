// Create and list agreements. Admin only.

import { requireAdmin } from "@/lib/require-admin";
import { asDigits, asString, asStringArray, isEmail, readJson, sameOrigin } from "@/lib/parse";
import { parseDollarsToCents } from "@/lib/money";
import { findPackage } from "@/lib/packages";
import { createAgreement, ensureTemplateRegistered, listAgreements } from "@/lib/agreement/queries";
import { CURRENT_TEMPLATE_VERSION, TEMPLATE_ID, currentTemplate, templateSourceHash, assertTemplatesUnchanged } from "@/lib/agreement/registry";
import { siteUrl } from "@/lib/email";
import type { UsageTermsSnapshot } from "@/lib/agreement/types";

export const runtime = "nodejs";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const rows = await listAgreements();
  return Response.json({ ok: true, agreements: rows });
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!sameOrigin(request)) {
    return Response.json({ ok: false, error: "Bad origin" }, { status: 403 });
  }

  // Refuse to issue anything if a frozen template has been edited.
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

  const setupFeeCents = parseDollarsToCents(asString(body.setupFee) || "0");
  const monthlyCents = parseDollarsToCents(asString(body.monthly) || "0");
  if (setupFeeCents === null || monthlyCents === null) {
    return Response.json({ ok: false, error: "Prices must be plain dollar amounts." }, { status: 400 });
  }
  if (setupFeeCents === 0 && monthlyCents === 0) {
    return Response.json({ ok: false, error: "An agreement needs at least one non-zero price." }, { status: 400 });
  }

  // A package only supplies defaults. Anything the admin edited on the form
  // wins, and a fully custom agreement sends no package key at all.
  const packageKey = asString(body.packageKey) || null;
  const preset = packageKey ? findPackage(packageKey) : null;
  const packageName = asString(body.packageName) || preset?.name || "Callvia AI Receptionist";
  const packageSummary = asString(body.packageSummary) || preset?.summary || null;
  const includedItems = asStringArray(body.includedItems);
  const items = includedItems.length > 0 ? includedItems : (preset?.includedItems ?? []);

  let usageTerms: UsageTermsSnapshot | null = null;
  const includedMinutes = asString(body.includedMinutes);
  const overageRate = asString(body.overageRate);
  if (includedMinutes && overageRate) {
    const overageCents = parseDollarsToCents(overageRate);
    const minutes = Number(includedMinutes.replace(/\D/g, ""));
    if (overageCents !== null && Number.isFinite(minutes) && minutes > 0) {
      usageTerms = { includedMinutes: minutes, overageCentsPerMinute: overageCents };
    }
  } else if (preset?.usageTerms) {
    usageTerms = preset.usageTerms;
  }

  const expiresRaw = asString(body.expiresInDays);
  const expiresInDays = expiresRaw === "" ? 30 : Number(expiresRaw.replace(/\D/g, "")) || null;

  // The template version an agreement is bound to must exist in the registry
  // table before the FK will accept it.
  await ensureTemplateRegistered(
    TEMPLATE_ID,
    CURRENT_TEMPLATE_VERSION,
    currentTemplate().title,
    templateSourceHash(CURRENT_TEMPLATE_VERSION),
  );

  const { id, rawToken } = await createAgreement({
    businessName,
    contactName,
    email,
    phone: phone.length === 10 ? phone : null,
    packageKey,
    packageName,
    packageSummary,
    includedItems: items,
    usageTerms,
    setupFeeCents,
    monthlyCents,
    setupFeeLabel: asString(body.setupFeeLabel) || "One-time setup fee",
    monthlyLabel: asString(body.monthlyLabel) || `${packageName}, monthly service`,
    templateVersion: CURRENT_TEMPLATE_VERSION,
    expiresInDays,
  });

  // The raw token is returned exactly once and is not recoverable afterward.
  return Response.json({ ok: true, id, url: `${siteUrl()}/agreement/${rawToken}` });
}
