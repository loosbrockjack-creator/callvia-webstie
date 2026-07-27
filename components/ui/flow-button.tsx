"use client";

// Animated pill button adapted from a 21st.dev "flow button" component: on
// hover the pill morphs into a rounded rect, an arrow slides in from the left
// as the label shifts right, and a color-matched circle wipes in behind it.
// The original was light-mode (dark text/border on white); recolored here for
// the site's dark theme. `variant="accent"` uses the Callvia purple for
// primary actions, `variant="neutral"` uses white for secondary ones.

import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FlowButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  target?: string;
  rel?: string;
  variant?: "accent" | "neutral";
  size?: "sm" | "md";
  className?: string;
}

const SIZES: Record<"sm" | "md", string> = {
  sm: "px-5 py-2 text-sm font-medium",
  md: "px-7 py-3.5 text-sm font-semibold",
};

const VARIANTS: Record<
  "accent" | "neutral",
  { border: string; text: string; hoverText: string; circle: string }
> = {
  accent: {
    border: "border-accent/40",
    text: "text-accent",
    hoverText: "group-hover:text-white",
    circle: "bg-accent",
  },
  neutral: {
    border: "border-white/15",
    text: "text-white/70",
    hoverText: "group-hover:text-black",
    circle: "bg-white",
  },
};

export function FlowButton({
  children,
  href,
  onClick,
  target,
  rel,
  variant = "neutral",
  size = "sm",
  className = "",
}: FlowButtonProps) {
  const v = VARIANTS[variant];

  const classes = cn(
    "group relative inline-flex items-center gap-1 overflow-hidden rounded-full border cursor-pointer",
    "transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
    "hover:border-transparent hover:rounded-xl active:scale-[0.96]",
    v.border,
    v.text,
    SIZES[size],
    className
  );

  const content = (
    <>
      <ArrowRight
        className={cn(
          "absolute w-4 h-4 left-[-25%] z-[9] fill-none",
          "transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          "group-hover:left-4",
          v.text,
          v.hoverText
        )}
      />
      <span
        className={cn(
          "relative z-[1] -translate-x-3 group-hover:translate-x-3",
          "transition-all duration-[800ms] ease-out",
          v.hoverText
        )}
      >
        {children}
      </span>
      <span
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full opacity-0 z-0",
          "transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)]",
          "group-hover:w-[220px] group-hover:h-[220px] group-hover:opacity-100",
          v.circle
        )}
      />
      <ArrowRight
        className={cn(
          "absolute w-4 h-4 right-4 z-[9] fill-none",
          "transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          "group-hover:right-[-25%]",
          v.text,
          v.hoverText
        )}
      />
    </>
  );

  if (href) {
    return (
      <a href={href} target={target} rel={rel} onClick={onClick} className={classes}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  );
}

export default FlowButton;
