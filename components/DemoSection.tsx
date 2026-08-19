"use client";

import { motion } from "framer-motion";

import { SectionLabel } from "@/components/ui/section-label";

export function DemoSection() {
  return (
    <section id="demo" className="relative py-16 md:py-36 px-6 border-t border-white/5 overflow-hidden">
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(124,92,252,0.08) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center">
        <SectionLabel>Demo</SectionLabel>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.05 }}
          className="text-4xl md:text-5xl font-light text-white tracking-tight"
          style={{ letterSpacing: "-0.02em" }}
        >
          Call it and try to break it
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.12 }}
          className="mt-5 max-w-lg text-base leading-relaxed text-muted"
        >
          This is a live demo Callvia receptionist set up for a home services contractor. Call it right now and see exactly what your customers experience. Ask it anything. Try to confuse it. See how it performs before you commit to a single thing.
        </motion.p>

        {/* Phone number */}
        <motion.a
          href="tel:6124710303"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.85, delay: 0.2 }}
          className="group mt-14 w-full flex flex-col items-center gap-4"
        >
          {/* Same raised surface and top-edge highlight as the card system's
              IconPlate, at medallion scale. It used to be a one-off with its
              border and fill written inline as rgba, which is why it never
              quite matched anything else on the page. */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-raised shadow-plate ring-1 ring-white/10 transition-colors duration-300 ease-card group-hover:bg-accent/10 group-hover:ring-accent/40">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white/50 group-hover:text-accent transition-colors duration-300"
            >
              <path
                d="M5 4c0 8.837 7.163 16 16 16h.5a2 2 0 002-2v-2a2 2 0 00-1.555-1.945l-2.94-.653a2 2 0 00-2.157.985l-.28.504a10.687 10.687 0 01-5.459-5.459l.504-.28a2 2 0 00.985-2.157l-.653-2.94A2 2 0 009.5 3H7a2 2 0 00-2 2z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          {/* Number */}
          <div
            className="text-4xl md:text-6xl font-light text-white tracking-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            (612) 471-0303
          </div>

          <span className="text-xs tracking-widest uppercase text-white/25 group-hover:text-white/50 transition-colors duration-300">
            Tap or click to call
          </span>
        </motion.a>
      </div>
    </section>
  );
}
