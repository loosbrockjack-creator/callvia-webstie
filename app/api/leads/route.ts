// Build-funnel lead notifications, emailed to team@callvia.io via Resend.
// Two stages:
//   stage "background": full form answers, sent the moment the form completes
//   stage "choice":     which delivery option they picked (live demo / email demo)
//
// Same policy as /api/onboarding: this route NEVER blocks the funnel. If the
// email send fails, the full payload is logged (recoverable in Vercel function
// logs) and the route still returns ok.

const NOTIFY_TO = "team@callvia.io";

type Stage = "background" | "choice";

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

async function sendEmail(subject: string, text: string, record: unknown) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("BUILD LEAD (RESEND_API_KEY not set, delivery skipped):", JSON.stringify(record));
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM ?? "Callvia Leads <onboarding@resend.dev>",
        to: [NOTIFY_TO],
        subject,
        text,
      }),
    });
    if (!res.ok) {
      console.error("BUILD LEAD (Resend send failed):", res.status, await res.text(), JSON.stringify(record));
    }
  } catch (err) {
    console.error("BUILD LEAD (Resend request threw):", err, JSON.stringify(record));
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return Response.json({ ok: false, error: "Invalid payload." }, { status: 400 });
  }

  const stage = body.stage as Stage;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const timestamp = new Date().toISOString();

  if (stage === "background") {
    const fullName = str(body.fullName);
    const email = str(body.email);
    const business = str(body.business);
    if (!fullName || !email || !business) {
      return Response.json({ ok: false, error: "Missing required fields." }, { status: 400 });
    }

    const answers = (body.answers ?? {}) as Record<string, unknown>;
    const record = { stage, fullName, email, business, answers, timestamp, ip };

    const answerLines = Object.entries(answers).map(([k, v]) => {
      const val = Array.isArray(v) ? v.join(", ") : String(v ?? "");
      return `${k}: ${val || "(blank)"}`;
    });

    const text = [
      `New build request`,
      ``,
      `Name:     ${fullName}`,
      `Email:    ${email}`,
      `Business: ${business}`,
      `Phone:    ${str(body.phone) || "(not given)"}`,
      ``,
      `--- Background answers ---`,
      ...answerLines,
      ``,
      `Timestamp (UTC): ${timestamp}`,
      `Requester IP:    ${ip}`,
    ].join("\n");

    await sendEmail(`New build request: ${business}`, text, record);
    return Response.json({ ok: true });
  }

  if (stage === "choice") {
    const email = str(body.email);
    const business = str(body.business);
    const choice = str(body.choice);
    if (!email || !business || !["live-demo", "email-demo"].includes(choice)) {
      return Response.json({ ok: false, error: "Missing required fields." }, { status: 400 });
    }

    const label = choice === "live-demo" ? "live demo" : "email demo";
    const record = { stage, email, business, choice, timestamp, ip };
    const text = [
      `Build request update`,
      ``,
      `Business: ${business}`,
      `Email:    ${email}`,
      `Chose:    ${label}`,
      ``,
      `Timestamp (UTC): ${timestamp}`,
    ].join("\n");

    await sendEmail(`Build request: ${business} chose ${label}`, text, record);
    return Response.json({ ok: true });
  }

  return Response.json({ ok: false, error: "Unknown stage." }, { status: 400 });
}
