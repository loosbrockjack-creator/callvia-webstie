-- 003_trials_and_onboarding.sql
-- Free trial agreements and client onboarding forms. Run once, by hand, in the
-- Neon SQL editor, after 002_client_auth.sql.
--
-- Two things happen here.
--
-- 1. Trials become a second KIND of agreement rather than a second table. The
--    template_id / template_version FK already exists for exactly this, so a
--    trial inherits token rotation, view tracking, the compare-and-swap status
--    machine, the signature audit columns, PDF storage, and agreement_events
--    with no new code in any of those layers.
--
--    A trial deliberately never reaches 'active'. Its terminal status is
--    'signed', and "running / ending soon / ended" is derived from
--    trial_ends_on at read time. That keeps the invariant in docs/AGREEMENTS.md
--    exactly as written: 'active' is reachable only from a Stripe webhook.
--
-- 2. Onboarding forms get their own table. They are not contracts: no
--    signature, no snapshot, no PDF, no money, nothing worth sharing with the
--    agreement machinery beyond the hashed-token link pattern.

-- ---------------------------------------------------------------------------
-- agreements: trial support
-- ---------------------------------------------------------------------------
alter table agreements
  add column if not exists kind                     text not null default 'service',
  add column if not exists trial_starts_on          date,
  add column if not exists trial_ends_on            date,
  add column if not exists converted_to_agreement_id uuid references agreements(id),
  add column if not exists converted_at             timestamptz;

comment on column agreements.kind is
  'service = paid agreement (Stripe). trial = free trial agreement (no Stripe, terminal status is signed).';
comment on column agreements.converted_to_agreement_id is
  'Set on a TRIAL row when it is converted, pointing at the service agreement created from it.';

-- Same reasoning as agreements_status_valid: a CHECK, not an enum, so adding a
-- third kind later is a drop and recreate rather than an ALTER TYPE.
alter table agreements drop constraint if exists agreements_kind_valid;
alter table agreements add constraint agreements_kind_valid
  check (kind in ('service','trial'));

-- A trial has no price, so the original "must cost something" rule has to make
-- room for it. Service agreements are unchanged: still at least one non-zero
-- price, still rejected at the API layer before they ever reach this check.
alter table agreements drop constraint if exists agreements_has_a_price;
alter table agreements add constraint agreements_has_a_price
  check (kind = 'trial' or setup_fee_cents > 0 or monthly_cents > 0);

-- A trial's window is part of the document text (it interpolates into the
-- agreement body), so a trial without dates is a malformed contract.
alter table agreements drop constraint if exists agreements_trial_dates;
alter table agreements add constraint agreements_trial_dates
  check (
    kind <> 'trial'
    or (trial_starts_on is not null
        and trial_ends_on is not null
        and trial_ends_on > trial_starts_on)
  );

-- A trial never enters the payment lifecycle. Catching this in the database
-- means a bug in a route handler cannot quietly bill a trial client.
alter table agreements drop constraint if exists agreements_trial_never_paid;
alter table agreements add constraint agreements_trial_never_paid
  check (
    kind <> 'trial'
    or (status not in ('payment_pending','active')
        and stripe_subscription_id is null
        and stripe_checkout_session_id is null)
  );

-- Drives the "trials ending soon" panel on the dashboard.
create index if not exists agreements_trial_ends_idx
  on agreements (trial_ends_on)
  where kind = 'trial';

create index if not exists agreements_kind_created_idx
  on agreements (kind, created_at desc);

-- ---------------------------------------------------------------------------
-- onboarding_forms: what we need in order to actually build someone's agent.
--
-- Sent to any email. client_id is a soft link, filled in when the address
-- matches an existing client, and left null otherwise so a form can go out
-- before that business has ever signed anything.
-- ---------------------------------------------------------------------------
create table if not exists onboarding_forms (
  id                   uuid primary key default gen_random_uuid(),
  client_id            uuid references clients(id),  -- nullable on purpose

  -- Same discipline as agreement links: the raw token is shown once, only its
  -- sha256 is stored, and a resend rotates it so the old link dies.
  token_hash           text not null unique,
  token_last4          text not null,
  expires_at           timestamptz,

  -- Who it was sent to. Copied onto the row rather than read through client_id,
  -- because the form may predate the client record.
  business_name        text,
  contact_name         text,
  email                text not null,

  status               text not null default 'sent',
  constraint onboarding_status_valid check (status in ('sent','viewed','submitted','void')),

  -- The answers, keyed by the question ids in components/onboarding/questions.ts.
  -- jsonb rather than columns: the question set will change, and a schema
  -- migration per wording tweak is not worth it for data we only ever read back
  -- whole.
  answers              jsonb not null default '{}'::jsonb,

  -- Delivery and engagement, mirroring the agreements columns.
  sent_at              timestamptz,
  first_viewed_at      timestamptz,
  last_viewed_at       timestamptz,
  view_count           integer not null default 0 check (view_count >= 0),

  submitted_at         timestamptz,
  submitted_ip         inet,
  submitted_user_agent text,

  voided_at            timestamptz,
  voided_reason        text,
  admin_note           text,

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  -- Belt and braces, matching agreements_signed_complete: a submitted form
  -- must carry the audit fields that prove who submitted it.
  constraint onboarding_submitted_complete check (
    status <> 'submitted'
    or (submitted_at is not null and submitted_ip is not null)
  )
);

create index if not exists onboarding_status_created_idx on onboarding_forms (status, created_at desc);
create index if not exists onboarding_client_idx         on onboarding_forms (client_id, created_at desc);
create index if not exists onboarding_email_lower_idx    on onboarding_forms (lower(email));

-- Postgres has no `create trigger if not exists`, so drop first to keep this
-- migration safe to re-run.
drop trigger if exists onboarding_forms_touch on onboarding_forms;
create trigger onboarding_forms_touch before update on onboarding_forms
  for each row execute function touch_updated_at();
