import { cookies } from "next/headers";
import { ADMIN_COOKIE, checkPassword, createSessionValue, sessionCookieOptions } from "@/lib/admin-session";
import { asString, clientIp, readJson, sameOrigin } from "@/lib/parse";
import { recentFailedLogins, recordLoginAttempt } from "@/lib/agreement/queries";

export const runtime = "nodejs";

const MAX_FAILURES = 8;

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return Response.json({ ok: false, error: "Bad origin" }, { status: 403 });
  }

  const ip = clientIp(request);

  // Throttling lives in Postgres, not memory: Vercel lambda instances do not
  // share state, so an in-memory counter is trivially bypassed.
  const failures = await recentFailedLogins(ip);
  if (failures >= MAX_FAILURES) {
    return Response.json(
      { ok: false, error: "Too many attempts. Try again in 15 minutes." },
      { status: 429 },
    );
  }

  const body = await readJson(request);
  const password = asString(body?.password);

  if (!password || !checkPassword(password)) {
    await recordLoginAttempt(ip, false);
    // Deliberately vague, and identical timing-wise to a wrong password.
    return Response.json({ ok: false, error: "Incorrect password." }, { status: 401 });
  }

  await recordLoginAttempt(ip, true);
  const store = await cookies();
  store.set(ADMIN_COOKIE, createSessionValue(), sessionCookieOptions);
  return Response.json({ ok: true });
}
