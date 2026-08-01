// Callvia Free Trial Agreement, version 1.
//
// ---------------------------------------------------------------------------
// JACK: THE CLAUSE TEXT BELOW IS A RECONSTRUCTION, NOT YOUR DOCUMENT.
//
// It was rebuilt from the structure of your Google Form (the eight section
// headings and the substance of each clause). The fetch tool would not
// reproduce the wording verbatim, and section 4 did not come through at all,
// so §4 below is written from scratch.
//
// Replace every `text` string with the exact wording from your form before
// sending this to a real client, then pin the hash in registry.ts. The
// machinery around it (dates, interpolation, signing, PDF, audit) is finished
// and does not change when you paste the real text in.
// ---------------------------------------------------------------------------
//
// FROZEN once the first client signs against it. Same discipline as v1.ts: a
// change after that point means a new trial-v2.ts and a new row in
// agreement_templates.
//
// NOT LEGAL ADVICE. This needs the same attorney review as the service
// agreement, and arguably more: a free trial that converts to a paid
// subscription is exactly the shape automatic-renewal statutes care about.
// Keeping Stripe out of the trial is what keeps that exposure small, because
// nothing here can start a charge.

import type { AgreementTemplate } from "../types";

export const trialV1: AgreementTemplate = {
  templateId: "callvia-free-trial",
  version: 1,
  title: "Callvia Free Trial Agreement",
  lastUpdated: "August 1, 2026",
  sections: [
    {
      blocks: [
        {
          kind: "p",
          text:
            'This Free Trial Agreement (the "Agreement") is entered into between Callvia ("Callvia," "we," or "us") and {{businessName}} (the "Client," "you," or "your"), and governs your participation in a no-charge trial of Callvia\'s AI receptionist services.',
        },
      ],
    },
    {
      heading: "1. Free Trial",
      blocks: [
        {
          kind: "p",
          text:
            "Callvia will provide AI receptionist services to {{businessName}} at no charge from {{trialStartDate}} through {{trialEndDate}} (the \"Trial Period\"). Either party may end the Trial Period at any time, for any reason, with no penalty and no further obligation.",
        },
        {
          kind: "callout",
          text:
            "No payment method is collected for this trial and no charge of any kind can arise from this Agreement. If you decide to continue after the Trial Period, that is a separate agreement you would sign at that time.",
        },
      ],
    },
    {
      heading: "2. Purpose",
      blocks: [
        {
          kind: "p",
          text:
            "The Trial Period exists so that you can evaluate Callvia's AI receptionist services in your own business, on your own calls, before deciding whether to purchase a subscription.",
        },
      ],
    },
    {
      heading: "3. Client Responsibilities",
      blocks: [
        {
          kind: "p",
          text:
            "To make the trial work, you agree to provide the information and access Callvia reasonably needs to configure and operate your receptionist, including call forwarding from the phone line your customers already call.",
        },
        {
          kind: "ul",
          items: [
            "Provide accurate information about your business, services, and how you want calls handled.",
            "Complete the call forwarding steps for your carrier so calls can reach your receptionist.",
            "Tell us promptly if a call is handled incorrectly, so it can be corrected during the trial.",
          ],
        },
        {
          kind: "p",
          text:
            "The services are provided during the Trial Period on an as-is basis. Uninterrupted operation, perfect call handling, and error-free performance cannot be guaranteed.",
        },
      ],
    },
    {
      heading: "4. Your Data During the Trial",
      blocks: [
        {
          kind: "p",
          text:
            "Callvia processes call recordings, transcripts, and caller details during the Trial Period in order to operate your receptionist and send you call summaries. This information is handled in accordance with the Callvia Privacy Policy. If the Trial Period ends without you becoming a paying customer, you may ask Callvia to delete the information collected during the trial.",
        },
      ],
    },
    {
      heading: "5. Limitation of Liability",
      blocks: [
        {
          kind: "p",
          text:
            "To the fullest extent permitted by law, Callvia is not liable for lost revenue, missed leads, business interruption, indirect damages, consequential damages, or any other losses arising out of or relating to the Trial Period. Because the trial is provided at no charge, Callvia's total liability under this Agreement is limited to zero dollars.",
        },
      ],
    },
    {
      heading: "6. No Obligation",
      blocks: [
        {
          kind: "p",
          text:
            "Neither party is under any obligation to continue after the Trial Period. You are not required to purchase anything, and Callvia is not required to offer a subscription. This Agreement creates no ongoing commitment of any kind once the Trial Period ends.",
        },
      ],
    },
    {
      heading: "7. Governing Documents",
      blocks: [
        {
          kind: "p",
          text:
            "Your use of the services during the Trial Period is also governed by the Callvia Privacy Policy and Terms of Service. No subscription fees are due unless you separately agree, in writing, to become a paying customer.",
        },
      ],
    },
    {
      heading: "8. Acceptance",
      blocks: [
        {
          kind: "p",
          text:
            "By typing your name below and submitting this form, you agree to this Free Trial Agreement on behalf of {{businessName}} and confirm that you are authorized to do so.",
        },
      ],
    },
  ],
};
