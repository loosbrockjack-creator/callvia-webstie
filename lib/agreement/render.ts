// Builds a client's fully interpolated agreement from the stored row.
//
// The server always re-derives this from the database. It is never built from
// anything in a request body, because the result is what gets frozen as the
// signature snapshot.

import { formatCents } from "../money";
import { interpolateSections } from "./interpolate";
import { getTemplate } from "./registry";
import type { AgreementRow } from "./queries";
import type { RenderedAgreement, Schedule, TemplateVars, UsageTermsSnapshot } from "./types";

export function scheduleFromRow(row: AgreementRow): Schedule {
  return {
    packageKey: row.package_key,
    packageName: row.package_name,
    packageSummary: row.package_summary,
    includedItems: row.included_items,
    usageTerms: row.usage_terms,
    currency: row.currency,
    setupFeeCents: row.setup_fee_cents,
    monthlyCents: row.monthly_cents,
    setupFeeLabel: row.setup_fee_label,
    monthlyLabel: row.monthly_label,
    dueTodayCents: row.setup_fee_cents + row.monthly_cents,
  };
}

function usageVars(usage: UsageTermsSnapshot | null): TemplateVars {
  if (!usage) {
    return { includedMinutes: "not applicable", overageRate: "not applicable" };
  }
  return {
    includedMinutes: `${usage.includedMinutes.toLocaleString("en-US")} minutes`,
    overageRate: `${formatCents(usage.overageCentsPerMinute)} per minute`,
  };
}

export function varsFromRow(row: AgreementRow): TemplateVars {
  return {
    businessName: row.business_name,
    contactName: row.contact_name,
    packageName: row.package_name,
    monthlyAmount: formatCents(row.monthly_cents),
    setupFeeAmount: formatCents(row.setup_fee_cents),
    dueTodayAmount: formatCents(row.setup_fee_cents + row.monthly_cents),
    ...usageVars(row.usage_terms),
  };
}

export function renderAgreement(row: AgreementRow): RenderedAgreement {
  const template = getTemplate(row.template_version);
  const vars = varsFromRow(row);
  return {
    templateId: template.templateId,
    templateVersion: template.version,
    title: template.title,
    lastUpdated: template.lastUpdated,
    sections: interpolateSections(template, vars),
    schedule: scheduleFromRow(row),
    party: {
      businessName: row.business_name,
      contactName: row.contact_name,
      email: row.email,
    },
    vars,
  };
}
