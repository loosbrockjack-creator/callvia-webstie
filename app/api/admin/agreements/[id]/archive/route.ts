// Delete (soft-archive) an agreement or trial. Same table, same kind column,
// so this one route serves both the Agreements and Trials tables.

import { requireAdmin } from "@/lib/require-admin";
import { sameOrigin } from "@/lib/parse";
import { archiveAgreement } from "@/lib/agreement/queries";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/admin/agreements/[id]/archive">,
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!sameOrigin(request)) {
    return Response.json({ ok: false, error: "Bad origin" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const ok = await archiveAgreement(id);
  if (!ok) return Response.json({ ok: false, error: "Already deleted or not found." }, { status: 409 });
  return Response.json({ ok: true });
}
