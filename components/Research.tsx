"use client";

import { motion } from "framer-motion";

import { RingGauge, SpanBar } from "@/components/graphics/stat-graphics";
import { Card, CardBody, CardWell } from "@/components/ui/card";
import { CursorCardsContainer } from "@/components/ui/cursor-cards";
import { SectionLabel } from "@/components/ui/section-label";

// `percent` is what the arc fills to, so it has to track the figure. The last
// one is a dollar range rather than a share, so it gets a span across an axis
// instead: there is no denominator to draw a ring against, and inventing one
// would have been a chart that lies.
type Stat = {
  value: string;
  label: string;
  source: string;
  href: string;
  /** 0 to 1. Present on the three share figures. */
  percent?: number;
  /** Present instead of `percent` on the dollar range. */
  range?: {
    from: number;
    to: number;
    axisMax: number;
    min: string;
    max: string;
  };
};

const stats: Stat[] = [
  {
    value: "85%",
    percent: 0.85,
    label: "of callers who reach voicemail never call back.",
    source: "Forbes / BIA Kelsey",
    href: "https://www.hicira.com/missed-call-statistics",
  },
  {
    value: "27%",
    percent: 0.27,
    label: "of inbound calls to home-service businesses go unanswered.",
    source: "Invoca (60M+ calls analyzed)",
    href: "https://www.hicira.com/missed-call-statistics",
  },
  {
    value: "78%",
    percent: 0.78,
    label: "of customers hire the first business that responds.",
    source: "Lead Connect / Vendasta",
    href: "https://www.hicira.com/missed-call-statistics",
  },
  {
    value: "$45K–$120K",
    range: { from: 45, to: 120, axisMax: 150, min: "$0", max: "$150K" },
    label: "lost per year by the average contractor to missed calls.",
    source: "Analysis of 1,200+ home-service contractors",
    href: "https://www.callbirdai.com/blog-contractors-lose-money-missed-calls",
  },
];

export function Research() {
  return (
    <section id="research" className="py-16 md:py-32 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <SectionLabel>The research</SectionLabel>

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

        {/* Same shell, same well height and same grid as the Features section,
            so the two read as siblings rather than as two separate ideas. */}
        <CursorCardsContainer className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.map((s, i) => (
            <Card key={s.value} reveal revealDelay={i * 0.1}>
              <CardWell>
                {s.range ? (
                  <SpanBar
                    value={s.value}
                    from={s.range.from}
                    to={s.range.to}
                    axisMax={s.range.axisMax}
                    axisMinLabel={s.range.min}
                    axisMaxLabel={s.range.max}
                  />
                ) : (
                  <RingGauge value={s.value} percent={s.percent ?? 0} />
                )}
              </CardWell>
              <CardBody>
                <p className="text-sm leading-relaxed text-muted text-pretty">
                  {s.label}
                </p>
                <div className="mt-4 border-t border-line pt-3.5">
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
              </CardBody>
            </Card>
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
