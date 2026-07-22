// Verbatim consent and disclosure copy.
//
// Every string here is shown to the signer AND stored on the agreement row AND
// printed into the signed PDF. They live in one place so the three copies can
// never drift, which is the whole point: the evidentiary value of a consent
// record comes from being able to prove exactly what wording was displayed.
//
// Do not reword these casually. The SMS text in particular is Twilio A2P 10DLC
// copy carried over verbatim from the old onboarding form.

import { formatCents } from "../money";

export const INTENT_TO_SIGN_TEXT =
  "By typing my name below and clicking Sign and Continue, I intend this to be my legally binding electronic signature on this Agreement.";

export const ESIGN_CONSENT_TEXT =
  "I consent to sign this Agreement electronically and to receive records relating to it electronically. I confirm I can access and retain PDF documents by email. I understand I may withdraw this consent or request a free paper copy by emailing team@callvia.io.";

export const AUTHORITY_ACK_TEXT =
  "I am authorized to enter into this Agreement on behalf of the business named above.";

// TCPA / Twilio A2P 10DLC. Must stay optional and unchecked by default, and
// must never gate submission.
export const SMS_CONSENT_TEXT =
  "By checking this box, I agree to receive recurring SMS messages from Callvia related to appointment scheduling and customer service at the phone number provided. Message frequency varies. Message and data rates may apply. Reply STOP to opt out at any time or HELP for help.";

// State automatic-renewal laws require the recurring amount and frequency to be
// disclosed clearly and conspicuously, immediately next to the control that
// authorizes the charge, not buried in the terms.
export function recurringDisclosure(monthlyCents: number, setupFeeCents: number): string | null {
  if (monthlyCents <= 0) return null;
  const monthly = formatCents(monthlyCents);
  const lead =
    setupFeeCents > 0
      ? `You are authorizing a one-time charge of ${formatCents(setupFeeCents)} today, plus a recurring charge of ${monthly} per month`
      : `You are authorizing a recurring charge of ${monthly} per month`;
  return `${lead}, beginning today, which continues automatically until you cancel. You can cancel at any time by emailing team@callvia.io, effective at the end of your current billing cycle.`;
}

export function oneTimeDisclosure(setupFeeCents: number): string {
  return `You are authorizing a one-time charge of ${formatCents(setupFeeCents)} today. This is not a recurring charge.`;
}
