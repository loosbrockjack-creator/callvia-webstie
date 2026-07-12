"use client";

import { useState } from "react";

// TODO: replace with the live Stripe payment link before sending this page to clients.
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/REPLACE_ME";

const inputClass =
  "w-full px-4 py-3 rounded-lg text-white text-base outline-none border transition-colors duration-200 focus:border-accent";
const inputStyle = { background: "#0d0d0d", borderColor: "#1f1f1f" } as const;

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export function OnboardingForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [business, setBusiness] = useState("");
  const [agreed, setAgreed] = useState(false);
  // SMS consent is fully optional. Unchecked by default and never required to submit.
  const [smsConsent, setSmsConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !business.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (phone.replace(/\D/g, "").length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.replace(/\D/g, ""),
          business: business.trim(),
          agreedToServiceAgreement: agreed,
          smsConsent,
        }),
      });
    } catch {
      // The API route never blocks payment. If the network call itself failed,
      // continue to payment anyway; the client details are re-collected by Stripe.
    }

    window.location.href = STRIPE_PAYMENT_LINK;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-7" noValidate>
      <div>
        <label htmlFor="ob-name" className="block text-xs tracking-widest uppercase mb-3" style={{ color: "#555555" }}>
          Full name *
        </label>
        <input
          id="ob-name"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div>
        <label htmlFor="ob-email" className="block text-xs tracking-widest uppercase mb-3" style={{ color: "#555555" }}>
          Email address *
        </label>
        <input
          id="ob-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div>
        <label htmlFor="ob-phone" className="block text-xs tracking-widest uppercase mb-3" style={{ color: "#555555" }}>
          Phone number *
        </label>
        <input
          id="ob-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="(612) 555-0134"
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div>
        <label htmlFor="ob-business" className="block text-xs tracking-widest uppercase mb-3" style={{ color: "#555555" }}>
          Business name *
        </label>
        <input
          id="ob-business"
          type="text"
          autoComplete="organization"
          value={business}
          onChange={(e) => setBusiness(e.target.value)}
          className={inputClass}
          style={inputStyle}
        />
      </div>

      {/* Optional: Service Agreement acknowledgment. Acceptance is effected by
          submitting payment per the agreement itself, so this does not gate submission. */}
      <label className="flex items-start gap-3.5 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-[#7c5cfc]"
        />
        <span className="text-sm leading-relaxed" style={{ color: "#999999" }}>
          I have read and agree to the{" "}
          <a
            href="/service-agreement"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-white/70 transition-colors duration-200 underline underline-offset-4"
          >
            Callvia Service Agreement
          </a>
          . (Optional)
        </span>
      </label>

      {/* Optional: SMS consent. Unchecked by default, never required. */}
      <label className="flex items-start gap-3.5 cursor-pointer">
        <input
          type="checkbox"
          checked={smsConsent}
          onChange={(e) => setSmsConsent(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-[#7c5cfc]"
        />
        <span className="text-sm leading-relaxed" style={{ color: "#999999" }}>
          I consent to receive SMS text messages from Callvia at the phone number provided above. Message frequency varies. Message &amp; data rates may apply. Reply STOP to opt out at any time, reply HELP for help. See our{" "}
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-white/70 transition-colors duration-200 underline underline-offset-4"
          >
            Privacy Policy
          </a>{" "}
          and{" "}
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-white/70 transition-colors duration-200 underline underline-offset-4"
          >
            Terms
          </a>
          . (Optional)
        </span>
      </label>

      {error && (
        <p className="text-sm" style={{ color: "#f87171" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 inline-flex items-center justify-center px-8 py-4 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-full transition-all duration-200 shadow-[0_0_30px_rgba(124,92,252,0.35)] hover:shadow-[0_0_40px_rgba(124,92,252,0.5)] disabled:opacity-60 disabled:pointer-events-none"
      >
        {submitting ? "Setting things up…" : "Complete Setup"}
      </button>
    </form>
  );
}
