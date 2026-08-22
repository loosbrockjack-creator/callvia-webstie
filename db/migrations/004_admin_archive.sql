-- 004_admin_archive.sql
-- Soft-delete ("archive") for the admin dashboard. Nothing in this system is
-- ever hard-deleted (see 001_init.sql) -- signed contracts have a 7-year
-- retention obligation and agreement_events is append-only. "Delete" in the
-- admin UI sets archived_at instead of removing a row: every list query the
-- dashboard reads from filters archived_at is null, so an archived row
-- disappears from every table and from every Overview stat/chart, while
-- staying on the record for compliance and recoverable by direct DB access.
--
-- Trials are agreements with kind = 'trial' (003_trials_and_onboarding.sql),
-- so one column on `agreements` covers both Agreements and Trials.

alter table clients          add column if not exists archived_at timestamptz;
alter table agreements       add column if not exists archived_at timestamptz;
alter table onboarding_forms add column if not exists archived_at timestamptz;

comment on column clients.archived_at is
  'Set by the admin "Delete" action. Cascades to the client''s agreements and onboarding forms in the same request. Not a hard delete: recoverable by clearing this column directly in Postgres.';
comment on column agreements.archived_at is
  'Set by the admin "Delete" action on an agreement or trial row (kind = service or trial). Distinct from voided_at/status = void: voiding is a contract lifecycle event with legal meaning; archiving is purely dashboard/analytics visibility.';
comment on column onboarding_forms.archived_at is
  'Set by the admin "Delete" action. Removes the form from the Onboarding list. Submitted answers are untouched.';

-- Every current dashboard list query (listAgreements, listClients,
-- listOnboarding) has no WHERE clause today beyond `order by created_at desc
-- limit 200`. The only new predicate any of them gains is `archived_at is
-- null`, so a partial index on exactly that predicate is what actually serves
-- these queries.
create index if not exists agreements_active_created_idx
  on agreements (created_at desc) where archived_at is null;

create index if not exists clients_active_created_idx
  on clients (created_at desc) where archived_at is null;

create index if not exists onboarding_active_created_idx
  on onboarding_forms (created_at desc) where archived_at is null;
