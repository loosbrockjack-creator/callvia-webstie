// Revokes the current session (flips revoked_at) and clears the cookie. No auth
// gate needed: a stale or missing cookie is simply a no-op, same as admin logout.

import { cookies } from "next/headers";
import { CLIENT_COOKIE } from "@/lib/client-auth/session";
import { revokeSessionByHash } from "@/lib/client-auth/queries";
import { hashToken } from "@/lib/crypto";

export const runtime = "nodejs";

export async function POST() {
  const store = await cookies();
  const raw = store.get(CLIENT_COOKIE)?.value;
  if (raw) await revokeSessionByHash(hashToken(raw));
  store.delete(CLIENT_COOKIE);
  return Response.json({ ok: true });
}
