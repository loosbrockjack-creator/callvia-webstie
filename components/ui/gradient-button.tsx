"use client";

// Rotating gradient border button, adapted from a 21st.dev component.
// The original snippet referenced a `.rotatingGradient` class + `--r` angle
// that weren't included; that CSS lives in app/globals.css, in the Callvia
// purple. This wrapper renders an anchor (when `href` is set) or a button,
// keeps the site's solid-purple fill, and adds the animated gradient rim.

import type { ReactNode } from "react";

interface GradientButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  target?: string;
  rel?: string;
  className?: string;
}

const OUTER =
  "rotatingGradient group relative inline-flex items-center justify-center rounded-full " +
  "transition-shadow duration-300 shadow-[0_0_30px_rgba(124,92,252,0.4)] " +
  "hover:shadow-[0_0_48px_rgba(124,92,252,0.6)] " +
  "after:content-[''] after:absolute after:inset-[2px] after:rounded-full " +
  "after:bg-[#7c5cfc] after:z-[1] after:transition-colors after:duration-300 " +
  "hover:after:bg-[#8f6ffd]";

const INNER =
  "relative z-[2] inline-flex items-center justify-center px-7 py-3.5 " +
  "text-sm font-semibold text-white";

export function GradientButton({
  children,
  href,
  onClick,
  target,
  rel,
  className = "",
}: GradientButtonProps) {
  const outerClass = `${OUTER} ${className}`.trim();
  const content = <span className={INNER}>{children}</span>;

  if (href) {
    return (
      <a href={href} target={target} rel={rel} className={outerClass}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={outerClass}>
      {content}
    </button>
  );
}

export default GradientButton;
