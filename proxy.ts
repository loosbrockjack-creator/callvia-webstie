// Next 16 renamed the middleware convention to `proxy`. This file must sit at
// the project root and export a function named `proxy`. It runs on the Node.js
// runtime (the edge runtime is not supported here and setting `runtime` throws),
// which is why lib/admin-session.ts and lib/client-auth/* can use node:crypto
// and the Neon HTTP driver.
//
// This is a first line of defense only. The Next docs are explicit that
// authorization must also be checked inside each route and page, and it is:
// every admin route calls requireAdmin() and every account route calls
// requireClient() / requireClientPage() itself.
//
// The Stripe webhook is deliberately outside the matcher. It authenticates with
// a Stripe signature over the raw body and must not be touched here.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionValue } from "./lib/admin-session";
import { CLIENT_COOKIE, clientSessionCookieOptions, renewIfNeeded, verifyClientSession } from "./lib/client-auth/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAccountPage = pathname === "/account" || pathname.startsWith("/account/");

  // Agreement links and the client dashboard are private: keep them out of
  // search engines, out of caches, and out of referrer headers sent to third
  // parties.
  if (pathname.startsWith("/agreement/") || isAccountPage) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    res.headers.set("Referrer-Policy", "no-referrer");
    res.headers.set("Cache-Control", "private, no-store, max-age=0");
    // Agreement pages carry their own token; only /account needs a session.
    if (!isAccountPage) return res;
    return gateClient(request, res);
  }

  // Client login endpoints must stay reachable while logged out.
  if (pathname === "/api/account/login" || pathname === "/api/account/verify") {
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/account/")) {
    return gateClient(request, NextResponse.next());
  }

  // Admin gate.
  const isLoginPage = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/login";
  if (isLoginPage || isLoginApi) return NextResponse.next();

  let authed = false;
  try {
    authed = verifySessionValue(request.cookies.get(ADMIN_COOKIE)?.value);
  } catch {
    // A missing or malformed ADMIN_SESSION_SECRET means nobody is authenticated.
    authed = false;
  }
  if (authed) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  return NextResponse.redirect(url);
}

// Shared client-session gate for /account pages and /api/account routes.
// /account/verify is intentionally still gated: the verify PAGE only renders a
// button, and the token exchange (POST /api/account/verify) is exempted above,
// so a logged-out visitor with a link is redirected to /login... which is wrong
// for a fresh magic-link click. So exempt the verify page here too.
async function gateClient(request: NextRequest, okResponse: NextResponse): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/account/verify")) return okResponse;

  let session = null;
  try {
    session = await verifyClientSession(request.cookies.get(CLIENT_COOKIE)?.value);
  } catch {
    session = null;
  }

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Sliding session: refresh the cookie when it is inside the renewal window.
  if (await renewIfNeeded(session)) {
    const raw = request.cookies.get(CLIENT_COOKIE)?.value;
    if (raw) okResponse.cookies.set(CLIENT_COOKIE, raw, clientSessionCookieOptions);
  }
  return okResponse;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/agreement/:path*",
    "/account/:path*",
    "/api/account/:path*",
  ],
};
