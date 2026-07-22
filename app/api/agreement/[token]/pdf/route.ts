// Serves the signed PDF back to the client. Possession of the private token is
// the authorization: it is the same credential that let them sign in the first
// place.
//
// ESIGN requires that a signer be able to retain a copy of what they signed, so
// this stays available for the life of the agreement, including after payment
// and after voiding.

import { findAgreementByToken, getPdf } from "@/lib/agreement/queries";

export const runtime = "nodejs";

export async function GET(_request: Request, ctx: RouteContext<"/api/agreement/[token]/pdf">) {
  const { token } = await ctx.params;

  const row = await findAgreementByToken(token);
  if (!row) return new Response("Not found", { status: 404 });

  const pdf = await getPdf(row.id);
  if (!pdf) return new Response("No signed copy is available for this agreement yet.", { status: 404 });

  const filename = `Callvia-Service-Agreement-${row.business_name.replace(/[^a-zA-Z0-9]+/g, "-")}.pdf`;

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
