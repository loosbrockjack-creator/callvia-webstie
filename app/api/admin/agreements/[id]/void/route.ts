// Void an agreement. Soft only: the row, its snapshot, and its signed PDF are
// never deleted, because a signed contract has to survive for the limitations
// period even after it stops being commercially live.

import { requireAdmin } from "@/lib/require-admin";
import { asString, readJson, sameOrigin } from "@/lib/parse";
import { voidAgreement } from "@/lib/agreement/queries";

export const runtime = "nodejs";

export async function POST(request: Request, ctx: RouteContext<"/api/admin/agreements/[id]/void">) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!sameOrigin(request)) {
    return Response.json({ ok: false, error: "Bad origin" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const body = await readJson(request);
  const reason = asString(body?.reason) || "Voided by admin";

  const ok = await voidAgreement(id, reason);
  if (!ok) return Response.json({ ok: false, error: "Already void or not found." }, { status: 409 });
  return Response.json({ ok: true });
}
