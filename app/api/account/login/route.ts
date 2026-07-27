// Passwordless login: emails a single-use magic link to the address on file.
//
// Like the old billing-portal route, the response is always a generic success,
// whether or not the email matches a client, so this endpoint cannot be used to
// enumerate accounts. The only non-generic response is a 429 when the requester
// is throttled, which reveals nothing about any particular email.

import { asString, clientIp, isEmail, readJson, sameOrigin, userAgent } from "@/lib/parse";
import {
  createLoginToken,
  findClientIdByEmail,
  recentLoginRequestsByEmail,
  recentLoginRequestsByIp,
  recordLoginRequest,
} from "@/lib/client-auth/queries";
import { sendEmail, siteUrl } from "@/lib/email";

export const runtime = "nodejs";

const MAX_PER_IP = 15;
const MAX_PER_EMAIL = 5;

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return Response.json({ ok: false, error: "Invalid origin." }, { status: 403 });
  }

  const body = await readJson(request);
  const email = asString(body?.email);
  if (!isEmail(email)) {
    return Response.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  }

  const ip = clientIp(request);

  // Throttling lives in Postgres, not memory: Vercel lambda instances do not
  // share state, so an in-memory counter is trivially bypassed.
  const [byIp, byEmail] = await Promise.all([
    recentLoginRequestsByIp(ip),
    recentLoginRequestsByEmail(email),
  ]);
  if (byIp >= MAX_PER_IP || byEmail >= MAX_PER_EMAIL) {
    return Response.json(
      { ok: false, error: "Too many requests. Try again in 15 minutes." },
      { status: 429 },
    );
  }

  try {
    const clientId = await findClientIdByEmail(email);
    await recordLoginRequest(ip, email, clientId !== null);

    if (clientId) {
      const { rawToken } = await createLoginToken(clientId, ip, userAgent(request));
      const link = `${siteUrl()}/account/verify/${rawToken}`;
      await sendEmail({
        to: [email],
        subject: "Your Callvia login link",
        text: [
          `Hi,`,
          ``,
          `Here is your secure link to log in to your Callvia account:`,
          ``,
          link,
          ``,
          `This link expires in 15 minutes and can only be used once. If you did not request it, you can ignore this email.`,
          ``,
          `Callvia`,
          `team@callvia.io`,
        ].join("\n"),
      });
    }
  } catch (err) {
    // Log and fall through to the generic response. A DB or mail failure must
    // not reveal whether the email matched a client.
    console.error("ACCOUNT LOGIN error:", err);
  }

  return Response.json({ ok: true });
}
