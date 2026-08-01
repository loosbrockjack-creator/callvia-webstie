import type { AgreementStatus } from "@/lib/agreement/status";
import type { AgreementKind } from "@/lib/agreement/types";
import type { AgreementRow } from "@/lib/agreement/queries";
import type { TrialView } from "@/lib/admin/metrics";

// The projection the dashboard components receive. Deliberately excludes token
// hashes, snapshots, and PDF bytes: none of that belongs in a client bundle.
export interface AdminAgreement {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  status: AgreementStatus;
  kind: AgreementKind;
  packageName: string;
  setupFeeCents: number;
  monthlyCents: number;
  createdAt: string;
  sentAt: string | null;
  signedAt: string | null;
  paidAt: string | null;
  viewCount: number;
  pdfEmailedAt: string | null;
  hasPdf: boolean;

  // Trials only.
  trialStartsOn: string | null;
  trialEndsOn: string | null;
  trialDaysLeft: number | null;
  trialState: TrialView["state"] | null;
  convertedToAgreementId: string | null;
}

export interface AdminPackage {
  key: string;
  name: string;
  summary: string;
  includedItems: string[];
  setupFeeCents: number;
  monthlyCents: number;
  includedMinutes: number | null;
  overageCentsPerMinute: number | null;
}

// Server-side projection helper, so every admin page maps rows the same way and
// no page accidentally passes a snapshot or a PDF hash into a client component.
export function toAdminAgreement(r: AgreementRow, trial?: TrialView): AdminAgreement {
  return {
    id: r.id,
    businessName: r.business_name,
    contactName: r.contact_name,
    email: r.email,
    status: r.status,
    kind: r.kind,
    packageName: r.package_name,
    setupFeeCents: r.setup_fee_cents,
    monthlyCents: r.monthly_cents,
    createdAt: String(r.created_at),
    sentAt: r.sent_at ? String(r.sent_at) : null,
    signedAt: r.signed_at ? String(r.signed_at) : null,
    paidAt: r.paid_at ? String(r.paid_at) : null,
    viewCount: r.view_count,
    pdfEmailedAt: r.pdf_emailed_at ? String(r.pdf_emailed_at) : null,
    hasPdf: r.pdf_sha256 !== null,

    trialStartsOn: r.trial_starts_on,
    trialEndsOn: r.trial_ends_on,
    trialDaysLeft: trial?.daysLeft ?? null,
    trialState: trial?.state ?? null,
    convertedToAgreementId: r.converted_to_agreement_id,
  };
}
