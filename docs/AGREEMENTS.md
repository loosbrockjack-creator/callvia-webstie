# Callvia Agreements

Sign-then-pay contract system. Replaces PandaDoc.

Create an agreement for a client at a specific price, email them a private link,
they read it, sign it, and pay. A signed PDF with a full audit trail is produced
automatically and emailed to both sides.

---

## How it flows

```
ADMIN     /admin -> New agreement (pick package, set price) -> Send
                                                       status: draft -> sent

CLIENT    opens /agreement/<token>                     status: viewed
          reads, ticks consents, types name, submits
             signature + IP + user agent + snapshot written
             PDF generated and emailed to both parties
                                                       status: signed  <- BINDING
          redirected to Stripe Checkout                status: payment_pending
          pays

STRIPE    webhook checkout.session.completed           status: active
```

Three rules the code depends on:

1. **The PDF is generated at signature, not at payment.** A client who signs and
   abandons checkout has still entered a binding contract, and you need the
   document for it. The PDF is immutable and deliberately contains no payment
   status.
2. **`active` is only ever reachable from a Stripe webhook.** A success redirect
   can be forged or replayed, so the completion page reads status from the
   database and polls. It also re-verifies the session with Stripe as a fallback
   if the webhook is slow or lost.
3. **Every status change is a compare-and-swap.** Zero rows updated means
   somebody else got there first. This is what makes a webhook racing a browser
   safe, and makes double-signing structurally impossible.

---

## First-time setup

### 1. Database (Neon)

Add Neon from the Vercel Marketplace, choose a **US region**. It injects
`DATABASE_URL` into all three Vercel environments automatically. Copy the
**pooled** connection string into `.env.local` for local work.

Then run `db/migrations/001_init.sql` in the Neon SQL editor. Once.

Neon's free tier scales compute to zero after 5 minutes idle and auto-resumes on
the next connection in milliseconds. Supabase was rejected for this: its free
tier pauses a project after 7 days idle and needs a **manual** restore, which
would mean a client clicking their contract link and getting an error.

### 2. Email (Resend)

**This is a hard blocker.** Verify a sending domain in Resend (for example
`agreements@callvia.io`) with SPF and DKIM, and set `RESEND_FROM` to it. The
fallback `onboarding@resend.dev` sender only delivers to the Resend account
owner, so client-facing mail silently never arrives.

### 3. Stripe

Test keys to start. Create the webhook endpoint later (see Going live).

### 4. Secrets

```
openssl rand -hex 32     # ADMIN_SESSION_SECRET
```

Pick a long passphrase for `ADMIN_PASSWORD`. Rotating `ADMIN_SESSION_SECRET`
invalidates every outstanding admin session at once: that is the kill switch.

### 5. Your packages

Edit `lib/packages.ts`. The seeded entries are placeholders. Each package
supplies defaults for the admin form; every field stays editable per client, and
you can create a fully custom agreement with no package at all.

Packages are safe to edit at any time. An agreement copies the package contents
onto its own row at creation, so changing your lineup never alters an agreement
that has already been sent or signed.

### 6. Legal review

`lib/agreement/templates/v1.ts` contains three clauses that did not exist in the
old static page and that need an attorney's eyes before go-live:

- **Section 3, Effective Date and Commencement of Services.** Protects you when
  somebody signs and never pays.
- **Section 9, Electronic Signature and Records.** Makes ESIGN consent explicit.
- **The recurring charge disclosure** (`lib/agreement/consent.ts`), shown in a
  bordered block next to the sign button. Required by state automatic-renewal
  laws. This is the biggest real exposure in the system.

Also flag the "cancel with notice" wording: some auto-renewal regimes are
hostile to notice periods that impede cancellation.

---

## Environment variables

| Var | Notes |
|---|---|
| `DATABASE_URL` | Injected by the Neon Vercel integration. Use the pooled string. |
| `STRIPE_SECRET_KEY` | `sk_test_` locally, `sk_live_` in Production only. |
| `STRIPE_WEBHOOK_SECRET` | **Different value locally** (from `stripe listen`) than in Production (from the Dashboard endpoint). |
| `ADMIN_PASSWORD` | Long random passphrase. |
| `ADMIN_SESSION_SECRET` | `openssl rand -hex 32`. |
| `RESEND_API_KEY` | Existing. |
| `RESEND_FROM` | Must be a verified domain sender. |
| `CALLVIA_NOTIFY_EMAIL` | Defaults to `team@callvia.io`. |
| `NEXT_PUBLIC_SITE_URL` | `https://callvia.io`. Used for links, `success_url`, and the origin check. |

No public Stripe key is needed. Checkout is Stripe-hosted, so no card data
touches this app and PCI scope stays at SAQ-A.

---

## Testing locally

```
npm run dev
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Put the printed `whsec_...` into `.env.local` as `STRIPE_WEBHOOK_SECRET` and
**restart the dev server**, since env is read at process start.

Note that `stripe trigger checkout.session.completed` fires a synthetic session
with no `client_reference_id`, so it only proves signature verification and the
idempotency ledger work. The real test is running your own flow with test keys.

Test cards (any future expiry, any CVC):

| Card | Behavior |
|---|---|
| `4242 4242 4242 4242` | Succeeds |
| `4000 0000 0000 9995` | Declined, insufficient funds |
| `4000 0000 0000 0341` | Attaches, then fails on the recurring charge |
| `4000 0025 0000 3155` | Requires 3D Secure |

Run all three pricing shapes: monthly only, one-time only, and setup fee plus
monthly. For the combined case, confirm Checkout shows two line items and that
the created subscription is monthly-only.

**Test the abandoned-payment path specifically:** sign, reach Stripe, close the
tab. The signed PDF should already be in the inbox, the dashboard should show
the row under "Signed, awaiting payment," and re-opening the link should show
the read-only view rather than the sign form.

Preview the PDF layout without a database or Stripe account:

```
npx tsx scripts/test-pdf.ts     # writes /tmp/callvia-sample.pdf
```

---

## Going live

1. Swap in `sk_live_...`.
2. Create a **production** webhook endpoint in the Stripe Dashboard pointing at
   `https://callvia.io/api/stripe/webhook`, subscribed to:
   `checkout.session.completed`, `checkout.session.expired`,
   `checkout.session.async_payment_succeeded`,
   `checkout.session.async_payment_failed`, `customer.subscription.updated`,
   `customer.subscription.deleted`, `invoice.payment_failed`.
   Copy **its own** signing secret into Vercel Production. It is a different
   value from the CLI's.
3. Set the Stripe statement descriptor to `CALLVIA` so clients recognize the
   charge and do not chargeback out of confusion.
4. Do one real end-to-end with a real card for a small amount, then refund it.
   Live mode differs from test mode in ways (Radar rules, receipt emails) that
   only show up in live mode.
5. Pin the template hash: run `templateSourceHash(1)` and paste the result into
   `FROZEN_HASHES` in `lib/agreement/registry.ts`. From then on, editing v1
   fails the build instead of silently changing what new clients are shown.

---

## Things worth knowing

**Agreement links cannot be recovered.** Only a SHA-256 of the token is stored.
"Resend" issues a fresh token and invalidates the old link, which is also how
you revoke a link that went to the wrong person.

**Nothing is ever hard-deleted.** Void is a status with a reason.
`agreement_events` is append-only. Plan for 7 years of retention, and note the
tension this creates with any data-deletion request.

**Signed agreements render from their snapshot, never from the template
module.** Editing `templates/v1.ts` cannot retroactively change what somebody
signed.

**The PDF is not cryptographically signed.** There is no embedded X.509
certificate. Its integrity rests on the database plus the recorded SHA-256
hashes. This is the same posture as DocuSign's and PandaDoc's standard tiers and
is completely normal, but never call the output "digitally signed," which means
something specific and stronger. "Electronically signed" is accurate.

**SMS consent must stay optional and unchecked by default**, and its copy must
stay verbatim (Twilio A2P 10DLC). It lives in one constant in
`lib/agreement/consent.ts` so it cannot drift between the page, the database,
and the PDF.

**Sales tax is not being collected.** `automatic_tax` is off. SaaS is taxable in
a growing number of states with low economic-nexus thresholds. Not a launch
blocker, but a liability that accrues quietly.

---

## The client portal (not built yet)

`clients.stripe_customer_id` and `clients.portal_token_hash` already exist in the
schema. A portal where clients view invoices and update their card is the Stripe
Billing Portal: one call to `stripe.billingPortal.sessions.create({ customer,
return_url })` behind a token check. Roughly an hour, no migration needed. That
is why this system does not need its own auth system for clients.
