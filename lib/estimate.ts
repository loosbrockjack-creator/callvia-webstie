// Shared missed-call revenue estimate math.
// Used by the homepage tool (MissedCallTool) and the /build funnel's cost card
// so the two never show contradicting numbers.

// Average job values per trade.
// HVAC $850 and Plumbing $650 are cited from the CallBird contractor dataset.
// Electrical $500 and GC $1,500 are unverified estimates, not sourced.
export const TRADES = [
  { id: "hvac", label: "HVAC", jobValue: 850 },
  { id: "plumbing", label: "Plumbing", jobValue: 650 },
  { id: "electrical", label: "Electrical", jobValue: 500 },
  { id: "gc", label: "General Contractor", jobValue: 1500 },
] as const;

export type Trade = (typeof TRADES)[number];

// How likely a caller is gone for good after hitting no answer.
// New/prospective callers: sourced (Forbes / BIA Kelsey). Repeat customers who
// already trust you are far less likely to give up, but no published research
// measures that specifically, so it's shown as a conservative-to-moderate
// assumed range rather than a single fake-precise number.
export const NEW_CALLER_CHURN = 0.85; // Forbes / BIA Kelsey
export const REPEAT_CHURN_LOW = 0.1; // assumption
export const REPEAT_CHURN_HIGH = 0.35; // assumption
export const WEEKS_PER_MONTH = 4.33;

export interface EstimateRange {
  missedCallsPerMonth: number;
  repeatShare: number;
  newShare: number;
  lowLostCallers: number;
  highLostCallers: number;
  lowRevenue: number;
  highRevenue: number;
}

// Range narrows to the sourced 85% figure when repeat share is 0 (all new
// callers), and widens as repeat share grows, since that segment's churn
// is an assumed range, not a cited number.
export function estimateRange(
  missedPerWeek: number,
  repeatSharePct: number,
  jobValue: number
): EstimateRange {
  const missedCallsPerMonth = missedPerWeek * WEEKS_PER_MONTH;
  const repeatShare = Math.min(100, Math.max(0, repeatSharePct)) / 100;
  const newShare = 1 - repeatShare;
  const lowChurn = repeatShare * REPEAT_CHURN_LOW + newShare * NEW_CALLER_CHURN;
  const highChurn = repeatShare * REPEAT_CHURN_HIGH + newShare * NEW_CALLER_CHURN;
  const lowLostCallers = missedCallsPerMonth * lowChurn;
  const highLostCallers = missedCallsPerMonth * highChurn;
  return {
    missedCallsPerMonth,
    repeatShare,
    newShare,
    lowLostCallers,
    highLostCallers,
    lowRevenue: lowLostCallers * jobValue,
    highRevenue: highLostCallers * jobValue,
  };
}
