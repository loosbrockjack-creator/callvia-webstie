import type { AgreementStatus } from "@/lib/agreement/status";
import { statusLabel } from "@/lib/agreement/status";
import { cn } from "@/lib/utils";

// Status colors live here rather than in each table, so a status added to
// lib/agreement/status.ts has exactly one place to be styled.
//
// Color never carries the meaning on its own: every badge also prints its
// label. The dot is a secondary cue, not the signal.
type Tone = "neutral" | "info" | "accent" | "warning" | "success" | "danger";

const TONE: Record<Tone, { dot: string; text: string; bg: string }> = {
  neutral: { dot: "#555555", text: "text-dim", bg: "rgba(255,255,255,0.04)" },
  info: { dot: "#999999", text: "text-muted", bg: "rgba(255,255,255,0.06)" },
  accent: { dot: "#9b7ffd", text: "text-accent-hover", bg: "rgba(124,92,252,0.12)" },
  warning: { dot: "#fbbf24", text: "text-warning", bg: "rgba(251,191,36,0.12)" },
  success: { dot: "#4ade80", text: "text-success", bg: "rgba(74,222,128,0.12)" },
  danger: { dot: "#f87171", text: "text-danger", bg: "rgba(248,113,113,0.12)" },
};

const STATUS_TONE: Record<AgreementStatus, Tone> = {
  draft: "neutral",
  sent: "info",
  viewed: "accent",
  signed: "warning",
  payment_pending: "warning",
  active: "success",
  void: "neutral",
  expired: "neutral",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const t = TONE[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium",
        t.text,
        className
      )}
      style={{ background: t.bg }}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ background: t.dot }}
        aria-hidden
      />
      {children}
    </span>
  );
}

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: AgreementStatus;
  /** Override the default wording, e.g. the shorter labels a trial uses. */
  label?: string;
  className?: string;
}) {
  return (
    <Badge tone={STATUS_TONE[status]} className={className}>
      {label ?? statusLabel(status)}
    </Badge>
  );
}
