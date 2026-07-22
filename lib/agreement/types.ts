// Shapes for the contract-as-data system.
//
// A template is the uninterpolated legal text with {{placeholders}}.
// A RenderedAgreement is one client's fully interpolated copy, and is what
// gets frozen into agreements.agreement_snapshot at signature. Signed
// agreements always render from the snapshot, never from the template module,
// so editing a template can never change what somebody already signed.

export type Block =
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "callout"; text: string };

export interface Section {
  heading?: string;
  blocks: Block[];
}

export interface AgreementTemplate {
  templateId: string;
  version: number;
  title: string;
  lastUpdated: string;
  sections: Section[];
}

export type TemplateVars = Record<string, string>;

export interface UsageTermsSnapshot {
  includedMinutes: number;
  overageCentsPerMinute: number;
}

// Schedule A: what the client is actually buying. Rendered as the order
// summary on the page and as an exhibit in the PDF.
export interface Schedule {
  packageKey: string | null;
  packageName: string;
  packageSummary: string | null;
  includedItems: string[];
  usageTerms: UsageTermsSnapshot | null;
  currency: string;
  setupFeeCents: number;
  monthlyCents: number;
  setupFeeLabel: string;
  monthlyLabel: string;
  dueTodayCents: number;
}

export interface PartySnapshot {
  businessName: string;
  contactName: string;
  email: string;
}

export interface RenderedAgreement {
  templateId: string;
  templateVersion: number;
  title: string;
  lastUpdated: string;
  sections: Section[];
  schedule: Schedule;
  party: PartySnapshot;
  vars: TemplateVars;
}
