"use client";

// Cursor-following card glow, adapted from a 21st.dev component.
// Adapted for this project: uses framer-motion (not the `motion` package),
// dark #0d0d0d card fill, purple #7c5cfc accent glow, an optional built-in
// scroll-reveal so it can replace existing entrance animations, and a
// re-render guard so pointer movement far from a container is free.

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  type MotionProps,
} from "framer-motion";

import { cn } from "@/lib/utils";

interface CursorCardsContainerProps {
  children: React.ReactNode;
  className?: string;
  proximityRange?: number;
}

interface CursorCardProps {
  children?: React.ReactNode;
  className?: string;
  illuminationRadius?: number;
  illuminationColor?: string;
  illuminationOpacity?: number;
  primaryHue?: string;
  secondaryHue?: string;
  borderColor?: string;
  cardColor?: string;
  // Optional entrance reveal, matching the site's scroll-in pattern.
  reveal?: boolean;
  revealDelay?: number;
}

interface InternalCursorCardProps extends CursorCardProps {
  globalMouseX?: number;
  globalMouseY?: number;
  isWithinRange?: boolean;
}

function useMousePosition(proximityRange: number) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [mouseState, setMouseState] = useState({
    mousePositionX: 0,
    mousePositionY: 0,
    isWithinRange: false,
  });

  const handlePointerMovement = useCallback(
    (event: PointerEvent) => {
      const el = wrapperRef.current;
      if (!el) return;

      const bounds = el.getBoundingClientRect();
      const { clientX, clientY } = event;

      const isInProximity =
        clientX >= bounds.left - proximityRange &&
        clientX <= bounds.right + proximityRange &&
        clientY >= bounds.top - proximityRange &&
        clientY <= bounds.bottom + proximityRange;

      setMouseState((prev) => {
        // No-op (React bails on same reference) when the pointer is nowhere
        // near this container and wasn't last frame either.
        if (!isInProximity && !prev.isWithinRange) return prev;
        return {
          mousePositionX: clientX,
          mousePositionY: clientY,
          isWithinRange: isInProximity,
        };
      });
    },
    [proximityRange]
  );

  useEffect(() => {
    document.addEventListener("pointermove", handlePointerMovement);
    return () =>
      document.removeEventListener("pointermove", handlePointerMovement);
  }, [handlePointerMovement]);

  return { wrapperRef, mouseState };
}

function useCardActivation(
  elementRef: React.RefObject<HTMLDivElement | null>,
  globalMouseX: number,
  globalMouseY: number,
  isWithinRange: boolean,
  illuminationRadius: number
) {
  const localMouseX = useMotionValue(-illuminationRadius);
  const localMouseY = useMotionValue(-illuminationRadius);
  const [isCardActive, setIsCardActive] = useState(false);

  useEffect(() => {
    const el = elementRef.current;
    if (!el || !isWithinRange) {
      setIsCardActive(false);
      localMouseX.set(-illuminationRadius);
      localMouseY.set(-illuminationRadius);
      return;
    }

    const rect = el.getBoundingClientRect();
    const extendedProximity = 100;

    const isNearCard =
      globalMouseX >= rect.left - extendedProximity &&
      globalMouseX <= rect.right + extendedProximity &&
      globalMouseY >= rect.top - extendedProximity &&
      globalMouseY <= rect.bottom + extendedProximity;

    setIsCardActive(isNearCard);

    if (isNearCard) {
      localMouseX.set(globalMouseX - rect.left);
      localMouseY.set(globalMouseY - rect.top);
    } else {
      localMouseX.set(-illuminationRadius);
      localMouseY.set(-illuminationRadius);
    }
  }, [
    elementRef,
    globalMouseX,
    globalMouseY,
    isWithinRange,
    illuminationRadius,
    localMouseX,
    localMouseY,
  ]);

  return { localMouseX, localMouseY, isCardActive };
}

export function CursorCardsContainer({
  children,
  className,
  proximityRange = 400,
}: CursorCardsContainerProps) {
  const { wrapperRef, mouseState } = useMousePosition(proximityRange);

  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === CursorCard) {
      return React.cloneElement(
        child as React.ReactElement<InternalCursorCardProps>,
        {
          globalMouseX: mouseState.mousePositionX,
          globalMouseY: mouseState.mousePositionY,
          isWithinRange: mouseState.isWithinRange,
        }
      );
    }
    return child;
  });

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      {enhancedChildren}
    </div>
  );
}

export function CursorCard({
  children,
  className,
  illuminationRadius = 200,
  illuminationColor = "rgba(124, 92, 252, 0.12)",
  illuminationOpacity = 0.85,
  primaryHue = "#9b7ffd",
  secondaryHue = "#7c5cfc",
  borderColor = "#1f1f1f",
  cardColor = "#0d0d0d",
  reveal = false,
  revealDelay = 0,
  globalMouseX = 0,
  globalMouseY = 0,
  isWithinRange = false,
}: InternalCursorCardProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const { localMouseX, localMouseY, isCardActive } = useCardActivation(
    elementRef,
    globalMouseX,
    globalMouseY,
    isWithinRange,
    illuminationRadius
  );

  const gradientBackground = useMotionTemplate`
    radial-gradient(${illuminationRadius}px circle at ${localMouseX}px ${localMouseY}px,
    ${primaryHue},
    ${secondaryHue},
    ${borderColor} 100%
    )
  `;

  const illuminationBackground = useMotionTemplate`
    radial-gradient(${illuminationRadius}px circle at ${localMouseX}px ${localMouseY}px,
    ${illuminationColor}, transparent 100%)
  `;

  const revealProps: MotionProps = reveal
    ? {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-60px" },
        transition: { duration: 0.6, ease: "easeOut", delay: revealDelay },
      }
    : {};

  return (
    <motion.div
      ref={elementRef}
      className={cn("group relative", className)}
      {...revealProps}
    >
      {/* Gradient layer, revealed at the 1px edge as the glowing border. */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ background: gradientBackground }}
      />
      {/* Card fill, inset 1px so the gradient shows only as a border. */}
      <div
        className="absolute inset-px rounded-[inherit]"
        style={{ background: cardColor }}
      />
      {/* Soft interior spotlight that follows the cursor. */}
      <motion.div
        className="pointer-events-none absolute inset-px rounded-[inherit] transition-opacity duration-300"
        style={{
          background: illuminationBackground,
          opacity: isCardActive ? illuminationOpacity : 0,
        }}
      />
      {/* Content. */}
      <div className="relative h-full">{children}</div>
    </motion.div>
  );
}
