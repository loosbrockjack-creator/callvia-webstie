// Exchanges a single-use login token for a session cookie. The token arrives in
// the POST body (not the URL) so it is never in a Referer header or server log.

import { cookies } from "next/headers";
import { asString, clientIp, readJson, sameOrigin, userAgent } from "@/lib/parse";
import { consumeLoginToken, createSession } from "@/lib/client-auth/queries";
import { CLIENT_COOKIE, clientSessionCookieOptions } from "@/lib/client-auth/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return Response.json({ ok: false, error: "Invalid origin." }, { status: 403 });
  }

  const body = await readJson(request);
  const token = asString(body?.token);
  if (!token) {
    return Response.json({ ok: false, error: "Missing token." }, { status: 400 });
  }

  const consumed = await consumeLoginToken(token);
  if (!consumed) {
    return Response.json(
      { ok: false, error: "This link is invalid, already used, or expired." },
      { status: 400 },
    );
  }

  const { rawToken } = await createSession(consumed.clientId, clientIp(request), userAgent(request));
  const store = await cookies();
  store.set(CLIENT_COOKIE, rawToken, clientSessionCookieOptions);

  return Response.json({ ok: true });
}
