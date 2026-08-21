"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { At, EnvelopeSimple } from "@phosphor-icons/react";

type Status = "idle" | "sending" | "sent";

// Presentation only was reworked for the split auth layout: the form is no
// longer inside its own card, because on that page the panel is the container
// and a card inside it would be a box in a box. The behaviour is untouched:
// same endpoint, same validation, same deliberately identical confirmation
// whether or not the address matches an account, so this cannot be used to
// discover who has one.
export function LoginForm() {
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
      await fetch("/api/account/login", {
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
        className="rounded-card border border-line bg-surface p-8 text-center shadow-card"
      >
        <span className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full bg-accent/12 text-accent ring-1 ring-accent/40">
          <EnvelopeSimple size={22} weight="light" />
        </span>
        <h2 className="text-xl font-light text-white">Check your inbox.</h2>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted text-pretty">
          If that email is tied to a Callvia account, we just sent a secure link
          to log in. It expires in 15 minutes.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <label
        htmlFor="login-email"
        className="text-xs uppercase tracking-widest text-dim"
      >
        Account email
      </label>

      <div className="relative">
        <input
          id="login-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@yourbusiness.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "login-error" : undefined}
          // text-base, not text-sm: anything smaller makes iOS Safari zoom the
          // whole viewport when the field takes focus.
          className="w-full rounded-xl border border-line bg-black py-3 pl-11 pr-4 text-base text-white outline-none transition-colors duration-200 placeholder:text-faint focus:border-accent"
        />
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-dim">
          <At size={16} weight="bold" />
        </span>
      </div>

      {error && (
        <p id="login-error" role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={status === "sending"}
        className="btn-shine mt-1 inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-white shadow-glow-accent transition-all duration-200 hover:bg-accent-hover hover:shadow-glow-accent-strong disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Email Me a Login Link"}
      </button>

      <p className="mt-2 text-xs leading-relaxed text-dim text-pretty">
        No password needed. We email a secure link to the address on your
        account, so only you can log in.
      </p>
    </div>
  );
}
