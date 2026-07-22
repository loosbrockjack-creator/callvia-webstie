import type { AgreementStatus } from "@/lib/agreement/status";

// The projection the dashboard components receive. Deliberately excludes token
// hashes, snapshots, and PDF bytes: none of that belongs in a client bundle.
export interface AdminAgreement {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  status: AgreementStatus;
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
