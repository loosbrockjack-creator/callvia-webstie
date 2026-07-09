"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WaveformMark } from "./WaveformMark";

// Average job values per trade, used for the revenue estimate.
// Sources: CallBird contractor dataset (HVAC $850, Plumbing $650),
// industry averages for electrical service calls and GC projects.
const TRADES = [
  { id: "hvac", label: "HVAC", jobValue: 850 },
  { id: "plumbing", label: "Plumbing", jobValue: 650 },
  { id: "electrical", label: "Electrical", jobValue: 500 },
  { id: "gc", label: "General Contractor", jobValue: 1500 },
] as const;

const UNANSWERED_RATE = 0.27; // Invoca, 60M+ calls analyzed
const NEVER_CALL_BACK = 0.85; // Forbes / BIA Kelsey
const WEEKS_PER_MONTH = 4.33;

const SCAN_STATUSES = [
  "Validating number format",
  "Querying carrier records",
  "Identifying line type",
  "Crunching industry benchmarks",
];

const BOOKING_URL = "https://cal.com/jack-loosbrock-wzgbta/meeting-callvia";

type Phase = "form" | "scanning" | "result";

interface LookupResult {
  carrier: string | null;
  lineType: string | null;
}

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

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

export function MissedCallTool() {
  const [phase, setPhase] = useState<Phase>("form");
  const [trade, setTrade] = useState<(typeof TRADES)[number] | null>(null);
  const [calls, setCalls] = useState("20");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lookup, setLookup] = useState<LookupResult>({ carrier: null, lineType: null });
  const [statusIdx, setStatusIdx] = useState(0);
  const statusTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const callsNum = Math.max(1, Math.min(500, parseInt(calls, 10) || 0));
  const digits = phone.replace(/\D/g, "");

  async function runAnalysis() {
    if (!trade) {
      setError("Pick your trade first.");
      return;
    }
    if (!parseInt(calls, 10)) {
      setError("How many calls do you get in a week?");
      return;
    }
    if (digits.length !== 10) {
      setError("Enter a valid 10-digit US phone number.");
      return;
    }
    setError(null);
    setPhase("scanning");
    setStatusIdx(0);
    statusTimer.current = setInterval(() => {
      setStatusIdx((i) => Math.min(i + 1, SCAN_STATUSES.length - 1));
    }, 850);

    const minDelay = new Promise((r) => setTimeout(r, 3000));
    const fetchLookup = fetch("/api/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: digits }),
    })
      .then((r) => (r.ok ? r.json() : { carrier: null, lineType: null }))
      .catch(() => ({ carrier: null, lineType: null }));

    const [result] = await Promise.all([fetchLookup, minDelay]);
    if (statusTimer.current) clearInterval(statusTimer.current);
    setLookup(result);
    setPhase("result");
  }

  function reset() {
    setPhase("form");
    setLookup({ carrier: null, lineType: null });
  }

  // The estimate math, all assumptions visible
  const monthlyCalls = callsNum * WEEKS_PER_MONTH;
  const missedCalls = monthlyCalls * UNANSWERED_RATE;
  const lostCallers = missedCalls * NEVER_CALL_BACK;
  const revenueAtStake = lostCallers * (trade?.jobValue ?? 0);
  const lt = lineTypeLabel(lookup.lineType);

  return (
    <section id="tool" className="py-32 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-xs tracking-widest uppercase mb-5 text-center"
          style={{ color: "#7c5cfc" }}
        >
          Run Your Numbers
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="text-4xl md:text-5xl font-light text-white tracking-tight leading-tight text-center"
          style={{ letterSpacing: "-0.02em" }}
        >
          See what your line is losing.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-5 text-base leading-relaxed max-w-xl mx-auto text-center"
          style={{ color: "#888888" }}
        >
          Two questions and your business number. We run a live carrier lookup, then apply the research above to estimate what unanswered calls cost you every month.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-12 max-w-2xl mx-auto rounded-2xl border p-8 md:p-10"
          style={{ background: "#0d0d0d", borderColor: "#1f1f1f" }}
        >
          <AnimatePresence mode="wait">
            {phase === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-7"
              >
                {/* Trade */}
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-3" style={{ color: "#555555" }}>
                    Your trade
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TRADES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTrade(t)}
                        className="px-4 py-2 text-sm rounded-full border transition-all duration-200"
                        style={
                          trade?.id === t.id
                            ? { borderColor: "#7c5cfc", color: "#ffffff", background: "rgba(124,92,252,0.12)" }
                            : { borderColor: "#1f1f1f", color: "#888888" }
                        }
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calls per week */}
                <div>
                  <label htmlFor="mct-calls" className="block text-xs tracking-widest uppercase mb-3" style={{ color: "#555555" }}>
                    Inbound calls per week
                  </label>
                  <input
                    id="mct-calls"
                    type="number"
                    min={1}
                    max={500}
                    value={calls}
                    onChange={(e) => setCalls(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg text-white text-base outline-none border transition-colors duration-200 focus:border-accent"
                    style={{ background: "#000000", borderColor: "#1f1f1f" }}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="mct-phone" className="block text-xs tracking-widest uppercase mb-3" style={{ color: "#555555" }}>
                    Business phone number
                  </label>
                  <input
                    id="mct-phone"
                    type="tel"
                    inputMode="tel"
                    placeholder="(612) 555-0134"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg text-white text-base outline-none border transition-colors duration-200 focus:border-accent"
                    style={{ background: "#000000", borderColor: "#1f1f1f" }}
                  />
                  <p className="mt-2.5 text-xs leading-relaxed" style={{ color: "#555555" }}>
                    Used once for a live carrier lookup. Never called, texted, stored, or shared.
                  </p>
                </div>

                {error && (
                  <p className="text-sm" style={{ color: "#f87171" }}>
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={runAnalysis}
                  className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-full transition-all duration-200 shadow-[0_0_30px_rgba(124,92,252,0.35)] hover:shadow-[0_0_40px_rgba(124,92,252,0.5)]"
                >
                  Analyze My Line
                </button>
              </motion.div>
            )}

            {phase === "scanning" && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center py-10"
              >
                <WaveformMark size={140} animated opacity={0.85} />
                <p className="mt-8 text-sm tracking-wide" style={{ color: "#888888" }}>
                  {SCAN_STATUSES[statusIdx]}
                  <span className="animate-pulse">…</span>
                </p>
              </motion.div>
            )}

            {phase === "result" && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col"
              >
                {/* Carrier line, only when the lookup returned real data */}
                {(lookup.carrier || lt) && (
                  <div
                    className="flex items-center gap-2.5 pb-6 mb-6 border-b"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                    <span className="text-sm" style={{ color: "#999999" }}>
                      Line identified:{" "}
                      <span className="text-white">
                        {[lookup.carrier, lt].filter(Boolean).join(", ")}
                      </span>
                    </span>
                  </div>
                )}

                <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "#555555" }}>
                  Estimated monthly revenue at stake
                </p>
                <div
                  className="text-5xl md:text-6xl font-semibold text-white tracking-tight"
                  style={{ letterSpacing: "-0.03em" }}
                >
                  ${Math.round(revenueAtStake).toLocaleString()}
                </div>

                {/* Breakdown */}
                <div className="mt-8 flex flex-col gap-3">
                  {[
                    { label: "Inbound calls per month", value: Math.round(monthlyCalls).toLocaleString() },
                    { label: "Go unanswered (27%, Invoca)", value: `~${Math.round(missedCalls)}` },
                    { label: "Never call back (85%, Forbes / BIA Kelsey)", value: `~${Math.round(lostCallers)}` },
                    { label: `Average ${trade?.label ?? ""} job value`, value: `$${(trade?.jobValue ?? 0).toLocaleString()}` },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between text-sm">
                      <span style={{ color: "#888888" }}>{row.label}</span>
                      <span className="text-white font-medium">{row.value}</span>
                    </div>
                  ))}
                </div>

                <a
                  href={BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-10 inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-full transition-all duration-200 shadow-[0_0_30px_rgba(124,92,252,0.35)] hover:shadow-[0_0_40px_rgba(124,92,252,0.5)]"
                >
                  Never Miss Another Call
                </a>

                <button
                  type="button"
                  onClick={reset}
                  className="mt-4 text-xs tracking-widest uppercase text-white/30 hover:text-white/60 transition-colors duration-200"
                >
                  Run it again
                </button>

                <p className="mt-8 text-xs leading-relaxed" style={{ color: "#444444" }}>
                  Estimate built from published industry research: Invoca unanswered-call data, Forbes / BIA Kelsey callback research, and average trade job values. It is not a reading of your call records, those are private to you and your carrier.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
