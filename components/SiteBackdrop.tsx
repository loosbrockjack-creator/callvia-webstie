"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useScroll, useSpring, useTransform } from "framer-motion";
import { ShaderBackground } from "./ui/shader-background";
import { FlowLines } from "./ui/flow-lines";
import { useHasFinePointer } from "./ui/use-fine-pointer";

/**
 * The moving background for the marketing surfaces. Mounted once in the root
 * layout and pinned behind every page.
 *
 * Sits at z-0. Page content is z-10, Nav and the floating CTA are z-50.
 *
 * Two layers, both always moving, and they never overlap. The shader field is
 * one screen tall and anchored to the top of the document, so it scrolls up and
 * out of frame like anything else on the page rather than fading out underneath
 * you. The streak starts below it and waves down the rest of the page. Neither
 * stops when the page does: they flow on their own clock, and scroll position
 * pushes them further along and unwinds them on the way back up.
 *
 * The streak is desktop only. It is drawn in document space onto a fixed canvas
 * and repositioned every frame from scroll position, which needs the scroll
 * stream to be smooth and the document height to be stable. Touch devices give
 * neither: momentum scrolling arrives in coarse jumps, and the browser chrome
 * resizes the viewport as it hides and shows. The result on a phone was visibly
 * unstable, so it does not render there at all. The field stays on everywhere,
 * as the hero background it has always been.
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
  // The login page carries its own line field in its brand panel, and two sets
  // of purple lines on one screen is one too many.
  "/login",
];

// Pages that keep the streak but not the shader field. About opens on a
// portrait and a letter rather than a wordmark, and a full-screen animation
// behind that top section was too much going on. The homepage hero is
// unaffected: the field is what it has always been there.
const NO_FIELD_PREFIXES = ["/about"];

// Pixels of scrolling per extra second of shader time, on top of the field's
// own clock. At 260 the field visibly runs with you without the strands
// whipping past on a fast flick.
const PX_PER_SECOND = 260;

export function SiteBackdrop() {
  const pathname = usePathname();
  const { scrollY } = useScroll();

  // Gates the streak. A fine pointer is the honest test here: the problem is
  // touch scrolling and dynamic browser chrome, not screen size, so this is
  // right in landscape and on tablets where a width breakpoint is not. Starts
  // false, so server and first client render agree on no streak, and only a
  // real mouse or trackpad turns it on.
  const hasFinePointer = useHasFinePointer();

  // Sprung so the field eases into its new position on a flick rather than
  // tracking the scrollbar frame for frame.
  const offset = useTransform(scrollY, (y) => y / PX_PER_SECOND);
  const smoothOffset = useSpring(offset, {
    stiffness: 110,
    damping: 30,
    mass: 0.4,
  });

  // The canvas render loop reads this rather than subscribing, so scrolling
  // never triggers a React render on a full-screen WebGL component. `paused` is
  // belt and braces alongside the field's own intersection observer.
  const drive = useRef({ offset: 0, paused: false });

  useEffect(() => {
    const stopOffset = smoothOffset.on("change", (v) => {
      drive.current.offset = v;
    });
    const stopScroll = scrollY.on("change", (v) => {
      drive.current.paused = v > window.innerHeight * 1.2;
    });
    return () => {
      stopOffset();
      stopScroll();
    };
  }, [smoothOffset, scrollY]);

  const hidden = HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (hidden) return null;

  const showField = !NO_FIELD_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  return (
    <>
      {/* One screen tall at the top of the document, so it scrolls away with
          the hero. No opacity animation anywhere: it leaves by going up. */}
      {showField && (
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 z-0 h-[100lvh] overflow-hidden pointer-events-none"
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

          <ShaderBackground className="absolute inset-0" driveRef={drive} />
        </div>
      )}

      {/* The streak is drawn in document space but rasterised one viewport at a
          time, so it runs from below the hero to the footer at the rate you
          actually scroll while only ever painting visible pixels. Not mounted
          at all on touch, so there is no canvas, no render loop and no observer
          on the devices it misbehaved on. */}
      {hasFinePointer && (
        <div
          aria-hidden
          className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
        >
          <FlowLines />
        </div>
      )}
    </>
  );
}
