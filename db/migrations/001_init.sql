-- 001_init.sql
-- Callvia Agreements schema. Run once, by hand, in the Neon SQL editor.
--
-- Money is stored as integer cents everywhere. Never float, never dollars.
-- Nothing in this schema is ever hard-deleted: agreements are voided, and
-- agreement_events is append-only. Signed records must survive for the
-- contract limitations period.

create extension if not exists pgcrypto;   -- gen_random_uuid()

-- ---------------------------------------------------------------------------
-- clients: durable per-business record, survives multiple agreements.
-- This is the table a future client portal hangs off.
-- ---------------------------------------------------------------------------
create table if not exists clients (
  id                  uuid primary key default gen_random_uuid(),
  business_name       text        not null,
  contact_name        text        not null,
  email               text        not null,
  phone               text,                          -- 10 digits, no formatting
  stripe_customer_id  text unique,                   -- set on first successful checkout
  portal_token_hash   text unique,                   -- reserved for the Stripe Billing Portal link
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create unique index if not exists clients_email_lower_idx on clients (lower(email));

-- ---------------------------------------------------------------------------
-- agreement_templates: one row per frozen contract version.
-- The authoritative text lives in lib/agreement/templates/vN.ts. This table
-- exists so agreements can foreign-key to a version and so the source hash of
-- each version is recorded outside the codebase.
-- ---------------------------------------------------------------------------
create table if not exists agreement_templates (
  template_id   text        not null,
  version       integer     not null,
  title         text        not null,
  effective_at  timestamptz not null default now(),
  source_sha256 text        not null,               -- sha256 of the uninterpolated template
  retired_at    timestamptz,                        -- non-null: no longer offered for NEW agreements
  primary key (template_id, version)
);

-- ---------------------------------------------------------------------------
-- agreements: the aggregate. One row per document sent to one client.
-- ---------------------------------------------------------------------------
create table if not exists agreements (
  id                       uuid primary key default gen_random_uuid(),
  client_id                uuid not null references clients(id),

  -- link. The raw token is never stored, only its sha256 and last 4 chars.
  token_hash               text not null unique,
  token_last4              text not null,
  expires_at               timestamptz,              -- only meaningful while status in (sent, viewed)

  -- lifecycle
  status                   text not null default 'draft',
  status_changed_at        timestamptz not null default now(),

  -- template binding
  template_id              text not null default 'callvia-service-agreement',
  template_version         integer not null,
  foreign key (template_id, template_version)
    references agreement_templates(template_id, version),

  -- pricing, integer cents only
  currency                 text    not null default 'usd',
  setup_fee_cents          integer not null default 0 check (setup_fee_cents >= 0),
  monthly_cents            integer not null default 0 check (monthly_cents   >= 0),
  setup_fee_label          text    not null default 'One-time setup fee',
  monthly_label            text    not null default 'Monthly service',
  constraint agreements_has_a_price
    check (setup_fee_cents > 0 or monthly_cents > 0),

  -- package / scope of services. Copied onto the row at creation, never
  -- referenced by FK, so editing lib/packages.ts cannot alter a sent agreement.
  package_key              text,                     -- null for a fully custom agreement
  package_name             text not null,
  package_summary          text,
  included_items           jsonb not null default '[]'::jsonb,
  usage_terms              jsonb,                    -- e.g. included minutes, overage rate

  -- immutable snapshot, written once at signature
  agreement_snapshot       jsonb,
  snapshot_sha256          text,

  -- signature + audit, written once at signature
  signed_at                timestamptz,
  signed_name              text,
  signed_email             text,
  signed_title             text,
  signed_ip                inet,
  signed_user_agent        text,
  signed_intent_text       text,                     -- verbatim attestation shown to the signer
  signed_authority_ack     boolean not null default false,
  esign_consent            boolean not null default false,
  esign_consent_text       text,
  sms_consent              boolean not null default false,
  sms_consent_text         text,
  sms_consent_at           timestamptz,

  -- delivery / engagement
  sent_at                  timestamptz,
  sent_to_email            text,
  first_viewed_at          timestamptz,
  last_viewed_at           timestamptz,
  view_count               integer not null default 0,

  -- stripe
  stripe_checkout_session_id text unique,
  stripe_customer_id         text,
  stripe_subscription_id     text,
  stripe_payment_intent_id   text,
  stripe_invoice_id          text,
  subscription_status        text,
  paid_at                    timestamptz,
  amount_paid_cents          integer,

  -- the signed artifact, stored inline
  pdf_bytes                bytea,
  pdf_sha256               text,
  pdf_generated_at         timestamptz,
  pdf_emailed_at           timestamptz,

  -- admin
  voided_at                timestamptz,
  voided_reason            text,
  admin_note               text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),

  -- A CHECK rather than a Postgres enum: adding a status later is a one-line
  -- drop and recreate instead of an ALTER TYPE.
  constraint agreements_status_valid check (status in (
    'draft','sent','viewed','signed','payment_pending','active','void','expired'
  )),

  -- Belt and braces: anything past signing must carry a complete signature.
  constraint agreements_signed_complete check (
    status in ('draft','sent','viewed','void','expired')
    or (signed_at is not null and signed_name is not null
        and signed_ip is not null and agreement_snapshot is not null)
  )
);

create index if not exists agreements_status_created_idx on agreements (status, created_at desc);
create index if not exists agreements_client_idx         on agreements (client_id, created_at desc);
create index if not exists agreements_sub_idx            on agreements (stripe_subscription_id)
  where stripe_subscription_id is not null;

-- ---------------------------------------------------------------------------
-- agreement_events: append-only audit log. Never updated, never deleted.
-- ---------------------------------------------------------------------------
create table if not exists agreement_events (
  id            bigserial primary key,
  agreement_id  uuid not null references agreements(id) on delete restrict,
  type          text not null,     -- created|sent|viewed|signed|checkout_created|paid|
                                   -- checkout_expired|payment_failed|pdf_generated|
                                   -- pdf_emailed|voided|subscription_updated|admin_note
  at            timestamptz not null default now(),
  actor         text,              -- client | admin | stripe | system
  ip            inet,
  user_agent    text,
  data          jsonb not null default '{}'::jsonb
);

create index if not exists agreement_events_agreement_idx on agreement_events (agreement_id, at desc);

-- ---------------------------------------------------------------------------
-- stripe_events: webhook idempotency ledger. livemode is stored so test-mode
-- and live-mode events can never be confused for one another.
-- ---------------------------------------------------------------------------
create table if not exists stripe_events (
  id            text primary key,          -- Stripe's evt_...
  type          text not null,
  livemode      boolean not null,
  received_at   timestamptz not null default now(),
  processed_at  timestamptz,
  error         text,
  payload       jsonb not null
);

-- ---------------------------------------------------------------------------
-- admin_login_attempts: rate limiting. This has to live in the database, not
-- an in-memory Map, because Vercel lambda instances do not share memory.
-- ---------------------------------------------------------------------------
create table if not exists admin_login_attempts (
  id        bigserial primary key,
  ip        inet,
  at        timestamptz not null default now(),
  succeeded boolean not null
);

create index if not exists admin_login_attempts_ip_at_idx on admin_login_attempts (ip, at desc);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists clients_touch on clients;
create trigger clients_touch before update on clients
  for each row execute function touch_updated_at();

drop trigger if exists agreements_touch on agreements;
create trigger agreements_touch before update on agreements
  for each row execute function touch_updated_at();
