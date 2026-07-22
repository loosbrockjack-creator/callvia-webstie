import { requireAdminPage } from "@/lib/require-admin";
import { listAgreements } from "@/lib/agreement/queries";
import { PACKAGES } from "@/lib/packages";
import { AwaitingPayment } from "@/components/admin/AwaitingPayment";
import { AgreementTable } from "@/components/admin/AgreementTable";
import { NewAgreementForm } from "@/components/admin/NewAgreementForm";
import { AdminHeader } from "@/components/admin/AdminHeader";
import type { AdminAgreement } from "@/components/admin/types";

export const metadata = {
  title: "Agreements | Callvia",
  robots: { index: false, follow: false },
};

// Always read live: a dashboard that shows a cached payment status is worse
// than no dashboard.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdminPage();
  const rows = await listAgreements();

  // Only what the client components need, and nothing sensitive: no token
  // hashes, no snapshots, no PDF bytes.
  const agreements: AdminAgreement[] = rows.map((r) => ({
    id: r.id,
    businessName: r.business_name,
    contactName: r.contact_name,
    email: r.email,
    status: r.status,
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
  }));

  const awaiting = agreements.filter((a) => a.status === "signed" || a.status === "payment_pending");

  const packages = PACKAGES.map((p) => ({
    key: p.key,
    name: p.name,
    summary: p.summary,
    includedItems: p.includedItems,
    setupFeeCents: p.setupFeeCents,
    monthlyCents: p.monthlyCents,
    includedMinutes: p.usageTerms?.includedMinutes ?? null,
    overageCentsPerMinute: p.usageTerms?.overageCentsPerMinute ?? null,
  }));

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <AdminHeader />

        {awaiting.length > 0 && <AwaitingPayment agreements={awaiting} />}

        <NewAgreementForm packages={packages} />

        <AgreementTable agreements={agreements} />
      </div>
    </main>
  );
}
