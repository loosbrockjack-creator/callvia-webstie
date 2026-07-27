-- 002_client_auth.sql
-- Client-facing, passwordless magic-link auth and persistent, revocable
-- sessions. Run once, by hand, in the Neon SQL editor, after 001_init.sql.
--
-- Same discipline as agreement links: a raw token is generated once, only its
-- sha256 is stored, and the raw value lives only in the client's inbox (login
-- token) or cookie (session). A database leak cannot be replayed.

-- ---------------------------------------------------------------------------
-- client_login_tokens: single-use magic-link tokens. Emailed to the client,
-- exchanged for a session at /account/verify. Short-lived and consumed once.
-- ---------------------------------------------------------------------------
create table if not exists client_login_tokens (
  id                   uuid primary key default gen_random_uuid(),
  client_id            uuid not null references clients(id),
  token_hash           text not null unique,   -- sha256 of the raw token
  token_last4          text not null,
  expires_at           timestamptz not null,   -- created_at + 15 minutes
  consumed_at          timestamptz,            -- null until exchanged for a session
  requested_ip         inet,
  requested_user_agent text,
  created_at           timestamptz not null default now()
);

create index if not exists client_login_tokens_client_idx
  on client_login_tokens (client_id, created_at desc);

-- ---------------------------------------------------------------------------
-- client_sessions: persistent (60 day), sliding, revocable sessions. The raw
-- session token lives only in the cv_client cookie; only its hash is stored.
-- revoked_at is the kill switch: logout sets it, and an admin can set it to
-- force-log-out one client without touching anyone else (unlike the shared
-- admin secret, which would nuke every session at once).
-- ---------------------------------------------------------------------------
create table if not exists client_sessions (
  id                 uuid primary key default gen_random_uuid(),
  client_id          uuid not null references clients(id),
  session_token_hash text not null unique,
  created_at         timestamptz not null default now(),
  last_seen_at       timestamptz not null default now(),
  expires_at         timestamptz not null,     -- renewed when < 30 days remain
  revoked_at         timestamptz,
  created_ip         inet,
  created_user_agent text
);

create index if not exists client_sessions_client_idx
  on client_sessions (client_id, created_at desc);

-- ---------------------------------------------------------------------------
-- client_login_attempts: throttling for the login-request endpoint. In
-- Postgres, not memory, for the same reason as admin_login_attempts: Vercel
-- lambda instances do not share memory. `matched` is for ops visibility only
-- and must never shape the HTTP response (no enumeration).
-- ---------------------------------------------------------------------------
create table if not exists client_login_attempts (
  id      bigserial primary key,
  ip      inet,
  email   text not null,
  matched boolean not null,
  at      timestamptz not null default now()
);

create index if not exists client_login_attempts_ip_at_idx
  on client_login_attempts (ip, at desc);
create index if not exists client_login_attempts_email_at_idx
  on client_login_attempts (lower(email), at desc);

-- ---------------------------------------------------------------------------
-- portal_token_hash was reserved in 001 for a single reusable Stripe-portal
-- token and was never read or written by app code. client_sessions and
-- client_login_tokens supersede it with real expiry, multi-device support, and
-- per-session revocation. Safe to drop.
-- ---------------------------------------------------------------------------
alter table clients drop column if exists portal_token_hash;
