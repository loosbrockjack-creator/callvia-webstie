"use client";

// 3D tilt-on-hover card, adapted from a 21st.dev component.
// Adapted for this project: framer-motion (not the `motion` package), the
// project's own pointer and reduced-motion hooks instead of duplicated ones,
// a white glare instead of the original `--foreground` token, and a hold on
// the tilt while someone is actually using a control inside the card. That
// last part matters here: the card wraps a form, and without it, dragging the
// slider or typing in a field would keep sliding the surface under the cursor.

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";

import { cn } from "@/lib/utils";
import { useHasFinePointer } from "@/components/ui/use-fine-pointer";
import { usePrefersReducedMotion } from "@/components/ui/use-reduced-motion";

const SPRING_MOUSE = { stiffness: 200, damping: 15, mass: 0.3 } as const;

export interface TiltCardProps {
  children: ReactNode;
  /** Peak rotation in degrees at the card's edge. Keep this low on large surfaces. */
  max?: number;
  glare?: boolean;
  glareOpacity?: number;
  className?: string;
  style?: CSSProperties;
}

export function TiltCard({
  children,
  max = 8,
  glare = true,
  glareOpacity = 0.06,
  className,
  style,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const hasFinePointer = useHasFinePointer();

  // Held = pointer is down inside the card. Focused = a field inside has focus.
  // Either one means the person is using the form, not admiring the card.
  const [held, setHeld] = useState(false);
  const [focused, setFocused] = useState(false);
  const active = hasFinePointer && !reduced && !held && !focused;

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);

  const srx = useSpring(rx, SPRING_MOUSE);
  const sry = useSpring(ry, SPRING_MOUSE);

  // Settle flat the moment the card stops tilting, so it is level while in use.
  useEffect(() => {
    if (active) return;
    rx.set(0);
    ry.set(0);
  }, [active, rx, ry]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !active) return;

    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    ry.set((px - 0.5) * max);
    rx.set((0.5 - py) * max);
    gx.set(px * 100);
    gy.set(py * 100);
  };

  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  const onPointerDown = () => {
    setHeld(true);
    window.addEventListener("pointerup", () => setHeld(false), { once: true });
  };

  const transform = useMotionTemplate`perspective(1200px) rotateX(${srx}deg) rotateY(${sry}deg)`;
  const glareBg = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, #ffffff, transparent 55%)`;

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onPointerDown={onPointerDown}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...style, transform, transformStyle: "preserve-3d" }}
      className={cn(
        "relative overflow-hidden rounded-2xl will-change-transform",
        className,
      )}
    >
      {children}

      {glare && active ? (
        <motion.div
          aria-hidden
          style={{ background: glareBg, opacity: glareOpacity }}
          className="pointer-events-none absolute inset-0"
        />
      ) : null}
    </motion.div>
  );
}
