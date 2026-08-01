// What we need in order to build a client's receptionist.
//
// This is the /build funnel's question set with the two diagnostic questions
// removed. "How many calls do you miss in a typical week?" and "What happens to
// a missed call today?" exist on the marketing funnel to size the problem for a
// prospect. An onboarding form goes to somebody who has already bought, so the
// problem is settled and asking again is friction.
//
// Ordering matters: identity first, then how calls should be handled, then the
// technical setup, then a free-text catch-all.

import type { Question } from "@/components/funnel/shared";

export const ONBOARDING_QUESTIONS: Question[] = [
  {
    id: "trade",
    kind: "single",
    label: "What's your trade?",
    options: [
      "Electrical",
      "Plumbing",
      "HVAC",
      "Roofing",
      "Landscaping",
      "General contracting",
    ],
    otherOption: true,
  },
  {
    id: "business",
    kind: "fields",
    label: "Tell us about your business",
    sublabel: "The phone number should be the line your customers already call.",
    fields: [
      { id: "businessName", label: "Business name", placeholder: "e.g. Loosbrock Electric" },
      {
        id: "businessPhone",
        label: "Business phone number",
        placeholder: "(555) 123-4567",
        type: "tel",
      },
    ],
  },
  {
    id: "website",
    kind: "text",
    label: "Got a business website?",
    sublabel: "We use it to learn how you present your business. Skip if you don't have one.",
    optional: true,
    placeholder: "yourbusiness.com",
  },
  {
    id: "serviceArea",
    kind: "text",
    label: "What area do you serve?",
    placeholder: "Cities or zip codes",
  },
  {
    id: "hours",
    kind: "text",
    label: "What are your business hours?",
    optional: true,
    placeholder: "e.g. Mon to Fri, 8am to 5pm",
  },
  {
    id: "answerWhen",
    kind: "multi",
    label: "When should your receptionist answer?",
    sublabel: "Pick everything that applies.",
    options: ["24/7", "After hours", "Missed calls"],
    otherOption: true,
  },
  {
    id: "callerNeeds",
    kind: "multi",
    label: "What do callers usually need?",
    sublabel: "Pick everything that applies.",
    options: ["Quotes", "Emergency repairs", "Scheduling", "General questions"],
    otherOption: true,
  },
  {
    id: "leadInfo",
    kind: "multi",
    label: "What should your receptionist collect from every caller?",
    sublabel:
      "Every call comes back to you as a written summary. These are the details your receptionist makes sure to get before the caller hangs up. Pick everything that applies.",
    options: ["Name", "Callback number", "Address", "Service needed", "Urgency"],
    otherOption: true,
  },
  {
    id: "summaryTo",
    kind: "multi",
    label: "Where should the call summaries be sent?",
    sublabel: "They land within a minute of the call ending. Pick everything that applies.",
    options: ["Phone number", "Email"],
    otherOption: true,
  },
  {
    id: "urgent",
    kind: "multi",
    label: "When something is urgent, what should happen?",
    sublabel: "Pick everything that applies.",
    options: ["Call me immediately", "Text me an alert", "Flag it in the summary"],
  },
  {
    id: "booking",
    kind: "single",
    label: "Want it to book appointments?",
    sublabel:
      "If a caller wants work done, your receptionist offers open times, puts the job on your calendar, and confirms it with the caller before hanging up.",
    options: ["Yes", "No"],
  },
  {
    id: "carrier",
    kind: "single",
    label: "What cell carrier are you on?",
    sublabel:
      "Call forwarding is set up differently on every carrier, so this tells us which steps to walk you through.",
    options: ["Verizon", "AT&T", "T-Mobile", "US Cellular"],
    otherOption: true,
  },
  {
    id: "phoneType",
    kind: "single",
    label: "What type of phone do you have?",
    options: ["iPhone", "Samsung", "Android", "Landline", "VoIP or internet phone"],
    otherOption: true,
  },
  {
    id: "notes",
    kind: "textarea",
    label: "Anything else we should know?",
    sublabel: "Anything that would help us handle calls exactly the way you would.",
    optional: true,
    placeholder: "Optional",
  },
];

// Used by the admin read view and the notification email, so an answer whose
// question was later reworded still prints under a sensible label.
export const QUESTION_LABELS: Record<string, string> = {
  ...Object.fromEntries(ONBOARDING_QUESTIONS.map((q) => [q.id, q.label])),
  businessName: "Business name",
  businessPhone: "Business phone number",
};
