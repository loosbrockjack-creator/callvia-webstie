"use client";

import { useState } from "react";

// A real click, not an auto-consume on page load. Corporate mail scanners
// (e.g. Microsoft Safe Links) pre-fetch link URLs, which would silently burn a
// single-use token before the client ever clicked. Requiring a button press
// means only a human consumes the token.
export function ConfirmLogin({ token }: { token: string }) {
  const [status, setStatus] = useState<"idle" | "working" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setStatus("working");
    setError(null);
    try {
      const res = await fetch("/api/account/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "This link is invalid or has expired.");
        setStatus("error");
        return;
      }
      window.location.href = "/account";
    } catch {
      setError("Network error. Try again.");
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={confirm}
        disabled={status === "working"}
        className="btn-shine inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-full transition-all duration-200 shadow-[0_0_30px_rgba(124,92,252,0.35)] hover:shadow-[0_0_40px_rgba(124,92,252,0.5)] disabled:opacity-60"
      >
        {status === "working" ? "Logging in…" : "Log in to my account"}
      </button>

      {error && (
        <p className="text-sm text-center" style={{ color: "#f87171" }}>
          {error}{" "}
          <a href="/login" className="text-accent hover:text-accent-hover transition-colors duration-200">
            Request a new link
          </a>
        </p>
      )}
    </div>
  );
}
