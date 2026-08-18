"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ShaderBackground } from "./ui/shader-background";
import { FlowLines } from "./ui/flow-lines";

/**
 * The moving background for the marketing surfaces. Mounted once in the root
 * layout and pinned behind every page, which is what lets the streak run
 * continuously from the hero to the footer instead of restarting per section.
 *
 * Sits at z-0. Page content is z-10, Nav and the floating CTA are z-50.
 *
 * Two layers, both always moving. The shader canvas draws the field over the
 * first screen; FlowLines draws the streak that crosses the hero and waves down
 * the rest of the page. Neither one stops when the page does: they flow on
 * their own clock, and scroll position pushes both further along and unwinds
 * them when you scroll back up.
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

// Pixels of scrolling per extra second of shader time, on top of the field's
// own clock. At 260 the field visibly runs with you without the strands
// whipping past on a fast flick.
const PX_PER_SECOND = 260;

// Past here the canvas has faded out, so there is nothing to draw.
const FADE_OUT_PX = 900;

export function SiteBackdrop() {
  const pathname = usePathname();
  const { scrollY } = useScroll();

  const shaderOpacity = useTransform(scrollY, [0, FADE_OUT_PX], [1, 0]);

  // Sprung so the field eases into its new position on a flick rather than
  // tracking the scrollbar frame for frame.
  const offset = useTransform(scrollY, (y) => y / PX_PER_SECOND);
  const smoothOffset = useSpring(offset, {
    stiffness: 110,
    damping: 30,
    mass: 0.4,
  });

  // The canvas render loop reads this rather than subscribing, so scrolling
  // never triggers a React render on a full-screen WebGL component.
  const drive = useRef({ offset: 0, paused: false });

  useEffect(() => {
    const stopOffset = smoothOffset.on("change", (v) => {
      drive.current.offset = v;
    });
    const stopScroll = scrollY.on("change", (v) => {
      drive.current.paused = v > FADE_OUT_PX;
    });
    return () => {
      stopOffset();
      stopScroll();
    };
  }, [smoothOffset, scrollY]);

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
          <ShaderBackground driveRef={drive} />
        </motion.div>
      </div>

      {/* The streak is drawn in document space but rasterised one viewport at a
          time, so it runs hero to footer at the rate you actually scroll while
          only ever painting visible pixels. */}
      <div
        aria-hidden
        className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
      >
        <FlowLines />
      </div>
    </>
  );
}
