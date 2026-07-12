"use client";

// Cursor-following gradient reveal on text, adapted from a 21st.dev component.
// Adapted for this project: the Callvia purple gradient (not the sample
// rainbow), Geist inherited instead of Helvetica, fixed colors instead of the
// `dark:` variants (this site is always dark regardless of OS theme), a
// readable base fill so names stay legible, optional alignment, and cursor
// mapping computed in true SVG user-space so the reveal tracks accurately
// despite the responsive aspect scaling.

import { useEffect, useId, useRef, useState } from "react";
import { motion } from "framer-motion";

const VBW = 640;
const VBH = 80;

interface TextHoverEffectProps {
  text: string;
  duration?: number;
  align?: "start" | "middle";
  restFill?: string;
  hoverFill?: string;
}

export function TextHoverEffect({
  text,
  duration = 0,
  align = "start",
  restFill = "rgba(255,255,255,0.6)",
  hoverFill = "rgba(255,255,255,0.78)",
}: TextHoverEffectProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const uid = useId().replace(/[:]/g, "");
  const gradientId = `thg-${uid}`;
  const revealId = `thr-${uid}`;
  const maskId = `thm-${uid}`;

  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  // Reveal center in SVG user-space units (viewBox coords), not screen %.
  const [maskPosition, setMaskPosition] = useState({ cx: -200, cy: VBH / 2 });

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    if (!rect.height) return;
    // "…YMid meet" on a wide row is height-constrained, so viewBox units scale
    // by rect.height / VBH. Account for horizontal centering when align=middle.
    const scale = rect.height / VBH;
    const offsetX = align === "middle" ? (rect.width - VBW * scale) / 2 : 0;
    setMaskPosition({
      cx: (cursor.x - rect.left - offsetX) / scale,
      cy: (cursor.y - rect.top) / scale,
    });
  }, [cursor, align]);

  const textProps = {
    x: align === "middle" ? VBW / 2 : 6,
    y: "50%",
    textAnchor: align,
    dominantBaseline: "middle" as const,
    fontSize: 52,
    fontWeight: 500,
    style: { fontFamily: "inherit", letterSpacing: "-0.02em" },
  };

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox={`0 0 ${VBW} ${VBH}`}
      preserveAspectRatio={align === "middle" ? "xMidYMid meet" : "xMinYMid meet"}
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      className="select-none overflow-visible"
    >
      <defs>
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="480" y2="0">
          {hovered && (
            <>
              <stop offset="0%" stopColor="#8f6ffd" />
              <stop offset="45%" stopColor="#c4b5fd" />
              <stop offset="100%" stopColor="#8f6ffd" />
            </>
          )}
        </linearGradient>

        <motion.radialGradient
          id={revealId}
          gradientUnits="userSpaceOnUse"
          r="78"
          animate={maskPosition}
          transition={{ duration, ease: "easeOut" }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>

        <mask id={maskId}>
          <rect x="0" y="0" width="100%" height="100%" fill={`url(#${revealId})`} />
        </mask>
      </defs>

      {/* Readable base name. */}
      <text
        {...textProps}
        fill={hovered ? hoverFill : restFill}
        className="transition-[fill] duration-300"
      >
        {text}
      </text>

      {/* Purple gradient reveal that follows the cursor (via the radial mask). */}
      <text {...textProps} fill={`url(#${gradientId})`} mask={`url(#${maskId})`}>
        {text}
      </text>
    </svg>
  );
}
