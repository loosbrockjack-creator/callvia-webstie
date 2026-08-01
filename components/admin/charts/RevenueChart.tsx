"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { formatCents } from "@/lib/money";
import type { RevenuePoint } from "@/lib/admin/metrics";
import { AXIS, GRID, TICK, useThinnedTicks, ChartTooltip } from "./chrome";

// One series measuring magnitude over time, so: bars, one hue, no legend (the
// panel title names the series), recessive grid.
export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const ticks = useThinnedTicks(data.map((d) => d.label));
  const empty = data.every((d) => d.cents === 0);

  return (
    <div className="h-[240px] w-full sm:h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
          <defs>
            {/* Light at the top, dark at the baseline. The gradient is
                decoration, not encoding: every bar is the same fill, so
                height alone carries the value. */}
            <linearGradient id="revBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8a8a8a" />
              <stop offset="100%" stopColor="#2e2e2e" />
            </linearGradient>
          </defs>

          <CartesianGrid {...GRID} />
          <XAxis dataKey="label" ticks={ticks} {...AXIS} tick={TICK} />

          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            content={
              <ChartTooltip
                format={(v) => formatCents(Number(v))}
                seriesLabel={() => "Collected"}
              />
            }
          />

          <Bar dataKey="cents" radius={[4, 4, 0, 0]} maxBarSize={56}>
            {data.map((d) => (
              <Cell key={d.label} fill={d.cents === 0 ? "#161616" : "url(#revBar)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {empty && (
        <p className="-mt-[140px] text-center text-sm text-dim">
          No payments collected yet.
        </p>
      )}
    </div>
  );
}
