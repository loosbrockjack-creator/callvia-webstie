"use client";

import { motion } from "framer-motion";

import {
  BookingGraphic,
  HandlingGraphic,
  LeadCaptureGraphic,
  RoutingGraphic,
  SummaryGraphic,
  UrgencyGraphic,
} from "@/components/graphics/feature-graphics";
import { Card, CardBody, CardWell } from "@/components/ui/card";
import { CursorCardsContainer } from "@/components/ui/cursor-cards";
import { SectionLabel } from "@/components/ui/section-label";

// Named as capabilities, not as story beats: the How It Works section already
// walks through the answer/capture/hand-off narrative, so anything here that
// restates it is dead weight.
//
// Each card carries a micro-mock instead of an icon. The icon and the graphic
// together would have been the same idea said twice, and the graphic is the
// one that actually shows the capability rather than labelling it.
const features = [
  {
    graphic: <BookingGraphic />,
    title: "Appointment booking",
    description:
      "Turn it on and your receptionist offers your open times, puts the job on your calendar, and confirms it with the caller before hanging up.",
  },
  {
    graphic: <LeadCaptureGraphic />,
    title: "Lead capture",
    description:
      "Names, phone numbers, addresses, and job details, collected and confirmed while the caller is still on the line. Nothing written on the back of a receipt.",
  },
  {
    graphic: <UrgencyGraphic />,
    title: "Urgency detection",
    description:
      "Your receptionist works out what the caller needs and how urgent it is in the first few seconds, so a burst pipe never gets handled like a routine quote.",
  },
  {
    graphic: <RoutingGraphic />,
    title: "Urgent call routing",
    description:
      "When a call needs a real decision, Callvia connects the customer straight to you. Can't pick up? It texts you the details instantly, flagged urgent. Your customers never get stuck with a robot that can't help.",
  },
  {
    graphic: <SummaryGraphic />,
    title: "Call summaries",
    description:
      "The moment a call ends you get a summary by text and email: who called, what they need, and their number. No more digging through voicemail.",
  },
  {
    graphic: <HandlingGraphic />,
    title: "Custom call handling",
    description:
      "Your greeting, your hours, your instructions. We build the receptionist around how you already run the business, so callers hear what you would have told them.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-16 md:py-32 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <SectionLabel>Features</SectionLabel>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
          className="text-4xl md:text-5xl font-light text-white leading-tight tracking-tight max-w-2xl"
          style={{ letterSpacing: "-0.02em" }}
        >
          Every call answered.
          <br />
          Every job still yours.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="mt-5 text-base max-w-xl leading-relaxed text-muted text-pretty"
        >
          Callvia handles your phones so you never have to lose a customer because you were too busy to answer every call. Sounds professional. Every job comes back to you.
        </motion.p>

        {/* Two columns, not three. The wells need the width to stay legible,
            and a 3-up grid would squash them into decoration. */}
        <CursorCardsContainer className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <Card key={f.title} reveal revealDelay={i * 0.1}>
              <CardWell>{f.graphic}</CardWell>
              <CardBody>
                <h3 className="text-base font-semibold leading-snug text-white text-balance">
                  {f.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted text-pretty">
                  {f.description}
                </p>
              </CardBody>
            </Card>
          ))}
        </CursorCardsContainer>
      </div>
    </section>
  );
}
