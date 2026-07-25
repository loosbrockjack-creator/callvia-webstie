"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [business, setBusiness] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (name.trim().length < 2) return setError("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Please enter a valid email address.");
    if (message.trim().length < 5) return setError("Tell us a little about what you need.");
    setError(null);
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, business, message }),
      });
      if (!res.ok) throw new Error("send failed");
      setStatus("sent");
    } catch {
      setStatus("error");
      setError("Something went wrong. Email us directly at team@callvia.io.");
    }
  }

  if (status === "sent") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border p-10 text-center"
        style={{ background: "#0d0d0d", borderColor: "#1f1f1f" }}
      >
        <div
          className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: "rgba(124,92,252,0.12)", border: "1px solid rgba(124,92,252,0.4)" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-accent">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="text-white text-xl font-light">Message sent.</h3>
        <p className="mt-2 text-sm" style={{ color: "#888888" }}>
          Thanks for reaching out. We usually reply within a few hours.
        </p>
      </motion.div>
    );
  }

  return (
    <div
      className="rounded-2xl border p-8 md:p-10 flex flex-col gap-6"
      style={{ background: "#0d0d0d", borderColor: "#1f1f1f" }}
    >
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg text-white text-base outline-none border transition-colors duration-200 focus:border-accent"
            style={{ background: "#000000", borderColor: "#1f1f1f" }}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg text-white text-base outline-none border transition-colors duration-200 focus:border-accent"
            style={{ background: "#000000", borderColor: "#1f1f1f" }}
          />
        </Field>
      </div>

      <Field label="Business" optional>
        <input
          type="text"
          value={business}
          onChange={(e) => setBusiness(e.target.value)}
          className="w-full px-4 py-3 rounded-lg text-white text-base outline-none border transition-colors duration-200 focus:border-accent"
          style={{ background: "#000000", borderColor: "#1f1f1f" }}
        />
      </Field>

      <Field label="How can we help?">
        <textarea
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-4 py-3 rounded-lg text-white text-base outline-none border transition-colors duration-200 focus:border-accent resize-none"
          style={{ background: "#000000", borderColor: "#1f1f1f" }}
        />
      </Field>

      {error && (
        <p className="text-sm" style={{ color: "#f87171" }}>
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={status === "sending"}
        className="btn-shine inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-full transition-all duration-200 shadow-[0_0_30px_rgba(124,92,252,0.35)] hover:shadow-[0_0_40px_rgba(124,92,252,0.5)] disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send Message"}
      </button>
    </div>
  );
}

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs tracking-widest uppercase mb-3" style={{ color: "#555555" }}>
        {label}
        {optional && <span className="ml-2 lowercase tracking-normal text-[#3f3f3f]">optional</span>}
      </label>
      {children}
    </div>
  );
}
