// Defense in depth for the client dashboard. proxy.ts gates /account and
// /api/account, but the Next docs warn that proxy alone is not authorization,
// so every account route and page calls one of these too. Parallel to
// lib/require-admin.ts.

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CLIENT_COOKIE, verifyClientSession } from "./client-auth/session";

// Returns the authenticated client id, or null.
export async function getClientId(): Promise<string | null> {
  try {
    // cookies() is async in Next 16.
    const store = await cookies();
    const session = await verifyClientSession(store.get(CLIENT_COOKIE)?.value);
    return session?.clientId ?? null;
  } catch {
    return null;
  }
}

// For route handlers: returns { clientId } or a 401 Response to hand back.
export async function requireClient(): Promise<{ clientId: string } | Response> {
  const clientId = await getClientId();
  if (clientId) return { clientId };
  return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

// For server components. Returns the client id, or redirects to /login.
export async function requireClientPage(): Promise<string> {
  const clientId = await getClientId();
  if (!clientId) redirect("/login");
  return clientId;
}
