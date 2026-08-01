"use client";

// Shared between the public marketing funnel (/build) and the client onboarding
// form (/onboarding/<token>).
//
// Only the presentation pieces live here. Each funnel keeps its own QUESTIONS
// array and its own ending, because those are the parts that differ: /build
// finishes with insights and a demo offer, onboarding just submits.

export interface Field {
  id: string;
  label: string;
  placeholder?: string;
  optional?: boolean;
  type?: "text" | "tel";
}

export interface Question {
  id: string;
  kind: "single" | "multi" | "text" | "fields" | "missed" | "textarea";
  label: string;
  sublabel?: string;
  options?: string[];
  otherOption?: boolean; // adds an "Other" row that reveals a text input
  optional?: boolean;
  placeholder?: string;
  fields?: Field[]; // "fields" only. Each field stores its own answer id.
}

export type Answers = Record<string, string | string[]>;

// Typeform-style vertical slide.
export const slideVariants = {
  enter: (dir: number) => ({ y: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (dir: number) => ({ y: dir > 0 ? -48 : 48, opacity: 0 }),
};

// text-base is 16px. Below that, iOS Safari zooms the viewport the moment the
// field takes focus, which on a 14-question flow means fighting the zoom on
// every text step.
export const inputClass =
  "w-full px-4 py-3 rounded-lg text-white text-base outline-none border transition-colors duration-200 focus:border-accent";

export const inputStyle = { background: "#000000", borderColor: "#1f1f1f" } as const;

export const LETTERS = "ABCDEFGH";

export function hasOther(v: string | string[] | undefined): boolean {
  if (Array.isArray(v)) return v.includes("Other");
  return v === "Other";
}

// Full-width lettered rows rather than pill chips. The whole row is the hit
// target, which is what makes this usable one-handed on a phone.
export function OptionRow({
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
        <span
          className="text-base transition-colors duration-200"
          style={{ color: selected ? "#ffffff" : "#aaaaaa" }}
        >
          {label}
        </span>
      </span>
      {selected && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M3.5 8.5l3 3 6-7"
            stroke="#9b7ffd"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
