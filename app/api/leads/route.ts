// Build-funnel lead notifications, emailed to team@callvia.io via Resend.
// Events:
//   "insights-reached": they finished the questions (answers only, no contact
//                       info is collected in the funnel anymore)
//   "choice":           picked live-demo (contact comes via cal.com) or
//                       email-demo (email collected right on that card)
//
// Policy: this route NEVER blocks the funnel. If the email send fails, the
// full payload is logged (recoverable in Vercel function logs) and the route
// still returns ok.

const NOTIFY_TO = "team@callvia.io";

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function answerLines(answers: Record<string, unknown>): string[] {
  return Object.entries(answers).map(([k, v]) => {
    const val = Array.isArray(v) ? v.join(", ") : String(v ?? "");
    return `${k}: ${val || "(blank)"}`;
  });
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

  const event = str(body.event);
  const answers = (body.answers ?? {}) as Record<string, unknown>;
  const repeatShare = typeof body.repeatShare === "number" ? body.repeatShare : null;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const timestamp = new Date().toISOString();

  const commonLines = [
    `--- Funnel answers ---`,
    ...answerLines(answers),
    ...(repeatShare !== null ? [`repeatShare: ${repeatShare}%`] : []),
    ``,
    `Timestamp (UTC): ${timestamp}`,
    `Requester IP:    ${ip}`,
  ];

  if (event === "insights-reached") {
    const business = str(answers.trade) || "unknown trade";
    const record = { event, answers, repeatShare, timestamp, ip };
    const text = [`Someone finished the build questions (no contact info yet).`, ``, ...commonLines].join("\n");
    await sendEmail(`Build funnel: questions completed (${business})`, text, record);
    return Response.json({ ok: true });
  }

  if (event === "choice") {
    const choice = str(body.choice);
    if (!["live-demo", "email-demo"].includes(choice)) {
      return Response.json({ ok: false, error: "Unknown choice." }, { status: 400 });
    }

    const email = str(body.email);
    if (choice === "email-demo" && !email) {
      return Response.json({ ok: false, error: "Email required for email demo." }, { status: 400 });
    }

    const record = { event, choice, email, answers, repeatShare, timestamp, ip };
    const label = choice === "live-demo" ? "live demo (contact via cal.com booking)" : `email demo for ${email}`;
    const text = [
      `New build request: ${label}`,
      ``,
      ...(email ? [`Email: ${email}`, ``] : []),
      ...commonLines,
    ].join("\n");

    const subject =
      choice === "live-demo"
        ? "Build request: live demo booked"
        : `Build request: email demo for ${email}`;
    await sendEmail(subject, text, record);
    return Response.json({ ok: true });
  }

  return Response.json({ ok: false, error: "Unknown event." }, { status: 400 });
}
