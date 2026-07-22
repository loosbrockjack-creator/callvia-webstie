// Money handling. Integer cents everywhere.
//
// User-entered dollars are parsed from the string form, never through
// parseFloat: parseFloat("0.29") * 100 is 28.999999999999996, and rounding
// that away works until the one input where it doesn't.

const DOLLARS_RE = /^\$?\s*(\d{1,7})(?:\.(\d{1,2}))?$/;

// Returns null when the input isn't a well-formed dollar amount, so callers
// can distinguish "invalid" from "zero".
export function parseDollarsToCents(input: string): number | null {
  const trimmed = input.trim().replace(/,/g, "");
  if (trimmed === "") return null;
  const m = DOLLARS_RE.exec(trimmed);
  if (!m) return null;
  const whole = Number(m[1]);
  const frac = (m[2] ?? "").padEnd(2, "0");
  return whole * 100 + Number(frac);
}

const USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function formatCents(cents: number): string {
  return USD.format(cents / 100);
}

// "$297.00 per month" / "$500.00 one-time". Used in disclosure copy, where the
// exact wording matters legally, so it lives in one place.
export function formatRecurring(cents: number): string {
  return `${formatCents(cents)} per month`;
}
