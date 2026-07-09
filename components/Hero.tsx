"use client";

import { motion } from "framer-motion";
import { WaveformMark } from "./WaveformMark";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Radial background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(124,92,252,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Waveform glow layer, blurred for glow effect */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      >
        <WaveformMark size={860} animated opacity={0.06} className="blur-[32px]" />
      </motion.div>

      {/* Waveform sharp layer */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
      >
        <WaveformMark size={800} animated opacity={0.18} />
      </motion.div>

      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.4 }}
          className="mb-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
          <span className="text-xs text-white/60 tracking-widest uppercase font-medium">
            AI Receptionist
          </span>
        </motion.div>

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
          className="mt-7 text-xl md:text-2xl font-light tracking-tight"
          style={{ color: "#cccccc", letterSpacing: "-0.01em" }}
        >
          Catches the call. Hands you the job.
        </motion.p>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.8 }}
          className="mt-4 max-w-xl text-base leading-relaxed"
          style={{ color: "#666666" }}
        >
          Your AI receptionist answers every call. When something needs you, it either transfers the call straight to you or texts you the lead instantly. You stay in control of every customer.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.95 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <a
            href="#demo"
            className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-full transition-all duration-200 shadow-[0_0_30px_rgba(124,92,252,0.35)] hover:shadow-[0_0_40px_rgba(124,92,252,0.5)]"
          >
            Experience It
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-medium text-white/70 border border-white/15 rounded-full hover:border-white/30 hover:text-white transition-all duration-200"
          >
            See How It Works
          </a>
        </motion.div>

      </div>
    </section>
  );
}
