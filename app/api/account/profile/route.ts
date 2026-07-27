// Authenticated client updates their own contact info. Email is not accepted
// here: it is the login identity and changing it needs its own verify flow.

import { requireClient } from "@/lib/require-client";
import { asDigits, asString, readJson, sameOrigin } from "@/lib/parse";
import { updateClientContactInfo } from "@/lib/clients/queries";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return Response.json({ ok: false, error: "Invalid origin." }, { status: 403 });
  }

  const auth = await requireClient();
  if (auth instanceof Response) return auth;

  const body = await readJson(request);
  const businessName = asString(body?.businessName);
  const contactName = asString(body?.contactName);
  const phone = asDigits(body?.phone, 10);

  if (businessName.length < 2 || contactName.length < 2) {
    return Response.json(
      { ok: false, error: "Business and contact name are required." },
      { status: 400 },
    );
  }

  await updateClientContactInfo(auth.clientId, {
    businessName,
    contactName,
    phone: phone.length > 0 ? phone : null,
  });

  return Response.json({ ok: true });
}
