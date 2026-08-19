"use client";

// Shared vocabulary for the in-card graphics.
//
// Every graphic in this folder draws from exactly these strokes, fills and
// variants. That constraint is the point: eight separate little drawings that
// each picked their own greys would read as eight separate little drawings.
// Sharing the ramp is what makes them read as one system.
//
// Everything here is monochrome. The purple accent stays out of the cards at
// rest and appears only in the cursor-tracked glow on the card shell itself.

import type { Variants } from "framer-motion";

import { usePrefersReducedMotion } from "@/components/ui/use-reduced-motion";

/** Line weights, lightest to heaviest. `active` is the one thing per graphic
 *  that is meant to draw the eye; if two elements use it, neither does. */
export const STROKE = {
  faint: "rgba(255, 255, 255, 0.08)",
  hairline: "rgba(255, 255, 255, 0.12)",
  soft: "rgba(255, 255, 255, 0.20)",
  strong: "rgba(255, 255, 255, 0.38)",
  active: "rgba(255, 255, 255, 0.70)",
} as const;

export const FILL = {
  panel: "rgba(255, 255, 255, 0.03)",
  panelRaised: "rgba(255, 255, 255, 0.05)",
  /** The single bright element. Reads as confirmed, resolved, done. */
  active: "rgba(255, 255, 255, 0.88)",
  /** Text sitting on top of `active`. */
  onActive: "var(--color-surface)",
  /** A control knob or cut-out reading as recessed into the raised well.
   *  Tailwind v4 emits every @theme colour as a real custom property, so the
   *  token works directly as an SVG paint value and this does not become
   *  another hardcoded hex. */
  recess: "var(--color-surface)",
} as const;

/** Type ramp inside the graphics. Deliberately dimmer than the card's real
 *  copy: these are supporting illustration, and a label that competes with the
 *  heading above it is a label that has gone wrong. */
export const TEXT = {
  label: "rgba(255, 255, 255, 0.34)",
  value: "rgba(255, 255, 255, 0.55)",
  bright: "rgba(255, 255, 255, 0.82)",
} as const;

/** Matches --ease-card in globals.css. Decelerates late, so motion settles
 *  like something with mass rather than coasting to a stop. */
export const EASE_CARD: [number, number, number, number] = [0.32, 0.72, 0, 1];

export const VIEWPORT = { once: true, margin: "-60px" } as const;

export const containerVariants: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

/** Default entrance for anything that is just content appearing. */
export const riseVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_CARD } },
};

/** For strokes that should look drawn rather than faded in. */
export const drawVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  shown: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.7, ease: EASE_CARD },
  },
};

/** For nodes and checkmarks landing. Requires `.svg-fill-box` on the element
 *  so it grows in place instead of flying in from the SVG origin. */
export const popVariants: Variants = {
  hidden: { scale: 0.4, opacity: 0 },
  shown: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.45, ease: EASE_CARD },
  },
};

/** Slide a control into its resting position. `from` is a negative X offset. */
export function slideVariants(from: number): Variants {
  return {
    hidden: { x: from, opacity: 0 },
    shown: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.75, ease: EASE_CARD },
    },
  };
}

/**
 * Props for a graphic's root element.
 *
 * Reduced motion is handled by starting in the finished state rather than by
 * shortening the animation, so the card is simply complete on arrival. Reads
 * the project's own hook, not framer-motion's, which was observed returning
 * false on this page even with the media query matching.
 */
export function useGraphicMotion() {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return { initial: "shown", animate: "shown" } as const;
  }

  return {
    initial: "hidden",
    whileInView: "shown",
    viewport: VIEWPORT,
  } as const;
}
