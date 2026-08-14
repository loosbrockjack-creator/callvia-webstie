"use client";

import { motion } from "framer-motion";
import { CursorCard, CursorCardsContainer } from "@/components/ui/cursor-cards";

// Named as capabilities, not as story beats: the How It Works section already
// walks through the answer/capture/hand-off narrative, so anything here that
// restates it is dead weight.
const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 8h14M7 2.5v3M13 2.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7.5 12.2l1.4 1.4 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Appointment booking",
    description:
      "Turn it on and your receptionist offers your open times, puts the job on your calendar, and confirms it with the caller before hanging up.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Lead capture",
    description:
      "Names, phone numbers, addresses, and job details, collected and confirmed while the caller is still on the line. Nothing written on the back of a receipt.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 3.5l7.5 13H2.5l7.5-13z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10 8.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="14" r="0.75" fill="currentColor" />
      </svg>
    ),
    title: "Urgency detection",
    description:
      "Your receptionist works out what the caller needs and how urgent it is in the first few seconds, so a burst pipe never gets handled like a routine quote.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 8c0 5.523 4.477 10 10 10h.5a1.5 1.5 0 001.5-1.5v-1.378a1.5 1.5 0 00-1.168-1.467l-2.2-.489a1.5 1.5 0 00-1.617.738l-.21.378a8.016 8.016 0 01-3.587-3.587l.378-.21a1.5 1.5 0 00.738-1.617l-.489-2.2A1.5 1.5 0 006.378 5H5A1.5 1.5 0 003.5 6.5V7C3.5 7.28 3.66 8 4 8z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M13 3l2 2-2 2M13 5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Urgent call routing",
    description:
      "When a call needs a real decision, Callvia connects the customer straight to you. Can't pick up? It texts you the details instantly, flagged urgent. Your customers never get stuck with a robot that can't help.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Call summaries",
    description:
      "The moment a call ends you get a summary by text and email: who called, what they need, and their number. No more digging through voicemail.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 6h8.5M15.5 6H17M3 14h1.5M8.5 14H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="13.5" cy="6" r="1.9" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="6.5" cy="14" r="1.9" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    title: "Custom call handling",
    description:
      "Your greeting, your hours, your instructions. We build the receptionist around how you already run the business, so callers hear what you would have told them.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-16 md:py-32 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-xs tracking-widest uppercase mb-5"
          style={{ color: "#7c5cfc" }}
        >
          Features
        </motion.p>

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

        {/* Cards grid */}
        <CursorCardsContainer className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <CursorCard
              key={f.title}
              reveal
              revealDelay={i * 0.1}
              className="p-7 rounded-2xl"
            >
              {/* Icon sits on the title's own baseline rather than in a tinted
                  chip above it: the chip read as decoration, this reads as a
                  bullet. It stays dim until the card is hovered. */}
              <div className="flex items-start gap-3">
                <span className="mt-px shrink-0 text-dim transition-colors duration-300 group-hover:text-muted">
                  {f.icon}
                </span>
                <h3 className="text-base font-semibold leading-snug text-white text-balance">
                  {f.title}
                </h3>
              </div>
              <p className="mt-3 pl-8 text-sm leading-relaxed text-muted text-pretty">
                {f.description}
              </p>
            </CursorCard>
          ))}
        </CursorCardsContainer>
      </div>
    </section>
  );
}
