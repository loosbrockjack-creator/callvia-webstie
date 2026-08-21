"use client";

// The line field behind the login panel.
//
// Adapted from a 21st.dev "FloatingPaths" component. Two things changed.
//
// The original strokes slate grey and sits on a light panel; these carry the
// Callvia accent so the panel belongs to the same site as the streak on the
// marketing pages. And the original set each path's duration from
// Math.random() during render, which produces different values on the server
// and the client and trips hydration. The stagger here is a function of the
// path index instead: same spread, same irregular feel, deterministic.

import { motion } from "framer-motion";

import { usePrefersReducedMotion } from "@/components/ui/use-reduced-motion";

const ACCENT = "124, 92, 252";
const COUNT = 24;

/** A family of near-parallel curves sweeping across the panel. */
const PATHS = Array.from({ length: COUNT }, (_, i) => {
  const drop = i * 27;
  return {
    id: i,
    d: `M-140 ${-120 + drop} C 130 ${40 + drop}, 300 ${300 + drop}, 760 ${400 + drop}`,
    width: 0.7 + (i % 6) * 0.32,
    // Brightest through the middle of the stack, so it reads as a band rather
    // than a uniform hatch.
    alpha: 0.12 + 0.34 * Math.sin((i / (COUNT - 1)) * Math.PI),
    // Deterministic spread, standing in for the original's Math.random().
    duration: 20 + ((i * 7) % 13),
  };
});

const PASSES = [
  { key: "bloom", widthScale: 7, alphaScale: 0.16 },
  { key: "core", widthScale: 1, alphaScale: 1 },
] as const;

export function AuthPaths() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        className="h-full w-full"
        viewBox="0 0 600 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Two passes per path: a wide, very faint twin for bloom, then the
            core over it. The streak on the marketing pages gets its glow from
            additive canvas blending, which SVG has no equivalent for, and a
            single flat stroke next to it looks like a hairline diagram. */}
        {PASSES.map(({ key, widthScale, alphaScale }) =>
          PATHS.map((path) => {
            const stroke = `rgba(${ACCENT}, ${path.alpha * alphaScale})`;
            const width = path.width * widthScale;

            if (prefersReducedMotion) {
              return (
                <path
                  key={`${key}-${path.id}`}
                  d={path.d}
                  stroke={stroke}
                  strokeWidth={width}
                  strokeLinecap="round"
                />
              );
            }

            return (
              <motion.path
                key={`${key}-${path.id}`}
                d={path.d}
                stroke={stroke}
                strokeWidth={width}
                strokeLinecap="round"
                initial={{ pathLength: 0.35, opacity: 0.5 }}
                animate={{
                  pathLength: 1,
                  opacity: [0.35, 0.9, 0.35],
                  pathOffset: [0, 1, 0],
                }}
                transition={{
                  duration: path.duration,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              />
            );
          })
        )}
      </svg>
    </div>
  );
}
