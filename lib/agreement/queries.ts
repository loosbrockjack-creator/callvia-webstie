// All database access for agreements.
//
// Two conventions hold throughout:
//
// 1. Every lifecycle change is a compare-and-swap:
//      update ... where id = $1 and status = any($expected) returning ...
//    Zero rows back means another actor (usually a Stripe webhook racing the
//    browser) got there first. Callers handle that; the database never guesses.
//
// 2. bytea moves as base64 through encode()/decode(), not as a bound Buffer.
//    The Neon HTTP driver serializes parameters as text, so a raw Buffer would
//    not round-trip.

import { q } from "../db";
import { generateToken, hashToken, sha256Hex, tokenLast4 } from "../crypto";
import { canonicalJson } from "./interpolate";
import type { AgreementStatus } from "./status";
import type { RenderedAgreement, UsageTermsSnapshot } from "./types";

export interface AgreementRow {
  id: string;
  client_id: string;

  business_name: string;
  contact_name: string;
  email: string;
  phone: string | null;

  token_last4: string;
  expires_at: Date | null;

  status: AgreementStatus;
  status_changed_at: Date;

  template_id: string;
  template_version: number;

  currency: string;
  setup_fee_cents: number;
  monthly_cents: number;
  setup_fee_label: string;
  monthly_label: string;

  package_key: string | null;
  package_name: string;
  package_summary: string | null;
  included_items: string[];
  usage_terms: UsageTermsSnapshot | null;

  agreement_snapshot: RenderedAgreement | null;
  snapshot_sha256: string | null;

  signed_at: Date | null;
  signed_name: string | null;
  signed_email: string | null;
  signed_title: string | null;
  signed_ip: string | null;
  signed_user_agent: string | null;
  signed_intent_text: string | null;
  signed_authority_ack: boolean;
  esign_consent: boolean;
  esign_consent_text: string | null;
  sms_consent: boolean;
  sms_consent_text: string | null;
  sms_consent_at: Date | null;

  sent_at: Date | null;
  sent_to_email: string | null;
  first_viewed_at: Date | null;
  last_viewed_at: Date | null;
  view_count: number;

  stripe_checkout_session_id: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_invoice_id: string | null;
  subscription_status: string | null;
  paid_at: Date | null;
  amount_paid_cents: number | null;

  pdf_sha256: string | null;
  pdf_generated_at: Date | null;
  pdf_emailed_at: Date | null;

  voided_at: Date | null;
  voided_reason: string | null;
  admin_note: string | null;
  created_at: Date;
  updated_at: Date;
}

// Every read joins the client so callers always have the party details.
const SELECT_AGREEMENT = `
  select a.id, a.client_id,
         c.business_name, c.contact_name, c.email, c.phone,
         a.token_last4, a.expires_at, a.status, a.status_changed_at,
         a.template_id, a.template_version,
         a.currency, a.setup_fee_cents, a.monthly_cents, a.setup_fee_label, a.monthly_label,
         a.package_key, a.package_name, a.package_summary, a.included_items, a.usage_terms,
         a.agreement_snapshot, a.snapshot_sha256,
         a.signed_at, a.signed_name, a.signed_email, a.signed_title,
         host(a.signed_ip) as signed_ip, a.signed_user_agent, a.signed_intent_text,
         a.signed_authority_ack, a.esign_consent, a.esign_consent_text,
         a.sms_consent, a.sms_consent_text, a.sms_consent_at,
         a.sent_at, a.sent_to_email, a.first_viewed_at, a.last_viewed_at, a.view_count,
         a.stripe_checkout_session_id, a.stripe_customer_id, a.stripe_subscription_id,
         a.stripe_payment_intent_id, a.stripe_invoice_id, a.subscription_status,
         a.paid_at, a.amount_paid_cents,
         a.pdf_sha256, a.pdf_generated_at, a.pdf_emailed_at,
         a.voided_at, a.voided_reason, a.admin_note, a.created_at, a.updated_at
  from agreements a
  join clients c on c.id = a.client_id
`;

export async function findAgreementByToken(rawToken: string): Promise<AgreementRow | null> {
  const rows = await q<AgreementRow>(`${SELECT_AGREEMENT} where a.token_hash = $1`, [hashToken(rawToken)]);
  return rows[0] ?? null;
}

export async function findAgreementById(id: string): Promise<AgreementRow | null> {
  const rows = await q<AgreementRow>(`${SELECT_AGREEMENT} where a.id = $1`, [id]);
  return rows[0] ?? null;
}

export async function listAgreements(): Promise<AgreementRow[]> {
  return q<AgreementRow>(`${SELECT_AGREEMENT} order by a.created_at desc limit 200`, []);
}

export async function logEvent(
  agreementId: string,
  type: string,
  opts: { actor?: string; ip?: string | null; userAgent?: string | null; data?: unknown } = {},
): Promise<void> {
  await q(
    `insert into agreement_events (agreement_id, type, actor, ip, user_agent, data)
     values ($1, $2, $3, $4::inet, $5, $6::jsonb)`,
    [
      agreementId,
      type,
      opts.actor ?? "system",
      opts.ip ?? null,
      opts.userAgent ?? null,
      JSON.stringify(opts.data ?? {}),
    ],
  );
}

export interface CreateAgreementInput {
  businessName: string;
  contactName: string;
  email: string;
  phone: string | null;
  packageKey: string | null;
  packageName: string;
  packageSummary: string | null;
  includedItems: string[];
  usageTerms: UsageTermsSnapshot | null;
  setupFeeCents: number;
  monthlyCents: number;
  setupFeeLabel: string;
  monthlyLabel: string;
  templateVersion: number;
  expiresInDays: number | null;
}

// Returns the raw token exactly once. It is never stored and cannot be
// recovered afterward, so the caller must surface it to the admin immediately.
export async function createAgreement(
  input: CreateAgreementInput,
): Promise<{ id: string; rawToken: string }> {

  // Select-then-write rather than ON CONFLICT: the uniqueness is enforced by an
  // expression index (lower(email)), and naming an expression as a conflict
  // target is fussier than it is worth for an admin-only, low-volume path.
  const existing = await q<{ id: string }>(`select id from clients where lower(email) = lower($1)`, [
    input.email,
  ]);
  let clientId: string;
  if (existing.length > 0) {
    clientId = existing[0].id;
    await q(
      `update clients
         set business_name = $2, contact_name = $3, phone = coalesce($4, phone)
       where id = $1`,
      [clientId, input.businessName, input.contactName, input.phone],
    );
  } else {
    const created = await q<{ id: string }>(
      `insert into clients (business_name, contact_name, email, phone)
       values ($1, $2, $3, $4) returning id`,
      [input.businessName, input.contactName, input.email, input.phone],
    );
    clientId = created[0].id;
  }

  const rawToken = generateToken();
  const expiresAt =
    input.expiresInDays === null
      ? null
      : new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000).toISOString();

  const rows = await q<{ id: string }>(
    `insert into agreements (
       client_id, token_hash, token_last4, expires_at,
       template_id, template_version,
       setup_fee_cents, monthly_cents, setup_fee_label, monthly_label,
       package_key, package_name, package_summary, included_items, usage_terms
     ) values (
       $1, $2, $3, $4,
       'callvia-service-agreement', $5,
       $6, $7, $8, $9,
       $10, $11, $12, $13::jsonb, $14::jsonb
     ) returning id`,
    [
      clientId,
      hashToken(rawToken),
      tokenLast4(rawToken),
      expiresAt,
      input.templateVersion,
      input.setupFeeCents,
      input.monthlyCents,
      input.setupFeeLabel,
      input.monthlyLabel,
      input.packageKey,
      input.packageName,
      input.packageSummary,
      JSON.stringify(input.includedItems),
      input.usageTerms ? JSON.stringify(input.usageTerms) : null,
    ],
  );

  const id = rows[0].id;
  await logEvent(id, "created", { actor: "admin", data: { packageKey: input.packageKey } });
  return { id, rawToken };
}

// Because only the hash of a token is stored, an existing link cannot be
// recovered to re-send it. Resending issues a fresh token instead, which also
// invalidates the previous link. That is a feature: a link forwarded to the
// wrong person can be revoked by resending.
export async function rotateToken(id: string): Promise<string | null> {
  const rawToken = generateToken();
  const rows = await q(
    `update agreements set token_hash = $2, token_last4 = $3
     where id = $1 and status <> 'void'
     returning id`,
    [id, hashToken(rawToken), tokenLast4(rawToken)],
  );
  return rows.length > 0 ? rawToken : null;
}

export async function markSent(id: string, toEmail: string): Promise<boolean> {
  const rows = await q(
    `update agreements
       set status = 'sent', status_changed_at = now(),
           sent_at = coalesce(sent_at, now()), sent_to_email = $2
     where id = $1 and status in ('draft', 'sent')
     returning id`,
    [id, toEmail],
  );
  if (rows.length === 0) return false;
  await logEvent(id, "sent", { actor: "admin", data: { toEmail } });
  return true;
}

export async function markViewed(
  id: string,
  ip: string | null,
  ua: string | null,
): Promise<void> {
  // Always record the view; only advance the status out of `sent`.
  await q(
    `update agreements
       set first_viewed_at = coalesce(first_viewed_at, now()),
           last_viewed_at  = now(),
           view_count      = view_count + 1,
           status          = case when status = 'sent' then 'viewed' else status end,
           status_changed_at = case when status = 'sent' then now() else status_changed_at end
     where id = $1`,
    [id],
  );
  await logEvent(id, "viewed", { actor: "client", ip, userAgent: ua });
}

export interface SignInput {
  agreementId: string;
  snapshot: RenderedAgreement;
  signedName: string;
  signedEmail: string;
  signedTitle: string | null;
  ip: string | null;
  userAgent: string | null;
  intentText: string;
  authorityAck: boolean;
  esignConsent: boolean;
  esignConsentText: string;
  smsConsent: boolean;
  smsConsentText: string;
}

// One statement, guarded. A double-clicked submit returns zero rows on the
// second attempt, which the route reports as "already signed" rather than an
// error. Expiry is re-checked here so a stale link cannot be signed even if
// the page was left open.
export async function signAgreement(input: SignInput): Promise<AgreementRow | null> {
  const snapshotJson = JSON.stringify(input.snapshot);
  const snapshotHash = sha256Hex(canonicalJson(input.snapshot));

  const rows = await q(
    `update agreements set
       status = 'signed', status_changed_at = now(),
       agreement_snapshot = $2::jsonb, snapshot_sha256 = $3,
       signed_at = now(), signed_name = $4, signed_email = $5, signed_title = $6,
       signed_ip = $7::inet, signed_user_agent = $8, signed_intent_text = $9,
       signed_authority_ack = $10, esign_consent = $11, esign_consent_text = $12,
       sms_consent = $13, sms_consent_text = $14,
       sms_consent_at = case when $13 then now() else null end
     where id = $1
       and status in ('sent', 'viewed')
       and (expires_at is null or expires_at > now())
     returning id`,
    [
      input.agreementId,
      snapshotJson,
      snapshotHash,
      input.signedName,
      input.signedEmail,
      input.signedTitle,
      input.ip,
      input.userAgent,
      input.intentText,
      input.authorityAck,
      input.esignConsent,
      input.esignConsentText,
      input.smsConsent,
      input.smsConsentText,
    ],
  );
  if (rows.length === 0) return null;

  await logEvent(input.agreementId, "signed", {
    actor: "client",
    ip: input.ip,
    userAgent: input.userAgent,
    data: { snapshotSha256: snapshotHash, smsConsent: input.smsConsent },
  });
  return findAgreementById(input.agreementId);
}

export async function attachPdf(id: string, pdf: Uint8Array): Promise<string> {
  const hash = sha256Hex(pdf);
  await q(
    `update agreements
       set pdf_bytes = decode($2, 'base64'), pdf_sha256 = $3, pdf_generated_at = now()
     where id = $1`,
    [id, Buffer.from(pdf).toString("base64"), hash],
  );
  await logEvent(id, "pdf_generated", { data: { sha256: hash } });
  return hash;
}

export async function getPdf(id: string): Promise<Buffer | null> {
  const rows = await q<{ b64: string }>(
    `select encode(pdf_bytes, 'base64') as b64 from agreements where id = $1 and pdf_bytes is not null`,
    [id],
  );
  const b64 = rows[0]?.b64;
  return b64 ? Buffer.from(b64, "base64") : null;
}

export async function markPdfEmailed(id: string): Promise<void> {
  await q(`update agreements set pdf_emailed_at = now() where id = $1`, [id]);
  await logEvent(id, "pdf_emailed", {});
}

export async function markCheckoutCreated(id: string, sessionId: string): Promise<void> {
  await q(
    `update agreements
       set status = 'payment_pending', status_changed_at = now(),
           stripe_checkout_session_id = $2
     where id = $1 and status in ('signed', 'payment_pending')`,
    [id, sessionId],
  );
  await logEvent(id, "checkout_created", { actor: "client", data: { sessionId } });
}

export interface PaidInput {
  agreementId: string;
  customerId: string | null;
  subscriptionId: string | null;
  paymentIntentId: string | null;
  invoiceId: string | null;
  amountPaidCents: number | null;
}

// Idempotent, and reachable from two paths: the webhook (authoritative) and the
// reconciliation check on the completion page. Both call this; the CAS makes a
// second call a no-op.
export async function markPaid(input: PaidInput): Promise<boolean> {
  const rows = await q<{ id: string; client_id: string }>(
    `update agreements set
       status = 'active', status_changed_at = now(), paid_at = now(),
       stripe_customer_id     = coalesce($2, stripe_customer_id),
       stripe_subscription_id = coalesce($3, stripe_subscription_id),
       stripe_payment_intent_id = coalesce($4, stripe_payment_intent_id),
       stripe_invoice_id      = coalesce($5, stripe_invoice_id),
       amount_paid_cents      = coalesce($6, amount_paid_cents),
       subscription_status    = case when $3 is not null then 'active' else subscription_status end
     where id = $1 and status in ('signed', 'payment_pending')
     returning id, client_id`,
    [
      input.agreementId,
      input.customerId,
      input.subscriptionId,
      input.paymentIntentId,
      input.invoiceId,
      input.amountPaidCents,
    ],
  );
  if (rows.length === 0) return false;

  // Backfill the durable client record so the billing portal works later.
  if (input.customerId) {
    const clientId = rows[0].client_id;
    await q(
      `update clients set stripe_customer_id = $2 where id = $1 and stripe_customer_id is null`,
      [clientId, input.customerId],
    );
  }
  await logEvent(input.agreementId, "paid", { actor: "stripe", data: input });
  return true;
}

// The only permitted backward transition, on checkout.session.expired.
export async function revertToSigned(id: string, reason: string): Promise<void> {
  await q(
    `update agreements
       set status = 'signed', status_changed_at = now(), stripe_checkout_session_id = null
     where id = $1 and status = 'payment_pending'`,
    [id],
  );
  await logEvent(id, "checkout_expired", { actor: "stripe", data: { reason } });
}

export async function setSubscriptionStatus(subscriptionId: string, status: string): Promise<void> {
  const rows = await q<{ id: string }>(
    `update agreements set subscription_status = $2
     where stripe_subscription_id = $1 returning id`,
    [subscriptionId, status],
  );
  const id = rows[0]?.id;
  if (id) await logEvent(id, "subscription_updated", { actor: "stripe", data: { status } });
}

export async function voidAgreement(id: string, reason: string): Promise<boolean> {
  // Soft only. The row and its PDF are never deleted.
  const rows = await q(
    `update agreements
       set status = 'void', status_changed_at = now(), voided_at = now(), voided_reason = $2
     where id = $1 and status <> 'void'
     returning id`,
    [id, reason],
  );
  if (rows.length === 0) return false;
  await logEvent(id, "voided", { actor: "admin", data: { reason } });
  return true;
}

export async function listEvents(agreementId: string): Promise<
  Array<{ id: string; type: string; at: Date; actor: string | null; ip: string | null; data: unknown }>
> {
  return q<{ id: string; type: string; at: Date; actor: string | null; ip: string | null; data: unknown }>(
    `select id, type, at, actor, host(ip) as ip, data
     from agreement_events where agreement_id = $1 order by at desc limit 100`,
    [agreementId],
  );
}

// Webhook idempotency. Returns false when this event id has been seen before,
// in which case the caller must do nothing and return 200.
export async function claimStripeEvent(
  id: string,
  type: string,
  livemode: boolean,
  payload: unknown,
): Promise<boolean> {
  const rows = await q(
    `insert into stripe_events (id, type, livemode, payload)
     values ($1, $2, $3, $4::jsonb)
     on conflict (id) do nothing
     returning id`,
    [id, type, livemode, JSON.stringify(payload)],
  );
  return rows.length > 0;
}

export async function finishStripeEvent(id: string): Promise<void> {
  await q(`update stripe_events set processed_at = now() where id = $1`, [id]);
}

// Called when a handler throws. The claim row has to go, or the retry Stripe
// sends would be rejected as a duplicate and the event would be lost forever.
// The failure is preserved on a separate id so the ledger still records it.
export async function releaseStripeEvent(
  id: string,
  type: string,
  livemode: boolean,
  payload: unknown,
  error: string,
): Promise<void> {
  await q(`delete from stripe_events where id = $1`, [id]);
  await q(
    `insert into stripe_events (id, type, livemode, payload, processed_at, error)
     values ($1, $2, $3, $4::jsonb, now(), $5)
     on conflict (id) do nothing`,
    [`${id}:failed:${Date.now()}`, type, livemode, JSON.stringify(payload), error],
  );
}

export async function ensureTemplateRegistered(
  templateId: string,
  version: number,
  title: string,
  sourceSha256: string,
): Promise<void> {
  await q(
    `insert into agreement_templates (template_id, version, title, source_sha256)
     values ($1, $2, $3, $4)
     on conflict (template_id, version) do nothing`,
    [templateId, version, title, sourceSha256],
  );
}

// Serverless-safe login throttling. An in-memory Map would not work: Vercel
// lambda instances do not share memory.
export async function recentFailedLogins(ip: string | null, windowMinutes = 15): Promise<number> {
  const rows = await q<{ n: number }>(
    `select count(*)::int as n from admin_login_attempts
     where succeeded = false and at > now() - make_interval(mins => $2::int)
       and ($1::inet is null or ip = $1::inet)`,
    [ip, windowMinutes],
  );
  return rows[0]?.n ?? 0;
}

export async function recordLoginAttempt(ip: string | null, succeeded: boolean): Promise<void> {
  await q(`insert into admin_login_attempts (ip, succeeded) values ($1::inet, $2)`, [
    ip,
    succeeded,
  ]);
}
