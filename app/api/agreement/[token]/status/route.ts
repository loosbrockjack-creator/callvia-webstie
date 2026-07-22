// Minimal status read for the completion page's poll. Returns only the
// lifecycle status: no amounts, no signature details, nothing that would be
// worth harvesting if a token leaked into a log.

import { findAgreementByToken } from "@/lib/agreement/queries";

export const runtime = "nodejs";

export async function GET(_request: Request, ctx: RouteContext<"/api/agreement/[token]/status">) {
  const { token } = await ctx.params;
  const row = await findAgreementByToken(token);
  if (!row) return Response.json({ ok: false }, { status: 404 });
  return Response.json({ ok: true, status: row.status });
}
