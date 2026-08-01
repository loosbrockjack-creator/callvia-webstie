// Records that the client opened their onboarding link.
//
// Fired from the browser on mount rather than during the server render, so a
// crawler or a prefetch cannot inflate the count, and so the page render stays
// free of writes.

import { findOnboardingByToken, markOnboardingViewed } from "@/lib/onboarding/queries";

export const runtime = "nodejs";

export async function POST(request: Request, ctx: RouteContext<"/api/onboarding/[token]/view">) {
  const { token } = await ctx.params;

  const row = await findOnboardingByToken(token);
  // Deliberately quiet: a bad token gets the same shape as a good one, so this
  // endpoint cannot be used to probe which tokens exist.
  if (!row) return Response.json({ ok: true });

  await markOnboardingViewed(row.id);
  return Response.json({ ok: true });
}
