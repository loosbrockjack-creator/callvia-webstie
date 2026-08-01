"use client";

import { useEffect, useState, type ReactNode } from "react";

// Shared chart chrome. Axes and grid are deliberately recessive: they are
// scaffolding for reading the marks, not marks themselves.

export const GRID = {
  stroke: "#161616",
  strokeDasharray: "0",
  vertical: false,
} as const;

export const AXIS = {
  axisLine: false,
  tickLine: false,
  dy: 10,
} as const;

export const TICK = { fill: "#555555", fontSize: 12 } as const;

/**
 * Seven date labels collide well before 390px. Rather than rotating them
 * (which is hard to read) or letting recharts drop them unpredictably, keep
 * every other label on narrow screens and always keep the last one, so the
 * axis still says where the series ends.
 */
export function useThinnedTicks(labels: string[]): string[] {
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  if (!narrow || labels.length <= 4) return labels;

  const kept = labels.filter((_, i) => i % 2 === 0);
  const last = labels[labels.length - 1];
  if (!kept.includes(last)) kept.push(last);
  return kept;
}

interface TooltipPayloadItem {
  dataKey?: string | number;
  name?: string | number;
  value?: number | string;
  color?: string;
  stroke?: string;
}

/**
 * Recharts' hover tooltip is also its touch tooltip: a tap fires the same
 * activation, which is what makes these charts inspectable on a phone where
 * there is no hover at all.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  format,
  seriesLabel,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  format: (value: number | string) => string;
  seriesLabel: (item: TooltipPayloadItem) => string;
}): ReactNode {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-line-strong bg-surface-raised px-3 py-2.5 shadow-xl">
      <p className="mb-1.5 text-xs text-dim">{label}</p>
      {payload.map((item, i) => (
        <p key={i} className="flex items-center gap-2 text-sm text-white">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: item.stroke ?? item.color ?? "#8a8a8a" }}
            aria-hidden
          />
          <span className="text-muted">{seriesLabel(item)}</span>
          <span className="ml-auto font-medium tabular-nums">
            {format(item.value ?? 0)}
          </span>
        </p>
      ))}
    </div>
  );
}
