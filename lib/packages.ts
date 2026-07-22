// Predefined packages. These prefill the admin form; every field stays
// editable per client, and an agreement can also be created with no package.
//
// Unlike contract templates, these are NOT frozen. Edit them freely: an
// agreement copies the package contents onto its own row at creation, so
// changing a package here can never alter one that has already been sent.
//
// Pricing mirrors the live Stripe product catalog (Product catalog -> All
// products). Internal cost/markup figures are deliberately not reproduced
// here: this file only holds what a client sees (price, included minutes,
// overage rate), never the underlying cost math.

export interface UsageTerms {
  includedMinutes: number;
  overageCentsPerMinute: number;
}

export interface Package {
  key: string;
  name: string;
  summary: string;
  includedItems: string[];
  setupFeeCents: number;
  monthlyCents: number;
  usageTerms?: UsageTerms;
}

const CORE_ITEMS = [
  "AI receptionist answering your inbound calls 24/7",
  "Caller information collected and confirmed on every call",
  "Request type and urgency identified automatically",
  "Call summaries sent to you by SMS and email",
  "Custom call-handling instructions, hours, and greeting",
];

export const PACKAGES: Package[] = [
  {
    key: "starter",
    name: "AI Receptionist, Starter",
    summary: "Built for smaller contractors: round-the-clock call answering with up to 400 minutes included each month.",
    includedItems: CORE_ITEMS,
    setupFeeCents: 0,
    monthlyCents: 29900,
    usageTerms: { includedMinutes: 400, overageCentsPerMinute: 70 },
  },
  {
    key: "growth",
    name: "AI Receptionist, Growth",
    summary: "Round-the-clock call answering for growing businesses, with up to 800 minutes included each month.",
    includedItems: CORE_ITEMS,
    setupFeeCents: 0,
    monthlyCents: 49900,
    usageTerms: { includedMinutes: 800, overageCentsPerMinute: 60 },
  },
  {
    key: "max",
    name: "AI Receptionist, Max",
    summary: "Built for high call volume: round-the-clock call answering with up to 1,500 minutes included each month.",
    includedItems: CORE_ITEMS,
    setupFeeCents: 0,
    monthlyCents: 99900,
    usageTerms: { includedMinutes: 1500, overageCentsPerMinute: 40 },
  },
];

export function findPackage(key: string): Package | null {
  return PACKAGES.find((p) => p.key === key) ?? null;
}
