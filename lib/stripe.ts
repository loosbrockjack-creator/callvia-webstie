// Stripe Checkout, built from dynamic price_data.
//
// There are no pre-made Payment Links or Prices in the dashboard to maintain:
// every agreement's amounts are typed by the admin and turned into line items
// here. That is what makes per-client pricing work.
//
// Because checkout is Stripe-hosted, no Stripe.js runs on Callvia pages and no
// card data touches this infrastructure, which keeps PCI scope at SAQ-A.

import Stripe from "stripe";
import type { AgreementRow } from "./agreement/queries";

let cached: Stripe | null = null;

export function stripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set.");
  // No explicit apiVersion: the SDK pins its own, which is the version its
  // types were generated against.
  cached = new Stripe(key);
  return cached;
}

export type CheckoutParams = Stripe.Checkout.SessionCreateParams;

export function buildCheckoutParams(row: AgreementRow, successUrl: string, cancelUrl: string): CheckoutParams {
  const currency = row.currency || "usd";
  const hasMonthly = row.monthly_cents > 0;
  const hasSetup = row.setup_fee_cents > 0;

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  if (hasMonthly) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency,
        unit_amount: row.monthly_cents,
        recurring: { interval: "month" },
        // The wording here shows on Stripe's page and on the receipt. It is
        // built from the same label the client saw in the order summary,
        // because a mismatch between contract and card statement is a common
        // chargeback trigger.
        product_data: { name: row.monthly_label, description: row.package_name },
      },
    });
  }

  if (hasSetup) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency,
        unit_amount: row.setup_fee_cents,
        // No `recurring`, so in subscription mode Stripe adds this to the first
        // invoice as a one-time charge. This is how a setup fee and a monthly
        // subscription ride in a single checkout.
        product_data: { name: row.setup_fee_label, description: row.package_name },
      },
    });
  }

  const metadata = {
    agreement_id: row.id,
    business_name: row.business_name.slice(0, 480),
    package: row.package_name.slice(0, 480),
  };

  const base: CheckoutParams = {
    mode: hasMonthly ? "subscription" : "payment",
    line_items: lineItems,
    // Restricted to cards so no delayed-settlement method (ACH and similar) can
    // leave a session in a pending state after the client thinks they are done.
    payment_method_types: ["card"],
    customer_email: row.email,
    client_reference_id: row.id,
    metadata,
    success_url: successUrl,
    cancel_url: cancelUrl,
  };

  if (hasMonthly) {
    // Session metadata does NOT propagate to the Subscription that Checkout
    // creates. Without this the subscription arrives in the dashboard with no
    // link back to an agreement.
    base.subscription_data = { metadata };
  } else {
    // In payment mode a Customer is not created by default, and one is needed
    // for the billing portal later.
    base.customer_creation = "always";
    base.payment_intent_data = { metadata };
    // Payment mode does not generate a Stripe Invoice by default, unlike
    // subscription mode. Without this a setup-fee-only agreement pays fine
    // but never shows up in the client's Invoices list.
    base.invoice_creation = { enabled: true };
  }

  return base;
}

export function amountFromSession(session: Stripe.Checkout.Session): number | null {
  return session.amount_total ?? null;
}

export function idOf(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

export interface InvoiceSummary {
  id: string;
  number: string | null;
  status: string | null;
  amountDueCents: number;
  amountPaidCents: number;
  currency: string;
  created: number; // unix seconds
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
}

// Fetched live for the client dashboard. No invoice data is persisted; at this
// traffic level a per-load Stripe call is simpler than a cache to keep in sync.
export async function listRecentInvoices(customerId: string, limit = 12): Promise<InvoiceSummary[]> {
  const res = await stripe().invoices.list({ customer: customerId, limit });
  return res.data.map((inv) => ({
    id: inv.id ?? "",
    number: inv.number ?? null,
    status: inv.status ?? null,
    amountDueCents: inv.amount_due ?? 0,
    amountPaidCents: inv.amount_paid ?? 0,
    currency: inv.currency ?? "usd",
    created: inv.created,
    hostedInvoiceUrl: inv.hosted_invoice_url ?? null,
    invoicePdf: inv.invoice_pdf ?? null,
  }));
}
