"use client";

import { formatCents } from "@/lib/money";
import type { AdminAgreement } from "./types";

// The one state that silently costs money: a binding signature with no payment
// against it. It gets its own panel at the top, aged, so it cannot be missed.
function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

function ageColor(days: number): string {
  if (days >= 7) return "#f87171";
  if (days >= 3) return "#fbbf24";
  return "#999999";
}

export function AwaitingPayment({ agreements }: { agreements: AdminAgreement[] }) {
  const sorted = [...agreements].sort((a, b) => {
    const at = a.signedAt ? new Date(a.signedAt).getTime() : 0;
    const bt = b.signedAt ? new Date(b.signedAt).getTime() : 0;
    return at - bt;
  });

  async function resend(id: string) {
    const res = await fetch(`/api/admin/agreements/${id}/send`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (data.url) {
      await navigator.clipboard.writeText(data.url).catch(() => {});
      alert(data.emailed ? "Payment link emailed and copied to clipboard." : `Email not sent. Link copied:\n${data.url}`);
    } else {
      alert(data.error ?? "Could not resend.");
    }
  }

  return (
    <section className="mb-16 rounded-xl border p-6" style={{ borderColor: "#3f2d1a", background: "#0d0d0d" }}>
      <h2 className="text-sm tracking-widest uppercase mb-1" style={{ color: "#fbbf24" }}>
        Signed, awaiting payment
      </h2>
      <p className="text-sm mb-6" style={{ color: "#999999" }}>
        These are binding contracts with no payment against them yet.
      </p>

      <div className="flex flex-col gap-3">
        {sorted.map((a) => {
          const days = a.signedAt ? daysSince(a.signedAt) : 0;
          return (
            <div
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg border px-4 py-3"
              style={{ borderColor: "#1f1f1f" }}
            >
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{a.businessName}</p>
                <p className="text-xs truncate" style={{ color: "#555555" }}>
                  {a.contactName} | {a.email}
                </p>
              </div>
              <div className="text-sm" style={{ color: "#999999" }}>
                {a.setupFeeCents > 0 && <span>{formatCents(a.setupFeeCents)} setup</span>}
                {a.setupFeeCents > 0 && a.monthlyCents > 0 && <span> + </span>}
                {a.monthlyCents > 0 && <span>{formatCents(a.monthlyCents)}/mo</span>}
              </div>
              <div className="text-sm tabular-nums" style={{ color: ageColor(days) }}>
                {days === 0 ? "signed today" : `${days} day${days === 1 ? "" : "s"} unpaid`}
              </div>
              <button
                onClick={() => resend(a.id)}
                className="text-xs px-4 py-2 rounded-full border transition-colors duration-200 hover:border-white/30"
                style={{ borderColor: "#1f1f1f", color: "#999999" }}
              >
                Resend payment link
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
