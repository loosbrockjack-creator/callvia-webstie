// Hand-written request body parsing, following the type-guard pattern this
// project already uses in its route handlers. No zod: at this field count the
// extra dependency and the second idiom aren't worth it.

export function asString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export function asBool(v: unknown): boolean {
  return v === true;
}

export function asDigits(v: unknown, max = 10): string {
  return typeof v === "string" ? v.replace(/\D/g, "").slice(0, max) : "";
}

export function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => (typeof x === "string" ? x.trim() : "")).filter(Boolean);
}

export function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function asObject(body: unknown): Record<string, unknown> | null {
  if (typeof body !== "object" || body === null || Array.isArray(body)) return null;
  return body as Record<string, unknown>;
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  const body = await request.json().catch(() => null);
  return asObject(body);
}

// Callers pass the raw request so the audit trail records what the server saw,
// never a client-supplied value.
export function clientIp(request: Request): string | null {
  const fwd = request.headers.get("x-forwarded-for");
  const ip = fwd?.split(",")[0]?.trim();
  return ip && ip.length > 0 ? ip : null;
}

export function userAgent(request: Request): string | null {
  return request.headers.get("user-agent");
}

// Cheap CSRF defense for state-changing admin endpoints: the browser sets
// Origin on cross-site POSTs and it cannot be forged by page script.
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // non-browser callers (curl, Stripe) send no Origin
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (!site) return true;
  try {
    return new URL(origin).origin === new URL(site).origin;
  } catch {
    return false;
  }
}
