"use client";

import { motion } from "framer-motion";
import { WaveformMark } from "./WaveformMark";
import { GradientButton } from "./ui/gradient-button";

const PRINCIPLES = [
  {
    title: "The call comes first",
    body: "For a service business, the phone is the front door. A missed call is a missed customer, often gone to the next name on the list. Everything we build starts there.",
  },
  {
    title: "You stay in control",
    body: "Callvia answers, qualifies, and hands off. It never pretends to be something it is not, and it always routes the moment that matters back to you.",
  },
  {
    title: "Simple beats clever",
    body: "No dashboards to babysit, no scripts to maintain. You tell us how you work, and your receptionist just handles the calls the way you would.",
  },
];

export function AboutContent() {
  return (
    <main className="bg-black text-white">
      {/* Hero */}
      <section className="relative pt-40 pb-24 px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(124,92,252,0.08) 0%, transparent 65%)",
          }}
        />
        <motion.div
          className="absolute inset-x-0 top-0 flex justify-center pointer-events-none"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        >
          <WaveformMark size={520} animated opacity={0.05} className="blur-[24px]" />
        </motion.div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs tracking-widest uppercase mb-6"
            style={{ color: "#7c5cfc" }}
          >
            About Callvia
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.05 }}
            className="text-4xl md:text-6xl font-light tracking-tight leading-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            Built so no customer ever hits a dead line.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.12 }}
            className="mt-7 text-lg leading-relaxed max-w-xl mx-auto"
            style={{ color: "#888888" }}
          >
            Callvia is an AI receptionist for the businesses that live and die by the phone. We answer every call, capture every lead, and hand you the work that needs a human.
          </motion.p>
        </div>
      </section>

      {/* Story */}
      <section className="px-6 py-20 border-t border-white/5">
        <div className="max-w-3xl mx-auto space-y-10 text-lg leading-relaxed" style={{ color: "#999999" }}>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-white">Most small businesses lose money to the same quiet problem.</span> The owner is on a job, under a truck, or on another line, and the phone rings out. That caller does not leave a voicemail. They call the next company, and a paying customer is gone before anyone knew they existed.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.05 }}
          >
            We started Callvia to close that gap without asking owners to hire a front desk or learn new software. Your receptionist answers in your business's voice, collects the details that matter, and either transfers the call to you or texts you the lead on the spot. You do less phone tag and keep more of the work that comes your way.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            No call center scripts. No long contracts. Just a receptionist that never sleeps, never takes a lunch break, and never lets your line ring out.
          </motion.p>
        </div>
      </section>

      {/* Principles */}
      <section className="px-6 py-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="text-3xl md:text-4xl font-light tracking-tight text-center mb-14"
            style={{ letterSpacing: "-0.02em" }}
          >
            What we build around.
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-5">
            {PRINCIPLES.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="rounded-2xl border p-7"
                style={{ background: "#0d0d0d", borderColor: "#1f1f1f" }}
              >
                <h3 className="text-white text-lg font-medium mb-3">{p.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#888888" }}>
                  {p.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-6 py-28 border-t border-white/5 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-3xl md:text-4xl font-light tracking-tight"
          style={{ letterSpacing: "-0.02em" }}
        >
          Hear it answer your line.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.06 }}
          className="mt-4 text-base max-w-md mx-auto"
          style={{ color: "#888888" }}
        >
          Build your receptionist in a few minutes and put it to work.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.12 }}
          className="mt-9 flex justify-center"
        >
          <GradientButton href="/build">Build My Receptionist</GradientButton>
        </motion.div>
      </section>
    </main>
  );
}
