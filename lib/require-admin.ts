// Defense in depth. proxy.ts gates /admin and /api/admin, but the Next docs
// warn that proxy alone is not authorization, so every admin route and page
// calls one of these too.

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, verifySessionValue } from "./admin-session";

export async function isAdmin(): Promise<boolean> {
  try {
    // cookies() is async in Next 16.
    const store = await cookies();
    return verifySessionValue(store.get(ADMIN_COOKIE)?.value);
  } catch {
    return false;
  }
}

// For route handlers: returns a 401 Response to hand straight back, or null.
export async function requireAdmin(): Promise<Response | null> {
  if (await isAdmin()) return null;
  return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

// For server components.
export async function requireAdminPage(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}
