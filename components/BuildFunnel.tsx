"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { TRADES, estimateRange } from "@/lib/estimate";
import { BOOKING_URL } from "@/lib/site";
import { CursorCard, CursorCardsContainer } from "@/components/ui/cursor-cards";

// ---------------------------------------------------------------------------
// Question config. Jack: revise wording, order, or options here, one place.
// Kinds: "single" (one choice, auto-advances), "multi" (pick several),
// "text" (short answer), "missed" (missed calls number + repeat slider),
// "textarea" (long answer).
// ---------------------------------------------------------------------------
interface Question {
  id: string;
  kind: "single" | "multi" | "text" | "missed" | "textarea";
  label: string;
  sublabel?: string;
  options?: string[];
  otherOption?: boolean; // adds an "Other" row that reveals a text input
  optional?: boolean;
  placeholder?: string;
}

const QUESTIONS: Question[] = [
  {
    id: "trade",
    kind: "single",
    label: "What's your trade?",
    options: [...TRADES.map((t) => t.label)],
    otherOption: true,
  },
  {
    id: "website",
    kind: "text",
    label: "Got a business website?",
    sublabel: "We use it to learn how you present your business. Skip if you don't have one.",
    optional: true,
    placeholder: "yourbusiness.com",
  },
  {
    id: "serviceArea",
    kind: "text",
    label: "What area do you serve?",
    placeholder: "Cities or zip codes",
  },
  {
    id: "hours",
    kind: "text",
    label: "What are your business hours?",
    optional: true,
    placeholder: "e.g. Mon to Fri, 8am to 5pm",
  },
  {
    id: "answerWhen",
    kind: "multi",
    label: "When should your receptionist answer?",
    sublabel: "Pick everything that applies.",
    options: ["24/7", "After hours only", "Missed calls only"],
    otherOption: true,
  },
  {
    id: "callerNeeds",
    kind: "multi",
    label: "What do callers usually need?",
    sublabel: "Pick everything that applies.",
    options: ["Quotes", "Emergency repairs", "Scheduling", "General questions"],
    otherOption: true,
  },
  {
    id: "missedPerWeek",
    kind: "missed",
    label: "How many calls do you miss in a typical week?",
    sublabel: "Your best guess is fine.",
    placeholder: "e.g. 10",
  },
  {
    id: "missedToday",
    kind: "single",
    label: "What happens to a missed call today?",
    options: ["Goes to voicemail", "Just rings out", "Answering service"],
  },
  {
    id: "urgent",
    kind: "multi",
    label: "When something is urgent, what should happen?",
    sublabel: "Pick everything that applies.",
    options: ["Call me immediately", "Text me an alert", "Flag it in the summary"],
  },
  {
    id: "booking",
    kind: "single",
    label: "Want it to book appointments?",
    sublabel: "If a caller wants work done, your receptionist offers open times, puts the job on your calendar, and confirms it with the caller before hanging up.",
    options: ["Yes", "No"],
  },
  {
    id: "notes",
    kind: "textarea",
    label: "Anything else we should know?",
    sublabel: "Anything that would help us handle calls exactly the way you would.",
    optional: true,
    placeholder: "Optional",
  },
];

type Phase = "questions" | "insights" | "options" | "doneLive" | "doneEmail";
type Answers = Record<string, string | string[]>;

// Typeform-style vertical slide
const slideVariants = {
  enter: (dir: number) => ({ y: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (dir: number) => ({ y: dir > 0 ? -48 : 48, opacity: 0 }),
};

const inputClass =
  "w-full px-4 py-3 rounded-lg text-white text-base outline-none border transition-colors duration-200 focus:border-accent";
const inputStyle = { background: "#000000", borderColor: "#1f1f1f" } as const;

// ---------------------------------------------------------------------------
// Option row: full-width lettered rows instead of pill chips
// ---------------------------------------------------------------------------
function OptionRow({
  letter,
  label,
  selected,
  onClick,
}: {
  letter: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between px-5 py-4 rounded-xl border text-left transition-all duration-200 group"
      style={
        selected
          ? { borderColor: "#7c5cfc", background: "rgba(124,92,252,0.1)" }
          : { borderColor: "#1f1f1f", background: "#0d0d0d" }
      }
    >
      <span className="flex items-center gap-4">
        <span
          className="w-6 h-6 rounded flex items-center justify-center text-[11px] font-mono border shrink-0 transition-colors duration-200"
          style={
            selected
              ? { borderColor: "rgba(124,92,252,0.6)", color: "#b79cff" }
              : { borderColor: "#2a2a2a", color: "#555555" }
          }
        >
          {letter}
        </span>
        <span className="text-base transition-colors duration-200" style={{ color: selected ? "#ffffff" : "#aaaaaa" }}>
          {label}
        </span>
      </span>
      {selected && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M3.5 8.5l3 3 6-7" stroke="#9b7ffd" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Insight card generation, rule-based from the answers
// ---------------------------------------------------------------------------
interface InsightCard {
  title: string;
  body: string;
}

function joinHuman(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? "";
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}

function buildInsights(answers: Answers): InsightCard[] {
  const cards: InsightCard[] = [];
  const missedToday = answers.missedToday as string;
  const needs = (answers.callerNeeds as string[]) ?? [];
  const urgent = (answers.urgent as string[]) ?? [];
  const answerWhen = (answers.answerWhen as string[]) ?? [];

  if (missedToday === "Goes to voicemail" || missedToday === "Just rings out") {
    cards.push({
      title: missedToday === "Goes to voicemail" ? "Voicemail is where callers give up" : "Unanswered rings are silent losses",
      body: "Research shows about 85% of first-time callers who don't get an answer never call back (Forbes / BIA Kelsey). Your receptionist picks up in under two seconds, every time, so that leak closes completely.",
    });
  } else if (missedToday === "Answering service") {
    cards.push({
      title: "An answering service takes messages. That's it.",
      body: "Your receptionist actually handles the call: answers questions about your business, collects job details, spots emergencies, and books work, instead of adding a middleman between you and the customer.",
    });
  }

  if (needs.includes("Emergency repairs")) {
    cards.push({
      title: "Emergencies can't wait for a callback",
      body: "An emergency caller who reaches voicemail is already dialing the next name on Google. Your receptionist identifies urgency in the first seconds of the call and acts on it immediately.",
    });
  }

  if (urgent.length > 0) {
    const parts: string[] = [];
    if (urgent.includes("Call me immediately")) parts.push("transfers the caller straight to your cell");
    if (urgent.includes("Text me an alert")) parts.push("fires you an instant text with the details");
    if (urgent.includes("Flag it in the summary")) parts.push("marks it clearly at the top of your call summary");
    cards.push({
      title: "Urgent calls reach you your way",
      body: `When your receptionist detects a real emergency, it ${joinHuman(parts)}. Nothing urgent sits in voicemail waiting for you to check it.`,
    });
  }

  if (answers.booking === "Yes") {
    cards.push({
      title: "Callers get booked, not deferred",
      body: "78% of customers hire the first business that responds. Your receptionist doesn't just take a message, it puts the job on your calendar while the caller is still on the line.",
    });
  }

  if (answerWhen.includes("24/7") || answerWhen.includes("After hours only")) {
    cards.push({
      title: answerWhen.includes("24/7") ? "Round-the-clock coverage, zero payroll" : "After-hours calls stop going dark",
      body: "Nights and weekends are when emergencies happen and when competitors' phones also go unanswered. Being the one business that picks up at 9pm is a real edge.",
    });
  }

  return cards.slice(0, 4);
}

// ---------------------------------------------------------------------------

export function BuildFunnel() {
  const params = useSearchParams();

  // Prefill from the tool / report: /build?trade=hvac&missed=5&repeat=40
  const prefillTrade = useMemo(() => {
    const t = TRADES.find((t) => t.id === params.get("trade"));
    return t?.label ?? "";
  }, [params]);
  const prefillMissed = useMemo(() => {
    const m = parseInt(params.get("missed") ?? "", 10);
    return m >= 1 && m <= 500 ? String(m) : "";
  }, [params]);
  const prefillRepeat = useMemo(() => {
    const r = parseInt(params.get("repeat") ?? "", 10);
    return r >= 0 && r <= 100 ? r : null;
  }, [params]);

  // If they already told the tool their missed-call numbers, don't ask twice.
  const activeQuestions = useMemo(
    () => (prefillMissed ? QUESTIONS.filter((q) => q.kind !== "missed") : QUESTIONS),
    [prefillMissed]
  );
  const TOTAL = activeQuestions.length;

  const [phase, setPhase] = useState<Phase>("questions");
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [answers, setAnswers] = useState<Answers>({
    ...(prefillTrade ? { trade: prefillTrade } : {}),
    ...(prefillMissed ? { missedPerWeek: prefillMissed } : {}),
  });
  const [repeatShare, setRepeatShare] = useState(prefillRepeat ?? 40);
  const [otherText, setOtherText] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const q = activeQuestions[step];

  function goNext() {
    setError(null);
    setOtherText("");
    setDir(1);
    if (step + 1 >= TOTAL) {
      setPhase("insights");
      submitLead("insights-reached");
    } else {
      setStep((s) => s + 1);
    }
  }

  function goBack() {
    setError(null);
    setOtherText("");
    setDir(-1);
    if (step > 0) setStep((s) => s - 1);
  }

  function setAnswer(id: string, value: string | string[]) {
    setAnswers((a) => ({ ...a, [id]: value }));
  }

  function hasOther(v: string | string[] | undefined): boolean {
    if (Array.isArray(v)) return v.includes("Other");
    return v === "Other";
  }

  function currentValid(): boolean {
    if (!q) return false;
    const v = answers[q.id];
    if (hasOther(v) && otherText.trim().length === 0) return false;
    if (q.optional) return true;
    if (q.kind === "multi") return Array.isArray(v) && v.length > 0;
    if (q.kind === "missed") {
      const n = parseInt((v as string) ?? "", 10);
      return n >= 1 && n <= 500;
    }
    return typeof v === "string" && v.trim().length > 0;
  }

  function resolveOther() {
    if (!q) return;
    const v = answers[q.id];
    const t = otherText.trim();
    if (!t) return;
    if (Array.isArray(v) && v.includes("Other")) {
      setAnswer(q.id, v.map((x) => (x === "Other" ? `Other: ${t}` : x)));
    } else if (v === "Other") {
      setAnswer(q.id, `Other: ${t}`);
    }
  }

  function advance() {
    if (!q) return;
    if (!currentValid()) {
      setError(
        q.kind === "missed"
          ? "Give us your best guess, 1 or more."
          : hasOther(answers[q.id])
            ? "Tell us what Other means for you."
            : "This one helps us build it right."
      );
      return;
    }
    resolveOther();
    goNext();
  }

  // Lead capture: fire-and-forget, never blocks the funnel.
  // "insights-reached" fires once when they finish the questions (no contact
  // info yet); the choice stage carries their email if they pick email-demo.
  function submitLead(event: string, extra: Record<string, unknown> = {}) {
    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        answers,
        repeatShare,
        ...extra,
      }),
    }).catch(() => {});
  }

  function chooseLive() {
    submitLead("choice", { choice: "live-demo" });
    window.open(BOOKING_URL, "_blank", "noopener,noreferrer");
    setPhase("doneLive");
  }

  function chooseEmail() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email so we know where to send it.");
      return;
    }
    setError(null);
    submitLead("choice", { choice: "email-demo", email: email.trim() });
    setPhase("doneEmail");
  }

  // Estimate for the insights cost card
  const trade = TRADES.find((t) => t.label === answers.trade);
  const missedNum = Math.max(1, Math.min(500, parseInt((answers.missedPerWeek as string) ?? "0", 10) || 1));
  const est = estimateRange(missedNum, repeatShare, trade?.jobValue ?? 0);
  const insights = useMemo(() => buildInsights(answers), [answers]);

  const letters = "ABCDEFGH";

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait" custom={dir}>
        {/* ------------------------------------------------ QUESTIONS ---- */}
        {phase === "questions" && q && (
          <motion.div key={`q-${step}`} custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ type: "spring", stiffness: 320, damping: 32 }}>
            {/* Progress */}
            <div className="flex items-center justify-between mb-10">
              <button
                type="button"
                onClick={goBack}
                disabled={step === 0}
                className="text-xs tracking-widest uppercase text-white/30 hover:text-white/60 transition-colors duration-200 disabled:opacity-0 disabled:pointer-events-none"
              >
                ← Back
              </button>
              <span className="text-xs font-mono" style={{ color: "#555555" }}>
                {step + 1} / {TOTAL}
              </span>
            </div>
            <div className="h-px w-full mb-12" style={{ background: "#1a1a1a" }}>
              <div
                className="h-px transition-all duration-500"
                style={{ background: "#7c5cfc", width: `${((step + 1) / TOTAL) * 100}%` }}
              />
            </div>

            <h2 className="text-2xl md:text-3xl font-light text-white tracking-tight leading-snug" style={{ letterSpacing: "-0.02em" }}>
              {q.label}
            </h2>
            {q.sublabel && (
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "#777777" }}>
                {q.sublabel}
              </p>
            )}

            <div className="mt-8">
              {/* Single-choice option rows, auto-advance */}
              {q.kind === "single" && (
                <div className="flex flex-col gap-2.5">
                  {[...(q.options ?? []), ...(q.otherOption ? ["Other"] : [])].map((opt, i) => {
                    const v = answers[q.id];
                    const selected =
                      v === opt || (typeof v === "string" && v.startsWith("Other:") && opt === "Other");
                    return (
                      <OptionRow
                        key={opt}
                        letter={letters[i]}
                        label={opt}
                        selected={selected}
                        onClick={() => {
                          setAnswer(q.id, opt);
                          setError(null);
                          if (opt !== "Other") setTimeout(goNext, 280);
                        }}
                      />
                    );
                  })}
                </div>
              )}

              {/* Multi-select option rows */}
              {q.kind === "multi" && (
                <div className="flex flex-col gap-2.5">
                  {[...(q.options ?? []), ...(q.otherOption ? ["Other"] : [])].map((opt, i) => {
                    const cur = Array.isArray(answers[q.id]) ? (answers[q.id] as string[]) : [];
                    const selected = cur.includes(opt) || (opt === "Other" && cur.some((x) => x.startsWith("Other:")));
                    return (
                      <OptionRow
                        key={opt}
                        letter={letters[i]}
                        label={opt}
                        selected={selected}
                        onClick={() => {
                          const cleaned = cur.filter((x) => !(opt === "Other" && x.startsWith("Other:")));
                          setAnswer(
                            q.id,
                            selected ? cleaned.filter((x) => x !== opt) : [...cleaned, opt]
                          );
                          setError(null);
                        }}
                      />
                    );
                  })}
                </div>
              )}

              {/* Free text revealed by "Other" */}
              {(q.kind === "single" || q.kind === "multi") && hasOther(answers[q.id]) && (
                <input
                  autoFocus
                  type="text"
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && advance()}
                  placeholder={q.id === "trade" ? "Tell us your trade" : "Tell us more"}
                  className={`${inputClass} mt-4`}
                  style={inputStyle}
                />
              )}

              {/* Short answer */}
              {q.kind === "text" && (
                <input
                  autoFocus
                  type="text"
                  value={(answers[q.id] as string) ?? ""}
                  onChange={(e) => {
                    setAnswer(q.id, e.target.value);
                    setError(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && advance()}
                  placeholder={q.placeholder}
                  className={inputClass}
                  style={inputStyle}
                />
              )}

              {/* Missed calls + repeat-share slider, same controls as the tool */}
              {q.kind === "missed" && (
                <div className="flex flex-col gap-7">
                  <input
                    autoFocus
                    type="number"
                    min={1}
                    max={500}
                    value={(answers[q.id] as string) ?? ""}
                    onChange={(e) => {
                      setAnswer(q.id, e.target.value);
                      setError(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && advance()}
                    placeholder={q.placeholder}
                    className={inputClass}
                    style={inputStyle}
                  />
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs tracking-widest uppercase" style={{ color: "#555555" }}>
                        Share that are repeat customers
                      </span>
                      <span className="text-sm text-white font-medium">{repeatShare}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={repeatShare}
                      onChange={(e) => setRepeatShare(parseInt(e.target.value, 10))}
                      className="w-full accent-[#7c5cfc]"
                    />
                    <p className="mt-2.5 text-xs leading-relaxed" style={{ color: "#555555" }}>
                      People who already know you are more likely to wait or call back. New callers usually just try the next name on Google.
                    </p>
                  </div>
                </div>
              )}

              {/* Long answer */}
              {q.kind === "textarea" && (
                <textarea
                  autoFocus
                  rows={4}
                  value={(answers[q.id] as string) ?? ""}
                  onChange={(e) => {
                    setAnswer(q.id, e.target.value);
                    setError(null);
                  }}
                  placeholder={q.placeholder}
                  className={`${inputClass} resize-none`}
                  style={inputStyle}
                />
              )}
            </div>

            {error && (
              <p className="mt-4 text-sm" style={{ color: "#f87171" }}>
                {error}
              </p>
            )}

            {/* Continue / Skip (single-choice rows auto-advance unless Other is open) */}
            {(q.kind !== "single" || hasOther(answers[q.id])) && (
              <div className="mt-8 flex items-center gap-5">
                <button
                  type="button"
                  onClick={advance}
                  className="inline-flex items-center justify-center px-7 py-3 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-full transition-all duration-200"
                >
                  Continue
                </button>
                {q.optional && (
                  <button
                    type="button"
                    onClick={goNext}
                    className="text-xs tracking-widest uppercase text-white/30 hover:text-white/60 transition-colors duration-200"
                  >
                    Skip
                  </button>
                )}
                <span className="hidden sm:inline text-xs" style={{ color: "#444444" }}>
                  press Enter ↵
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* ------------------------------------------------- INSIGHTS ---- */}
        {phase === "insights" && (
          <motion.div key="insights" initial={{ y: 48, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 320, damping: 32 }}>
            <p className="text-xs tracking-widest uppercase mb-5" style={{ color: "#7c5cfc" }}>
              Your Phone Line, Diagnosed
            </p>
            <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight leading-tight" style={{ letterSpacing: "-0.02em" }}>
              Here&#39;s what your receptionist fixes.
            </h2>

            <CursorCardsContainer className="mt-10 flex flex-col gap-4">
              {insights.map((card, i) => (
                <CursorCard
                  key={card.title}
                  reveal
                  revealDelay={0.15 + i * 0.12}
                  className="rounded-2xl p-6 md:p-7"
                >
                  <h3 className="text-base font-semibold text-white mb-2">{card.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#888888" }}>
                    {card.body}
                  </p>
                </CursorCard>
              ))}

              {/* Cost card */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 + insights.length * 0.12 }}
                className="rounded-2xl border p-6 md:p-7"
                style={{ background: "#0d0d0d", borderColor: "rgba(124,92,252,0.25)" }}
              >
                <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "#555555" }}>
                  Estimated revenue at stake
                </p>
                {trade ? (
                  <div className="text-3xl md:text-4xl font-semibold text-white tracking-tight" style={{ letterSpacing: "-0.03em" }}>
                    ${Math.round(est.lowRevenue).toLocaleString()} &ndash; ${Math.round(est.highRevenue).toLocaleString()}
                    <span className="text-base font-normal" style={{ color: "#666666" }}> /month</span>
                  </div>
                ) : (
                  <div className="text-3xl md:text-4xl font-semibold text-white tracking-tight" style={{ letterSpacing: "-0.03em" }}>
                    ~{Math.round(est.lowLostCallers)} &ndash; {Math.round(est.highLostCallers)}
                    <span className="text-base font-normal" style={{ color: "#666666" }}> customers lost for good /month</span>
                  </div>
                )}
                <p className="mt-3 text-xs leading-relaxed" style={{ color: "#444444" }}>
                  Based on the {missedNum} missed calls a week you told us about. Research shows about 85% of first-time callers who can&#39;t reach you never call back (Forbes / BIA Kelsey). Your regular customers are more patient, so we assume only 10 to 35% of them give up. That&#39;s why you see a range instead of one exact number.
                </p>
              </motion.div>
            </CursorCardsContainer>

            <button
              type="button"
              onClick={() => setPhase("options")}
              className="mt-10 inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-full transition-all duration-200 shadow-[0_0_30px_rgba(124,92,252,0.35)] hover:shadow-[0_0_40px_rgba(124,92,252,0.5)]"
            >
              Get My Demo
            </button>
          </motion.div>
        )}

        {/* -------------------------------------------------- OPTIONS ---- */}
        {phase === "options" && (
          <motion.div key="options" initial={{ y: 48, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 320, damping: 32 }}>
            <p className="text-xs tracking-widest uppercase mb-5" style={{ color: "#7c5cfc" }}>
              One Last Choice
            </p>
            <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight leading-tight" style={{ letterSpacing: "-0.02em" }}>
              How do you want your demo?
            </h2>

            <CursorCardsContainer className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CursorCard className="rounded-2xl p-7">
                <div className="flex h-full flex-col">
                  <h3 className="text-base font-semibold text-white mb-2">Watch it live</h3>
                  <p className="text-sm leading-relaxed flex-1" style={{ color: "#888888" }}>
                    A short call where we walk you through your receptionist handling real scenarios, and you can ask anything.
                  </p>
                  <button
                    type="button"
                    onClick={chooseLive}
                    className="mt-6 inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-full transition-all duration-200"
                  >
                    Book a Live Demo
                  </button>
                </div>
              </CursorCard>

              <CursorCard className="rounded-2xl p-7">
                <div className="flex h-full flex-col">
                  <h3 className="text-base font-semibold text-white mb-2">Send it to me</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#888888" }}>
                    No calls, no meetings. We build your receptionist and email you a recording of it handling a real call.
                  </p>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && chooseEmail()}
                    placeholder="you@yourbusiness.com"
                    className={`${inputClass} mt-5`}
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={chooseEmail}
                    className="mt-4 inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white/80 border border-white/15 rounded-full hover:border-white/30 hover:text-white transition-all duration-200"
                  >
                    Email Me My Demo
                  </button>
                </div>
              </CursorCard>
            </CursorCardsContainer>

            {error && (
              <p className="mt-4 text-sm" style={{ color: "#f87171" }}>
                {error}
              </p>
            )}
          </motion.div>
        )}

        {/* ----------------------------------------------------- DONE ---- */}
        {(phase === "doneLive" || phase === "doneEmail") && (
          <motion.div key="done" initial={{ y: 48, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 320, damping: 32 }} className="text-center py-10">
            <div
              className="mx-auto w-14 h-14 rounded-full flex items-center justify-center border mb-8"
              style={{ borderColor: "rgba(124,92,252,0.35)", background: "rgba(124,92,252,0.1)" }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 11.5l4 4 8-8.5" stroke="#9b7ffd" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight leading-tight" style={{ letterSpacing: "-0.02em" }}>
              {phase === "doneLive" ? "See you there." : "It's on the way."}
            </h2>
            <p className="mt-5 text-base leading-relaxed max-w-md mx-auto" style={{ color: "#888888" }}>
              {phase === "doneLive"
                ? "Finish picking a time in the tab we just opened. We'll show up with your receptionist already drafted from what you told us."
                : "We're building your receptionist from what you told us. A recording of it handling a real call will land in your inbox soon."}
            </p>
            <a
              href="/"
              className="mt-10 inline-block text-xs tracking-widest uppercase text-white/30 hover:text-white/60 transition-colors duration-200"
            >
              ← Back to Callvia
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
