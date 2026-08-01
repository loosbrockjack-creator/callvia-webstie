# Free trials and onboarding forms

Two workflows that used to live outside the system: free trial agreements (which
were duplicated Google Forms) and client onboarding (which did not exist).

Read `docs/AGREEMENTS.md` first. Everything here builds on it.

---

## Before this is usable

1. **Run `db/migrations/003_trials_and_onboarding.sql`** by hand in the Neon SQL
   editor, the same way 001 and 002 were applied. It is safe to re-run.
2. **Replace the trial agreement text.** `lib/agreement/templates/trial-v1.ts`
   currently holds a reconstruction of the Google Form, not the real document.
   Section 4 in particular was written from scratch. Paste the real wording in,
   then pin the hash (below).
3. **Verify the Resend sending domain.** On the `onboarding@resend.dev` fallback
   these emails deliver only to the account owner and fail silently for
   everyone else. This blocks both features for real clients.

---

## Free trials

### Why there is no Stripe

A trial touches Stripe nowhere. No card, no customer, no subscription, no
`trial_period_days`.

The alternative was a Stripe subscription in `trialing`, which means either
asking for a card before the client has seen any value, or creating a
subscription with no payment method that has to be chased later. Both drag
trial-specific wording into the recurring-charge disclosure in
`lib/agreement/consent.ts`, which `docs/AGREEMENTS.md` already identifies as the
biggest legal exposure in the system.

Keeping Stripe out means the trial reuses the token, signature, audit, and PDF
pipeline unchanged, and nothing in the trial path can start a charge.

### A trial is an agreement, not a new table

Trials are rows in `agreements` with `kind = 'trial'`. The
`template_id` / `template_version` composite FK already existed for exactly
this. That buys token rotation, view tracking, the compare-and-swap status
machine, the signature audit columns, PDF storage, and `agreement_events` with
no new code in any of those layers.

**A trial never reaches `active`.** Its terminal status is `signed`. Whether a
trial is running, ending, or over is derived from `trial_ends_on` at read time
(`trialView()` in `lib/admin/metrics.ts`), never stored. This leaves the
invariant in `docs/AGREEMENTS.md` exactly as written: `active` is reachable only
from a Stripe webhook.

### Four guards, so a trial cannot be charged

1. `agreements_trial_never_paid` CHECK: a trial cannot hold a
   `payment_pending`/`active` status, a subscription id, or a checkout session
   id. The database refuses.
2. `POST /api/agreement/[token]/checkout` returns 409 for `kind = 'trial'`.
3. The browser never calls checkout for a trial (`SignAgreement`, `isTrial`).
4. The Schedule A branch keys on `schedule.trial` being present, not on the
   price being zero, so a trial cannot fall through to a fee table even if a
   price somehow landed on the row.

`scripts/test-pdf.ts` renders both variants. The trial PDF contains no dollar
amount and no recurring-charge line at all.

### Dates

`trial_starts_on` / `trial_ends_on` are `date`, not `timestamptz`, and are
carried as `'YYYY-MM-DD'` strings the whole way (`to_char` in the select).
`new Date('2026-08-06')` parses as UTC midnight, which is the previous day in
every US timezone, so anywhere those dates are formatted or compared the parts
are split manually rather than handed to `Date`. See `formatTrialDate` and
`trialDays` in `lib/agreement/render.ts`.

### Converting

`POST /api/admin/agreements/[id]/convert` creates a **new** service agreement
carrying the trial's client, then stamps `converted_to_agreement_id` on the
trial. The trial is never mutated into an agreement: it is a separately executed
contract and the client's copy has to keep matching the record.

The stamp is a compare-and-swap on `converted_to_agreement_id is null`. If two
clicks race, the loser's response names the stray agreement so it can be voided
rather than silently orphaned.

---

## Onboarding forms

Its own table (`onboarding_forms`). It is not a contract: no signature, no
snapshot, no PDF, no money.

What it shares with agreements is the hashed-token link pattern, so
`lib/crypto.ts` is reused and a resend rotates the token and kills the old link.

- Questions live in `lib/onboarding/questions.ts`. It is the `/build` marketing
  funnel's set minus the two diagnostic questions ("how many calls do you miss",
  "what happens to a missed call today"), which exist to size the problem for a
  prospect and are pointless for someone who has already bought.
- The flow reuses the funnel's UI via `components/funnel/shared.tsx`.
  `BuildFunnel` keeps its own questions, insights, and demo-choice ending; only
  the presentation pieces are shared, so the marketing funnel cannot regress
  from an onboarding change.
- `client_id` is a **soft** link, filled in when the email matches an existing
  client and left null otherwise. Sending someone a form does not conjure a
  client record for a business that has never signed anything.
- Submitted answers are whitelisted against the known question ids and length
  capped before storage. This is a public endpoint writing jsonb that is later
  rendered into an admin page and an email.
- Submission is a compare-and-swap on the pre-submission states, so a
  double-tapped Finish cannot overwrite recorded answers.
- Answers are persisted **before** any email is attempted. A Resend outage costs
  a notification, never a client's twelve minutes of typing.

`/onboarding/:path*` is in the `proxy.ts` matcher and gets the same
noindex / no-referrer / no-store headers as `/agreement/*`. The token is the
credential, so it is exempt from the admin gate.

---

## Pinning template hashes

Neither template is pinned in `FROZEN_HASHES` yet. Pin each the moment a client
first signs against it:

```
npx tsx -e "import {templateSourceHash,TEMPLATE_ID,TRIAL_TEMPLATE_ID} from './lib/agreement/registry'; \
  console.log('service', templateSourceHash(TEMPLATE_ID,1)); \
  console.log('trial  ', templateSourceHash(TRIAL_TEMPLATE_ID,1))"
```

Then fill in `FROZEN_HASHES` in `lib/agreement/registry.ts`. After that, editing
a signed template throws at agreement-creation time instead of silently changing
what new clients are shown.

---

## The admin dashboard

`/admin` is a route group: `app/admin/(shell)/` carries the layout and the auth
gate, `/admin/login` sits outside it. A layout at `app/admin/layout.tsx` would
wrap the login page and redirect it to itself forever.

Sections: Overview, Clients, Agreements, Trials, Onboarding.

Every number and both charts on Overview are computed in memory from the rows
`listAgreements()` already returns (`lib/admin/metrics.ts`). The only query
added for the dashboard is `listRecentEvents()` for the activity feed. If the
200-row cap in `listAgreements` ever becomes the binding constraint on those
numbers, that is the moment to push aggregation into SQL, not before.

Design tokens are in the `@theme` block of `app/globals.css`. The admin is
deliberately near-monochrome: accent purple appears on the active nav item,
primary buttons, and focus rings, and nowhere else. Green and red report state
only.

The two-series chart separates its lines by lightness rather than hue. Running
the `dataviz` palette validator on that pair reports the two failures every
greyscale palette reports (chroma floor, lightness band); the checks that decide
whether a reader can separate the series pass at ΔE 41.8 against a 15 floor, and
lightness is the one channel every kind of color vision deficiency preserves. It
ships with a legend and direct end labels so identity never rests on color.
