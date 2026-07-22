"use client";

import { useEffect, useState } from "react";

// The webhook is the source of truth for payment, and it can land a moment
// after the browser redirect. Rather than claim success from the redirect
// alone, poll our own status endpoint for a short while.
export function CompleteStatus({ token }: { token: string }) {
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    async function poll() {
      if (cancelled) return;
      attempts += 1;
      try {
        const res = await fetch(`/api/agreement/${token}/status`, { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (data.status === "active") {
          window.location.reload();
          return;
        }
      } catch {
        // Ignore and retry.
      }
      if (attempts >= 10) {
        setGaveUp(true);
        return;
      }
      setTimeout(poll, 2000);
    }

    const timer = setTimeout(poll, 1500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [token]);

  return (
    <>
      <h1 className="text-4xl font-light tracking-tight mb-4" style={{ letterSpacing: "-0.025em" }}>
        {gaveUp ? "Still finalizing." : "Finalizing your account…"}
      </h1>
      <p className="text-base leading-relaxed" style={{ color: "#999999" }}>
        {gaveUp
          ? "Your payment may still be processing. If you were charged, you are all set and we will confirm by email shortly. If you are unsure, email team@callvia.io and we will check for you."
          : "Payment received. Give us a moment to confirm it with our payment processor."}
      </p>
    </>
  );
}
