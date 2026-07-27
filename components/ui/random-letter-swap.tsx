"use client";

import { useRef, useState } from "react";
import { motion, type Transition } from "framer-motion";
import { cn } from "@/lib/utils";

// A per-letter hover effect: on hover each character lifts and settles back in
// a randomized stagger, so the word "shuffles" without changing its text. Two
// stacked copies keep layout stable and prevent layout shift.
interface RandomLetterSwapProps {
  label: string;
  className?: string;
  staggerDuration?: number;
  transition?: Transition;
}

export function RandomLetterSwap({
  label,
  className,
  staggerDuration = 0.025,
  transition = { duration: 0.6, type: "spring" },
}: RandomLetterSwapProps) {
  const [hovered, setHovered] = useState(false);
  const busy = useRef(false);

  function onEnter() {
    if (busy.current) return;
    busy.current = true;
    setHovered(true);
  }

  const chars = label.split("");
  // A stable but scrambled per-index delay so each letter fires in its own order.
  const delays = chars.map((_, i) => ((i * 7) % chars.length) * staggerDuration);

  return (
    <span
      className={cn("relative inline-block whitespace-nowrap", className)}
      onMouseEnter={onEnter}
      onMouseLeave={() => setHovered(false)}
    >
      {chars.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          className="inline-block"
          initial={{ y: 0 }}
          animate={hovered ? { y: [0, -8, 0] } : { y: 0 }}
          transition={{ ...transition, delay: delays[i] }}
          onAnimationComplete={() => {
            if (i === chars.length - 1) busy.current = false;
          }}
        >
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </span>
  );
}
