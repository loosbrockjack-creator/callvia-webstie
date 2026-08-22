// Delete (soft-archive) an onboarding form.

import { requireAdmin } from "@/lib/require-admin";
import { sameOrigin } from "@/lib/parse";
import { archiveOnboarding } from "@/lib/onboarding/queries";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/admin/onboarding/[id]/archive">,
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!sameOrigin(request)) {
    return Response.json({ ok: false, error: "Bad origin" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const ok = await archiveOnboarding(id);
  if (!ok) return Response.json({ ok: false, error: "Already deleted or not found." }, { status: 409 });
  return Response.json({ ok: true });
}
