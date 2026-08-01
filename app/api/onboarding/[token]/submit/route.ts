// Records a completed onboarding form.
//
// Same ordering rule as the sign route: persist first, notify afterwards. The
// answers are durable before any email is attempted, so a Resend outage costs a
// notification, never a client's twelve minutes of typing.

import { after } from "next/server";
import { clientIp, readJson, userAgent } from "@/lib/parse";
import { notifyAddress, sendEmail } from "@/lib/email";
import { findOnboardingByToken, markOnboardingSubmitted } from "@/lib/onboarding/queries";
import { ONBOARDING_QUESTIONS, QUESTION_LABELS } from "@/lib/onboarding/questions";

export const runtime = "nodejs";
export const maxDuration = 30;

// Every id the form can legitimately produce: the question ids, plus the inner
// field ids of any "fields" question, which store their answers separately.
const ALLOWED_IDS = new Set<string>([
  ...ONBOARDING_QUESTIONS.map((q) => q.id),
  ...ONBOARDING_QUESTIONS.flatMap((q) => (q.fields ?? []).map((f) => f.id)),
]);

const MAX_LEN = 2000;

// Whitelist rather than store-what-arrives. This jsonb is rendered back into an
// admin page and an email, so an unbounded blob from a public endpoint would be
// both a storage problem and an injection surface.
function sanitize(raw: unknown): Record<string, string | string[]> {
  if (typeof raw !== "object" || raw === null) return {};
  const out: Record<string, string | string[]> = {};

  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!ALLOWED_IDS.has(key)) continue;

    if (typeof value === "string") {
      const v = value.trim().slice(0, MAX_LEN);
      if (v) out[key] = v;
    } else if (Array.isArray(value)) {
      const items = value
        .filter((x): x is string => typeof x === "string")
        .map((x) => x.trim().slice(0, MAX_LEN))
        .filter(Boolean)
        .slice(0, 20);
      if (items.length > 0) out[key] = items;
    }
  }

  return out;
}

function formatAnswers(answers: Record<string, string | string[]>): string {
  // Printed in the question order the client saw, not in object key order,
  // so the email reads like the form.
  const ids = [
    ...ONBOARDING_QUESTIONS.flatMap((q) =>
      q.fields ? q.fields.map((f) => f.id) : [q.id],
    ),
  ];

  return ids
    .filter((id) => answers[id] !== undefined)
    .map((id) => {
      const v = answers[id];
      const label = QUESTION_LABELS[id] ?? id;
      return `${label}\n  ${Array.isArray(v) ? v.join(", ") : v}`;
    })
    .join("\n\n");
}

export async function POST(request: Request, ctx: RouteContext<"/api/onboarding/[token]/submit">) {
  const { token } = await ctx.params;

  const row = await findOnboardingByToken(token);
  if (!row) return Response.json({ ok: false, error: "Not found." }, { status: 404 });

  if (row.status === "void") {
    return Response.json({ ok: false, error: "This form is no longer active." }, { status: 409 });
  }
  if (row.status === "submitted") {
    // A double-tapped Finish lands here. From the client's point of view their
    // answers are recorded, which is the outcome they wanted.
    return Response.json({ ok: true, alreadySubmitted: true });
  }
  if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) {
    return Response.json({ ok: false, error: "This link has expired." }, { status: 410 });
  }

  const body = await readJson(request);
  if (!body) return Response.json({ ok: false, error: "Invalid body." }, { status: 400 });

  const answers = sanitize(body.answers);
  if (Object.keys(answers).length === 0) {
    return Response.json({ ok: false, error: "No answers were received." }, { status: 400 });
  }

  const saved = await markOnboardingSubmitted(
    row.id,
    answers,
    clientIp(request),
    userAgent(request),
  );

  // Zero rows from the guarded update: submitted by another request first.
  if (!saved) return Response.json({ ok: true, alreadySubmitted: true });

  const business =
    (answers.businessName as string) ?? row.business_name ?? row.email;

  after(async () => {
    await sendEmail({
      to: [notifyAddress()],
      replyTo: row.email,
      subject: `ONBOARDING: ${business}`,
      text: [
        `${business} completed their onboarding form.`,
        ``,
        `Contact: ${row.contact_name ?? "not recorded"}`,
        `Email:   ${row.email}`,
        `Client:  ${row.client_id ? `linked (${row.client_id})` : "no client record"}`,
        ``,
        `--- Answers ---`,
        ``,
        formatAnswers(answers),
        ``,
        `--- Audit ---`,
        `Submitted:  ${saved.submitted_at}`,
        `IP:         ${saved.submitted_ip ?? "not recorded"}`,
        `User agent: ${saved.submitted_user_agent ?? "not recorded"}`,
        ``,
        `View it in the admin: /admin/onboarding/${saved.id}`,
      ].join("\n"),
    });
  });

  return Response.json({ ok: true });
}
