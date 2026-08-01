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

const DAY_MS = 86_400_000;

// A trial window is calendar days, stored as `date` and carried as
// 'YYYY-MM-DD'. Parsing it with `new Date('2026-08-06')` would land on UTC
// midnight, which is the previous day everywhere in the US, so a contract could
// print an end date one day earlier than the one in the database. Parse the
// parts instead.
function parseDateParts(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

export function formatTrialDate(iso: string): string {
  const { y, m, d } = parseDateParts(iso);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function trialDays(startsOn: string, endsOn: string): number {
  const a = parseDateParts(startsOn);
  const b = parseDateParts(endsOn);
  return Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / DAY_MS);
}

export function scheduleFromRow(row: AgreementRow): Schedule {
  const base: Schedule = {
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

  // A trial carries its window instead of a fee table. Everything downstream
  // branches on the presence of `trial`, so a trial cannot render a "Due today"
  // line even if a price somehow ended up on the row.
  if (row.kind === "trial" && row.trial_starts_on && row.trial_ends_on) {
    base.trial = {
      startsOn: row.trial_starts_on,
      endsOn: row.trial_ends_on,
      days: trialDays(row.trial_starts_on, row.trial_ends_on),
    };
  }

  return base;
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

    // Present for every kind. interpolate() throws on a placeholder with no
    // matching var, but extra vars are harmless, so supplying these
    // unconditionally means a template can start using them without a change
    // here.
    trialStartDate: row.trial_starts_on ? formatTrialDate(row.trial_starts_on) : "",
    trialEndDate: row.trial_ends_on ? formatTrialDate(row.trial_ends_on) : "",

    ...usageVars(row.usage_terms),
  };
}

export function renderAgreement(row: AgreementRow): RenderedAgreement {
  const template = getTemplate(row.template_id, row.template_version);
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
