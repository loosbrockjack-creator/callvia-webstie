// Admin force-logout: revokes every live client_session for one client at
// once. Used when a client's device is lost or a login link was forwarded to
// the wrong person. The client can simply log in again to get a fresh session.

import { requireAdmin } from "@/lib/require-admin";
import { sameOrigin } from "@/lib/parse";
import { revokeAllSessionsForClient } from "@/lib/client-auth/queries";

export const runtime = "nodejs";

export async function POST(request: Request, ctx: RouteContext<"/api/admin/clients/[id]/revoke-sessions">) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!sameOrigin(request)) {
    return Response.json({ ok: false, error: "Bad origin" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const count = await revokeAllSessionsForClient(id);
  return Response.json({ ok: true, revoked: count });
}
