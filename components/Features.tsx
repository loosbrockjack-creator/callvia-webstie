"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 9l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Always Answers",
    description:
      "Your AI receptionist picks up every call, 24 hours a day, 7 days a week, even when you're on a job site, with a customer, or off the clock.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Captures Every Lead",
    description:
      "Automatically collects names, phone numbers, addresses, and job details. Every caller's information organized and ready when you need it.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Texts You the Lead",
    description:
      "The moment a call ends, you get a clear summary including who called, what they need, and their contact info. No more digging through voicemail.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 8c0 5.523 4.477 10 10 10h.5a1.5 1.5 0 001.5-1.5v-1.378a1.5 1.5 0 00-1.168-1.467l-2.2-.489a1.5 1.5 0 00-1.617.738l-.21.378a8.016 8.016 0 01-3.587-3.587l.378-.21a1.5 1.5 0 00.738-1.617l-.489-2.2A1.5 1.5 0 006.378 5H5A1.5 1.5 0 003.5 6.5V7C3.5 7.28 3.66 8 4 8z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M13 3l2 2-2 2M13 5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Knows When to Reach You",
    description:
      "When a call needs a real decision, Callvia connects the customer straight to you. Can't pick up? It texts you the details instantly, flagged urgent. Your customers never get stuck with a robot that can't help.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-32 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-xs tracking-widest uppercase mb-5"
          style={{ color: "#7c5cfc" }}
        >
          Features
        </motion.p>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
          className="text-4xl md:text-5xl font-light text-white leading-tight tracking-tight max-w-2xl"
          style={{ letterSpacing: "-0.02em" }}
        >
          Every call answered.
          <br />
          Every job still yours.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="mt-5 text-base max-w-xl leading-relaxed"
          style={{ color: "#888888" }}
        >
          Callvia handles your front line so you never lose a customer because you were too busy to answer. Every call sounds professional. Every job comes back to you.
        </motion.p>

        {/* Cards grid */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, ease: "easeOut", delay: i * 0.1 }}
              className="group relative p-7 rounded-2xl border transition-all duration-300"
              style={{ background: "#0d0d0d", borderColor: "#1f1f1f" }}
              whileHover={{ borderColor: "rgba(124,92,252,0.3)", transition: { duration: 0.2 } }}
            >
              <div
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg mb-5"
                style={{ background: "rgba(124,92,252,0.12)", color: "#9b7ffd" }}
              >
                {f.icon}
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#666666" }}>
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
