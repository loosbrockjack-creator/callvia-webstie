"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BOOKING_URL } from "@/lib/site";

// Hidden on internal/task flows where a marketing CTA doesn't belong:
// admin dashboard, the tokenized contract-signing flow, and the build
// funnel/report (which are themselves the conversion path).
const HIDDEN_PREFIXES = ["/admin", "/agreement", "/build", "/report"];

export function FloatingBookCall() {
  const pathname = usePathname();

  if (HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  return (
    <motion.a
      href={BOOKING_URL}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 1 }}
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/10 bg-black/90 backdrop-blur-md text-sm font-medium text-white/85 shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:text-white hover:border-white/25 transition-all duration-200"
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
      Book a Call
    </motion.a>
  );
}
