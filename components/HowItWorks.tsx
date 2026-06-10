"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.4" />
        <path d="M11 7v4l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
    title: "We Get You Set Up",
    description:
      "A real person walks you through the whole thing. We connect your existing business number, build out your receptionist, and test it before you ever go live. No software to figure out on your own.",
  },
  {
    number: "02",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 8c0 5.523 4.477 10 10 10h.5a1.5 1.5 0 001.5-1.5v-1.378a1.5 1.5 0 00-1.168-1.467l-2.2-.489a1.5 1.5 0 00-1.617.738l-.21.378a8.016 8.016 0 01-3.587-3.587l.378-.21a1.5 1.5 0 00.738-1.617l-.489-2.2A1.5 1.5 0 006.378 4H5A1.5 1.5 0 003.5 5.5v.5C3.5 6.552 3.72 7.32 4 8z" stroke="currentColor" strokeWidth="1.4" />
        <path d="M14.5 4.5l2 2-2 2M14.5 6.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "AI Answers Every Call You Want It To",
    description:
      "When a customer calls, the AI answers immediately and collects exactly what you need. But you can still pick up whenever you want. The AI works quietly in the background, stepping in only when you need it to. It doesn't replace you. It just covers the calls you can't.",
  },
  {
    number: "03",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M7 8h8M7 11h8M7 14h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
    title: "You Get the Lead, You Close the Job",
    description:
      "If a call needs you in the moment, Callvia transfers it straight to you. If you're busy, you get a text with everything you need. Either way, the lead is yours. No middlemen, no missed money.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 px-6 border-t border-white/5">
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
          How It Works
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
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono tracking-widest" style={{ color: "#333333" }}>
                  {step.number}
                </span>
                <div style={{ color: "#7c5cfc" }}>{step.icon}</div>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-2.5">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#666666" }}>
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
