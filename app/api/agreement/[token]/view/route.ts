// Records that the client opened their agreement link, and advances
// sent -> viewed. Called from the browser on mount rather than during render,
// so a page render is never a write.

import { clientIp, userAgent } from "@/lib/parse";
import { findAgreementByToken, markViewed } from "@/lib/agreement/queries";

export const runtime = "nodejs";

export async function POST(request: Request, ctx: RouteContext<"/api/agreement/[token]/view">) {
  const { token } = await ctx.params;
  const row = await findAgreementByToken(token);
  if (!row) return Response.json({ ok: false }, { status: 404 });

  await markViewed(row.id, clientIp(request), userAgent(request));
  return Response.json({ ok: true });
}
