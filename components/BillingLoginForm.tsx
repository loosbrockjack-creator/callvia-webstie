"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type Status = "idle" | "sending" | "sent";

export function BillingLoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setError("Please enter a valid email address.");
    }
    setError(null);
    setStatus("sending");
    try {
      await fetch("/api/billing-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Ignore: we show the same generic confirmation either way.
    }
    setStatus("sent");
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
            <path
              d="M4 7l8 5 8-5M4 7v10a1 1 0 001 1h14a1 1 0 001-1V7M4 7a1 1 0 011-1h14a1 1 0 011 1"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="text-white text-xl font-light">Check your inbox.</h3>
        <p className="mt-2 text-sm leading-relaxed max-w-xs mx-auto" style={{ color: "#888888" }}>
          If that email is tied to an active Callvia account, we just sent a secure link to manage your billing.
        </p>
      </motion.div>
    );
  }

  return (
    <div
      className="rounded-2xl border p-8 md:p-10 flex flex-col gap-5"
      style={{ background: "#0d0d0d", borderColor: "#1f1f1f" }}
    >
      <div>
        <label htmlFor="login-email" className="block text-xs tracking-widest uppercase mb-3" style={{ color: "#555555" }}>
          Account email
        </label>
        <input
          id="login-email"
          type="email"
          inputMode="email"
          placeholder="you@yourbusiness.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="w-full px-4 py-3 rounded-lg text-white text-base outline-none border transition-colors duration-200 focus:border-accent"
          style={{ background: "#000000", borderColor: "#1f1f1f" }}
        />
      </div>

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
        {status === "sending" ? "Sending…" : "Email Me My Billing Link"}
      </button>

      <p className="text-xs leading-relaxed" style={{ color: "#555555" }}>
        For existing clients. We email a secure link to the address on your account, so only you can reach your billing.
      </p>
    </div>
  );
}
