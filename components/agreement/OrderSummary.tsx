import { formatCents } from "@/lib/money";
import type { Schedule } from "@/lib/agreement/types";

// Schedule A, shown above the contract. The client should be able to answer
// "what am I buying and what will I be charged" without reading a clause.
export function OrderSummary({ schedule }: { schedule: Schedule }) {
  const { setupFeeCents, monthlyCents, dueTodayCents, usageTerms } = schedule;

  return (
    <section className="rounded-xl border p-8 mb-16" style={{ borderColor: "#1f1f1f", background: "#0d0d0d" }}>
      <p className="text-xs tracking-widest uppercase mb-4" style={{ color: "#555555" }}>
        Your plan
      </p>

      <h2 className="text-2xl font-light tracking-tight text-white mb-2" style={{ letterSpacing: "-0.025em" }}>
        {schedule.packageName}
      </h2>
      {schedule.packageSummary && (
        <p className="text-base mb-8" style={{ color: "#999999" }}>
          {schedule.packageSummary}
        </p>
      )}

      {schedule.includedItems.length > 0 && (
        <>
          <p className="text-xs tracking-widest uppercase mb-4" style={{ color: "#555555" }}>
            What is included
          </p>
          <ul className="space-y-2.5 mb-8">
            {schedule.includedItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-base" style={{ color: "#999999" }}>
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: "#7c5cfc" }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {usageTerms && (
        <p className="text-sm mb-8" style={{ color: "#555555" }}>
          Includes {usageTerms.includedMinutes.toLocaleString("en-US")} minutes per month. Additional
          usage is billed at {formatCents(usageTerms.overageCentsPerMinute)} per minute.
        </p>
      )}

      <div className="border-t pt-6" style={{ borderColor: "#1f1f1f" }}>
        {setupFeeCents > 0 && (
          <div className="flex justify-between items-baseline mb-3">
            <span className="text-base" style={{ color: "#999999" }}>
              {schedule.setupFeeLabel}
            </span>
            <span className="text-base text-white tabular-nums">{formatCents(setupFeeCents)}</span>
          </div>
        )}
        {monthlyCents > 0 && (
          <div className="flex justify-between items-baseline mb-3">
            <span className="text-base" style={{ color: "#999999" }}>
              {schedule.monthlyLabel}
            </span>
            <span className="text-base text-white tabular-nums">
              {formatCents(monthlyCents)}
              <span style={{ color: "#555555" }}> / month</span>
            </span>
          </div>
        )}
        <div className="flex justify-between items-baseline pt-4 mt-4 border-t" style={{ borderColor: "#1f1f1f" }}>
          <span className="text-base text-white font-medium">Due today</span>
          <span className="text-2xl font-light text-white tabular-nums" style={{ letterSpacing: "-0.025em" }}>
            {formatCents(dueTodayCents)}
          </span>
        </div>
        {monthlyCents > 0 && (
          <p className="text-sm mt-3" style={{ color: "#555555" }}>
            Then {formatCents(monthlyCents)} per month until you cancel.
          </p>
        )}
      </div>
    </section>
  );
}
