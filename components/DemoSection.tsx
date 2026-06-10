"use client";

import { motion } from "framer-motion";

export function DemoSection() {
  return (
    <section id="demo" className="relative py-36 px-6 border-t border-white/5 overflow-hidden">
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 50%, rgba(124,92,252,0.08) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-8 inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5"
        >
          <span className="relative flex items-center justify-center w-2 h-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
          </span>
          <span className="text-xs text-white/60 tracking-widest uppercase font-medium">
            Live Demo
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.05 }}
          className="text-4xl md:text-5xl font-light text-white tracking-tight"
          style={{ letterSpacing: "-0.02em" }}
        >
          Call It and Try to Break It
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.12 }}
          className="mt-5 max-w-lg text-base leading-relaxed"
          style={{ color: "#888888" }}
        >
          This is a live Callvia receptionist set up for an electrical contractor. Call it right now and see exactly what your customers experience. Ask it anything. Try to confuse it. See how it performs before you commit to a single thing.
        </motion.p>

        {/* Phone number */}
        <motion.a
          href="tel:6127123298"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.85, delay: 0.2 }}
          className="group mt-14 flex flex-col items-center gap-4"
        >
          {/* Phone icon */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center border transition-all duration-300 group-hover:border-accent/40 group-hover:bg-accent/10"
            style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}
          >
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

          {/* Number — font-light to match all headings */}
          <span
            className="font-light text-white group-hover:text-accent transition-colors duration-300"
            style={{ fontSize: "clamp(36px, 6vw, 72px)", letterSpacing: "-0.025em" }}
          >
            (612) 712-3298
          </span>

          <span className="text-xs tracking-widest uppercase text-white/25 group-hover:text-white/50 transition-colors duration-300">
            Tap or click to call
          </span>
        </motion.a>
      </div>
    </section>
  );
}
