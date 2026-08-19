"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { NAV_LINK_GROUPS } from "@/lib/nav-links";

// Sticky-reveal footer, md and up: the <footer> box reserves its own height in
// the flow, but the visible panel is position:fixed to the bottom of the
// viewport. The clip-path makes the footer a containing block for that fixed
// child, so the panel is clipped to whatever slice of the footer box has
// scrolled into view. Net effect: the page slides up off the footer instead of
// pushing it down. Heights are duplicated below (box, panel, sticky offset) and
// must stay in sync.
//
// Below md the whole mechanism is off and the footer is a plain flowing block:
// a fixed 640px panel can't fit this much content on a phone, which forced the
// wordmark and copyright row to overlap.
const H = "md:h-[640px]";
const STICKY_TOP = "md:top-[calc(100vh-640px)]";

export function Footer() {
  // The panel is position:fixed, so it is always "in view" as far as an
  // IntersectionObserver is concerned and whileInView would fire on load.
  // Watch the footer box in the document flow instead, and hand the result
  // down so the reveal plays when the footer is actually uncovered.
  const boxRef = useRef<HTMLElement>(null);
  const revealed = useInView(boxRef, { once: true, margin: "-120px" });

  return (
    <footer
      ref={boxRef}
      className={`relative w-full ${H}`}
      style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
    >
      <div className={`w-full md:fixed md:bottom-0 ${H}`}>
        <div className={`md:sticky ${STICKY_TOP} md:h-full md:overflow-y-auto`}>
          <div className="relative flex w-full md:size-full flex-col justify-between bg-black border-t border-white/5 px-6 sm:px-8 md:px-12 pt-10 sm:pt-12 md:pt-14 pb-6">
            {/* Purple wash rising from the bottom edge, matching the CTA section */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 90% 55% at 50% 118%, rgba(124,92,252,0.10) 0%, transparent 70%)",
              }}
            />

            <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col gap-8 md:flex-row">
              <AnimatedContainer show={revealed} className="w-full md:max-w-xs">
                <span
                  className="text-white font-[200] uppercase"
                  style={{ fontSize: "13px", letterSpacing: "0.22em" }}
                >
                  Callvia
                </span>
                <p className="mt-5 text-sm leading-relaxed" style={{ color: "#777777" }}>
                  The receptionist built for the trades, so you never leave a job
                  on the table.
                </p>
                <a
                  href="mailto:team@callvia.io"
                  className="mt-6 inline-block text-sm text-white/60 hover:text-white transition-colors duration-200"
                >
                  team@callvia.io
                </a>
              </AnimatedContainer>

              <div className="grid grid-cols-2 gap-8 sm:gap-10 sm:grid-cols-3 md:flex-1">
                {NAV_LINK_GROUPS.map((group, index) => (
                  <AnimatedContainer
                    key={group.label}
                    show={revealed}
                    delay={0.1 + index * 0.08}
                  >
                    <h3
                      className="text-[11px] uppercase tracking-[0.18em]"
                      style={{ color: "#555555" }}
                    >
                      {group.label}
                    </h3>
                    <ul className="mt-5 space-y-3">
                      {group.links.map((link) => (
                        <li key={link.title}>
                          <a
                            href={link.href}
                            className="text-sm text-white/50 hover:text-white transition-colors duration-200"
                          >
                            {link.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </AnimatedContainer>
                ))}
              </div>
            </div>

            {/* Oversized hollow wordmark. The copyright row layers over it from
                md up, where there's room inside the glyphs; below that it stacks
                underneath so the two can't collide. */}
            <div className="relative z-10 w-full max-w-6xl mx-auto mt-12 md:mt-0">
              <AnimatedContainer show={revealed} delay={0.3} className="relative">
                <Wordmark />
                <div className="mt-5 flex flex-col items-center justify-between gap-3 text-xs sm:flex-row md:absolute md:inset-x-0 md:bottom-0 md:mt-0 md:pt-6">
                  <p style={{ color: "#444444" }}>
                    © {new Date().getFullYear()} Callvia. All rights reserved.
                  </p>
                  <p style={{ color: "#444444" }}>Built for the trades.</p>
                </div>
              </AnimatedContainer>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Outlined display type, drawn as one path rather than SVG <text>.
//
// Geist's uppercase L is built with an overlapping corner: the stem's right
// edge runs down past the foot's top edge, then a segment doubles back up to
// meet it. Filled, that overlap is invisible solid ink. Outlined, the doubling
// back shows as a diagonal chamfer inside each L. It is in the glyph at every
// weight, so no CSS fixes it.
//
// So the word is pre-shaped: real Geist 600 outlines, harfbuzz kerning, the
// spacing that textLength="1000" used to produce, and the two L corners squared
// off. The path is authored against the same viewBox and baseline as before, so
// it renders identically apart from the corners. Regenerating it means
// re-extracting from the font, which is why the shape is documented here.
//
// The stroke is vector-effect="non-scaling-stroke" so it stays a true hairline
// instead of thickening with the viewBox scale.
const WORDMARK_PATH =
  "M70.6 143.0Q52.3 143.0 38.2 134.6Q24.1 126.2 16.1 110.5Q8.2 94.7 8.2 72.7Q8.2 51.1 15.9 35.3Q23.7 19.4 37.8 10.7Q51.9 2.1 70.9 2.1Q96.7 2.1 111.0 14.9Q125.3 27.7 129.5 50.8L103.7 52.0Q101.3 38.7 93.1 31.1Q84.9 23.6 70.9 23.6Q59.4 23.6 51.1 29.6Q42.8 35.6 38.2 46.7Q33.7 57.7 33.7 72.7Q33.7 87.9 38.3 98.9Q42.9 109.8 51.2 115.7Q59.6 121.5 70.8 121.5Q85.8 121.5 94.0 113.3Q102.3 105.1 104.4 90.7L130.3 91.9Q127.7 107.7 120.1 119.2Q112.5 130.6 100.1 136.8Q87.7 143.0 70.6 143.0Z M173.9 140.0 222.5 5.1H252.7L301.3 140.0H275.4L264.3 108.1H210.9L199.7 140.0ZM218.1 87.0H257.1L237.7 30.1Z M354.9 140.0V5.1H379.6V118.5H443.6V140.0Z M499.3 140.0V5.1H524.0V118.5H588.0V140.0Z M658.5 140.0 609.8 5.1H635.7L673.5 112.4L711.3 5.1H737.2L688.3 140.0Z M789.3 140.0V5.1H814.0V140.0Z M868.9 140.0 917.6 5.1H947.8L996.4 140.0H970.5L959.3 108.1H905.9L894.8 140.0ZM913.2 87.0H952.2L932.7 30.1Z";

function Wordmark() {
  return (
    <svg
      viewBox="0 0 1000 200"
      className="w-full select-none"
      role="img"
      aria-label="Callvia"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="cv-wordmark-stroke" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.10" />
          <stop offset="55%" stopColor="#8f74ff" stopOpacity="0.30" />
          <stop offset="100%" stopColor="#7c5cfc" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <path
        d={WORDMARK_PATH}
        fill="none"
        stroke="url(#cv-wordmark-stroke)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

// motion.div widens `children` to allow MotionValues; narrow it back so the
// reduced-motion branch can render a plain <div>.
type AnimatedContainerProps = Omit<
  React.ComponentProps<typeof motion.div>,
  "children"
> & {
  show: boolean;
  delay?: number;
  children?: React.ReactNode;
};

function AnimatedContainer({
  show,
  delay = 0.1,
  children,
  ...props
}: AnimatedContainerProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={props.className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ filter: "blur(4px)", translateY: -8, opacity: 0 }}
      animate={
        show
          ? { filter: "blur(0px)", translateY: 0, opacity: 1 }
          : { filter: "blur(4px)", translateY: -8, opacity: 0 }
      }
      transition={{ delay, duration: 0.8 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
