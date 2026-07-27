// Client download of their own signed agreement PDF. Ownership is checked
// against the session's client_id; a mismatch returns 404 (not 403) so this
// cannot confirm whether an agreement id exists.

import { requireClient } from "@/lib/require-client";
import { findAgreementById, getPdf } from "@/lib/agreement/queries";

export const runtime = "nodejs";

export async function GET(_request: Request, ctx: RouteContext<"/api/account/agreements/[id]/pdf">) {
  const auth = await requireClient();
  if (auth instanceof Response) return auth;

  const { id } = await ctx.params;
  const row = await findAgreementById(id);
  if (!row || row.client_id !== auth.clientId) return new Response("Not found", { status: 404 });

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
