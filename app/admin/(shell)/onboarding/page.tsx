import { requireAdminPage } from "@/lib/require-admin";
import { listOnboarding } from "@/lib/onboarding/queries";
import { OnboardingTable, type AdminOnboarding } from "@/components/admin/OnboardingTable";

export const metadata = {
  title: "Onboarding | Callvia",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  await requireAdminPage();
  const rows = await listOnboarding();

  // Projection only: the raw answers stay on the server and are rendered on the
  // detail page, so the list view never ships a client's full submission.
  const forms: AdminOnboarding[] = rows.map((r) => ({
    id: r.id,
    businessName: r.business_name,
    contactName: r.contact_name,
    email: r.email,
    status: r.status,
    clientId: r.client_id,
    createdAt: String(r.created_at),
    sentAt: r.sent_at ? String(r.sent_at) : null,
    submittedAt: r.submitted_at ? String(r.submitted_at) : null,
    viewCount: r.view_count,
    answerCount: Object.keys(r.answers ?? {}).length,
  }));

  return <OnboardingTable forms={forms} />;
}
