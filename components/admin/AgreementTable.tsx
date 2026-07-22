"use client";

import { formatCents } from "@/lib/money";
import { statusLabel } from "@/lib/agreement/status";
import type { AdminAgreement } from "./types";

const STATUS_COLOR: Record<string, string> = {
  draft: "#555555",
  sent: "#999999",
  viewed: "#9b7ffd",
  signed: "#fbbf24",
  payment_pending: "#fbbf24",
  active: "#4ade80",
  void: "#555555",
  expired: "#555555",
};

function shortDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function AgreementTable({ agreements }: { agreements: AdminAgreement[] }) {
  async function resend(id: string) {
    const res = await fetch(`/api/admin/agreements/${id}/send`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (data.url) {
      await navigator.clipboard.writeText(data.url).catch(() => {});
      alert(data.emailed ? "Sent and copied to clipboard." : `Email not sent. Link copied:\n${data.url}`);
    } else {
      alert(data.error ?? "Could not send.");
    }
  }

  async function voidAgreement(id: string, name: string) {
    const reason = prompt(`Void the agreement for ${name}? The record and any signed PDF are kept. Reason:`);
    if (reason === null) return;
    const res = await fetch(`/api/admin/agreements/${id}/void`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    if (res.ok) window.location.reload();
    else alert("Could not void.");
  }

  if (agreements.length === 0) {
    return (
      <p className="text-sm" style={{ color: "#555555" }}>
        No agreements yet.
      </p>
    );
  }

  return (
    <section>
      <h2 className="text-sm tracking-widest uppercase mb-6" style={{ color: "#555555" }}>
        All agreements
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left" style={{ color: "#555555" }}>
              <th className="font-normal text-xs tracking-widest uppercase py-3 pr-4">Client</th>
              <th className="font-normal text-xs tracking-widest uppercase py-3 pr-4">Package</th>
              <th className="font-normal text-xs tracking-widest uppercase py-3 pr-4">Price</th>
              <th className="font-normal text-xs tracking-widest uppercase py-3 pr-4">Status</th>
              <th className="font-normal text-xs tracking-widest uppercase py-3 pr-4">Views</th>
              <th className="font-normal text-xs tracking-widest uppercase py-3 pr-4">Created</th>
              <th className="font-normal text-xs tracking-widest uppercase py-3" />
            </tr>
          </thead>
          <tbody>
            {agreements.map((a) => (
              <tr key={a.id} className="border-t align-top" style={{ borderColor: "#1f1f1f" }}>
                <td className="py-4 pr-4">
                  <p className="text-white">{a.businessName}</p>
                  <p className="text-xs" style={{ color: "#555555" }}>
                    {a.email}
                  </p>
                </td>
                <td className="py-4 pr-4" style={{ color: "#999999" }}>
                  {a.packageName}
                </td>
                <td className="py-4 pr-4 whitespace-nowrap" style={{ color: "#999999" }}>
                  {a.setupFeeCents > 0 && <div>{formatCents(a.setupFeeCents)} setup</div>}
                  {a.monthlyCents > 0 && <div>{formatCents(a.monthlyCents)}/mo</div>}
                </td>
                <td className="py-4 pr-4 whitespace-nowrap">
                  <span style={{ color: STATUS_COLOR[a.status] ?? "#999999" }}>{statusLabel(a.status)}</span>
                  {/* A signed agreement whose PDF never reached the client is a
                      silent failure, so it is called out here. */}
                  {a.hasPdf && !a.pdfEmailedAt && (
                    <div className="text-xs mt-1" style={{ color: "#f87171" }}>
                      PDF not emailed
                    </div>
                  )}
                </td>
                <td className="py-4 pr-4 tabular-nums" style={{ color: "#999999" }}>
                  {a.viewCount}
                </td>
                <td className="py-4 pr-4 whitespace-nowrap" style={{ color: "#555555" }}>
                  {shortDate(a.createdAt)}
                </td>
                <td className="py-4 whitespace-nowrap">
                  <div className="flex gap-3 justify-end">
                    <a
                      href={`/admin/agreements/${a.id}`}
                      className="text-xs transition-colors duration-200 hover:text-white"
                      style={{ color: "#999999" }}
                    >
                      Details
                    </a>
                    {a.status !== "void" && (
                      <>
                        <button
                          onClick={() => resend(a.id)}
                          className="text-xs transition-colors duration-200 hover:text-white"
                          style={{ color: "#999999" }}
                        >
                          {a.sentAt ? "Resend" : "Send"}
                        </button>
                        <button
                          onClick={() => voidAgreement(a.id, a.businessName)}
                          className="text-xs transition-colors duration-200 hover:text-white"
                          style={{ color: "#555555" }}
                        >
                          Void
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
