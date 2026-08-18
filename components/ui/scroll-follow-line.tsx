"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { usePrefersReducedMotion } from "./use-reduced-motion";

/**
 * A single stroke that draws itself down the page as you scroll, in the same
 * visual language as the hero shader.
 *
 * Meant to be rendered inside a `fixed inset-0 overflow-hidden` parent
 * (SiteBackdrop). It positions itself absolutely and clips against that parent.
 *
 * Two things make this robust where the 21st.dev source was not:
 *  - useScroll() is called with no target, so it reads document progress. The
 *    `overflow-x: hidden` on html/body in globals.css breaks container-based
 *    scroll measurement, and this sidesteps it entirely.
 *  - The path lives in a fixed 0..100 by 0..300 viewBox with
 *    preserveAspectRatio="none", so it stretches to any viewport without being
 *    re-measured when section heights change. vectorEffect keeps the stroke an
 *    even weight despite the non-uniform scale.
 */

// Serpentine with wide horizontal travel, x roughly 12 to 88.
const DESKTOP_PATH =
  "M 50 0 C 78 22, 88 46, 62 66 C 36 86, 12 104, 26 128 C 40 152, 76 160, 82 184 C 88 208, 54 220, 40 242 C 26 264, 44 284, 66 300";

// Same rhythm, about a third of the excursion (x roughly 34 to 64), so on a
// 390px screen it reads as texture behind the copy instead of cutting across it.
const MOBILE_PATH =
  "M 46 0 C 60 26, 64 50, 52 74 C 40 98, 34 122, 46 146 C 58 170, 64 194, 52 218 C 40 242, 38 268, 50 300";

const GRADIENT_ID = "callvia-scroll-line-gradient";

export function ScrollFollowLine() {
  const reduceMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll();

  const smooth = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 24,
    mass: 0.3,
  });

  // The svg is 300lvh tall and travels up by two viewports, so the whole stroke
  // passes through over the length of the page.
  const y = useTransform(smooth, [0, 1], ["0%", "-66.667%"]);

  // Tuned so the leading tip sits near the bottom edge of the viewport the
  // whole way down. That is what makes it read as following you rather than
  // as a decoration that happens to grow.
  const pathLength = useTransform(smooth, [0, 1], [0.38, 1]);

  const stroke = `url(#${GRADIENT_ID})`;

  // Must be an explicit 1 under reduced motion, not an omitted style. The flag
  // resolves after the first render, by which point the motion value has already
  // committed a strokeDasharray to the DOM, and dropping the style prop does not
  // clear it. Passing 1 overwrites it with a fully drawn line.
  const drawn = reduceMotion ? { pathLength: 1 } : { pathLength };

  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 100 300"
      preserveAspectRatio="none"
      fill="none"
      className="absolute inset-x-0 top-0 w-full"
      style={{
        height: "300lvh",
        // Static and fully drawn when motion is not wanted. No spring, no travel.
        ...(reduceMotion ? {} : { y }),
      }}
    >
      <defs>
        <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0" />
          <stop offset="12%" stopColor="var(--color-accent)" stopOpacity="0.55" />
          <stop offset="50%" stopColor="var(--color-accent)" stopOpacity="0.95" />
          <stop offset="88%" stopColor="var(--color-accent)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Desktop. The blurred twin gives the same bloom as the hero strands and
          is skipped below sm, where a filter over 300lvh is not worth paying for. */}
      <g className="hidden sm:block" opacity={0.8}>
        <motion.path
          d={DESKTOP_PATH}
          stroke={stroke}
          strokeWidth={6}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          opacity={0.35}
          style={{ filter: "blur(7px)", ...drawn }}
        />
        <motion.path
          d={DESKTOP_PATH}
          stroke={stroke}
          strokeWidth={1.6}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={drawn}
        />
      </g>

      <g className="sm:hidden" opacity={0.3}>
        <motion.path
          d={MOBILE_PATH}
          stroke={stroke}
          strokeWidth={1}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={drawn}
        />
      </g>
    </motion.svg>
  );
}
