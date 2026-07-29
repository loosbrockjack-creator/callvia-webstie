"use client";

// Minimal animated pill button: a small arrow that nudges right on hover.
// `variant="accent"` is a solid purple fill for primary actions.
// `variant="neutral"` is a thin border with a faint fill on hover, for
// secondary actions.

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
  showArrow?: boolean;
}

const SIZES: Record<"sm" | "md", string> = {
  sm: "px-4 py-2 text-sm font-medium",
  md: "px-7 py-3.5 text-sm font-medium",
};

const VARIANTS: Record<"accent" | "neutral", string> = {
  accent: "bg-accent border-accent text-white hover:bg-accent-hover hover:border-accent-hover",
  neutral:
    "border-white/15 text-white/60 hover:border-white/30 hover:bg-white/5 hover:text-white",
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
  showArrow = true,
}: FlowButtonProps) {
  const classes = cn(
    "group inline-flex items-center gap-1.5 rounded-full border transition-all duration-300 ease-out",
    VARIANTS[variant],
    SIZES[size],
    className
  );

  const content = (
    <>
      <span>{children}</span>
      {showArrow && (
        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
      )}
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
