import { requireAdminPage } from "@/lib/require-admin";
import { listClients } from "@/lib/agreement/queries";
import { ClientTable, type AdminClient } from "@/components/admin/ClientTable";

export const metadata = {
  title: "Clients | Callvia",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  await requireAdminPage();
  const rows = await listClients();

  const clients: AdminClient[] = rows.map((c) => ({
    id: c.id,
    businessName: c.business_name,
    contactName: c.contact_name,
    email: c.email,
    phone: c.phone,
    createdAt: String(c.created_at),
    agreementCount: c.agreement_count,
    trialCount: c.trial_count,
    hasActive: c.has_active ?? false,
  }));

  return (
    <div>
      <p className="mb-5 text-sm text-muted">
        {clients.length} {clients.length === 1 ? "client" : "clients"}
      </p>
      <ClientTable clients={clients} />
    </div>
  );
}
