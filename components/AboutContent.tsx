"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { WaveformMark } from "./WaveformMark";
import { GradientButton } from "./ui/gradient-button";

const PRINCIPLES = [
  {
    title: "The call comes first",
    body: "For a service business, the phone is the front door. A missed call is a missed customer, often gone to the next name on the list. Everything I build starts there.",
  },
  {
    title: "You stay in control",
    body: "Callvia answers, qualifies, and hands off. It never pretends to be something it is not, and it always routes the moment that matters back to you.",
  },
  {
    title: "Simple beats clever",
    body: "No dashboards to babysit, no scripts to maintain. You tell me how you work, and your receptionist just handles the calls the way you would.",
  },
  {
    title: "Prove it before you pay for it",
    body: "You get a free trial before any money changes hands. If Callvia does not pay for itself, you walk away. No charge, no hard feelings, no pressure to keep something that is not working for you.",
  },
];

export function AboutContent() {
  return (
    <main className="bg-black text-white">
      {/* Hero */}
      <section className="relative pt-28 md:pt-40 pb-8 md:pb-10 px-6 overflow-hidden">
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
            I built this because my uncle kept losing jobs to a ringing phone.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.12 }}
            className="mt-7 text-lg leading-relaxed max-w-xl mx-auto text-muted"
          >
            Callvia is an AI receptionist for the businesses that live and die by the phone. I built it to answer all the calls you need, capturing every lead, making sure you aren't the one that dies by the phone.
          </motion.p>
        </div>
      </section>

      {/* Founder letter */}
      <section className="px-6 pt-8 md:pt-10 pb-12 md:pb-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-xs tracking-widest uppercase mb-4 text-center"
            style={{ color: "#7c5cfc" }}
          >
            From the founder
          </motion.p>

          {/* Portrait, sized for the source photo's actual portrait crop (2:3) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="w-full max-w-[420px] mx-auto"
          >
            <div
              className="relative aspect-[2/3] rounded-2xl overflow-hidden border"
              style={{ borderColor: "#1f1f1f" }}
            >
              <Image
                src="/founder.png"
                alt="Jack Loosbrock, founder of Callvia"
                fill
                sizes="(min-width: 768px) 420px, 90vw"
                className="object-cover"
                priority
              />
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-white">Jack Loosbrock</p>
              <p className="text-xs" style={{ color: "#666666" }}>
                Founder, Callvia · Iowa State University, Sophomore
              </p>
            </div>
          </motion.div>

          {/* Letter */}
          <div className="mt-10">
            <div className="space-y-6 text-lg leading-relaxed text-muted">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7 }}
              >
                <span className="text-white">My uncle Scott runs Loosbrock Electric.</span> He has spent years building that business one job at a time, and more than once he has lost work simply because he could not get to the phone. He is up a ladder or inside a panel mid job, the phone rings, and by the time he is free to call back, the customer has already hired someone else.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: 0.05 }}
              >
                That is the story behind Callvia. I am not a call center trying to sell you software. I am a sophomore at Iowa State University, and I built this myself, over the past several months, because I watched this happen to someone in my own family and knew it was not just him.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                There is no team behind Callvia yet. I built the AI voice system, the call handling, the text alerts, all of it, myself. When you sign up, you are not routed through account managers or a rotating cast of reps. You are working directly with the person who built it.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, delay: 0.15 }}
              >
                I think that matters, especially if you are a contractor. You did not build your business by handing it off to the biggest name in the room. You built it by showing up, doing the work right, and trusting people who show up the same way. That is what I am trying to be here: not a faceless platform, but someone who is actually in it, working just as hard as you are so the next call does not slip through.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-10 pt-6 border-t"
              style={{ borderColor: "#1f1f1f" }}
            >
              <p className="text-white font-medium">Jack Loosbrock</p>
              <p className="text-sm" style={{ color: "#666666" }}>
                Founder, Callvia
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="px-6 py-12 md:py-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="text-3xl md:text-4xl font-light tracking-tight text-center mb-14"
            style={{ letterSpacing: "-0.02em" }}
          >
            What I build around.
          </motion.h2>
          <div className="grid sm:grid-cols-2 gap-5">
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
                <p className="text-sm leading-relaxed text-muted">
                  {p.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-6 py-16 md:py-28 border-t border-white/5 text-center">
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
          className="mt-4 text-base max-w-md mx-auto text-muted"
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
        <p className="mt-4 text-xs text-white/35">Everyone gets a free trial. If it doesn&#39;t pay for itself, you walk away.</p>
      </section>
    </main>
  );
}
