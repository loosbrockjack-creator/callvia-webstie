"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BOOKING_URL } from "@/lib/site";

// Hidden on internal/task flows where a marketing CTA doesn't belong:
// admin dashboard, the tokenized contract-signing flow, and the build
// funnel/report (which are themselves the conversion path).
// `/login` is here for the same reason as the rest: someone on the auth screen
// is an existing customer trying to get into their account, and a sales pill
// floating over it is aimed at the wrong person.
const HIDDEN_PREFIXES = ["/admin", "/agreement", "/build", "/report", "/login"];

export function FloatingBookCall() {
  const pathname = usePathname();
  const [overFooter, setOverFooter] = useState(false);

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

  if (hidden) return null;

  return (
    <motion.a
      href={BOOKING_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Book a call"
      initial={{ opacity: 0, y: 12 }}
      animate={{
        opacity: overFooter ? 0 : 1,
        y: 0,
        pointerEvents: overFooter ? "none" : "auto",
      }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 1 }}
      style={{
        bottom: "calc(1.5rem + env(safe-area-inset-bottom))",
        right: "calc(1.5rem + env(safe-area-inset-right))",
      }}
      className="fixed z-50 inline-flex items-center justify-center gap-2 p-3.5 md:px-5 md:py-3 rounded-full border border-white/30 bg-black/90 backdrop-blur-md text-sm font-medium text-white/85 shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:text-white hover:border-white/50 transition-all duration-200"
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white/60"
      >
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18" />
        <path d="M8 3v4" />
        <path d="M16 3v4" />
      </svg>
      <span className="hidden md:inline">Book a Call</span>
    </motion.a>
  );
}
