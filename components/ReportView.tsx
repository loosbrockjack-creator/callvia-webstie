"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { TRADES, estimateRange } from "@/lib/estimate";

function lineTypeLabel(type: string | null): string | null {
  if (!type) return null;
  const map: Record<string, string> = {
    mobile: "mobile line",
    landline: "landline",
    fixedVoip: "VoIP line",
    nonFixedVoip: "VoIP line",
    voip: "VoIP line",
  };
  return map[type] ?? `${type} line`;
}

export function ReportView() {
  const params = useSearchParams();

  const trade = TRADES.find((t) => t.id === params.get("trade")) ?? null;
  const missed = Math.max(1, Math.min(500, parseInt(params.get("missed") ?? "", 10) || 5));
  const repeat = (() => {
    const r = parseInt(params.get("repeat") ?? "", 10);
    return r >= 0 && r <= 100 ? r : 40;
  })();
  const carrier = params.get("carrier");
  const lt = lineTypeLabel(params.get("lt"));

  const jobValue = trade?.jobValue ?? 0;
  const est = estimateRange(missed, repeat, jobValue);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <p className="text-xs tracking-widest uppercase mb-5" style={{ color: "#7c5cfc" }}>
        Your Missed-Call Report
      </p>
      <h1 className="text-3xl md:text-5xl font-light text-white tracking-tight leading-tight" style={{ letterSpacing: "-0.025em" }}>
        Here&#39;s what those
        <br />
        missed calls add up to.
      </h1>

      <div
        className="mt-12 rounded-2xl border p-8 md:p-10"
        style={{ background: "#0d0d0d", borderColor: "#1f1f1f" }}
      >
        {/* Carrier line, only when the lookup returned real data */}
        {(carrier || lt) && (
          <div
            className="flex items-center gap-2.5 pb-6 mb-6 border-b"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
            <span className="text-sm" style={{ color: "#999999" }}>
              Line identified:{" "}
              <span className="text-white">{[carrier, lt].filter(Boolean).join(", ")}</span>
            </span>
          </div>
        )}

        <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "#555555" }}>
          Estimated monthly revenue at stake
        </p>
        <div
          className="text-4xl md:text-6xl font-semibold text-white tracking-tight"
          style={{ letterSpacing: "-0.03em" }}
        >
          ${Math.round(est.lowRevenue).toLocaleString()} &ndash; ${Math.round(est.highRevenue).toLocaleString()}
        </div>

        {/* Breakdown */}
        <div className="mt-8 flex flex-col gap-3">
          {[
            { label: "Missed calls per month", value: Math.round(est.missedCallsPerMonth).toLocaleString() },
            { label: "From repeat customers", value: `~${Math.round(est.missedCallsPerMonth * est.repeatShare)}` },
            { label: "From brand-new callers", value: `~${Math.round(est.missedCallsPerMonth * est.newShare)}` },
            { label: `Average ${trade?.label ?? "trade"} job value`, value: `$${jobValue.toLocaleString()}` },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between text-sm">
              <span style={{ color: "#888888" }}>{row.label}</span>
              <span className="text-white font-medium">{row.value}</span>
            </div>
          ))}
        </div>

        <a
          href={`/build?trade=${trade?.id ?? ""}&missed=${missed}&repeat=${repeat}`}
          className="btn-shine mt-10 inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-full transition-all duration-200 shadow-[0_0_30px_rgba(124,92,252,0.35)] hover:shadow-[0_0_40px_rgba(124,92,252,0.5)]"
        >
          Build My Receptionist
        </a>

        <p className="mt-8 text-xs leading-relaxed" style={{ color: "#444444" }}>
          How we get this number: research shows about 85% of first-time callers who can&#39;t reach you never call back (Forbes / BIA Kelsey). Your regular customers are more patient, so we assume only 10 to 35% of them give up. That&#39;s why you see a range instead of one exact number. This is an estimate built from industry research, not a reading of your call records. Those stay private to you and your carrier.
        </p>
      </div>

      <a
        href="/#tool"
        className="mt-8 inline-block text-xs tracking-widest uppercase text-white/30 hover:text-white/60 transition-colors duration-200"
      >
        ← Run it again
      </a>
    </motion.div>
  );
}
