"use client";

import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { ShaderBackground } from "./ui/shader-background";
import { ScrollFollowLine } from "./ui/scroll-follow-line";

/**
 * The one moving background layer for the marketing surfaces. Mounted once in
 * the root layout and pinned behind every page, which is what lets the stroke
 * run continuously instead of restarting per section.
 *
 * Sits at z-0. Page content is z-10, Nav and the floating CTA are z-50.
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
  const { scrollY } = useScroll();

  // Full strength for the first viewport, then it settles into an ambient wash
  // so the sections below read as content on textured black, not on a light
  // show. Held low deliberately: the strands and the scroll stroke are the same
  // kind of mark, and at anything brighter the stroke disappears into them.
  const shaderOpacity = useTransform(scrollY, [0, 700], [1, 0.18]);

  const hidden = HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (hidden) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
    >
      {/* Stands in when WebGL is unavailable, and keeps the page from being flat
          black for the frame before the canvas paints. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% 42%, rgba(124,92,252,0.10) 0%, transparent 70%)",
        }}
      />

      <motion.div className="absolute inset-0" style={{ opacity: shaderOpacity }}>
        <ShaderBackground />
      </motion.div>

      <ScrollFollowLine />
    </div>
  );
}
