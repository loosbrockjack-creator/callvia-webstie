// Admin download of a signed PDF. One of this route's real jobs is chargeback
// defense: the signed document plus its audit page is exactly the evidence a
// card dispute asks for.

import { requireAdmin } from "@/lib/require-admin";
import { findAgreementById, getPdf } from "@/lib/agreement/queries";

export const runtime = "nodejs";

export async function GET(_request: Request, ctx: RouteContext<"/api/admin/agreements/[id]/pdf">) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await ctx.params;
  const row = await findAgreementById(id);
  if (!row) return new Response("Not found", { status: 404 });

  const pdf = await getPdf(id);
  if (!pdf) return new Response("Not signed yet", { status: 404 });

  const filename = `Callvia-Service-Agreement-${row.business_name.replace(/[^a-zA-Z0-9]+/g, "-")}.pdf`;
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
