import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { AccountDashboard } from "@/components/account/AccountDashboard";
import { requireClientPage } from "@/lib/require-client";
import { getClientById } from "@/lib/clients/queries";
import { findCurrentAgreementForClient, listAgreementsForClient } from "@/lib/agreement/queries";
import { listRecentInvoices, type InvoiceSummary } from "@/lib/stripe";
import { statusLabel } from "@/lib/agreement/status";
import { formatCents } from "@/lib/money";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Your account | Callvia",
  robots: { index: false, follow: false },
};

// Never cache: this is per-client, session-gated, and shows live billing state.
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const clientId = await requireClientPage();

  const client = await getClientById(clientId);
  if (!client) redirect("/login");

  const [current, history] = await Promise.all([
    findCurrentAgreementForClient(clientId),
    listAgreementsForClient(clientId),
  ]);

  let invoices: InvoiceSummary[] = [];
  if (client.stripe_customer_id) {
    try {
      invoices = await listRecentInvoices(client.stripe_customer_id);
    } catch (err) {
      // A Stripe hiccup should not blank out the whole dashboard.
      console.error("ACCOUNT invoices error:", err);
    }
  }

  const plan = current
    ? {
        id: current.id,
        packageName: current.package_name,
        packageSummary: current.package_summary,
        status: current.status,
        statusLabel: statusLabel(current.status),
        monthly: current.monthly_cents > 0 ? formatCents(current.monthly_cents) : null,
        setupFee: current.setup_fee_cents > 0 ? formatCents(current.setup_fee_cents) : null,
        hasPdf: current.pdf_generated_at !== null,
        includedItems: current.included_items,
      }
    : null;

  const agreements = history.map((a) => ({
    id: a.id,
    packageName: a.package_name,
    statusLabel: statusLabel(a.status),
    createdAt: a.created_at.toISOString(),
    hasPdf: a.pdf_generated_at !== null,
  }));

  const invoiceRows = invoices.map((inv) => ({
    id: inv.id,
    number: inv.number,
    status: inv.status,
    amount: formatCents(inv.amountPaidCents > 0 ? inv.amountPaidCents : inv.amountDueCents),
    created: new Date(inv.created * 1000).toISOString(),
    hostedInvoiceUrl: inv.hostedInvoiceUrl,
    invoicePdf: inv.invoicePdf,
  }));

  return (
    <div className="bg-black min-h-[100dvh] text-white">
      <Nav />
      <AccountDashboard
        profile={{
          businessName: client.business_name,
          contactName: client.contact_name,
          email: client.email,
          phone: client.phone,
        }}
        hasStripeCustomer={client.stripe_customer_id !== null}
        plan={plan}
        agreements={agreements}
        invoices={invoiceRows}
      />
      <Footer />
    </div>
  );
}
