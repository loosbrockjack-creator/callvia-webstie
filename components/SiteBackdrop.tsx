"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ShaderBackground } from "./ui/shader-background";
import { FlowLines } from "./ui/flow-lines";

/**
 * The one moving background layer for the marketing surfaces. Mounted once in
 * the root layout and pinned behind every page, which is what lets the lines
 * run continuously from the hero to the footer instead of restarting per
 * section.
 *
 * Sits at z-0. Page content is z-10, Nav and the floating CTA are z-50.
 *
 * Two pieces, one motion. The shader canvas draws the field over the first
 * screen and FlowLines picks the same lines up as geometry, fanned across the
 * hero and then gathered into a ribbon that switchbacks down the page. As you
 * scroll the canvas fades out while the ribbon brightens, so the field resolves
 * into the ribbon rather than handing off at a visible seam.
 *
 * Nothing runs on a clock. The field advances because iTime is fed from scroll
 * position, which is also what makes it run backwards when you scroll up.
 */

// Same reasoning as FloatingBookCall's HIDDEN_PREFIXES: this is a marketing
// treatment, so it stays off the admin dashboard, the tokenized contract and
// onboarding flows, the build funnel and its report, the account area, and the
// legal pages, which are all meant to read as plain documents.
const HIDDEN_PREFIXES = [
  "/admin",
  "/agreement",
  "/onboarding",
  "/build",
  "/report",
  "/account",
  "/privacy",
  "/terms",
  "/service-agreement",
];

// Seconds of shader time the field rests at. t=0 is a flat, uninteresting
// frame; by here the strands have spread out, so this is what a visitor who
// never scrolls sees.
const REST_TIME = 12;

// Pixels of scrolling per second of shader time. At 220 the field moves
// noticeably while the hero is still on screen without the strands whipping.
const PX_PER_SECOND = 220;

export function SiteBackdrop() {
  const pathname = usePathname();
  const { scrollY } = useScroll();

  // Held low deliberately. The canvas and the ribbon are the same kind of mark,
  // and anything brighter down here would bury the ribbon in the field it is
  // supposed to have come out of.
  const shaderOpacity = useTransform(scrollY, [0, 900], [1, 0]);

  // Spring first, then map: the field eases into its new position on a flick
  // instead of tracking the scrollbar frame for frame.
  const scrollTime = useTransform(scrollY, (y) => REST_TIME + y / PX_PER_SECOND);
  const smoothTime = useSpring(scrollTime, {
    stiffness: 110,
    damping: 30,
    mass: 0.4,
  });

  // The canvas render loop reads this ref rather than subscribing, so scrolling
  // never triggers a React render on a full-screen WebGL component.
  const timeRef = useRef(REST_TIME);
  useEffect(() => smoothTime.on("change", (v) => {
    timeRef.current = v;
  }), [smoothTime]);

  const hidden = HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (hidden) return null;

  return (
    <>
      {/* The field itself stays locked to the viewport. */}
      <div
        aria-hidden
        className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
      >
        {/* Stands in when WebGL is unavailable, and keeps the page from being
            flat black for the frame before the canvas paints. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 55% at 50% 42%, rgba(124,92,252,0.10) 0%, transparent 70%)",
          }}
        />

        <motion.div className="absolute inset-0" style={{ opacity: shaderOpacity }}>
          <ShaderBackground timeRef={timeRef} />
        </motion.div>
      </div>

      {/* The ribbon spans the real document instead, so it runs hero to footer
          and advances at the rate you actually scroll. A viewport-pinned
          overlay can only ever travel a fixed number of screens, so on a
          ten-screen page it would crawl. inset-0 against the relatively
          positioned body resolves to the full page height with no JS. */}
      <div
        aria-hidden
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      >
        <FlowLines />
      </div>
    </>
  );
}
