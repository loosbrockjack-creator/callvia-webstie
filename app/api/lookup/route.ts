// Carrier / line-type lookup via Twilio Lookup v2.
// Returns { carrier, lineType } or nulls so the client can degrade gracefully.
// The number is used for this single lookup only. It is never stored, called, or texted.

const DAILY_LIMIT_PER_IP = 5;

// Best-effort rate limiting. In-memory, so it only persists per warm serverless
// instance on Vercel. Acceptable as a cost guard (~$0.008/lookup), not a security boundary.
const hits = new Map<string, { day: string; count: number }>();

function rateLimited(ip: string): boolean {
  const day = new Date().toISOString().slice(0, 10);
  const entry = hits.get(ip);
  if (!entry || entry.day !== day) {
    hits.set(ip, { day, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > DAILY_LIMIT_PER_IP;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const digits = String(body?.phone ?? "").replace(/\D/g, "");
  const ten = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;

  if (ten.length !== 10) {
    return Response.json({ carrier: null, lineType: null }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return Response.json({ carrier: null, lineType: null });
  }

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    // Env vars not configured: estimate-only mode.
    return Response.json({ carrier: null, lineType: null });
  }

  try {
    const res = await fetch(
      `https://lookups.twilio.com/v2/PhoneNumbers/${encodeURIComponent(`+1${ten}`)}?Fields=line_type_intelligence`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        },
        cache: "no-store",
      }
    );
    if (!res.ok) {
      return Response.json({ carrier: null, lineType: null });
    }
    const data = await res.json();
    const lti = data?.line_type_intelligence;
    return Response.json({
      carrier: lti?.carrier_name ?? null,
      lineType: lti?.type ?? null,
    });
  } catch {
    return Response.json({ carrier: null, lineType: null });
  }
}
