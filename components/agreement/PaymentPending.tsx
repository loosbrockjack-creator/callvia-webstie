"use client";

import { useState } from "react";

// Shown when an agreement is already signed. The sign form is never rendered
// again: re-signing is refused server-side by the compare-and-swap guard, and
// showing the form would only invite a confusing failure.
export function PaymentPending({
  token,
  signedName,
  signedAt,
}: {
  token: string;
  signedName: string;
  signedAt: string;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/agreement/${token}/checkout`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error ?? "Could not open checkout. Please email team@callvia.io.");
      setSubmitting(false);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border p-8" style={{ borderColor: "#1f1f1f", background: "#0d0d0d" }}>
      <p className="text-xs tracking-widest uppercase mb-4" style={{ color: "#4ade80" }}>
        Signed
      </p>
      <h2 className="text-2xl font-light tracking-tight text-white mb-3" style={{ letterSpacing: "-0.025em" }}>
        Thanks, {signedName.split(" ")[0]}.
      </h2>
      <p className="text-base leading-relaxed mb-8" style={{ color: "#999999" }}>
        You signed this agreement on {signedAt}. A signed copy has been emailed to you, and you can
        download it again below. The last step is payment, and your service starts once it goes through.
      </p>

      {error && (
        <p className="text-sm mb-6" style={{ color: "#f87171" }}>
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-5">
        <button
          onClick={pay}
          disabled={submitting}
          className="inline-flex items-center justify-center px-8 py-4 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-full transition-all duration-200 shadow-[0_0_30px_rgba(124,92,252,0.35)] disabled:opacity-40 disabled:pointer-events-none"
        >
          {submitting ? "Opening checkout…" : "Complete payment"}
        </button>
        <a
          href={`/api/agreement/${token}/pdf`}
          className="text-sm transition-colors duration-200 hover:text-white underline underline-offset-4"
          style={{ color: "#999999" }}
        >
          Download your signed copy
        </a>
      </div>
    </div>
  );
}
