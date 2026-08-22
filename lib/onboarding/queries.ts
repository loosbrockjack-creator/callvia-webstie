// All database access for onboarding forms.
//
// Follows the same two conventions as lib/agreement/queries.ts: every state
// change is a compare-and-swap, and a raw token is generated once, stored only
// as a sha256, and never recoverable afterward.
//
// Onboarding is not a contract, so there is no snapshot, no signature, and no
// PDF. What it does share is the tokenized-link pattern, which is why the
// crypto helpers are reused rather than reinvented.

import { q } from "../db";
import { generateToken, hashToken, tokenLast4 } from "../crypto";

export type OnboardingStatus = "sent" | "viewed" | "submitted" | "void";

export interface OnboardingRow {
  id: string;
  client_id: string | null;
  token_last4: string;
  expires_at: Date | null;

  business_name: string | null;
  contact_name: string | null;
  email: string;

  status: OnboardingStatus;
  answers: Record<string, string | string[]>;

  sent_at: Date | null;
  first_viewed_at: Date | null;
  last_viewed_at: Date | null;
  view_count: number;

  submitted_at: Date | null;
  submitted_ip: string | null;
  submitted_user_agent: string | null;

  voided_at: Date | null;
  voided_reason: string | null;
  admin_note: string | null;
  created_at: Date;
  updated_at: Date;
  archived_at: Date | null;
}

const SELECT_ONBOARDING = `
  select o.id::text as id, o.client_id::text as client_id,
         o.token_last4, o.expires_at,
         o.business_name, o.contact_name, o.email,
         o.status, o.answers,
         o.sent_at, o.first_viewed_at, o.last_viewed_at, o.view_count,
         o.submitted_at, host(o.submitted_ip) as submitted_ip, o.submitted_user_agent,
         o.voided_at, o.voided_reason, o.admin_note, o.created_at, o.updated_at, o.archived_at
    from onboarding_forms o
`;

export async function findOnboardingByToken(rawToken: string): Promise<OnboardingRow | null> {
  const rows = await q<OnboardingRow>(`${SELECT_ONBOARDING} where o.token_hash = $1`, [
    hashToken(rawToken),
  ]);
  return rows[0] ?? null;
}

export async function findOnboardingById(id: string): Promise<OnboardingRow | null> {
  const rows = await q<OnboardingRow>(`${SELECT_ONBOARDING} where o.id = $1`, [id]);
  return rows[0] ?? null;
}

export async function listOnboarding(): Promise<OnboardingRow[]> {
  return q<OnboardingRow>(
    `${SELECT_ONBOARDING} where o.archived_at is null order by o.created_at desc limit 200`,
    [],
  );
}

// For the admin's client detail sub-panel. Excludes archived rows, same
// reasoning as listAgreementsForClient: a real client's forms are never
// archived, so this only ever hides a deleted test form.
export async function listOnboardingForClient(clientId: string): Promise<OnboardingRow[]> {
  return q<OnboardingRow>(
    `${SELECT_ONBOARDING} where o.client_id = $1 and o.archived_at is null order by o.created_at desc limit 50`,
    [clientId],
  );
}

export interface CreateOnboardingInput {
  businessName: string | null;
  contactName: string | null;
  email: string;
  expiresInDays: number | null;
}

// Returns the raw token exactly once. Same rule as agreements: it is not
// stored and cannot be recovered, so the caller must surface it immediately.
export async function createOnboarding(
  input: CreateOnboardingInput,
): Promise<{ id: string; rawToken: string }> {
  // Soft link to an existing client by email. Deliberately a lookup rather than
  // an upsert: sending someone an onboarding form should not conjure a client
  // record for a business that has never signed anything.
  const existing = await q<{ id: string }>(
    `select id from clients where lower(email) = lower($1)`,
    [input.email],
  );
  const clientId = existing[0]?.id ?? null;

  const rawToken = generateToken();
  const expiresAt =
    input.expiresInDays === null
      ? null
      : new Date(Date.now() + input.expiresInDays * 86_400_000).toISOString();

  const rows = await q<{ id: string }>(
    `insert into onboarding_forms
       (client_id, token_hash, token_last4, expires_at, business_name, contact_name, email)
     values ($1, $2, $3, $4, $5, $6, $7)
     returning id::text as id`,
    [
      clientId,
      hashToken(rawToken),
      tokenLast4(rawToken),
      expiresAt,
      input.businessName,
      input.contactName,
      input.email,
    ],
  );

  return { id: rows[0].id, rawToken };
}

// Resend. Rotates the token, which kills the old link: the same trade-off
// agreements make, and for the same reason (a forwarded link is a leaked link).
export async function rotateOnboardingToken(id: string): Promise<string | null> {
  const rawToken = generateToken();
  const rows = await q<{ id: string }>(
    `update onboarding_forms
        set token_hash = $2, token_last4 = $3
      where id = $1 and status <> 'submitted' and status <> 'void'
      returning id`,
    [id, hashToken(rawToken), tokenLast4(rawToken)],
  );
  return rows.length > 0 ? rawToken : null;
}

export async function markOnboardingSent(id: string, toEmail: string): Promise<boolean> {
  const rows = await q<{ id: string }>(
    `update onboarding_forms
        set status = case when status = 'void' then status else 'sent' end,
            sent_at = now(), email = $2
      where id = $1 and status <> 'submitted' and status <> 'void'
      returning id`,
    [id, toEmail],
  );
  return rows.length > 0;
}

export async function markOnboardingViewed(id: string): Promise<void> {
  // first_viewed_at is set once; last_viewed_at every time. A form that has
  // already been submitted does not move back to 'viewed'.
  await q(
    `update onboarding_forms
        set status = case when status = 'sent' then 'viewed' else status end,
            first_viewed_at = coalesce(first_viewed_at, now()),
            last_viewed_at = now(),
            view_count = view_count + 1
      where id = $1 and status in ('sent','viewed')`,
    [id],
  );
}

export async function markOnboardingSubmitted(
  id: string,
  answers: Record<string, string | string[]>,
  ip: string | null,
  userAgent: string | null,
): Promise<OnboardingRow | null> {
  // Compare-and-swap on the pre-submission states. A double-tapped submit, or a
  // resubmit from a stale tab, gets zero rows back and cannot overwrite answers
  // that are already recorded.
  const rows = await q<{ id: string }>(
    `update onboarding_forms
        set status = 'submitted',
            answers = $2::jsonb,
            submitted_at = now(),
            submitted_ip = $3::inet,
            submitted_user_agent = $4
      where id = $1 and status in ('sent','viewed')
      returning id`,
    [id, JSON.stringify(answers), ip, userAgent],
  );
  if (rows.length === 0) return null;
  return findOnboardingById(id);
}

export async function voidOnboarding(id: string, reason: string): Promise<boolean> {
  const rows = await q<{ id: string }>(
    `update onboarding_forms
        set status = 'void', voided_at = now(), voided_reason = $2
      where id = $1 and status <> 'void'
      returning id`,
    [id, reason],
  );
  return rows.length > 0;
}

// Soft only, same posture as voidOnboarding: dashboard/analytics visibility,
// not a status change. Submitted answers are untouched.
export async function archiveOnboarding(id: string): Promise<boolean> {
  const rows = await q<{ id: string }>(
    `update onboarding_forms set archived_at = now() where id = $1 and archived_at is null returning id`,
    [id],
  );
  return rows.length > 0;
}
