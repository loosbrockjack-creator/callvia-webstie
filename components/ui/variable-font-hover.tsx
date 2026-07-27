"use client";

import { useMemo, useRef, useState } from "react";
import { motion, type Transition } from "framer-motion";
import { cn } from "@/lib/utils";

// A per-letter hover effect that animates the font's weight axis. On hover each
// character interpolates from `fromFontVariationSettings` to
// `toFontVariationSettings` in a randomized-feeling stagger, so the word "thickens"
// letter by letter without any layout shift. Requires a variable font on the axis
// being animated (this project uses Geist, which exposes 'wght').
interface VariableFontHoverProps {
  label: string;
  fromFontVariationSettings: string;
  toFontVariationSettings: string;
  className?: string;
  transition?: Transition;
  staggerDuration?: number;
  staggerFrom?: "first" | "last" | "center" | number;
  // When true the letters stay pinned at `toFontVariationSettings` (e.g. the
  // active nav link keeps the bold weight it reaches on hover).
  active?: boolean;
  onClick?: () => void;
}

export function VariableFontHover({
  label,
  fromFontVariationSettings,
  toFontVariationSettings,
  className,
  transition = { type: "spring", duration: 0.7 },
  staggerDuration = 0.03,
  staggerFrom = "first",
  active = false,
  onClick,
}: VariableFontHoverProps) {
  const [hovered, setHovered] = useState(false);
  const scope = useRef<HTMLSpanElement>(null);

  const chars = useMemo(() => label.split(""), [label]);

  // Distance (in indices) from the stagger origin, used to delay each letter so
  // the animation ripples outward from `staggerFrom`.
  const delayFor = (index: number) => {
    const total = chars.length;
    let distance: number;
    switch (staggerFrom) {
      case "first":
        distance = index;
        break;
      case "last":
        distance = total - 1 - index;
        break;
      case "center":
        distance = Math.abs(index - (total - 1) / 2);
        break;
      default:
        distance = Math.abs(index - staggerFrom);
    }
    return distance * staggerDuration;
  };

  return (
    <span
      ref={scope}
      className={cn("relative inline-block whitespace-nowrap", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {chars.map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          className="inline-block"
          initial={{ fontVariationSettings: fromFontVariationSettings }}
          animate={{
            fontVariationSettings:
              hovered || active
                ? toFontVariationSettings
                : fromFontVariationSettings,
          }}
          transition={{ ...transition, delay: delayFor(i) }}
        >
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </span>
  );
}
