"use client";

import { useState } from "react";
import { Lock } from "@phosphor-icons/react";

// Visually matched to components/LoginForm.tsx's split-auth-page styling so
// the admin door looks like the same product as the client door. Behavior is
// untouched: still a plain password POST to /api/admin/login, same
// rate-limiting and HMAC-signed session cookie as before -- this is markup
// only.
export function AdminLogin() {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Login failed.");
        setSubmitting(false);
        return;
      }
      window.location.href = "/admin";
    } catch {
      setError("Network error. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
      <label htmlFor="admin-password" className="text-xs uppercase tracking-widest text-dim">
        Password
      </label>

      <div className="relative">
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "admin-login-error" : undefined}
          // text-base, not text-sm: anything smaller makes iOS Safari zoom the
          // whole viewport when the field takes focus.
          className="w-full rounded-xl border border-line bg-black py-3 pl-11 pr-4 text-base text-white outline-none transition-colors duration-200 placeholder:text-faint focus:border-accent"
        />
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-dim">
          <Lock size={16} weight="bold" />
        </span>
      </div>

      {error && (
        <p id="admin-login-error" role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || password.length === 0}
        className="btn-shine mt-1 inline-flex min-h-[44px] w-full items-center justify-center rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-white shadow-glow-accent transition-all duration-200 hover:bg-accent-hover hover:shadow-glow-accent-strong disabled:opacity-60"
      >
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
