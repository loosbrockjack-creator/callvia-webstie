"use client";

import { motion } from "framer-motion";
import { GradientButton } from "./ui/gradient-button";

// The moving strand field behind this lives in SiteBackdrop, pinned at z-0 for
// the whole site. The hero is transparent so it shows through at full strength;
// the backdrop fades itself down past the first viewport.
export function Hero() {
  return (
    // 100svh, not 100dvh. dvh tracks the iOS URL bar, so every collapse and
    // re-expand resized the hero, shifted every section under it, and made the
    // streak in SiteBackdrop rebuild its whole path mid-scroll. svh is the
    // small-viewport height and never changes, so the page holds still.
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      {/* Legibility scrim, not decoration. The strands are brightest through the
          middle of the viewport, which is exactly where the headline sits.
          Black rather than purple so it darkens without adding more accent. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.5) 48%, transparent 80%)",
        }}
      />

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
