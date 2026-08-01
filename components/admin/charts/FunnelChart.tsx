"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import type { FunnelPoint } from "@/lib/admin/metrics";
import { AXIS, GRID, TICK, useThinnedTicks, ChartTooltip } from "./chrome";

// Two series, separated by lightness rather than hue, because the dashboard is
// deliberately achromatic.
//
// Running the palette validator on this pair reports the two failures every
// greyscale palette reports (chroma floor "reads gray", and pure-ish white sits
// outside the categorical lightness band). The checks that decide whether a
// reader can actually tell the series apart both pass by a wide margin: ΔE 41.8
// against a 15 normal-vision floor and an 8 CVD target. Lightness is also the
// one channel every type of color vision deficiency preserves, so this pair is
// more robust than most two-hue pairs, not less.
//
// The rule that greyscale cannot satisfy on its own is that identity must never
// rest on color alone. Hence: a legend, always, plus a direct label on the end
// of each line.
const SIGNED = "#ededed";
const SENT = "#6b6b6b";

function EndLabel(props: {
  x?: number;
  y?: number;
  index?: number;
  value?: number;
  count: number;
  text: string;
  fill: string;
}) {
  const { x, y, index, count, text, fill } = props;
  if (index !== count - 1 || x === undefined || y === undefined) return null;
  return (
    <text
      x={x}
      y={y - 10}
      textAnchor="end"
      fill={fill}
      fontSize={11}
      className="hidden sm:block"
    >
      {text}
    </text>
  );
}

export function FunnelChart({ data }: { data: FunnelPoint[] }) {
  const ticks = useThinnedTicks(data.map((d) => d.label));
  const empty = data.every((d) => d.sent === 0 && d.signed === 0);

  return (
    <div>
      <div className="mb-4 flex items-center gap-5">
        {[
          { label: "Sent", color: SENT },
          { label: "Signed", color: SIGNED },
        ].map((s) => (
          <span key={s.label} className="flex items-center gap-2 text-xs text-muted">
            <span
              className="h-0.5 w-4 rounded-full"
              style={{ background: s.color }}
              aria-hidden
            />
            {s.label}
          </span>
        ))}
      </div>

      <div className="h-[200px] w-full sm:h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 16, right: 8, bottom: 0, left: 4 }}>
            <CartesianGrid {...GRID} />
            <XAxis dataKey="label" ticks={ticks} {...AXIS} tick={TICK} />

            <Tooltip
              cursor={{ stroke: "#2a2a2a", strokeWidth: 1 }}
              content={
                <ChartTooltip
                  format={(v) => String(v)}
                  seriesLabel={(item) => (item.dataKey === "signed" ? "Signed" : "Sent")}
                />
              }
            />

            {/* stepAfter, not a smooth curve: these are discrete weekly counts,
                and interpolating between them would draw values that never
                happened. */}
            <Line
              type="stepAfter"
              dataKey="sent"
              stroke={SENT}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: SENT, stroke: "#000", strokeWidth: 2 }}
              label={(p: object) => (
                <EndLabel {...p} count={data.length} text="Sent" fill={SENT} />
              )}
            />
            <Line
              type="stepAfter"
              dataKey="signed"
              stroke={SIGNED}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: SIGNED, stroke: "#000", strokeWidth: 2 }}
              label={(p: object) => (
                <EndLabel {...p} count={data.length} text="Signed" fill={SIGNED} />
              )}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {empty && (
        <p className="-mt-[130px] text-center text-sm text-dim">
          Nothing sent in the last 8 weeks.
        </p>
      )}
    </div>
  );
}
