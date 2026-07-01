"use client";

import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section id="get-started" className="relative py-36 px-6 border-t border-white/5 overflow-hidden">
      {/* Purple radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(124,92,252,0.09) 0%, transparent 65%)",
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-xs tracking-widest uppercase mb-6"
          style={{ color: "#7c5cfc" }}
        >
          Get Started
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.05 }}
          className="text-4xl md:text-6xl font-light text-white tracking-tight leading-tight"
          style={{ letterSpacing: "-0.025em" }}
        >
          Your phones should work
          <br />
          even when you can&#39;t.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.12 }}
          className="mt-6 text-base leading-relaxed max-w-lg"
          style={{ color: "#888888" }}
        >
          Stop losing opportunities. Start capturing every call, every lead, every time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <a
            href="https://cal.com/jack-loosbrock-wzgbta/meeting-callvia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-4 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-full transition-all duration-200 shadow-[0_0_40px_rgba(124,92,252,0.4)] hover:shadow-[0_0_56px_rgba(124,92,252,0.55)]"
          >
            Book a Demo
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-6 inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/10 bg-white/[0.03]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="7" cy="7" r="6" stroke="#4ade80" strokeWidth="1.2" />
            <path d="M4.5 7l2 2 3-3" stroke="#4ade80" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-sm font-medium" style={{ color: "#e5e5e5" }}>
            Free demo. No credit card, no commitment
          </span>
        </motion.div>
      </div>
    </section>
  );
}
