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
import { useHasFinePointer } from "@/components/ui/use-fine-pointer";
import { usePrefersReducedMotion } from "@/components/ui/use-reduced-motion";

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
  // Optional hover lift. Driven here rather than in CSS because framer-motion
  // owns this element's inline transform, so a `:hover { transform }` rule in
  // globals.css would simply lose to it.
  lift?: boolean;
}

export interface InternalCursorCardProps extends CursorCardProps {
  globalMouseX?: number;
  globalMouseY?: number;
  isWithinRange?: boolean;
  hasFinePointer?: boolean;
}

// The container used to inject pointer props by checking `child.type ===
// CursorCard`, which silently failed the moment a card was wrapped in another
// component: the wrapper rendered, the glow never arrived, and nothing warned.
// That is exactly the bug in BuildFunnel's cost card. Components that
// ultimately render a CursorCard and forward these props can now opt in by
// setting this marker on themselves.
type CursorCardAware = { acceptsCursorCardProps?: boolean };

function acceptsCursorCardProps(type: unknown): boolean {
  if (type === CursorCard) return true;
  return (
    typeof type === "function" &&
    (type as CursorCardAware).acceptsCursorCardProps === true
  );
}

function useMousePosition(proximityRange: number) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hasFinePointer = useHasFinePointer();
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

  // Touch devices fire pointermove only mid-drag and never a leave event, so
  // the glow would either never show or stick where it was last touched. Skip
  // tracking entirely there and let the static border below stand in.
  useEffect(() => {
    if (!hasFinePointer) return;
    document.addEventListener("pointermove", handlePointerMovement);
    return () =>
      document.removeEventListener("pointermove", handlePointerMovement);
  }, [handlePointerMovement, hasFinePointer]);

  return { wrapperRef, mouseState, hasFinePointer };
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
  const { wrapperRef, mouseState, hasFinePointer } =
    useMousePosition(proximityRange);

  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && acceptsCursorCardProps(child.type)) {
      return React.cloneElement(
        child as React.ReactElement<InternalCursorCardProps>,
        {
          globalMouseX: mouseState.mousePositionX,
          globalMouseY: mouseState.mousePositionY,
          isWithinRange: mouseState.isWithinRange,
          hasFinePointer,
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
  lift = false,
  globalMouseX = 0,
  globalMouseY = 0,
  isWithinRange = false,
  hasFinePointer = false,
}: InternalCursorCardProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
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

  // Reduced motion gets no entrance: the card is simply there.
  //
  // It has to say so explicitly rather than by dropping the props. The hook
  // reports false on the first render and corrects in an effect, so by the
  // time it flips, framer-motion has already written opacity:0 and a 24px
  // offset as inline styles. Removing `initial`/`whileInView` does not clear
  // those, and with no whileInView left to fire, the card stays invisible
  // forever. Animating to the resting state instead guarantees it resolves.
  //
  // Note this reads the project's own hook, not framer-motion's, which was
  // observed returning false on this page even with the media query matching.
  // See use-reduced-motion.ts.
  const revealProps: MotionProps = !reveal
    ? {}
    : prefersReducedMotion
      ? {
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0 },
        }
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: { duration: 0.6, ease: "easeOut", delay: revealDelay },
        };

  // A touch device has no hover, and a lift that fires on tap just makes the
  // card feel loose under the finger. Fine pointers only.
  const liftProps: MotionProps =
    lift && hasFinePointer && !prefersReducedMotion
      ? {
          whileHover: {
            y: -2,
            transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] },
          },
          whileTap: {
            scale: 0.995,
            transition: { duration: 0.12, ease: [0.32, 0.72, 0, 1] },
          },
        }
      : {};

  return (
    <motion.div
      ref={elementRef}
      className={cn("group relative", className)}
      {...revealProps}
      {...liftProps}
    >
      {/* Gradient layer, revealed at the 1px edge as the glowing border.
          Without a cursor it can't animate, so touch gets a static accent
          edge instead of a flat one. */}
      {hasFinePointer ? (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ background: gradientBackground }}
        />
      ) : (
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            background: `linear-gradient(160deg, ${primaryHue}55, ${secondaryHue}22 45%, ${borderColor} 100%)`,
          }}
        />
      )}
      {/* Card fill, inset 1px so the gradient shows only as a border. */}
      <div
        className="absolute inset-px rounded-[inherit]"
        style={{ background: cardColor }}
      />
      {/* Soft interior spotlight that follows the cursor. */}
      {hasFinePointer && (
        <motion.div
          className="pointer-events-none absolute inset-px rounded-[inherit] transition-opacity duration-300"
          style={{
            background: illuminationBackground,
            opacity: isCardActive ? illuminationOpacity : 0,
          }}
        />
      )}
      {/* Content. */}
      <div className="relative h-full">{children}</div>
    </motion.div>
  );
}
