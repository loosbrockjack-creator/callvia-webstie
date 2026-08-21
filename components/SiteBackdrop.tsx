"use client";

import { usePathname } from "next/navigation";
import { FlowLines } from "./ui/flow-lines";
import { useHasFinePointer } from "./ui/use-fine-pointer";

/**
 * The moving background for the marketing surfaces. Mounted once in the root
 * layout and pinned behind every page.
 *
 * Sits at z-0. Page content is z-10, Nav and the floating CTA are z-50.
 *
 * One layer now. The hero used to carry a full-screen WebGL plasma field, which
 * was removed for being loud enough to compete with the headline sitting on top
 * of it. The hero is black, and the streak is the only motion behind the page.
 *
 * The streak is desktop only. It is drawn in document space onto a fixed canvas
 * and repositioned every frame from scroll position, which needs the scroll
 * stream to be smooth and the document height to be stable. Touch devices give
 * neither: momentum scrolling arrives in coarse jumps, and the browser chrome
 * resizes the viewport as it hides and shows. The result on a phone was visibly
 * unstable, so it does not render there at all.
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

export function SiteBackdrop() {
  const pathname = usePathname();

  // Gates the streak. A fine pointer is the honest test here: the problem is
  // touch scrolling and dynamic browser chrome, not screen size, so this is
  // right in landscape and on tablets where a width breakpoint is not. Starts
  // false, so server and first client render agree on no streak, and only a
  // real mouse or trackpad turns it on.
  const hasFinePointer = useHasFinePointer();

  const hidden = HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (hidden) return null;

  if (!hasFinePointer) return null;

  // Drawn in document space but rasterised one viewport at a time, so it runs
  // from below the hero to the footer at the rate you actually scroll while
  // only ever painting visible pixels. Not mounted at all on touch, so there is
  // no canvas, no render loop and no observer on the devices it misbehaved on.
  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
    >
      <FlowLines />
    </div>
  );
}
