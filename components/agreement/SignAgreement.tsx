"use client";

import { useEffect, useState } from "react";
import {
  AUTHORITY_ACK_TEXT,
  ESIGN_CONSENT_TEXT,
  INTENT_TO_SIGN_TEXT,
  SMS_CONSENT_TEXT,
} from "@/lib/agreement/consent";

const inputClass =
  "w-full px-4 py-3 rounded-lg text-white text-base outline-none border transition-colors duration-200 focus:border-accent";
const inputStyle = { background: "#0d0d0d", borderColor: "#1f1f1f" } as const;

interface Props {
  token: string;
  businessName: string;
  contactName: string;
  email: string;
  disclosure: string;
  hasPhone: boolean;
}

export function SignAgreement({ token, businessName, contactName, email, disclosure, hasPhone }: Props) {
  const [typedName, setTypedName] = useState(contactName);
  const [signerEmail, setSignerEmail] = useState(email);
  const [title, setTitle] = useState("");
  const [esignConsent, setEsignConsent] = useState(false);
  const [authorityAck, setAuthorityAck] = useState(false);
  // Optional, unchecked by default, and never gates submission (Twilio A2P).
  const [smsConsent, setSmsConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // View tracking runs on mount rather than during render, so it is a real user
  // action and not a render side effect.
  useEffect(() => {
    fetch(`/api/agreement/${token}/view`, { method: "POST" }).catch(() => {});
  }, [token]);

  const canSubmit = typedName.trim().length > 1 && esignConsent && authorityAck && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);

    try {
      const signRes = await fetch(`/api/agreement/${token}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          typedName: typedName.trim(),
          email: signerEmail.trim(),
          title: title.trim(),
          esignConsent,
          authorityAck,
          smsConsent,
        }),
      });
      const signData = await signRes.json().catch(() => ({}));
      if (!signRes.ok && !signData.alreadySigned) {
        setError(signData.error ?? "We could not record your signature. Please try again.");
        setSubmitting(false);
        return;
      }

      // Signature is durable at this point. Payment is a separate step, and a
      // failure here leaves a valid signed agreement rather than losing it.
      const checkoutRes = await fetch(`/api/agreement/${token}/checkout`, { method: "POST" });
      const checkoutData = await checkoutRes.json().catch(() => ({}));
      if (checkoutRes.ok && checkoutData.url) {
        window.location.href = checkoutData.url;
        return;
      }
      setError(
        "Your signature was recorded and a signed copy has been emailed to you, but we could not open checkout. Please reload the page to complete payment.",
      );
      setSubmitting(false);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-7" noValidate>
      {/* State automatic-renewal laws require this next to the control that
          authorizes the charge, not buried in the terms above. */}
      {disclosure && (
        <div
          className="rounded-xl border p-6"
          style={{ borderColor: "#7c5cfc", background: "rgba(124,92,252,0.06)" }}
        >
          <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "#9b7ffd" }}>
            Before you sign
          </p>
          <p className="text-base leading-relaxed text-white">{disclosure}</p>
        </div>
      )}

      <div className="grid gap-7 sm:grid-cols-2">
        <div>
          <label htmlFor="sig-name" className="block text-xs tracking-widest uppercase mb-3" style={{ color: "#555555" }}>
            Type your full name to sign *
          </label>
          <input
            id="sig-name"
            type="text"
            autoComplete="name"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="sig-title" className="block text-xs tracking-widest uppercase mb-3" style={{ color: "#555555" }}>
            Your title (optional)
          </label>
          <input
            id="sig-title"
            type="text"
            autoComplete="organization-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label htmlFor="sig-email" className="block text-xs tracking-widest uppercase mb-3" style={{ color: "#555555" }}>
          Email for your signed copy *
        </label>
        <input
          id="sig-email"
          type="email"
          autoComplete="email"
          value={signerEmail}
          onChange={(e) => setSignerEmail(e.target.value)}
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <label className="flex items-start gap-3.5 cursor-pointer">
        <input
          type="checkbox"
          checked={esignConsent}
          onChange={(e) => setEsignConsent(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-[#7c5cfc]"
        />
        <span className="text-sm leading-relaxed" style={{ color: "#999999" }}>
          {ESIGN_CONSENT_TEXT}
        </span>
      </label>

      <label className="flex items-start gap-3.5 cursor-pointer">
        <input
          type="checkbox"
          checked={authorityAck}
          onChange={(e) => setAuthorityAck(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-[#7c5cfc]"
        />
        <span className="text-sm leading-relaxed" style={{ color: "#999999" }}>
          {AUTHORITY_ACK_TEXT.replace("the business named above", businessName)}
        </span>
      </label>

      {/* Optional. Unchecked by default and never required to submit, so the
          signer can decline and still complete the agreement. */}
      {hasPhone && (
        <label className="flex items-start gap-3.5 cursor-pointer">
          <input
            type="checkbox"
            checked={smsConsent}
            onChange={(e) => setSmsConsent(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-[#7c5cfc]"
          />
          <span className="text-sm leading-relaxed" style={{ color: "#999999" }}>
            {SMS_CONSENT_TEXT} (Optional) View our{" "}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/70 transition-colors duration-200 underline underline-offset-4">
              Privacy Policy
            </a>{" "}
            and{" "}
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/70 transition-colors duration-200 underline underline-offset-4">
              Terms of Service
            </a>
            .
          </span>
        </label>
      )}

      <p className="text-sm leading-relaxed" style={{ color: "#555555" }}>
        {INTENT_TO_SIGN_TEXT}
      </p>

      {error && (
        <p className="text-sm" style={{ color: "#f87171" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-2 inline-flex items-center justify-center px-8 py-4 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-full transition-all duration-200 shadow-[0_0_30px_rgba(124,92,252,0.35)] hover:shadow-[0_0_40px_rgba(124,92,252,0.5)] disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none"
      >
        {submitting ? "Signing…" : "Sign and continue to payment"}
      </button>
    </form>
  );
}
