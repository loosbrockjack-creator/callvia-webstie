// Delete (soft-archive) a client. Cascades to every agreement, trial, and
// onboarding form tied to them, in one request -- see lib/admin/archive.ts.

import { requireAdmin } from "@/lib/require-admin";
import { sameOrigin } from "@/lib/parse";
import { archiveClientCascade } from "@/lib/admin/archive";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/admin/clients/[id]/archive">,
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!sameOrigin(request)) {
    return Response.json({ ok: false, error: "Bad origin" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const result = await archiveClientCascade(id);
  if (!result.archived) {
    return Response.json({ ok: false, error: "Already deleted or not found." }, { status: 409 });
  }
  return Response.json({
    ok: true,
    agreementsArchived: result.agreementsArchived,
    onboardingArchived: result.onboardingArchived,
  });
}
