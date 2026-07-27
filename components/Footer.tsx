"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

// Sticky-reveal footer: the <footer> box reserves its own height in the flow,
// but the visible panel is position:fixed to the bottom of the viewport. The
// clip-path makes the footer a containing block for that fixed child, so the
// panel is clipped to whatever slice of the footer box has scrolled into view.
// Net effect: the page slides up off the footer instead of pushing it down.
// Heights are duplicated below (box, panel, sticky offset) and must stay in sync.
const H = "h-[600px] md:h-[640px]";
const STICKY_TOP = "top-[calc(100vh-600px)] md:top-[calc(100vh-640px)]";

const LINK_GROUPS = [
  {
    label: "Product",
    links: [
      { title: "How It Works", href: "/#how-it-works" },
      { title: "Features", href: "/#features" },
      { title: "Live Demo", href: "/#demo" },
      { title: "Missed Call Calculator", href: "/#tool" },
      { title: "Who It's For", href: "/#who-its-for" },
    ],
  },
  {
    label: "Company",
    links: [
      { title: "About", href: "/about" },
      { title: "Research", href: "/#research" },
      { title: "Build My Receptionist", href: "/build" },
      { title: "Login", href: "/login" },
    ],
  },
  {
    label: "Legal",
    links: [
      { title: "Privacy Policy", href: "/privacy" },
      { title: "Terms & Conditions", href: "/terms" },
      { title: "Service Agreement", href: "/service-agreement" },
    ],
  },
];

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
      <div className={`fixed bottom-0 w-full ${H}`}>
        <div className={`sticky ${STICKY_TOP} h-full overflow-y-auto`}>
          <div className="relative flex size-full flex-col justify-between bg-black border-t border-white/5 px-6 md:px-12 pt-14 pb-6">
            {/* Purple wash rising from the bottom edge, matching the CTA section */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 90% 55% at 50% 118%, rgba(124,92,252,0.10) 0%, transparent 70%)",
              }}
            />

            <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col gap-12 md:flex-row md:gap-8">
              <AnimatedContainer show={revealed} className="w-full md:max-w-xs">
                <span
                  className="text-white font-[200] uppercase"
                  style={{ fontSize: "13px", letterSpacing: "0.22em" }}
                >
                  Callvia
                </span>
                <p className="mt-5 text-sm leading-relaxed" style={{ color: "#777777" }}>
                  AI receptionists that answer every call, capture every lead, and
                  send you a clear summary. 24/7.
                </p>
                <a
                  href="mailto:team@callvia.io"
                  className="mt-6 inline-block text-sm text-white/60 hover:text-white transition-colors duration-200"
                >
                  team@callvia.io
                </a>
              </AnimatedContainer>

              <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:flex-1">
                {LINK_GROUPS.map((group, index) => (
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

            {/* Oversized hollow wordmark, with the copyright row layered over it */}
            <div className="relative z-10 w-full max-w-6xl mx-auto">
              <AnimatedContainer show={revealed} delay={0.3} className="relative">
                <Wordmark />
                <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-between gap-3 pt-6 text-xs sm:flex-row">
                  <p style={{ color: "#444444" }}>
                    © {new Date().getFullYear()} Callvia. All rights reserved.
                  </p>
                  <p style={{ color: "#444444" }}>Built for small businesses.</p>
                </div>
              </AnimatedContainer>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Outlined display type. textLength + lengthAdjust="spacing" force the word to
// span the container exactly (letter-spacing absorbs the difference, glyphs are
// never stretched), so it stays flush edge to edge at any width. The stroke is
// vector-effect="non-scaling-stroke" so it renders a true hairline, not a line
// that thickens with the viewBox scale.
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
      <text
        x="0"
        y="140"
        textLength="1000"
        lengthAdjust="spacing"
        fontSize="190"
        fontWeight="600"
        fill="none"
        stroke="url(#cv-wordmark-stroke)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
        style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
      >
        CALLVIA
      </text>
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
