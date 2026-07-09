"use client";

import { motion } from "framer-motion";

export function MissedCallsTeaser() {
  return (
    <section className="py-24 px-6 border-t border-white/5">
      <motion.a
        href="/missed-calls"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
        className="group max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-2xl border p-8 md:p-10 transition-all duration-300 hover:border-[rgba(124,92,252,0.3)]"
        style={{ background: "#0d0d0d", borderColor: "#1f1f1f" }}
      >
        <div className="flex items-baseline gap-6">
          <span
            className="text-5xl md:text-6xl font-semibold text-white tracking-tight shrink-0"
            style={{ letterSpacing: "-0.03em" }}
          >
            27%
          </span>
          <p className="text-base md:text-lg leading-relaxed max-w-md" style={{ color: "#999999" }}>
            of inbound calls to home-service businesses go unanswered. See what that costs you every month.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 text-sm font-medium text-white/50 group-hover:text-white transition-colors duration-200 shrink-0">
          Run your numbers
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M2.5 7h9M8 3.5L11.5 7 8 10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </motion.a>
    </section>
  );
}
