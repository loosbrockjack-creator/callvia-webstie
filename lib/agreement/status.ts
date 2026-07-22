// Agreement lifecycle.
//
//   draft -> sent -> viewed -> signed -> payment_pending -> active
//
// plus `expired` (only out of sent/viewed) and `void` (admin only, soft).
// The one permitted backward move is payment_pending -> signed, on
// checkout.session.expired. It is safe because it never crosses the `signed`
// boundary: once signed, always signed.
//
// Every transition in the query layer is a compare-and-swap
// (UPDATE ... WHERE id = $1 AND status = ANY($expected) RETURNING ...).
// Zero rows back means someone else got there first, which callers handle.
// That is what makes a Stripe webhook and a browser racing each other safe,
// and it is what makes double-signing structurally impossible.

export const STATUSES = [
  "draft",
  "sent",
  "viewed",
  "signed",
  "payment_pending",
  "active",
  "void",
  "expired",
] as const;

export type AgreementStatus = (typeof STATUSES)[number];

// States in which the sign form may be shown and a signature accepted.
export const SIGNABLE: AgreementStatus[] = ["sent", "viewed"];

// States that already carry a signature, so the document is binding and a PDF exists.
export const SIGNED_STATES: AgreementStatus[] = ["signed", "payment_pending", "active"];

export function isSigned(status: AgreementStatus): boolean {
  return SIGNED_STATES.includes(status);
}

export function isTerminal(status: AgreementStatus): boolean {
  return status === "void" || status === "expired";
}

// Expiry is computed lazily on read rather than trusted from the column, so a
// missed sweep can never let a stale link be signed.
export function isExpired(status: AgreementStatus, expiresAt: Date | null): boolean {
  if (status === "expired") return true;
  if (!SIGNABLE.includes(status) && status !== "draft") return false;
  return expiresAt !== null && expiresAt.getTime() < Date.now();
}

export function statusLabel(status: AgreementStatus): string {
  switch (status) {
    case "draft": return "Draft";
    case "sent": return "Sent";
    case "viewed": return "Viewed";
    case "signed": return "Signed, awaiting payment";
    case "payment_pending": return "Signed, at checkout";
    case "active": return "Active";
    case "void": return "Void";
    case "expired": return "Expired";
  }
}
