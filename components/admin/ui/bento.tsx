import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// The admin reads as one ruled surface rather than a scatter of floating cards.
//
// The hairlines between cells are the grid's own background showing through a
// 1px gap, not borders on the children. That matters for mobile: when the grid
// reflows from four columns to two to one, the dividers turn from vertical to
// horizontal on their own. Per-child border classes would need a rule for every
// cell at every breakpoint, and would be wrong the moment a row has an odd
// number of items.

export function BentoGrid({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid gap-px overflow-hidden rounded-xl border bg-line border-line",
        "grid-cols-1",
        className
      )}
    >
      {children}
    </div>
  );
}

export function BentoCell({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("bg-black p-5 sm:p-6", className)}>{children}</div>;
}

// Panel header: bold title, optional trend pill inline with it, one grey line
// of subtitle underneath. Matches the reference's "Net revenue [66.9%]" block.
export function PanelHeader({
  title,
  subtitle,
  trend,
  action,
}: {
  title: string;
  subtitle?: string;
  trend?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="text-base font-semibold tracking-tight text-white sm:text-lg">
            {title}
          </h2>
          {trend}
        </div>
        {subtitle && (
          <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  hint,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      {icon && <div className="mb-4 text-faint">{icon}</div>}
      <p className="text-sm text-muted">{title}</p>
      {hint && <p className="mt-1.5 text-xs text-dim">{hint}</p>}
    </div>
  );
}
