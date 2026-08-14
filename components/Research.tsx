"use client";

import { motion } from "framer-motion";
import { CursorCard, CursorCardsContainer } from "@/components/ui/cursor-cards";

const stats = [
  {
    value: "85%",
    label: "of callers who reach voicemail never call back.",
    source: "Forbes / BIA Kelsey",
    href: "https://www.hicira.com/missed-call-statistics",
  },
  {
    value: "27%",
    label: "of inbound calls to home-service businesses go unanswered.",
    source: "Invoca (60M+ calls analyzed)",
    href: "https://www.hicira.com/missed-call-statistics",
  },
  {
    value: "78%",
    label: "of customers hire the first business that responds.",
    source: "Lead Connect / Vendasta",
    href: "https://www.hicira.com/missed-call-statistics",
  },
  {
    value: "$45K–$120K",
    label: "lost per year by the average contractor to missed calls.",
    source: "Analysis of 1,200+ home-service contractors",
    href: "https://www.callbirdai.com/blog-contractors-lose-money-missed-calls",
  },
];

export function Research() {
  return (
    <section id="research" className="py-16 md:py-32 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-xs tracking-widest uppercase mb-5 text-dim"
        >
          The research
        </motion.p>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="text-4xl md:text-5xl font-light text-white tracking-tight leading-tight max-w-2xl"
          style={{ letterSpacing: "-0.02em" }}
        >
          The real cost of
          <br />
          a missed call.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-5 text-base max-w-xl leading-relaxed text-muted text-pretty"
        >
          These aren&#39;t guesses. Across the trades, the data on unanswered calls tells the same story, and it&#39;s more expensive than most owners think.
        </motion.p>

        {/* Stat grid */}
        <CursorCardsContainer className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.map((s, i) => (
            <CursorCard
              key={s.value}
              reveal
              revealDelay={i * 0.1}
              className="flex flex-col p-8 md:p-10 rounded-2xl"
            >
              <div
                className="text-5xl md:text-6xl font-semibold text-white tracking-tight"
                style={{ letterSpacing: "-0.03em" }}
              >
                {s.value}
              </div>
              <p className="mt-4 text-base leading-relaxed text-muted text-pretty">
                {s.label}
              </p>
              <div className="mt-6 pt-4 border-t border-white/[0.06]">
                {/* Hover handled in CSS. This previously mutated
                    currentTarget.style on mouse events, which left keyboard
                    focus with no affordance at all. */}
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs tracking-wide inline-flex items-center gap-1.5 text-dim transition-colors duration-200 hover:text-white focus-visible:text-white"
                >
                  {s.source}
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M3 7L7 3M7 3H3.5M7 3V6.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </CursorCard>
          ))}
        </CursorCardsContainer>

        {/* Bottom line */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-12 text-lg md:text-xl font-light leading-relaxed max-w-3xl text-white/80 text-pretty"
          style={{ letterSpacing: "-0.01em" }}
        >
          The pattern is simple: when your phone goes unanswered, the customer doesn&#39;t wait. They dial the next name on Google. A single HVAC or plumbing job is worth{" "}
          <span className="text-white font-normal">$650&ndash;$2,400</span> on average, and the ones you miss add up fast. Callvia answers every one, so the job stays yours.
        </motion.p>
      </div>
    </section>
  );
}
