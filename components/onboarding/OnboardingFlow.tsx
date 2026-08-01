"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ONBOARDING_QUESTIONS } from "@/lib/onboarding/questions";
import {
  LETTERS,
  OptionRow,
  hasOther,
  inputClass,
  inputStyle,
  slideVariants,
  type Answers,
} from "@/components/funnel/shared";

// The /build funnel's flow, minus the ending.
//
// There are no insights, no revenue estimate, no demo choice, and no booking
// prompt. This person has already bought: the only job left is to collect what
// is needed to build their receptionist and get out of the way.

interface Props {
  token: string;
  businessName: string | null;
  contactName: string | null;
}

export function OnboardingFlow({ token, businessName, contactName }: Props) {
  // Prefill what the admin already typed when sending, so the client is not
  // asked for their own business name.
  const [answers, setAnswers] = useState<Answers>(
    businessName ? { businessName } : {},
  );
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [otherText, setOtherText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const TOTAL = ONBOARDING_QUESTIONS.length;
  const q = ONBOARDING_QUESTIONS[step];

  // Same policy as the agreement page: the view is recorded on mount, as a real
  // user action rather than a render side effect.
  useEffect(() => {
    fetch(`/api/onboarding/${token}/view`, { method: "POST" }).catch(() => {});
  }, [token]);

  // The keyboard on a phone covers roughly half the viewport. Without this,
  // advancing to the next question leaves you looking at the middle of it.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const firstName = useMemo(() => contactName?.trim().split(" ")[0] ?? null, [contactName]);

  function setAnswer(id: string, value: string | string[]) {
    setAnswers((a) => ({ ...a, [id]: value }));
  }

  function fieldsError(): string | null {
    if (q?.kind !== "fields") return null;
    for (const f of q.fields ?? []) {
      const val = ((answers[f.id] as string) ?? "").trim();
      if (!f.optional && val.length === 0) return `Add your ${f.label.toLowerCase()} to keep going.`;
      if (f.type === "tel" && val.length > 0 && val.replace(/\D/g, "").length < 10) {
        return "Enter a full phone number, area code included.";
      }
    }
    return null;
  }

  function currentValid(): boolean {
    if (!q) return false;
    const v = answers[q.id];
    if (hasOther(v) && otherText.trim().length === 0) return false;
    if (q.kind === "fields") return fieldsError() === null;
    if (q.optional) return true;
    if (q.kind === "multi") return Array.isArray(v) && v.length > 0;
    return typeof v === "string" && v.trim().length > 0;
  }

  function resolveOther(): Answers {
    const v = answers[q.id];
    const t = otherText.trim();
    if (!t) return answers;
    if (Array.isArray(v) && v.includes("Other")) {
      const next = { ...answers, [q.id]: v.map((x) => (x === "Other" ? `Other: ${t}` : x)) };
      setAnswers(next);
      return next;
    }
    if (v === "Other") {
      const next = { ...answers, [q.id]: `Other: ${t}` };
      setAnswers(next);
      return next;
    }
    return answers;
  }

  function goBack() {
    setError(null);
    setOtherText("");
    setDir(-1);
    if (step > 0) setStep((s) => s - 1);
  }

  async function advance() {
    if (!q) return;
    if (!currentValid()) {
      setError(
        q.kind === "fields"
          ? (fieldsError() ?? "This one helps us build it right.")
          : hasOther(answers[q.id])
            ? "Tell us what Other means for you."
            : "This one helps us build it right.",
      );
      return;
    }

    // Resolve the "Other" text into the answer before reading it, because the
    // state update from resolveOther has not flushed by the time submit runs.
    const finalAnswers = resolveOther();
    setError(null);
    setOtherText("");
    setDir(1);

    if (step + 1 >= TOTAL) {
      await submit(finalAnswers);
    } else {
      setStep((s) => s + 1);
    }
  }

  async function submit(finalAnswers: Answers) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/onboarding/${token}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers }),
      });
      const data = await res.json().catch(() => ({}));
      // alreadySubmitted is a success from the client's point of view: their
      // answers are recorded, which is all they care about.
      if (!res.ok && !data.alreadySubmitted) {
        setError(data.error ?? "We could not save your answers. Please try again.");
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ y: 48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="py-10 text-center"
      >
        <div
          className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-full border"
          style={{ borderColor: "rgba(124,92,252,0.35)", background: "rgba(124,92,252,0.1)" }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
            <path
              d="M5 11.5l4 4 8-8.5"
              stroke="#9b7ffd"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2
          className="text-3xl font-light tracking-tight text-white md:text-4xl"
          style={{ letterSpacing: "-0.02em" }}
        >
          That&#39;s everything.
        </h2>
        <p
          className="mx-auto mt-5 max-w-md text-base leading-relaxed"
          style={{ color: "#888888" }}
        >
          We have what we need to start building your receptionist. We will be in touch shortly
          with the next step.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={`q-${step}`}
          custom={dir}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
        >
          <div className="mb-10 flex items-center justify-between">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 0}
              className="min-h-[44px] text-xs uppercase tracking-widest text-white/30 transition-colors duration-200 hover:text-white/60 disabled:pointer-events-none disabled:opacity-0"
            >
              &larr; Back
            </button>
            <span className="font-mono text-xs" style={{ color: "#555555" }}>
              {step + 1} / {TOTAL}
            </span>
          </div>
          <div className="mb-12 h-px w-full" style={{ background: "#1a1a1a" }}>
            <div
              className="h-px transition-all duration-500"
              style={{ background: "#7c5cfc", width: `${((step + 1) / TOTAL) * 100}%` }}
            />
          </div>

          {step === 0 && firstName && (
            <p className="mb-5 text-xs uppercase tracking-widest" style={{ color: "#7c5cfc" }}>
              Welcome, {firstName}
            </p>
          )}

          <h2
            className="text-2xl font-light leading-snug tracking-tight text-white md:text-3xl"
            style={{ letterSpacing: "-0.02em" }}
          >
            {q.label}
          </h2>
          {q.sublabel && (
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "#777777" }}>
              {q.sublabel}
            </p>
          )}

          <div className="mt-8">
            {q.kind === "single" && (
              <div className="flex flex-col gap-2.5">
                {[...(q.options ?? []), ...(q.otherOption ? ["Other"] : [])].map((opt, i) => {
                  const v = answers[q.id];
                  const selected =
                    v === opt || (typeof v === "string" && v.startsWith("Other:") && opt === "Other");
                  return (
                    <OptionRow
                      key={opt}
                      letter={LETTERS[i]}
                      label={opt}
                      selected={selected}
                      onClick={() => {
                        setAnswer(q.id, opt);
                        setError(null);
                        if (opt !== "Other") setTimeout(advance, 280);
                      }}
                    />
                  );
                })}
              </div>
            )}

            {q.kind === "multi" && (
              <div className="flex flex-col gap-2.5">
                {[...(q.options ?? []), ...(q.otherOption ? ["Other"] : [])].map((opt, i) => {
                  const cur = Array.isArray(answers[q.id]) ? (answers[q.id] as string[]) : [];
                  const selected =
                    cur.includes(opt) || (opt === "Other" && cur.some((x) => x.startsWith("Other:")));
                  return (
                    <OptionRow
                      key={opt}
                      letter={LETTERS[i]}
                      label={opt}
                      selected={selected}
                      onClick={() => {
                        const cleaned = cur.filter(
                          (x) => !(opt === "Other" && x.startsWith("Other:")),
                        );
                        setAnswer(q.id, selected ? cleaned.filter((x) => x !== opt) : [...cleaned, opt]);
                        setError(null);
                      }}
                    />
                  );
                })}
              </div>
            )}

            {(q.kind === "single" || q.kind === "multi") && hasOther(answers[q.id]) && (
              <input
                type="text"
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && advance()}
                placeholder={q.id === "trade" ? "Tell us your trade" : "Tell us more"}
                className={`${inputClass} mt-4`}
                style={inputStyle}
              />
            )}

            {q.kind === "text" && (
              <input
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

            {q.kind === "fields" && (
              <div className="flex flex-col gap-5">
                {(q.fields ?? []).map((f) => (
                  <div key={f.id}>
                    <label
                      htmlFor={`ob-${f.id}`}
                      className="mb-2 block text-xs uppercase tracking-widest"
                      style={{ color: "#555555" }}
                    >
                      {f.label}
                    </label>
                    <input
                      id={`ob-${f.id}`}
                      type={f.type === "tel" ? "tel" : "text"}
                      inputMode={f.type === "tel" ? "tel" : undefined}
                      autoComplete={f.type === "tel" ? "tel" : "organization"}
                      value={(answers[f.id] as string) ?? ""}
                      onChange={(e) => {
                        setAnswer(f.id, e.target.value);
                        setError(null);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && advance()}
                      placeholder={f.placeholder}
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>
            )}

            {q.kind === "textarea" && (
              <textarea
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

          {/* Single-choice rows advance themselves, unless an Other field is
              open and still needs typing into. */}
          {(q.kind !== "single" || hasOther(answers[q.id])) && (
            <div className="mt-8 flex items-center gap-5">
              <button
                type="button"
                onClick={advance}
                disabled={submitting}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-7 text-sm font-semibold text-white transition-all duration-200 hover:bg-accent-hover disabled:opacity-40"
              >
                {submitting ? "Sending…" : step + 1 >= TOTAL ? "Finish" : "Continue"}
              </button>
              {q.optional && (
                <button
                  type="button"
                  onClick={advance}
                  className="min-h-[44px] text-xs uppercase tracking-widest text-white/30 transition-colors duration-200 hover:text-white/60"
                >
                  Skip
                </button>
              )}
              <span className="hidden text-xs sm:inline" style={{ color: "#444444" }}>
                press Enter &crarr;
              </span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
