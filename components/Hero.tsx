"use client";

import { motion } from "framer-motion";
import { GradientButton } from "./ui/gradient-button";

// The hero is black. It used to sit on a full-screen WebGL plasma field from
// SiteBackdrop, which was removed for competing with the headline on top of it.
// The legibility scrim that darkened that field went with it: black over black
// is one more layer to composite and nothing to see. The streak in SiteBackdrop
// starts below the first viewport, so nothing is drawn behind this section.
export function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto">
        {/* Main headline, font-light matches all section headings */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.5 }}
          className="text-white leading-none font-light"
          style={{ fontSize: "clamp(64px, 11vw, 144px)", letterSpacing: "-0.035em" }}
        >
          Callvia
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.65 }}
          className="mt-7 text-xl md:text-2xl font-light tracking-tight text-white/80"
          style={{ letterSpacing: "-0.01em" }}
        >
          Every call matters. Answer every one.
        </motion.p>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.78 }}
          className="mt-4 text-sm md:text-base font-normal text-white/45 max-w-xl"
        >
          The AI receptionist built for the trades, so you never leave a job on the table.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.95 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <GradientButton href="#demo">Experience It</GradientButton>
          <a
            href="#how-it-works"
            className="btn-shine inline-flex items-center justify-center px-7 py-3.5 text-sm font-medium text-white bg-[#1a1a1a] border border-white/15 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:bg-[#242424] hover:border-white/25 hover:shadow-[0_0_28px_rgba(255,255,255,0.09)] transition-all duration-200"
          >
            See How It Works
          </a>
        </motion.div>

      </div>
    </section>
  );
}
