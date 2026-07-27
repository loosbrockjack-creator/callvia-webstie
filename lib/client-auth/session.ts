// Client session cookie: shape, verification, and sliding renewal.
//
// Unlike the admin cookie (a stateless HMAC, revocable only by rotating the
// shared secret, which kills everyone at once), a client session is a row in
// client_sessions keyed by the hash of the cookie value. That is what lets one
// client be force-logged-out without touching anyone else, and what makes a
// 60-day cookie tolerable: a leaked cookie can be revoked.
//
// Imported by proxy.ts, which runs on the Node.js runtime in Next 16, so the
// Neon HTTP driver and node:crypto are both available.

import { hashToken } from "../crypto";
import { findSessionByHash, touchSessionExpiry, sessionTtlMs } from "./queries";

export const CLIENT_COOKIE = "cv_client";

const RENEW_THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000; // renew when < 30 days remain

export const clientSessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: sessionTtlMs() / 1000,
};

export interface ClientSession {
  clientId: string;
  sessionId: string;
  expiresAt: Date;
}

export async function verifyClientSession(
  rawToken: string | undefined | null,
): Promise<ClientSession | null> {
  if (!rawToken) return null;
  const row = await findSessionByHash(hashToken(rawToken));
  if (!row) return null;
  return {
    clientId: row.client_id,
    sessionId: row.id,
    expiresAt: new Date(row.expires_at),
  };
}

// Slides the expiry forward when the session is inside its renewal window.
// Returns true if the caller should re-set the cookie (to refresh maxAge too).
// Only proxy.ts calls this, because only it can mutate the outgoing Set-Cookie.
export async function renewIfNeeded(session: ClientSession): Promise<boolean> {
  if (session.expiresAt.getTime() - Date.now() > RENEW_THRESHOLD_MS) return false;
  await touchSessionExpiry(session.sessionId, new Date(Date.now() + sessionTtlMs()));
  return true;
}
