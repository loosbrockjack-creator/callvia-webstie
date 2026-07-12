"use client";

import { motion } from "framer-motion";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";

const industries = [
  { name: "HVAC" },
  { name: "Plumbing" },
  { name: "Electrical" },
  { name: "General Contractors" },
];

const stats = [
  { value: "24/7", label: "Availability" },
  { value: "< 2s", label: "Answer time" },
  { value: "100%", label: "Calls captured" },
];

export function WhoItsFor() {
  return (
    <section id="who-its-for" className="py-32 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Left column */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
              className="text-xs tracking-widest uppercase mb-5"
              style={{ color: "#7c5cfc" }}
            >
              Who It&#39;s For
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="text-4xl md:text-5xl font-light text-white tracking-tight leading-tight"
              style={{ letterSpacing: "-0.02em" }}
            >
              Built for
              <br />
              the Trades.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mt-6 text-base leading-relaxed max-w-md"
              style={{ color: "#888888" }}
            >
              A missed call is a missed job. Callvia answers every call you want it to, and texts you the lead the moment something needs your attention. You stay in control of every customer.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-10 flex items-center gap-10"
            >
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: "#555555" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right column: numbered list */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="pt-2"
          >
            <div className="border-t border-white/8">
              {industries.map((industry, i) => (
                <motion.div
                  key={industry.name}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 + i * 0.08 }}
                  className="group flex items-center justify-between py-7 border-b cursor-default transition-all duration-200"
                  style={{ borderColor: "rgba(255,255,255,0.05)" }}
                >
                  <div className="flex items-center gap-6 flex-1">
                    <span
                      className="text-xs font-mono w-5 shrink-0"
                      style={{ color: "#333333" }}
                    >
                      0{i + 1}
                    </span>
                    <div className="flex-1 h-9 md:h-11">
                      <TextHoverEffect text={industry.name} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
