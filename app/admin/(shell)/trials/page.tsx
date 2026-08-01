import { requireAdminPage } from "@/lib/require-admin";
import { listAgreements } from "@/lib/agreement/queries";
import { trialView } from "@/lib/admin/metrics";
import { TrialTable } from "@/components/admin/TrialTable";
import { NewTrialForm } from "@/components/admin/NewTrialForm";
import { toAdminAgreement } from "@/components/admin/types";

export const metadata = {
  title: "Trials | Callvia",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function TrialsPage() {
  await requireAdminPage();
  const rows = await listAgreements();

  const trials = rows
    .filter((r) => r.kind === "trial")
    .map((r) => toAdminAgreement(r, trialView(r)));

  const needsAttention = trials.filter(
    (t) => t.trialState === "ending" || t.trialState === "ended",
  ).length;

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          {trials.length} {trials.length === 1 ? "trial" : "trials"}
          {needsAttention > 0 && (
            <span className="text-warning"> · {needsAttention} needing attention</span>
          )}
        </p>
        <NewTrialForm />
      </div>

      <TrialTable trials={trials} />
    </div>
  );
}
