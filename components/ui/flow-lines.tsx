"use client";

import { useEffect, useRef } from "react";

/**
 * One connected streak of lines that comes in from the left below the hero,
 * waves back and forth across the page, and runs to the footer.
 *
 * It starts below the first screen. The hero is the shader field and nothing
 * else; the streak enters off the left edge once the hero has scrolled by, so
 * there is never a second set of lines sitting on top of the headline.
 *
 * Every line is a single unbroken curve from where it enters to the bottom of
 * the document. There is no per-section piece and no seam, so nothing can read
 * as a disconnected fragment.
 *
 * Canvas rather than svg, for two reasons. The lines have to keep flowing while
 * the page sits still, which means regenerating their shape every frame, and a
 * document-height svg would have to rewrite tens of thousands of path segments
 * to do it. And the look comes from additive blending at the crossings, which
 * canvas gives directly. The element is one viewport, fixed, with scroll
 * applied as an offset, so only visible pixels are ever rasterised no matter
 * how long the page gets.
 *
 * Geometry is in viewport-relative units: 100 across is one viewport width, 100
 * down is one viewport height, against the measured document height.
 */

/** Units in one viewport. */
const SCREEN = 100;

// Where the streak begins, in units from the top of the document. Has to clear
// one screen by more than a line's furthest reach above the spine (its offset
// plus its wobble), or the topmost line grazes the bottom of the hero.
const STREAK_TOP = 118;

// Turnarounds sit outside the viewport, so the streak leaves frame at the edges
// rather than visibly bouncing off them. Also what puts its start point off the
// left edge, so it slides into frame instead of beginning in open space.
const DESKTOP_AMP = 62;
const MOBILE_AMP = 56;

// Screens of scrolling per sweep. Longer on mobile: the document is three or
// four times taller there, and matching the desktop rate would pack the page
// with switchbacks.
const DESKTOP_SWEEP = 1.3;
const MOBILE_SWEEP = 1.8;

// Sampling resolution along the curve, in half-cycles. Only the visible span is
// ever evaluated, so this buys smoothness cheaply.
const STEP = 0.012;

// Where the leading tip sits, in screens from the top of the viewport. Just
// inside the bottom edge rather than past it, so the streak visibly arrives
// into the lower part of the frame as you scroll instead of being there
// already. Below 1.0 or you never see it come in.
const LEAD = 0.92;

// Length of the softened tail behind the leading tip, in units.
const TIP_FADE = 30;

// Vertical spread of the streak, and the excursion of each line's own wobble.
// Both stay tight enough that it reads as one band.
const SPREAD = 21;
const WOBBLE = 4.5;

// Radians per second the wave travels along the lines while the page is still.
const IDLE_RATE = 0.34;

// Radians of extra travel per screen scrolled. This is what makes the streak
// run with you and unwind when you scroll back up. Kept under the point where
// the waves visibly race the page.
const SCROLL_RATE = 0.6;

const ACCENT = "124, 92, 252";
const ACCENT_HOT = "154, 129, 255";

type Line = {
  seed: number;
  offset: number;
  width: number;
  alpha: number;
  rate: number;
};

/** The same sum of cosines the shader uses, so these carry the field's rhythm. */
const wave = (t: number) =>
  (Math.cos(t) + Math.cos(t * 1.3 + 1.3) + Math.cos(t * 1.4 + 1.4)) / 3;

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function makeLines(count: number, spread: number, scale: number): Line[] {
  return Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0.5 : i / (count - 1);
    return {
      seed: i * 1.37,
      offset: -spread * 0.45 + spread * t,
      width: (0.55 + 1.2 * Math.abs(Math.cos(i * 1.7))) * scale,
      alpha: 0.32 + 0.5 * Math.abs(Math.sin(i * 1.23 + 0.4)),
      // Slightly different flow rates, so the lines slide against each other
      // instead of undulating in lockstep like a single rigid sheet.
      rate: 1 + 0.28 * Math.sin(i * 1.9),
    };
  });
}

type Geometry = {
  sweeps: number;
  span: number;
  amp: number;
  lines: Line[];
};

function geometryFor(screens: number, mobile: boolean): Geometry {
  const sweepScreens = mobile ? MOBILE_SWEEP : DESKTOP_SWEEP;
  const sweeps = Math.max(2, Math.round((screens - STREAK_TOP / SCREEN) / sweepScreens));
  // Overshoot the bottom a little so the last sweep is still travelling when it
  // leaves the frame, rather than parking on the footer.
  const endY = screens * SCREEN + 0.16 * SCREEN;

  return {
    sweeps,
    span: (endY - STREAK_TOP) / sweeps,
    amp: mobile ? MOBILE_AMP : DESKTOP_AMP,
    lines: mobile ? makeLines(7, SPREAD * 0.8, 0.85) : makeLines(12, SPREAD, 1),
  };
}

/**
 * Vertical position of the spine. `p` counts sweeps across the page.
 *
 * Within a sweep the descent is fast at the two ends and slow through the
 * middle, which is the whole look: the streak runs flat across the page, then
 * dives where it turns.
 */
function spineY(p: number, geo: Geometry): number {
  const k = Math.min(geo.sweeps - 1, Math.floor(p));
  const u = Math.min(1, p - k);
  const eased = u + (0.75 / (2 * Math.PI)) * Math.sin(2 * Math.PI * u);
  return STREAK_TOP + (k + eased) * geo.span;
}

/**
 * Horizontal position. The first sweep runs left to right, so the streak comes
 * into frame off the left edge and swings across, then alternates.
 *
 * Smoothstep rather than linear, so it eases into each turn instead of arriving
 * at the edge still travelling sideways. Paired with spineY's fast ends, that
 * reads as a hook over the edge.
 */
function spineX(p: number, geo: Geometry): number {
  const k = Math.min(geo.sweeps - 1, Math.floor(p));
  const u = Math.min(1, p - k);
  const s = u * u * (3 - 2 * u);
  const left = 50 - geo.amp;
  const right = 50 + geo.amp;
  return k % 2 === 0 ? left + (right - left) * s : right + (left - right) * s;
}

export function FlowLines() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const narrow = window.matchMedia("(max-width: 639px)");

    let mobile = narrow.matches;
    let screens = 7;
    let geo = geometryFor(screens, mobile);

    let vw = 1;
    let vh = 1;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
      vw = canvas.clientWidth;
      vh = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(vw * dpr));
      canvas.height = Math.max(1, Math.round(vh * dpr));
    };

    const remeasure = () => {
      const nextMobile = narrow.matches;
      const raw = document.documentElement.scrollHeight / Math.max(1, canvas.clientHeight);
      // Quantised so a one-pixel reflow does not rebuild the geometry. The
      // canvas is fixed and adds no height, so this cannot feed back.
      const next = Math.max(1.6, Math.round(raw * 4) / 4);
      if (next !== screens || nextMobile !== mobile) {
        screens = next;
        mobile = nextMobile;
        geo = geometryFor(screens, mobile);
      }
    };

    // Exponentially smoothed rather than hard-tracked, so a flick pulls the tip
    // behind and it eases back up instead of snapping.
    let tip = Number.NaN;

    const render = (t: number) => {
      const scrollY = window.scrollY;
      const screenY = scrollY / vh; // scroll position in screens

      const tipTarget = (screenY + LEAD) * SCREEN;
      if (Number.isNaN(tip)) tip = tipTarget;
      tip += (tipTarget - tip) * 0.1;

      const drawTip = reduceMotion ? Number.POSITIVE_INFINITY : tip;
      const phase = (reduceMotion ? 0 : t * IDLE_RATE) + screenY * SCROLL_RATE;

      // Only the span crossing the viewport, plus a margin. It has to clear the
      // furthest a line sits from the spine (offset plus wobble), or a line
      // would pop in at the top of the frame instead of arriving already drawn.
      const margin = SPREAD * 0.5 + WOBBLE + 12;
      const top = screenY * SCREEN - margin;
      const bottom = (screenY + 1) * SCREEN + margin;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, vw, vh);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // The spine is shared, so the visible span is found once rather than per
      // line, and coarsely: it only has to bracket the range, and each end is
      // padded by a step of its own. y is monotonic in p, so this is exact.
      const SCAN = 0.05;
      let pFrom = 0;
      let pTo = geo.sweeps;
      for (let p = 0; p <= geo.sweeps; p += SCAN) {
        const y = spineY(p, geo);
        if (y < top) pFrom = p;
        if (y > bottom) {
          pTo = p;
          break;
        }
      }
      pFrom = Math.max(0, pFrom - SCAN);
      pTo = Math.min(geo.sweeps, pTo + SCAN);

      for (const line of geo.lines) {
        const pts: Array<[number, number, number]> = [];

        for (let p = pFrom; p <= pTo; p += STEP) {
          const y0 = spineY(p, geo);
          if (y0 > drawTip) break;

          const flow = phase * line.rate;
          const x = spineX(p, geo) + 3.5 * wave(p * 4.2 + line.seed * 1.7 + flow * 0.7);
          const y = y0 + line.offset + WOBBLE * wave(p * 6.5 + line.seed + flow);

          const tail = Number.isFinite(drawTip)
            ? smoothstep(drawTip, drawTip - TIP_FADE, y0)
            : 1;

          pts.push([(x * vw) / SCREEN, (y * vh) / SCREEN - scrollY, tail]);
        }

        if (pts.length < 3) continue;

        // Two passes: a wide faint twin for bloom, then the core. Chunked so
        // alpha can vary along the length, overlapping by a point so the joins
        // do not show.
        for (const pass of [0, 1] as const) {
          const width = pass === 0 ? line.width * 8 : line.width;
          const tint = pass === 0 ? ACCENT : ACCENT_HOT;
          const scale = pass === 0 ? 0.09 : 1;
          ctx.lineWidth = width;

          const chunk = 8;
          for (let i = 0; i < pts.length - 1; i += chunk) {
            const end = Math.min(pts.length - 1, i + chunk);
            const alpha = line.alpha * scale * pts[Math.floor((i + end) / 2)][2];
            if (alpha < 0.004) continue;

            ctx.strokeStyle = `rgba(${tint}, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(pts[i][0], pts[i][1]);
            // Quadratics through the midpoints: smooth joins without a spline.
            for (let j = i + 1; j < end; j++) {
              const [cx, cy] = pts[j];
              const [nx, ny] = pts[j + 1];
              ctx.quadraticCurveTo(cx, cy, (cx + nx) / 2, (cy + ny) / 2);
            }
            ctx.lineTo(pts[end][0], pts[end][1]);
            ctx.stroke();
          }
        }
      }
    };

    let frameId = 0;
    let running = false;
    let start = 0;

    const loop = (ts: number) => {
      if (start === 0) start = ts;
      render((ts - start) / 1000);
      frameId = requestAnimationFrame(loop);
    };

    const play = () => {
      if (running || reduceMotion) return;
      running = true;
      frameId = requestAnimationFrame(loop);
    };

    const pause = () => {
      running = false;
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
    };

    resize();
    remeasure();

    if (reduceMotion) {
      // One static frame, fully drawn, and no loop is ever scheduled.
      render(0);
    } else {
      play();
    }

    const onResize = () => {
      resize();
      remeasure();
      if (!running) render(0);
    };

    const onVisibility = () => {
      if (document.hidden) pause();
      else play();
    };

    // The canvas is fixed and contributes no height, so watching the document
    // for its own growth cannot feed back into itself.
    const observer = new ResizeObserver(remeasure);
    observer.observe(document.documentElement);

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      pause();
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      // 100lvh rather than 100% so a collapsing mobile URL bar does not
      // reallocate the drawing buffer on every scroll nudge.
      style={{ display: "block", width: "100%", height: "100lvh" }}
    />
  );
}
