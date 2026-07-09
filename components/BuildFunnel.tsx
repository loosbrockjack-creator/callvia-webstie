"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { TRADES, estimateRange } from "@/lib/estimate";
import { BOOKING_URL } from "@/lib/site";

// ---------------------------------------------------------------------------
// Question config. Jack: revise wording, order, or options here, one place.
// Kinds: "chips" (single choice, auto-advances), "multi" (multi-select chips),
// "text" (short answer), "number", "textarea" (long answer).
// ---------------------------------------------------------------------------
interface Question {
  id: string;
  kind: "chips" | "multi" | "text" | "number" | "textarea";
  label: string;
  sublabel?: string;
  options?: string[];
  otherOption?: boolean; // adds an "Other" chip that reveals a text input
  optional?: boolean;
  placeholder?: string;
}

const QUESTIONS: Question[] = [
  {
    id: "trade",
    kind: "chips",
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
    kind: "chips",
    label: "When should your receptionist answer?",
    options: ["24/7", "After hours only", "Missed calls only"],
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
    kind: "number",
    label: "How many calls do you miss in a typical week?",
    sublabel: "Your best guess is fine.",
    placeholder: "e.g. 10",
  },
  {
    id: "missedToday",
    kind: "chips",
    label: "What happens to a missed call today?",
    options: ["Goes to voicemail", "Just rings out", "Answering service", "Someone usually picks up"],
  },
  {
    id: "urgent",
    kind: "chips",
    label: "When something is urgent, what should happen?",
    options: ["Call me immediately", "Text me an alert", "Flag it in the summary"],
  },
  {
    id: "booking",
    kind: "chips",
    label: "Want it to book appointments?",
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

const TOTAL_STEPS = QUESTIONS.length + 1; // + contact screen

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

function chipStyle(selected: boolean) {
  return selected
    ? { borderColor: "#7c5cfc", color: "#ffffff", background: "rgba(124,92,252,0.12)" }
    : { borderColor: "#1f1f1f", color: "#888888" };
}

// ---------------------------------------------------------------------------
// Insight card generation, rule-based from the answers
// ---------------------------------------------------------------------------
interface InsightCard {
  title: string;
  body: string;
}

function buildInsights(answers: Answers): InsightCard[] {
  const cards: InsightCard[] = [];
  const missedToday = answers.missedToday as string;
  const needs = (answers.callerNeeds as string[]) ?? [];
  const urgent = answers.urgent as string;
  const answerWhen = answers.answerWhen as string;

  if (missedToday === "Goes to voicemail" || missedToday === "Just rings out") {
    cards.push({
      title: missedToday === "Goes to voicemail" ? "Voicemail is where callers give up" : "Unanswered rings are silent losses",
      body: "Research puts it at 85% of new callers never trying again after no answer (Forbes / BIA Kelsey). Your receptionist picks up in under two seconds, every time, so that leak closes completely.",
    });
  } else if (missedToday === "Answering service") {
    cards.push({
      title: "An answering service takes messages. That's it.",
      body: "Your receptionist actually handles the call: answers questions about your business, collects job details, triages urgency, and books work, instead of adding a middleman between you and the customer.",
    });
  } else if (missedToday === "Someone usually picks up") {
    cards.push({
      title: "Coverage gaps are the silent leak",
      body: "Even businesses that usually answer miss the calls that come mid-job, after hours, or when everyone's stretched. Your receptionist covers exactly those gaps without changing how you answer today.",
    });
  }

  if (needs.includes("Emergency repairs")) {
    cards.push({
      title: "Emergencies can't wait for a callback",
      body: "An emergency caller who reaches voicemail is already dialing the next name on Google. Your receptionist identifies urgency in the first seconds of the call and acts on it immediately.",
    });
  }

  if (urgent === "Call me immediately") {
    cards.push({
      title: "Urgent calls ring your cell within seconds",
      body: "When your receptionist detects a real emergency, it transfers the caller straight to you. You stay the decision-maker; it just makes sure the call reaches you.",
    });
  } else if (urgent === "Text me an alert") {
    cards.push({
      title: "Urgent calls hit your phone as an instant text",
      body: "The moment an urgent call ends, you get a text with who called, what they need, and their callback number. No voicemail digging, no delay.",
    });
  } else if (urgent === "Flag it in the summary") {
    cards.push({
      title: "Urgency flagged, nothing slips through",
      body: "Every call summary lands with urgency clearly marked at the top, so a burst pipe never sits buried under routine quote requests.",
    });
  }

  if (answers.booking === "Yes") {
    cards.push({
      title: "Callers get booked, not deferred",
      body: "78% of customers hire the first business that responds. Your receptionist doesn't just take a message, it puts the job on your calendar while the caller is still on the line.",
    });
  }

  if (answerWhen === "After hours only" || answerWhen === "24/7") {
    cards.push({
      title: answerWhen === "24/7" ? "Round-the-clock coverage, zero payroll" : "After-hours calls stop going dark",
      body: "Nights and weekends are when emergencies happen and when competitors' phones also go unanswered. Being the one business that picks up at 9pm is a real edge.",
    });
  }

  return cards.slice(0, 4);
}

// ---------------------------------------------------------------------------

export function BuildFunnel() {
  const params = useSearchParams();

  // Prefill from the missed-calls tool: /build?trade=hvac&missed=5&repeat=40
  const prefillTrade = useMemo(() => {
    const t = TRADES.find((t) => t.id === params.get("trade"));
    return t?.label ?? "";
  }, [params]);
  const prefillMissed = useMemo(() => {
    const m = parseInt(params.get("missed") ?? "", 10);
    return m >= 1 && m <= 500 ? String(m) : "";
  }, [params]);
  const repeatSharePct = useMemo(() => {
    const r = parseInt(params.get("repeat") ?? "", 10);
    return r >= 0 && r <= 100 ? r : 40;
  }, [params]);

  const [phase, setPhase] = useState<Phase>("questions");
  const [step, setStep] = useState(0); // 0..QUESTIONS.length (last = contact)
  const [dir, setDir] = useState(1);
  const [answers, setAnswers] = useState<Answers>({
    ...(prefillTrade ? { trade: prefillTrade } : {}),
    ...(prefillMissed ? { missedPerWeek: prefillMissed } : {}),
  });
  const [otherText, setOtherText] = useState("");
  const [contact, setContact] = useState({ fullName: "", email: "", business: "", phone: "" });
  const [error, setError] = useState<string | null>(null);

  const isContactStep = step === QUESTIONS.length;
  const q = isContactStep ? null : QUESTIONS[step];

  function goNext() {
    setError(null);
    setOtherText("");
    setDir(1);
    setStep((s) => Math.min(s + 1, QUESTIONS.length));
  }

  function goBack() {
    setError(null);
    setOtherText("");
    setDir(-1);
    if (phase === "questions" && step > 0) setStep((s) => s - 1);
  }

  function setAnswer(id: string, value: string | string[]) {
    setAnswers((a) => ({ ...a, [id]: value }));
  }

  function currentValid(): boolean {
    if (!q) return false;
    if (q.optional) return true;
    const v = answers[q.id];
    if (q.kind === "multi") return Array.isArray(v) && v.length > 0;
    if (q.kind === "number") {
      const n = parseInt((v as string) ?? "", 10);
      return n >= 1 && n <= 500;
    }
    if (v === "Other") return otherText.trim().length > 0;
    return typeof v === "string" && v.trim().length > 0;
  }

  function advanceFromInput() {
    if (!q) return;
    if (!currentValid()) {
      setError(q.kind === "number" ? "Give us your best guess, 1 or more." : "This one helps us build it right.");
      return;
    }
    // Resolve "Other" free text into the stored answer
    if (answers[q.id] === "Other" && otherText.trim()) {
      setAnswer(q.id, `Other: ${otherText.trim()}`);
    }
    goNext();
  }

  function submitContact() {
    if (!contact.fullName.trim() || !contact.business.trim()) {
      setError("Name and business name are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);

    // Lead lands in Jack's inbox now, even if they bail at the insights step.
    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stage: "background",
        fullName: contact.fullName.trim(),
        email: contact.email.trim(),
        business: contact.business.trim(),
        phone: contact.phone.replace(/\D/g, ""),
        answers,
      }),
    }).catch(() => {});

    setPhase("insights");
  }

  function chooseOption(choice: "live-demo" | "email-demo") {
    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stage: "choice",
        email: contact.email.trim(),
        business: contact.business.trim(),
        choice,
      }),
    }).catch(() => {});

    if (choice === "live-demo") {
      window.open(BOOKING_URL, "_blank", "noopener,noreferrer");
      setPhase("doneLive");
    } else {
      setPhase("doneEmail");
    }
  }

  // Estimate for the insights cost card
  const trade = TRADES.find((t) => t.label === answers.trade);
  const missedNum = Math.max(1, Math.min(500, parseInt((answers.missedPerWeek as string) ?? "0", 10) || 1));
  const est = estimateRange(missedNum, repeatSharePct, trade?.jobValue ?? 0);
  const firstName = contact.fullName.trim().split(/\s+/)[0] || "";
  const insights = useMemo(() => buildInsights(answers), [answers]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait" custom={dir}>
        {/* ------------------------------------------------ QUESTIONS ---- */}
        {phase === "questions" && (
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
                {step + 1} / {TOTAL_STEPS}
              </span>
            </div>
            <div className="h-px w-full mb-12" style={{ background: "#1a1a1a" }}>
              <div
                className="h-px transition-all duration-500"
                style={{ background: "#7c5cfc", width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
              />
            </div>

            {q && (
              <div>
                <h2 className="text-2xl md:text-3xl font-light text-white tracking-tight leading-snug" style={{ letterSpacing: "-0.02em" }}>
                  {q.label}
                </h2>
                {q.sublabel && (
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: "#777777" }}>
                    {q.sublabel}
                  </p>
                )}

                <div className="mt-8">
                  {/* Single-choice chips, auto-advance */}
                  {q.kind === "chips" && (
                    <div className="flex flex-wrap gap-2.5">
                      {[...(q.options ?? []), ...(q.otherOption ? ["Other"] : [])].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setAnswer(q.id, opt);
                            setError(null);
                            if (opt !== "Other") setTimeout(goNext, 260);
                          }}
                          className="px-5 py-2.5 text-sm rounded-full border transition-all duration-200"
                          style={chipStyle(answers[q.id] === opt || (typeof answers[q.id] === "string" && (answers[q.id] as string).startsWith("Other:") && opt === "Other"))}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Multi-select chips */}
                  {q.kind === "multi" && (
                    <div className="flex flex-wrap gap-2.5">
                      {[...(q.options ?? []), ...(q.otherOption ? ["Other"] : [])].map((opt) => {
                        const selected = Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              const cur = Array.isArray(answers[q.id]) ? (answers[q.id] as string[]) : [];
                              setAnswer(q.id, selected ? cur.filter((x) => x !== opt) : [...cur, opt]);
                              setError(null);
                            }}
                            className="px-5 py-2.5 text-sm rounded-full border transition-all duration-200"
                            style={chipStyle(selected)}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Free text for "Other" on chips */}
                  {q.kind === "chips" && answers[q.id] === "Other" && (
                    <input
                      autoFocus
                      type="text"
                      value={otherText}
                      onChange={(e) => setOtherText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && advanceFromInput()}
                      placeholder="Tell us your trade"
                      className={`${inputClass} mt-5`}
                      style={inputStyle}
                    />
                  )}

                  {/* Text / number inputs */}
                  {(q.kind === "text" || q.kind === "number") && (
                    <input
                      autoFocus
                      type={q.kind === "number" ? "number" : "text"}
                      min={q.kind === "number" ? 1 : undefined}
                      max={q.kind === "number" ? 500 : undefined}
                      value={(answers[q.id] as string) ?? ""}
                      onChange={(e) => {
                        setAnswer(q.id, e.target.value);
                        setError(null);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && advanceFromInput()}
                      placeholder={q.placeholder}
                      className={inputClass}
                      style={inputStyle}
                    />
                  )}

                  {/* Textarea */}
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

                {/* Continue / Skip (chips auto-advance unless Other is open) */}
                {(q.kind !== "chips" || answers[q.id] === "Other") && (
                  <div className="mt-8 flex items-center gap-5">
                    <button
                      type="button"
                      onClick={advanceFromInput}
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
              </div>
            )}

            {/* Contact screen, the final step */}
            {isContactStep && (
              <div>
                <h2 className="text-2xl md:text-3xl font-light text-white tracking-tight leading-snug" style={{ letterSpacing: "-0.02em" }}>
                  Last step. Where do we send it?
                </h2>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "#777777" }}>
                  We build your receptionist from everything you just told us.
                </p>

                <div className="mt-8 flex flex-col gap-5">
                  {(
                    [
                      { key: "fullName", label: "Full name *", type: "text", auto: "name" },
                      { key: "email", label: "Email *", type: "email", auto: "email" },
                      { key: "business", label: "Business name *", type: "text", auto: "organization" },
                      { key: "phone", label: "Phone (optional)", type: "tel", auto: "tel" },
                    ] as const
                  ).map((f) => (
                    <div key={f.key}>
                      <label htmlFor={`bf-${f.key}`} className="block text-xs tracking-widest uppercase mb-2.5" style={{ color: "#555555" }}>
                        {f.label}
                      </label>
                      <input
                        id={`bf-${f.key}`}
                        type={f.type}
                        autoComplete={f.auto}
                        value={contact[f.key]}
                        onChange={(e) => {
                          setContact((c) => ({ ...c, [f.key]: e.target.value }));
                          setError(null);
                        }}
                        onKeyDown={(e) => e.key === "Enter" && submitContact()}
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                  ))}
                </div>

                {error && (
                  <p className="mt-4 text-sm" style={{ color: "#f87171" }}>
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={submitContact}
                  className="mt-8 inline-flex items-center justify-center px-8 py-3.5 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-full transition-all duration-200 shadow-[0_0_30px_rgba(124,92,252,0.35)] hover:shadow-[0_0_40px_rgba(124,92,252,0.5)]"
                >
                  See My Insights
                </button>
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
              {firstName ? `Alright ${firstName}, here's` : "Here's"} what your receptionist fixes.
            </h2>

            <div className="mt-10 flex flex-col gap-4">
              {insights.map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.12 }}
                  className="rounded-2xl border p-6 md:p-7"
                  style={{ background: "#0d0d0d", borderColor: "#1f1f1f" }}
                >
                  <h3 className="text-base font-semibold text-white mb-2">{card.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#888888" }}>
                    {card.body}
                  </p>
                </motion.div>
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
                    <span className="text-base font-normal" style={{ color: "#666666" }}> callers lost for good /month</span>
                  </div>
                )}
                <p className="mt-3 text-xs leading-relaxed" style={{ color: "#444444" }}>
                  Based on the {missedNum} missed calls a week you told us about. New-caller churn (85%) is sourced from Forbes / BIA Kelsey; repeat-customer churn (10&ndash;35%) is a conservative assumption, which is why this is a range and not a fake-precise number.
                </p>
              </motion.div>
            </div>

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

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border p-7 flex flex-col" style={{ background: "#0d0d0d", borderColor: "#1f1f1f" }}>
                <h3 className="text-base font-semibold text-white mb-2">Watch it live</h3>
                <p className="text-sm leading-relaxed flex-1" style={{ color: "#888888" }}>
                  A short call where we walk you through your receptionist handling real scenarios, and you can ask anything.
                </p>
                <button
                  type="button"
                  onClick={() => chooseOption("live-demo")}
                  className="mt-6 inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-accent hover:bg-accent-hover rounded-full transition-all duration-200"
                >
                  Book a Live Demo
                </button>
              </div>

              <div className="rounded-2xl border p-7 flex flex-col" style={{ background: "#0d0d0d", borderColor: "#1f1f1f" }}>
                <h3 className="text-base font-semibold text-white mb-2">Send it to me</h3>
                <p className="text-sm leading-relaxed flex-1" style={{ color: "#888888" }}>
                  No calls, no meetings. We build your receptionist and email you a recording of it handling a real call.
                </p>
                <button
                  type="button"
                  onClick={() => chooseOption("email-demo")}
                  className="mt-6 inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white/80 border border-white/15 rounded-full hover:border-white/30 hover:text-white transition-all duration-200"
                >
                  Email Me My Demo
                </button>
              </div>
            </div>
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
