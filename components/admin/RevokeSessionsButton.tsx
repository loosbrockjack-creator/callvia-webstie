"use client";

import { useState } from "react";

// Admin force-logout for one client. Confirms first because it invalidates
// every device the client is currently logged in on.
export function RevokeSessionsButton({ clientId }: { clientId: string }) {
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function revoke() {
    if (!confirm("Log this client out of all devices? They can log back in with a fresh link.")) return;
    setStatus("working");
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/revoke-sessions`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error ?? "Failed.");
        setStatus("error");
        return;
      }
      setMessage(`Logged out of ${data.revoked} session${data.revoked === 1 ? "" : "s"}.`);
      setStatus("done");
    } catch {
      setMessage("Network error.");
      setStatus("error");
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={revoke}
        disabled={status === "working"}
        className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-full border transition-colors duration-200 hover:bg-white/5 disabled:opacity-50"
        style={{ borderColor: "#1f1f1f", color: "#cccccc" }}
      >
        {status === "working" ? "Working…" : "Force log out"}
      </button>
      {message && (
        <span className="text-sm" style={{ color: status === "error" ? "#f87171" : "#a48bff" }}>
          {message}
        </span>
      )}
    </div>
  );
}
