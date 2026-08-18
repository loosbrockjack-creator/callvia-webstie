"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { usePrefersReducedMotion } from "./use-reduced-motion";

/**
 * The one moving mark on the marketing pages: a bundle of thin lines that
 * arches across the hero, then serpentines down the length of the document,
 * drawing itself forward as you scroll and un-drawing as you scroll back.
 *
 * Nothing here animates on a timer. At rest the hero arch is already drawn and
 * the page is still; every frame after that is a direct function of scroll
 * position, so scrolling up genuinely reverses the stroke.
 *
 * Geometry is expressed in viewport-relative units: the svg is stretched to the
 * document by CSS and the viewBox is sized to the measured document height, so
 * 100 units across is one viewport width and 100 units down is one viewport
 * height regardless of how long the page gets. That is what lets the hero arch
 * be placed against the headline instead of drifting whenever a section grows.
 */

/** viewBox units in one viewport. */
const SCREEN = 100;

// The hero arch. Enters off the left edge, lifts clear over the headline, then
// falls back across it and dives off the right edge into the first sweep.
// Tuned against the real hero block, which sits at roughly y 31 to 69: the
// bundle crests above the h1 rather than cutting through the middle of it.
const HERO_TOP = 30;
const HERO_BOTTOM = 56;
const HERO_ARCH = 17;

// How far below the fold the leading tip aims for, in screens. Leading rather
// than tracking exactly, so the stroke arrives into view slightly ahead of the
// content it belongs to instead of chasing it.
const LEAD = 1.35;

// Sampling resolution along the path, in half-cycles. 50 samples per sweep is
// well past the point where the quadratic smoothing shows facets.
const STEP = 0.02;

// Turnarounds sit this far outside the viewport on desktop, so the bundle
// leaves frame at the edges rather than visibly bouncing off them.
const DESKTOP_AMP = 62;
const MOBILE_AMP = 56;

// Screens of scrolling per sweep. Longer on mobile: the document is three or
// four times taller there, and matching the desktop rate would pack the page
// with switchbacks.
const DESKTOP_SWEEP = 1.3;
const MOBILE_SWEEP = 1.8;

type Strand = {
  seed: number;
  yOff: number;
  ampScale: number;
  width: number;
  opacity: number;
};

// A bundle, not a set of independent squiggles: small y offsets and slightly
// different amplitudes so the lines run near-parallel and fan a little at the
// turns, the way a ribbon does.
const DESKTOP_STRANDS: Strand[] = [
  { seed: 0.0, yOff: -6.5, ampScale: 1.06, width: 1.0, opacity: 0.4 },
  { seed: 1.1, yOff: -2.5, ampScale: 1.0, width: 1.4, opacity: 0.62 },
  { seed: 2.3, yOff: 1.5, ampScale: 0.97, width: 1.1, opacity: 0.5 },
  { seed: 3.6, yOff: 5.5, ampScale: 0.93, width: 0.9, opacity: 0.36 },
  { seed: 4.8, yOff: 10.0, ampScale: 0.88, width: 0.8, opacity: 0.26 },
];

const MOBILE_STRANDS: Strand[] = [
  { seed: 0.0, yOff: -4.0, ampScale: 1.0, width: 1.0, opacity: 0.42 },
  { seed: 2.3, yOff: 1.0, ampScale: 0.94, width: 0.8, opacity: 0.3 },
  { seed: 4.8, yOff: 6.5, ampScale: 0.88, width: 0.7, opacity: 0.2 },
];

type Geometry = {
  halfCycles: number;
  restSpan: number;
  amp: number;
};

/**
 * Vertical position along the serpentine. `p` counts half-cycles: 0 to 1 is the
 * hero arch, every unit after that is one sweep across the page.
 *
 * Within a sweep the descent is fast at the two ends and slow through the
 * middle, which is the whole look: the line runs flat across the page, then
 * dives where it turns.
 */
function baseY(p: number, { halfCycles, restSpan }: Geometry): number {
  const k = Math.min(halfCycles - 1, Math.floor(p));
  const u = Math.min(1, p - k);
  const eased = u + (0.75 / (2 * Math.PI)) * Math.sin(2 * Math.PI * u);

  const from = k === 0 ? HERO_TOP : HERO_BOTTOM + (k - 1) * restSpan;
  const to = k === 0 ? HERO_BOTTOM : HERO_BOTTOM + k * restSpan;

  let y = from + (to - from) * eased;
  if (k === 0) y -= HERO_ARCH * Math.sin(Math.PI * u);
  return y;
}

/**
 * Horizontal position. Smoothstep rather than linear, so the line eases into
 * each turn instead of arriving at the edge still travelling sideways. Paired
 * with baseY's fast ends, that reads as a hook over the edge.
 */
function baseX(p: number, ampScale: number, { halfCycles, amp }: Geometry): number {
  const k = Math.min(halfCycles - 1, Math.floor(p));
  const u = Math.min(1, p - k);
  const s = u * u * (3 - 2 * u);
  const a = amp * ampScale;
  const left = 50 - a;
  const right = 50 + a;
  return k % 2 === 0 ? left + (right - left) * s : right + (left - right) * s;
}

type Built = {
  paths: string[];
  /** Scroll progress at each sweep boundary, ascending. */
  qs: number[];
  /** Arc fraction of the path at the same boundaries. */
  arcs: number[];
  height: number;
};

function build(strands: Strand[], screens: number, ampFor: number, sweepScreens: number): Built {
  const height = screens * SCREEN;

  // One arch plus at least two sweeps, then a sweep per `sweepScreens` of page.
  const sweeps = Math.max(2, Math.round((screens - HERO_BOTTOM / SCREEN) / sweepScreens));
  const halfCycles = 1 + sweeps;

  // Overshoot the bottom a little so the last sweep is still travelling when it
  // leaves the frame, rather than parking on the footer.
  const endY = height + 0.16 * SCREEN;
  const geo: Geometry = {
    halfCycles,
    restSpan: (endY - HERO_BOTTOM) / sweeps,
    amp: ampFor,
  };

  const f = (n: number) => n.toFixed(2);

  const paths = strands.map((strand) => {
    const pts: Array<[number, number]> = [];

    for (let p = 0; p <= halfCycles; p += STEP) {
      const x = baseX(p, strand.ampScale, geo) + 3 * Math.cos(p * 3.1 + strand.seed);
      const y =
        baseY(p, geo) + strand.yOff + 4.5 * Math.cos(p * 2.3 + strand.seed * 1.7);
      pts.push([x, y]);
    }

    // Quadratics through the midpoints: smooth joins without fitting a spline.
    let d = `M ${f(pts[0][0])} ${f(pts[0][1])}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const [cx, cy] = pts[i];
      const [nx, ny] = pts[i + 1];
      d += ` Q ${f(cx)} ${f(cy)} ${f((cx + nx) / 2)} ${f((cy + ny) / 2)}`;
    }
    const last = pts[pts.length - 1];
    return `${d} L ${f(last[0])} ${f(last[1])}`;
  });

  // Arc fraction at each boundary, measured on a neutral strand. The hero arch
  // and the sweeps are not the same length, so assuming an even split would
  // make the tip drift ahead of the scroll by the bottom of the page.
  const lengths: number[] = [];
  let total = 0;
  let prev: [number, number] = [baseX(0, 1, geo), baseY(0, geo)];
  for (let k = 1; k <= halfCycles; k++) {
    for (let p = (k - 1) + STEP; p <= k + 1e-9; p += STEP) {
      const cur: [number, number] = [baseX(p, 1, geo), baseY(p, geo)];
      total += Math.hypot(cur[0] - prev[0], cur[1] - prev[1]);
      prev = cur;
    }
    lengths.push(total);
  }
  const arcs = lengths.map((l) => l / total);

  // Scroll progress at which the leading tip should reach each boundary.
  // scrollYProgress 1 puts the document bottom at the viewport bottom, so the
  // visible bottom edge sits at (q * (screens - 1) + 1) screens.
  const travel = Math.max(0.35, screens - 1);
  const qs: number[] = [];
  for (let k = 1; k <= halfCycles; k++) {
    const y = k === 1 ? HERO_BOTTOM : HERO_BOTTOM + (k - 1) * geo.restSpan;
    qs.push((y / SCREEN - LEAD) / travel);
  }

  return { paths, qs, arcs, height };
}

function sample(qs: number[], arcs: number[], q: number): number {
  if (q <= qs[0]) return arcs[0];
  for (let i = 1; i < qs.length; i++) {
    if (q <= qs[i]) {
      const span = qs[i] - qs[i - 1];
      const t = span > 0 ? (q - qs[i - 1]) / span : 1;
      return arcs[i - 1] + (arcs[i] - arcs[i - 1]) * t;
    }
  }
  return arcs[arcs.length - 1];
}

const GRADIENT_ID = "callvia-flow-gradient";

function Line({
  strand,
  d,
  index,
  arc,
  reduceMotion,
}: {
  strand: Strand;
  d: string;
  index: number;
  arc: MotionValue<number>;
  reduceMotion: boolean;
}) {
  // Each line runs a hair ahead of the one behind it, so the bundle arrives as
  // a ripple rather than snapping into place as one rigid shape.
  const pathLength = useTransform(arc, (v) => Math.min(1, v + index * 0.011));

  // An explicit 1 rather than an omitted prop: the media query resolves after
  // first render, by which point a strokeDasharray is already on the element,
  // and dropping the style would not clear it.
  const drawn = reduceMotion ? { pathLength: 1 } : { pathLength };
  const stroke = `url(#${GRADIENT_ID})`;

  return (
    <>
      {/* Wide faint twin for bloom. A stroke halo rather than a blur filter,
          because a filter region the height of the document is expensive. */}
      <motion.path
        d={d}
        stroke={stroke}
        strokeWidth={strand.width * 6}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        opacity={strand.opacity * 0.14}
        style={drawn}
      />
      <motion.path
        d={d}
        stroke={stroke}
        strokeWidth={strand.width}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        opacity={strand.opacity}
        style={drawn}
      />
    </>
  );
}

export function FlowLines() {
  const reduceMotion = usePrefersReducedMotion();
  const [screens, setScreens] = useState(7);
  const [mobile, setMobile] = useState(false);

  // Document height in viewports, quantised so a one-pixel reflow does not
  // rebuild every path. The svg is absolutely positioned and adds no height, so
  // observing the root cannot feed back into itself.
  useEffect(() => {
    const measure = () => {
      const vh = window.innerHeight || 1;
      const raw = document.documentElement.scrollHeight / vh;
      setScreens(Math.max(1.6, Math.round(raw * 4) / 4));
      setMobile(window.matchMedia("(max-width: 639px)").matches);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.documentElement);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const strands = mobile ? MOBILE_STRANDS : DESKTOP_STRANDS;
  const built = useMemo(
    () =>
      build(
        strands,
        screens,
        mobile ? MOBILE_AMP : DESKTOP_AMP,
        mobile ? MOBILE_SWEEP : DESKTOP_SWEEP,
      ),
    [strands, screens, mobile],
  );

  const { scrollYProgress } = useScroll();

  // The spring is the "flows with you" part: the stroke trails the scroll by a
  // few frames and settles, instead of being welded to the scrollbar.
  const smooth = useSpring(scrollYProgress, {
    stiffness: 78,
    damping: 24,
    mass: 0.35,
  });

  const toArc = useCallback(
    (q: number) => sample(built.qs, built.arcs, q),
    [built],
  );
  const arc = useTransform(smooth, toArc);

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${SCREEN} ${built.height}`}
      preserveAspectRatio="none"
      fill="none"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <linearGradient
          id={GRADIENT_ID}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="0"
          y2={built.height}
        >
          {/* Accent through the hero, where it is the only colour on screen,
              then cooling to a near-neutral grey for the rest of the page so a
              full-length purple ribbon never takes the page over. */}
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0" />
          <stop offset="4%" stopColor="var(--color-accent)" stopOpacity="0.95" />
          <stop offset="14%" stopColor="var(--color-accent)" stopOpacity="0.8" />
          <stop offset="38%" stopColor="#8f86c4" stopOpacity="0.5" />
          <stop offset="72%" stopColor="#9aa0b0" stopOpacity="0.38" />
          <stop offset="96%" stopColor="#9aa0b0" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#9aa0b0" stopOpacity="0" />
        </linearGradient>
      </defs>

      {built.paths.map((d, i) => (
        <Line
          key={strands[i].seed}
          strand={strands[i]}
          d={d}
          index={i}
          arc={arc}
          reduceMotion={reduceMotion}
        />
      ))}
    </svg>
  );
}
