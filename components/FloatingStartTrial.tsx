"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, Calendar } from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { BOOKING_URL } from "@/lib/site";

// Hidden on internal/task flows where a marketing CTA doesn't belong:
// admin dashboard, the tokenized contract-signing flow, and the build
// funnel/report (which are themselves the conversion path).
// `/login` is here for the same reason as the rest: someone on the auth screen
// is an existing customer trying to get into their account, and a sales pill
// floating over it is aimed at the wrong person.
const HIDDEN_PREFIXES = ["/admin", "/agreement", "/build", "/report", "/login"];

export function FloatingStartTrial() {
  const pathname = usePathname();
  const [overFooter, setOverFooter] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const hidden = HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  // The footer carries its own links and CTA, so the floating pill has nothing
  // to add there and would sit on top of them. Fade it out once the footer is
  // on screen. Re-queried per route since not every page renders a footer.
  useEffect(() => {
    if (hidden) return;

    const footer = document.querySelector("footer");
    if (!footer) {
      setOverFooter(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setOverFooter(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, [pathname, hidden]);

  useEffect(() => {
    setExpanded(false);
  }, [pathname]);

  // No shared click-outside hook exists elsewhere in this codebase, so this
  // stays local to the one component that needs it.
  useEffect(() => {
    if (!expanded) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };

    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [expanded]);

  if (hidden) return null;

  return (
    <motion.div
      ref={containerRef}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{
        opacity: overFooter ? 0 : 1,
        y: 0,
        pointerEvents: overFooter ? "none" : "auto",
      }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 1 }}
      style={{
        position: "fixed",
        bottom: "calc(1.5rem + env(safe-area-inset-bottom))",
        right: "calc(1.5rem + env(safe-area-inset-right))",
      }}
      className="z-50"
    >
      <AnimatePresence mode="wait" initial={false}>
        {!expanded ? (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <ShimmerButton
              type="button"
              aria-expanded={false}
              onClick={() => setExpanded(true)}
              background="rgba(0, 0, 0, 0.92)"
              shimmerColor="#ffffff"
              shimmerDuration="2.5s"
              borderRadius="999px"
              className="gap-2 px-5 py-3.5 text-sm font-medium shadow-card"
            >
              <span>Start your trial</span>
            </ShimmerButton>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            aria-expanded={true}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col w-64 p-1.5 rounded-3xl border border-white/10 bg-black shadow-card"
          >
            <a
              href="/build"
              className="flex items-center gap-3 min-h-[44px] px-3 rounded-xl text-sm text-white/85 hover:text-white hover:bg-white/5 transition-colors duration-150"
            >
              <Wrench className="w-4 h-4 text-white/60" />
              Build My Receptionist
            </a>

            <div className="border-t border-white/10 mx-1" />

            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setExpanded(false)}
              className="flex items-center gap-3 min-h-[44px] px-3 rounded-xl text-sm text-white/85 hover:text-white hover:bg-white/5 transition-colors duration-150"
            >
              <Calendar className="w-4 h-4 text-white/60" />
              Book a Call
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default FloatingStartTrial;
