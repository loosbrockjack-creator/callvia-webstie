import { requireAdminPage } from "@/lib/require-admin";
import { listAgreements } from "@/lib/agreement/queries";
import { PACKAGES } from "@/lib/packages";
import { AgreementTable } from "@/components/admin/AgreementTable";
import { NewAgreementForm } from "@/components/admin/NewAgreementForm";
import { toAdminAgreement } from "@/components/admin/types";

export const metadata = {
  title: "Agreements | Callvia",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AgreementsPage() {
  await requireAdminPage();
  const rows = await listAgreements();

  // Paid agreements only. Trials share the table but have their own page,
  // because the columns that matter for one are noise on the other.
  const agreements = rows.filter((r) => r.kind === "service").map((r) => toAdminAgreement(r));

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
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          {agreements.length} {agreements.length === 1 ? "agreement" : "agreements"}
        </p>
        <NewAgreementForm packages={packages} />
      </div>

      <AgreementTable agreements={agreements} />
    </div>
  );
}
