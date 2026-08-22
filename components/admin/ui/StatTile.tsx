import type { ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { BentoCell } from "./bento";
import { cn } from "@/lib/utils";

// A headline number is not a chart. Label, value, then a delta line that says
// what the number is being compared against, because a percentage with no
// baseline is decoration.

export function TrendPill({
  pct,
  className,
}: {
  pct: number;
  className?: string;
}) {
  const up = pct >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium tabular-nums",
        up ? "text-success" : "text-danger",
        className
      )}
      style={{
        background: up ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
      }}
    >
      {up ? "↗" : "↘"} {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

export function StatTile({
  label,
  value,
  deltaPct,
  deltaLabel = "vs last week",
  hint,
  icon,
}: {
  label: string;
  value: string;
  /** null hides the delta row entirely: no baseline, no claim. */
  deltaPct?: number | null;
  deltaLabel?: string;
  /** Shown in place of a delta when a comparison is not meaningful. */
  hint?: string;
  /** A small neutral icon plate, top-right. Decoration only, never a signal. */
  icon?: ReactNode;
}) {
  const up = (deltaPct ?? 0) >= 0;
  const Chevron = up ? ChevronUp : ChevronDown;

  return (
    <BentoCell className="flex flex-col justify-between gap-5 sm:gap-6">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted">{label}</p>
        {icon && (
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-raised text-dim"
            aria-hidden
          >
            {icon}
          </span>
        )}
      </div>
      <div>
        {/* Steps down on small screens so a value like $18,290 never wraps
            mid-number in the 2-up mobile grid. */}
        <p className="text-[28px] font-semibold leading-none tracking-tight text-white tabular-nums sm:text-[34px] lg:text-[40px]">
          {value}
        </p>
        {deltaPct !== null && deltaPct !== undefined ? (
          <p className="mt-3 flex items-center gap-1 text-sm">
            <Chevron
              size={14}
              className={up ? "text-success" : "text-danger"}
              aria-hidden
            />
            <span
              className={cn("font-medium tabular-nums", up ? "text-success" : "text-danger")}
            >
              {Math.abs(deltaPct).toFixed(1)}%
            </span>
            <span className="text-muted">{deltaLabel}</span>
          </p>
        ) : (
          <p className="mt-3 text-sm text-dim">{hint ?? " "}</p>
        )}
      </div>
    </BentoCell>
  );
}
