// Next 16 renamed the middleware convention to `proxy`. This file must sit at
// the project root and export a function named `proxy`. It runs on the Node.js
// runtime (the edge runtime is not supported here and setting `runtime` throws),
// which is why lib/admin-session.ts can use node:crypto.
//
// This is a first line of defense only. The Next docs are explicit that
// authorization must also be checked inside each route and page, and it is:
// every admin route calls requireAdmin() itself.
//
// The Stripe webhook is deliberately outside the matcher. It authenticates with
// a Stripe signature over the raw body and must not be touched here.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionValue } from "./lib/admin-session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Agreement links are private documents: keep them out of search engines,
  // out of caches, and out of referrer headers sent to third parties.
  if (pathname.startsWith("/agreement/")) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    res.headers.set("Referrer-Policy", "no-referrer");
    res.headers.set("Cache-Control", "private, no-store, max-age=0");
    return res;
  }

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

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/agreement/:path*"],
};
