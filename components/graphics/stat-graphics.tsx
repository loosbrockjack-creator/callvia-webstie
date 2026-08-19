"use client";

// The Research stat graphics.
//
// The point of both of these is that the shape carries the number. A grid of
// four large percentages all set at the same size tells you nothing at a
// glance: 85% and 27% look equally emphatic. An arc that is nearly closed next
// to one barely started does the comparison for the reader before they have
// finished the sentence underneath.

import { motion } from "framer-motion";

import {
  EASE_CARD,
  STROKE,
  TEXT,
  VIEWPORT,
} from "@/components/graphics/shared";
import { usePrefersReducedMotion } from "@/components/ui/use-reduced-motion";

const MONO = "var(--font-geist-mono), ui-monospace, monospace";

/**
 * A hairline arc filled to `percent`, with the figure itself centred inside.
 *
 * The number is HTML rather than an SVG <text>, so it renders with the real
 * font stack and scales with the type scale instead of with the viewBox.
 */
export function RingGauge({
  value,
  percent,
}: {
  value: string;
  /** 0 to 1. */
  percent: number;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();

  // The reduced branch must ANIMATE to the finished state, not just declare
  // it as `initial`. The hook reports false on the first render, so
  // framer-motion has already written pathLength 0 to the DOM by the time it
  // corrects, and an `initial` with nothing to drive it never clears that.
  // Getting this wrong renders an empty ring and no figure at all.
  const arcProps = prefersReducedMotion
    ? { animate: { pathLength: percent }, transition: { duration: 0 } }
    : {
        initial: { pathLength: 0 },
        whileInView: { pathLength: percent },
        viewport: VIEWPORT,
        transition: { duration: 1.1, ease: EASE_CARD, delay: 0.15 },
      };

  const valueProps = prefersReducedMotion
    ? { animate: { opacity: 1 }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0 },
        whileInView: { opacity: 1 },
        viewport: VIEWPORT,
        transition: { duration: 0.6, ease: EASE_CARD, delay: 0.25 },
      };

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative flex items-center justify-center">
        {/* Rotated so the arc starts at twelve o'clock rather than at three. */}
        <svg
          viewBox="0 0 120 120"
          fill="none"
          aria-hidden="true"
          className="size-[112px] -rotate-90 sm:size-[132px]"
        >
          <circle
            cx={60}
            cy={60}
            r={52}
            stroke={STROKE.faint}
            strokeWidth={1.25}
          />
          <motion.circle
            cx={60}
            cy={60}
            r={52}
            stroke={STROKE.active}
            strokeWidth={1.25}
            strokeLinecap="round"
            {...arcProps}
          />
        </svg>

        <motion.span
          className="absolute text-3xl font-semibold tracking-tight text-white sm:text-4xl"
          style={{ letterSpacing: "-0.03em" }}
          {...valueProps}
        >
          {value}
        </motion.span>
      </div>
    </div>
  );
}

/**
 * A range, not a share, so it gets a span across an axis instead of an arc.
 *
 * Forcing this one into a ring would have meant inventing a denominator it
 * does not have. It keeps the same hairline weights and the same single bright
 * element as the gauges, which is enough to make it sit beside them.
 */
export function SpanBar({
  value,
  from,
  to,
  axisMax,
  axisMinLabel,
  axisMaxLabel,
}: {
  value: string;
  /** Both in the same units as `axisMax`. */
  from: number;
  to: number;
  axisMax: number;
  axisMinLabel: string;
  axisMaxLabel: string;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const trackX = 10;
  const trackWidth = 220;
  const startX = trackX + (from / axisMax) * trackWidth;
  const endX = trackX + (to / axisMax) * trackWidth;

  const spanProps = prefersReducedMotion
    ? { animate: { scaleX: 1 }, transition: { duration: 0 } }
    : {
        initial: { scaleX: 0 },
        whileInView: { scaleX: 1 },
        viewport: VIEWPORT,
        transition: { duration: 0.9, ease: EASE_CARD, delay: 0.15 },
      };

  const valueProps = prefersReducedMotion
    ? { animate: { opacity: 1, y: 0 }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, y: 6 },
        whileInView: { opacity: 1, y: 0 },
        viewport: VIEWPORT,
        transition: { duration: 0.6, ease: EASE_CARD, delay: 0.2 },
      };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-5">
      <motion.span
        className="text-2xl font-semibold tracking-tight text-white sm:text-3xl"
        style={{ letterSpacing: "-0.03em" }}
        {...valueProps}
      >
        {value}
      </motion.span>

      <svg
        viewBox="0 0 240 34"
        fill="none"
        aria-hidden="true"
        className="h-auto w-full max-w-[240px]"
      >
        <path
          d={`M${trackX} 10 V22`}
          stroke={STROKE.hairline}
          strokeWidth={1}
        />
        <path
          d={`M${trackX + trackWidth} 10 V22`}
          stroke={STROKE.hairline}
          strokeWidth={1}
        />
        <rect
          x={trackX}
          y={14.5}
          width={trackWidth}
          height={3}
          rx={1.5}
          fill={STROKE.faint}
        />
        <motion.rect
          x={startX}
          y={13}
          width={endX - startX}
          height={6}
          rx={3}
          fill={STROKE.active}
          style={{
            transformBox: "fill-box",
            transformOrigin: "left center",
          }}
          {...spanProps}
        />
        <text
          x={trackX}
          y={33}
          fontSize={8}
          fontFamily={MONO}
          fill={TEXT.label}
        >
          {axisMinLabel}
        </text>
        <text
          x={trackX + trackWidth}
          y={33}
          textAnchor="end"
          fontSize={8}
          fontFamily={MONO}
          fill={TEXT.label}
        >
          {axisMaxLabel}
        </text>
      </svg>
    </div>
  );
}
