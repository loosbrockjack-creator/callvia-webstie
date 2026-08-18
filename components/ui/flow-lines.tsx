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
 * The hero field, continued down the page as one motion.
 *
 * These are the same lines the shader draws behind the headline, picked up as
 * real geometry: they fan across the first screen the way the field does, then
 * gather into a ribbon and switchback down the length of the document, drawing
 * forward as you scroll and un-drawing as you scroll back.
 *
 * The handoff is a crossfade, not a cut. Across the first screen and a half the
 * shader canvas fades out while these brighten (see the gradient stops), so the
 * field appears to resolve into the ribbon rather than being replaced by it.
 *
 * Geometry is in viewport-relative units against a measured document height:
 * 100 units across is one viewport width, 100 units down is one viewport
 * height, whatever the page grows to. That is what keeps the hero fan sitting
 * on the hero instead of drifting every time a section changes size.
 */

/** viewBox units in one viewport. */
const SCREEN = 100;

// The spine of the hero pass. Individual lines hang off this by their fan
// offset, which is what spreads them over the whole first screen.
const HERO_TOP = 42;
const HERO_BOTTOM = 58;
const HERO_ARCH = 8;

// How far below the fold the leading tip aims for, in screens. Leading rather
// than tracking exactly, so the ribbon arrives into view slightly ahead of the
// content it belongs to instead of chasing it.
const LEAD = 1.35;

// Sampling resolution along the path, in half-cycles.
const STEP = 0.03;

// Turnarounds sit outside the viewport, so the ribbon leaves frame at the edges
// rather than visibly bouncing off them.
const DESKTOP_AMP = 62;
const MOBILE_AMP = 56;

// Screens of scrolling per sweep. Longer on mobile: the document is three or
// four times taller there, and matching the desktop rate would pack the page
// with switchbacks.
const DESKTOP_SWEEP = 1.3;
const MOBILE_SWEEP = 1.8;

// Where the fan becomes a ribbon, in half-cycles. Starts partway through the
// hero pass and finishes during the first sweep, so the gathering happens on
// the way out of the first screen rather than at a seam.
const GATHER_FROM = 0.55;
const GATHER_TO = 1.9;

// Vertical excursion of a line's own wobble, fanned then gathered. The large
// value is what makes the lines cross each other over the hero the way the
// field does; the small one is what keeps the ribbon reading as a ribbon.
const WOBBLE_FAN = 15;
const WOBBLE_RIBBON = 4.5;

type Line = {
  seed: number;
  /** Offset from the spine over the hero, before gathering. */
  fan: number;
  /** Offset from the spine once gathered into the ribbon. */
  ribbon: number;
  width: number;
  opacity: number;
  halo: boolean;
};

/**
 * The same sum of cosines the shader uses for its strand offsets, so these
 * carry the field's rhythm rather than an unrelated wobble.
 */
const wave = (t: number) =>
  (Math.cos(t) + Math.cos(t * 1.3 + 1.3) + Math.cos(t * 1.4 + 1.4)) / 3;

/**
 * Deterministic rather than a literal table: at this count a hand-written list
 * is just noise, and the trig keeps widths and brightness varying line to line
 * instead of banding.
 */
function makeLines(count: number, fanSpan: number, ribbonSpan: number, scale: number): Line[] {
  return Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0.5 : i / (count - 1);
    return {
      seed: i * 1.37,
      fan: -fanSpan * 0.42 + fanSpan * t + 6 * Math.cos(i * 2.1),
      ribbon: -ribbonSpan * 0.42 + ribbonSpan * t,
      width: (0.5 + 1.25 * Math.abs(Math.cos(i * 1.7))) * scale,
      opacity: 0.3 + 0.55 * Math.abs(Math.sin(i * 1.23 + 0.4)),
      // Every other line gets the bloom pass. Doing all of them doubles the
      // path count for glow nobody can pick apart at these opacities.
      halo: i % 2 === 0,
    };
  });
}

const DESKTOP_LINES = makeLines(12, 74, 21, 1);
const MOBILE_LINES = makeLines(7, 66, 17, 0.85);

type Geometry = {
  halfCycles: number;
  restSpan: number;
  amp: number;
};

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Vertical position of the spine. `p` counts half-cycles: 0 to 1 is the pass
 * across the hero, every unit after that is one sweep across the page.
 *
 * Within a sweep the descent is fast at the two ends and slow through the
 * middle, which is the whole look: the ribbon runs flat across the page, then
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
function baseX(p: number, { halfCycles, amp }: Geometry): number {
  const k = Math.min(halfCycles - 1, Math.floor(p));
  const u = Math.min(1, p - k);
  const s = u * u * (3 - 2 * u);
  const left = 50 - amp;
  const right = 50 + amp;
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

function build(lines: Line[], screens: number, ampFor: number, sweepScreens: number): Built {
  const height = screens * SCREEN;

  // One hero pass plus at least two sweeps, then a sweep per `sweepScreens`.
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

  const paths = lines.map((line) => {
    const pts: Array<[number, number]> = [];

    for (let p = 0; p <= halfCycles; p += STEP) {
      const gathered = smoothstep(GATHER_FROM, GATHER_TO, p);
      const off = line.fan + (line.ribbon - line.fan) * gathered;
      const wob = WOBBLE_FAN + (WOBBLE_RIBBON - WOBBLE_FAN) * gathered;

      const x = baseX(p, geo) + 3.5 * wave(p * 4.2 + line.seed * 1.7);
      const y = baseY(p, geo) + off + wob * wave(p * 6.5 + line.seed);
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

  // Arc fraction at each boundary, measured on the spine. The hero pass and the
  // sweeps are not the same length, so assuming an even split would make the
  // drawn tip drift ahead of the scroll by the bottom of the page.
  const lengths: number[] = [];
  let total = 0;
  let prev: [number, number] = [baseX(0, geo), baseY(0, geo)];
  for (let k = 1; k <= halfCycles; k++) {
    for (let p = k - 1 + STEP; p <= k + 1e-9; p += STEP) {
      const cur: [number, number] = [baseX(p, geo), baseY(p, geo)];
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

function Stroke({
  line,
  d,
  index,
  arc,
  reduceMotion,
}: {
  line: Line;
  d: string;
  index: number;
  arc: MotionValue<number>;
  reduceMotion: boolean;
}) {
  // Each line runs a hair ahead of the one behind it, so the ribbon arrives as
  // a ripple rather than snapping into place as one rigid shape.
  const pathLength = useTransform(arc, (v) => Math.min(1, v + index * 0.006));

  // An explicit 1 rather than an omitted prop: the media query resolves after
  // first render, by which point a strokeDasharray is already on the element,
  // and dropping the style would not clear it.
  const drawn = reduceMotion ? { pathLength: 1 } : { pathLength };
  const stroke = `url(#${GRADIENT_ID})`;

  return (
    <>
      {line.halo && (
        // Wide faint twin for bloom. A stroke halo rather than a blur filter,
        // because a filter region the height of the document is expensive.
        <motion.path
          d={d}
          stroke={stroke}
          strokeWidth={line.width * 7}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          opacity={line.opacity * 0.16}
          style={drawn}
        />
      )}
      <motion.path
        d={d}
        stroke={stroke}
        strokeWidth={line.width}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        opacity={line.opacity}
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

  const lines = mobile ? MOBILE_LINES : DESKTOP_LINES;
  const built = useMemo(
    () =>
      build(
        lines,
        screens,
        mobile ? MOBILE_AMP : DESKTOP_AMP,
        mobile ? MOBILE_SWEEP : DESKTOP_SWEEP,
      ),
    [lines, screens, mobile],
  );

  const { scrollYProgress } = useScroll();

  // The spring is the "flows with you" part: the ribbon trails the scroll by a
  // few frames and settles, instead of being welded to the scrollbar.
  const smooth = useSpring(scrollYProgress, {
    stiffness: 78,
    damping: 24,
    mass: 0.35,
  });

  const toArc = useCallback((q: number) => sample(built.qs, built.arcs, q), [built]);
  const arc = useTransform(smooth, toArc);

  // Crossfade stops, in document fractions. Held down over the hero because the
  // shader canvas is still at full strength there and two fields at once reads
  // as clutter; full vibrancy from a screen and a half down, where the canvas
  // has gone and these are the only thing carrying the page.
  const fadeMid = Math.min(0.4, (0.9 * SCREEN) / built.height);
  const fadeFull = Math.min(0.6, (1.7 * SCREEN) / built.height);

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
          <stop offset="0" stopColor="var(--color-accent)" stopOpacity="0.22" />
          <stop offset={fadeMid} stopColor="var(--color-accent)" stopOpacity="0.45" />
          <stop offset={fadeFull} stopColor="var(--color-accent)" stopOpacity="1" />
          <stop offset="0.93" stopColor="var(--color-accent)" stopOpacity="0.85" />
          <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {built.paths.map((d, i) => (
        <Stroke
          key={lines[i].seed}
          line={lines[i]}
          d={d}
          index={i}
          arc={arc}
          reduceMotion={reduceMotion}
        />
      ))}
    </svg>
  );
}
