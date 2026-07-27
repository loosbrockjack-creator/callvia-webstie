// Database access for client-facing magic-link auth and sessions.
//
// Same two conventions as lib/agreement/queries.ts:
//   1. Only the hash of a token is ever stored (via lib/crypto).
//   2. Consuming a login token is a compare-and-swap: a double-click or a
//      link-scanner pre-fetch that already consumed it returns zero rows on
//      the second attempt, which the caller treats as "already used".

import { q } from "../db";
import { generateToken, hashToken, tokenLast4 } from "../crypto";

const LOGIN_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes
const SESSION_TTL_MS = 60 * 24 * 60 * 60 * 1000; // 60 days

export function sessionTtlMs(): number {
  return SESSION_TTL_MS;
}

// Resolve an email to its client id, if any. Callers must not reveal which
// case occurred (no enumeration).
export async function findClientIdByEmail(email: string): Promise<string | null> {
  const rows = await q<{ id: string }>(
    `select id from clients where lower(email) = lower($1) limit 1`,
    [email],
  );
  return rows[0]?.id ?? null;
}

// Mints a login token, returning the raw value exactly once. Only its hash is
// stored, so it cannot be recovered afterward.
export async function createLoginToken(
  clientId: string,
  ip: string | null,
  ua: string | null,
): Promise<{ rawToken: string }> {
  const rawToken = generateToken();
  const expiresAt = new Date(Date.now() + LOGIN_TOKEN_TTL_MS).toISOString();
  await q(
    `insert into client_login_tokens
       (client_id, token_hash, token_last4, expires_at, requested_ip, requested_user_agent)
     values ($1, $2, $3, $4, $5::inet, $6)`,
    [clientId, hashToken(rawToken), tokenLast4(rawToken), expiresAt, ip, ua],
  );
  return { rawToken };
}

// Single-use exchange. The CAS (consumed_at is null and not expired) means a
// second use returns null, never a second session.
export async function consumeLoginToken(
  rawToken: string,
): Promise<{ clientId: string } | null> {
  const rows = await q<{ client_id: string }>(
    `update client_login_tokens
       set consumed_at = now()
     where token_hash = $1
       and consumed_at is null
       and expires_at > now()
     returning client_id`,
    [hashToken(rawToken)],
  );
  const row = rows[0];
  return row ? { clientId: row.client_id } : null;
}

export async function createSession(
  clientId: string,
  ip: string | null,
  ua: string | null,
): Promise<{ rawToken: string; expiresAt: Date }> {
  const rawToken = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await q(
    `insert into client_sessions
       (client_id, session_token_hash, expires_at, created_ip, created_user_agent)
     values ($1, $2, $3, $4::inet, $5)`,
    [clientId, hashToken(rawToken), expiresAt.toISOString(), ip, ua],
  );
  return { rawToken, expiresAt };
}

export interface SessionRow {
  id: string;
  client_id: string;
  expires_at: Date;
}

// A live session: not revoked and not expired. last_seen_at is bumped on every
// verified read so an idle session's true recency is visible in the DB.
export async function findSessionByHash(tokenHash: string): Promise<SessionRow | null> {
  const rows = await q<SessionRow>(
    `update client_sessions
       set last_seen_at = now()
     where session_token_hash = $1
       and revoked_at is null
       and expires_at > now()
     returning id, client_id, expires_at`,
    [tokenHash],
  );
  return rows[0] ?? null;
}

export async function touchSessionExpiry(sessionId: string, newExpiresAt: Date): Promise<void> {
  await q(`update client_sessions set expires_at = $2 where id = $1`, [
    sessionId,
    newExpiresAt.toISOString(),
  ]);
}

export async function revokeSessionByHash(tokenHash: string): Promise<void> {
  await q(
    `update client_sessions set revoked_at = now()
     where session_token_hash = $1 and revoked_at is null`,
    [tokenHash],
  );
}

// Admin force-logout: kills every live session for one client at once.
export async function revokeAllSessionsForClient(clientId: string): Promise<number> {
  const rows = await q<{ id: string }>(
    `update client_sessions set revoked_at = now()
     where client_id = $1 and revoked_at is null
     returning id`,
    [clientId],
  );
  return rows.length;
}

// Serverless-safe throttling for the login-request endpoint. An in-memory Map
// would not work: Vercel lambda instances do not share memory.
export async function recentLoginRequestsByIp(
  ip: string | null,
  windowMinutes = 15,
): Promise<number> {
  const rows = await q<{ n: number }>(
    `select count(*)::int as n from client_login_attempts
     where at > now() - make_interval(mins => $2::int)
       and ($1::inet is null or ip = $1::inet)`,
    [ip, windowMinutes],
  );
  return rows[0]?.n ?? 0;
}

export async function recentLoginRequestsByEmail(
  email: string,
  windowMinutes = 15,
): Promise<number> {
  const rows = await q<{ n: number }>(
    `select count(*)::int as n from client_login_attempts
     where at > now() - make_interval(mins => $2::int)
       and lower(email) = lower($1)`,
    [email, windowMinutes],
  );
  return rows[0]?.n ?? 0;
}

export async function recordLoginRequest(
  ip: string | null,
  email: string,
  matched: boolean,
): Promise<void> {
  await q(`insert into client_login_attempts (ip, email, matched) values ($1::inet, $2, $3)`, [
    ip,
    email,
    matched,
  ]);
}
