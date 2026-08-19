"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

import { SectionLabel } from "@/components/ui/section-label";
import { usePrefersReducedMotion } from "@/components/ui/use-reduced-motion";

const steps = [
  {
    number: "01",
    title: "We get you set up",
    description:
      "A real person walks you through the whole thing. We connect your existing business number, build out your receptionist, and test it before you ever go live. No software to figure out on your own.",
  },
  {
    number: "02",
    title: "It answers every call you want it to",
    description:
      "You choose what it answers: every call that comes in, only the ones you miss, or just nights and weekends. Switch it on or off whenever you want, in a couple of taps, and change your mind as often as you like. You can always pick up yourself. Callvia covers the calls you don't.",
  },
  {
    number: "03",
    title: "You get the lead, you close the job",
    description:
      "However you set it, the lead still ends up with you. If a call needs you right then, Callvia transfers it straight to your cell. If you're busy, you get a text and an email with who called, what they need, and their number. No middleman, no lost job.",
  },
];

// This section is deliberately the one thing on the page that is not a card.
//
// It sits between two card grids, and making it a third would have turned the
// middle of the page into an unbroken run of boxes. It is a sequence, not a
// set, so it gets the form of a sequence: a rail with nodes on it. The
// contrast against its neighbours is the point, not an oversight.
export function HowItWorks() {
  const prefersReducedMotion = usePrefersReducedMotion();

  // The rail draws along its own length, which means scaleY while it is a
  // vertical spine on mobile and scaleX once it flips horizontal at md:. One
  // element cannot do both, so there are two, each hidden at the other's
  // breakpoint.
  //
  // Both are driven from useInView on the wrapper rather than from
  // whileInView on the rails themselves. A rail scaled to zero has a
  // zero-area bounding box, and an element with no area is an unreliable
  // IntersectionObserver target: the vertical one silently never fired, so
  // mobile got three nodes floating with nothing joining them. Observing the
  // full-size parent instead is the same approach the footer already uses.
  const railRef = useRef<HTMLDivElement>(null);
  const railInView = useInView(railRef, { once: true, margin: "-60px" });
  const railShown = prefersReducedMotion || railInView;
  const railTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 1, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] };

  return (
    <section id="how-it-works" className="py-16 md:py-32 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <SectionLabel>How it works</SectionLabel>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="text-4xl md:text-5xl font-light text-white tracking-tight max-w-xl"
          style={{ letterSpacing: "-0.02em" }}
        >
          Done for you.
          <br />
          Built around you.
        </motion.h2>

        <div ref={railRef} className="relative mt-16">
          {/* Vertical spine, mobile. Aligned to the centre of the 11px node. */}
          <motion.span
            aria-hidden="true"
            className="absolute left-[5px] top-1 bottom-1 w-px origin-top bg-line md:hidden"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: railShown ? 1 : 0 }}
            transition={railTransition}
          />
          {/* Horizontal rail, desktop. */}
          <motion.span
            aria-hidden="true"
            className="absolute left-0 right-0 top-[5px] hidden h-px origin-left bg-line md:block"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: railShown ? 1 : 0 }}
            transition={railTransition}
          />

          <ol className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-10">
            {steps.map((step, i) => (
              <motion.li
                key={step.number}
                // Same reason as the card reveal: the reduced-motion branch has
                // to animate to the resting state, because simply dropping the
                // props leaves the inline opacity:0 from the first render in
                // place with nothing left to clear it.
                {...(prefersReducedMotion
                  ? {
                      animate: { opacity: 1, y: 0 },
                      transition: { duration: 0 },
                    }
                  : {
                      initial: { opacity: 0, y: 32 },
                      whileInView: { opacity: 1, y: 0 },
                      viewport: { once: true, margin: "-60px" },
                      transition: {
                        duration: 0.65,
                        ease: "easeOut",
                        delay: i * 0.12,
                      },
                    })}
                className="group relative pl-8 md:pl-0 md:pt-9"
              >
                {/* The node. Sits on the rail: left of the text on mobile,
                    above it on desktop. */}
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-[3px] size-[11px] rounded-full border border-line-strong bg-black transition-colors duration-300 group-hover:border-white/40 md:left-0 md:top-0"
                />

                <span className="block text-xs font-mono tracking-widest text-faint tabular-nums">
                  {step.number}
                </span>
                <h3 className="mt-4 text-base font-semibold leading-snug text-white text-balance transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted text-pretty">
                  {step.description}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
