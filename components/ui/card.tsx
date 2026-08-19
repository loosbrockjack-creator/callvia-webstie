"use client";

// The marketing card system.
//
// Every card on the marketing site is built from these four pieces, so the
// geometry and the hover language stay identical across sections that
// otherwise look quite different. Cohesion here comes from shared measurements,
// not from making every section the same shape.
//
// Structure, the "machined bezel": an outer tray holds an inner core that sits
// one shade lighter and carries a hairline highlight along its top edge, the
// way a glass plate sits in a milled aluminium surround. The two radii are
// concentric because the inner is the outer minus the tray padding. Get that
// subtraction wrong and it stops reading as one machined object and starts
// reading as two rounded rectangles.
//
// Three tiers are in use:
//   Tier 1, showcase  Card + CardWell + CardBody   Features, Research
//   Tier 2, plate     Card + CardBody + IconPlate  About principles
//   Tier 3, bare      no card at all               How It Works, Who It's For

import React from "react";

import { cn } from "@/lib/utils";
import {
  CursorCard,
  type InternalCursorCardProps,
} from "@/components/ui/cursor-cards";

interface CardProps extends InternalCursorCardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * The tray. Wraps CursorCard rather than reimplementing it: that component
 * already owns the cursor-tracked gradient hairline, the interior spotlight,
 * the coarse-pointer fallback edge and the proximity re-render guard, none of
 * which is worth rebuilding.
 *
 * The internal pointer props are injected by CursorCardsContainer and have to
 * be forwarded down, which is why they are spread rather than destructured.
 * The `acceptsCursorCardProps` marker below is what tells the container this
 * wrapper is willing to receive them.
 */
export function Card({ children, className, ...cursorProps }: CardProps) {
  return (
    <CursorCard
      {...cursorProps}
      lift
      className={cn("rounded-card p-1.5 shadow-card", className)}
    >
      {children}
    </CursorCard>
  );
}

Card.acceptsCursorCardProps = true;

/**
 * The inner core, used when a card has a graphic to show.
 *
 * The fixed height is the single most important measurement in the system. It
 * is what makes every title in a grid start at the same Y position, and what
 * lets Features and Research read as siblings rather than as two unrelated
 * experiments. Do not swap it for an intrinsic height.
 */
export function CardWell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative h-[148px] sm:h-[168px] overflow-hidden rounded-card-inner bg-surface-raised shadow-plate",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Text block, sitting in the tray below the well. */
export function CardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("px-5 pb-5 pt-4", className)}>{children}</div>;
}

/**
 * Tier 2's nested plate. Same surface and same top-edge highlight as CardWell,
 * just at icon scale, so a card with no graphic still belongs to the system.
 *
 * The icon stays dim until the card is hovered. It is a marker, not decoration.
 */
export function IconPlate({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-plate bg-surface-raised shadow-plate ring-1 ring-white/5 text-dim transition-colors duration-300 group-hover:text-muted",
        className
      )}
    >
      {children}
    </span>
  );
}
