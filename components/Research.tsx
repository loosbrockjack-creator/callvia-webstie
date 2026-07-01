"use client";

import { motion } from "framer-motion";

const stats = [
  {
    value: "85%",
    label: "of callers who reach voicemail never call back.",
    source: "Forbes / BrightLocal",
  },
  {
    value: "30–50%",
    label: "of inbound calls to the average contractor go unanswered.",
    source: "CallRail / Invoca benchmarks",
  },
  {
    value: "78%",
    label: "of customers hire the first business that responds.",
    source: "HubSpot / lead-response research",
  },
  {
    value: "$45K–$120K",
    label: "lost per year by the average contractor to missed calls.",
    source: "Analysis of 1,200+ home-service contractors",
  },
];

export function Research() {
  return (
    <section id="research" className="py-32 px-6 border-t border-white/5">
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
          The Research
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
          className="mt-5 text-base max-w-xl leading-relaxed"
          style={{ color: "#888888" }}
        >
          These aren&#39;t guesses. Across the trades, the data on unanswered calls tells the same story &mdash; and it&#39;s more expensive than most owners think.
        </motion.p>

        {/* Stat grid */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.value}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, ease: "easeOut", delay: i * 0.1 }}
              className="group relative flex flex-col p-8 md:p-10 rounded-2xl border transition-all duration-300"
              style={{ background: "#0d0d0d", borderColor: "#1f1f1f" }}
              whileHover={{ borderColor: "rgba(124,92,252,0.3)", transition: { duration: 0.2 } }}
            >
              <div
                className="text-5xl md:text-6xl font-semibold text-white tracking-tight"
                style={{ letterSpacing: "-0.03em" }}
              >
                {s.value}
              </div>
              <p className="mt-4 text-base leading-relaxed" style={{ color: "#999999" }}>
                {s.label}
              </p>
              <div
                className="mt-6 pt-4 border-t text-xs tracking-wide"
                style={{ borderColor: "rgba(255,255,255,0.06)", color: "#555555" }}
              >
                {s.source}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom line */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-12 text-lg md:text-xl font-light leading-relaxed max-w-3xl"
          style={{ color: "#cccccc", letterSpacing: "-0.01em" }}
        >
          The pattern is simple: when your phone goes unanswered, the customer doesn&#39;t wait &mdash; they dial the next name on Google. A single HVAC or plumbing call can be worth{" "}
          <span className="text-white font-normal">$350&ndash;$1,200</span>, and the ones you miss add up fast. Callvia answers every one, so the job stays yours.
        </motion.p>
      </div>
    </section>
  );
}
