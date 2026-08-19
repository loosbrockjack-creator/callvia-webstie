"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Feather, HandTap, PhoneCall, Receipt } from "@phosphor-icons/react";
import { WaveformMark } from "./WaveformMark";
import { GradientButton } from "./ui/gradient-button";
import { Card, CardBody, IconPlate } from "./ui/card";
import { CursorCardsContainer } from "./ui/cursor-cards";
import { SectionLabel } from "./ui/section-label";

// Tier 2 of the card system: same shell and same hover as the homepage grids,
// but no graphic well. There is nothing to draw for a principle, and inventing
// a diagram for one would have been filler.
const PRINCIPLES = [
  {
    icon: <PhoneCall size={18} weight="light" />,
    title: "The call comes first",
    body: "For a service business, the phone is the front door. A missed call is a missed customer, often gone to the next name on the list. Everything I build starts there.",
  },
  {
    icon: <HandTap size={18} weight="light" />,
    title: "You stay in control",
    body: "Callvia answers, qualifies, and hands off. It never pretends to be something it is not, and it always routes the moment that matters back to you.",
  },
  {
    icon: <Feather size={18} weight="light" />,
    title: "Simple beats clever",
    body: "No dashboards to babysit, no scripts to maintain. You tell me how you work, and your receptionist just handles the calls the way you would.",
  },
  {
    icon: <Receipt size={18} weight="light" />,
    title: "Prove it before you pay for it",
    body: "You start with a free trial before any money changes hands. If Callvia does not pay for itself within the trial, you walk away. No charge, no hard feelings, no pressure to keep something that is not working for you.",
  },
];

export function AboutContent() {
  return (
    <main className="text-white">
      {/* Hero */}
      <section className="relative pt-28 md:pt-40 pb-8 md:pb-10 px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(124,92,252,0.04) 0%, transparent 65%)",
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
          {/* Above the fold, so this one animates on load rather than on
              scroll and keeps its own motion props. */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 text-xs uppercase tracking-widest text-accent"
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
          <SectionLabel className="mb-4 text-center">
            From the founder
          </SectionLabel>

          {/* Portrait, sized for the source photo's actual portrait crop (2:3) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="w-full max-w-[420px] mx-auto"
          >
            {/* Card radius and shadow, but no tray. A photograph is already
                the thing you are meant to look at; framing it in a bezel would
                be a container around a container. */}
            <div className="relative aspect-[2/3] overflow-hidden rounded-card border border-line shadow-card">
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
              <p className="text-xs text-dim">
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
              className="mt-10 border-t border-line pt-6"
            >
              <p className="text-white font-medium">Jack Loosbrock</p>
              <p className="text-sm text-dim">
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
          {/* gap-4 to match the homepage grids. These were gap-5 for no
              reason, which is the kind of thing you only notice when the two
              pages sit side by side. */}
          <CursorCardsContainer className="grid gap-4 sm:grid-cols-2">
            {PRINCIPLES.map((p, i) => (
              <Card key={p.title} reveal revealDelay={i * 0.08}>
                <CardBody className="p-7">
                  <div className="flex items-start gap-3.5">
                    <IconPlate>{p.icon}</IconPlate>
                    <h3 className="mt-1.5 text-lg font-medium text-white text-balance">
                      {p.title}
                    </h3>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted text-pretty">
                    {p.body}
                  </p>
                </CardBody>
              </Card>
            ))}
          </CursorCardsContainer>
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
        <p className="mt-4 text-xs text-white/35">Start with the free trial. If it doesn&#39;t pay for itself within the trial, you walk away.</p>
      </section>
    </main>
  );
}
