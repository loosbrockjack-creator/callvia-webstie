"use client";

import { usePathname } from "next/navigation";
import { FlowLines } from "./ui/flow-lines";

/**
 * The background layer for the marketing surfaces. Mounted once in the root
 * layout and pinned behind every page, which is what lets the flow lines run
 * continuously from the hero to the footer instead of restarting per section.
 *
 * Sits at z-0. Page content is z-10, Nav and the floating CTA are z-50.
 *
 * There is deliberately nothing here on a timer. The page is still until you
 * scroll it; the previous looping shader field competed with the lines and read
 * as a screensaver behind the headline.
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

  const hidden = HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (hidden) return null;

  return (
    <>
      {/* Static glow, anchored to the top of the document rather than fixed to
          the viewport: it gives the hero depth and then genuinely ends, so the
          sections below sit on flat black the way the section cards expect. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 z-0 h-[130vh] overflow-hidden pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 78% 46% at 50% 34%, rgba(124,92,252,0.13) 0%, rgba(124,92,252,0.04) 45%, transparent 72%)",
        }}
      />

      {/* The lines span the real document instead of a viewport-pinned overlay.
          A pinned overlay can only ever travel a fixed number of screens, so on
          a ten-screen page the stroke crawls. inset-0 against the relatively
          positioned body resolves to the full page height. */}
      <div
        aria-hidden
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      >
        <FlowLines />
      </div>
    </>
  );
}
