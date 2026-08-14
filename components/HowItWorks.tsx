"use client";

import { motion } from "framer-motion";

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

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-32 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-xs tracking-widest uppercase mb-5"
          style={{ color: "#7c5cfc" }}
        >
          How it works
        </motion.p>

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

        {/* Steps */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: "#1a1a1a" }}>
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, ease: "easeOut", delay: i * 0.12 }}
              className="relative p-8 flex flex-col gap-6"
              style={{ background: "#000" }}
            >
              <span className="text-xs font-mono tracking-widest text-faint tabular-nums">
                {step.number}
              </span>
              <div>
                <h3 className="text-base font-semibold leading-snug text-white mb-2.5 text-balance">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted text-pretty">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
