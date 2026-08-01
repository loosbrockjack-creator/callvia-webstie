"use client";

import { useState } from "react";
import Link from "next/link";
import { PACKAGES } from "@/lib/packages";
import { formatTrialDate } from "@/lib/agreement/render";
import { DataTable, type Column } from "./ui/DataTable";
import { Badge, StatusBadge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Modal } from "./ui/overlays";
import { Input, Select } from "./ui/form";
import { useToast } from "./ui/Toast";
import type { AdminAgreement } from "./types";

// Derived from the trial's dates, not from its status. A trial's terminal
// status is 'signed'; whether it is running, ending, or over is a question
// about today's date, so it is answered at read time rather than stored.
const TRIAL_STATE: Record<string, { label: string; tone: Parameters<typeof Badge>[0]["tone"] }> = {
  unsigned: { label: "Not signed", tone: "info" },
  running: { label: "Running", tone: "success" },
  ending: { label: "Ending soon", tone: "warning" },
  ended: { label: "Ended", tone: "danger" },
  converted: { label: "Converted", tone: "accent" },
};

function dollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function TrialTable({ trials }: { trials: AdminAgreement[] }) {
  const toast = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [converting, setConverting] = useState<AdminAgreement | null>(null);
  const [packageKey, setPackageKey] = useState(PACKAGES[0]?.key ?? "");
  const [setupFee, setSetupFee] = useState("0.00");
  const [monthly, setMonthly] = useState(dollars(PACKAGES[0]?.monthlyCents ?? 0));
  const [convertError, setConvertError] = useState<string | null>(null);
  const [convertBusy, setConvertBusy] = useState(false);

  function openConvert(t: AdminAgreement) {
    const p = PACKAGES[0];
    setPackageKey(p?.key ?? "");
    setSetupFee(dollars(p?.setupFeeCents ?? 0));
    setMonthly(dollars(p?.monthlyCents ?? 0));
    setConvertError(null);
    setConverting(t);
  }

  function applyPackage(key: string) {
    setPackageKey(key);
    const p = PACKAGES.find((x) => x.key === key);
    if (!p) return;
    setSetupFee(dollars(p.setupFeeCents));
    setMonthly(dollars(p.monthlyCents));
  }

  async function resend(t: AdminAgreement) {
    setBusyId(t.id);
    try {
      const res = await fetch(`/api/admin/agreements/${t.id}/send`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (data.url) {
        await navigator.clipboard.writeText(data.url).catch(() => {});
        if (data.emailed) toast.success("Sent, and the link is on your clipboard.", data.url);
        else toast.error("Email did not send. Copy this link.", data.url);
      } else {
        toast.error(data.error ?? "Could not send.");
      }
    } finally {
      setBusyId(null);
    }
  }

  async function doConvert() {
    if (!converting) return;
    setConvertBusy(true);
    setConvertError(null);
    try {
      const res = await fetch(`/api/admin/agreements/${converting.id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageKey, setupFee, monthly }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setConvertError(data.error ?? "Could not convert.");
        setConvertBusy(false);
        return;
      }
      toast.success(
        `Created a paid agreement for ${converting.businessName}. Review it, then send.`,
      );
      window.location.href = `/admin/agreements/${data.id}`;
    } catch {
      setConvertError("Network error. Try again.");
      setConvertBusy(false);
    }
  }

  const columns: Column<AdminAgreement>[] = [
    {
      key: "client",
      header: "Client",
      mobile: "title",
      sortValue: (t) => t.businessName.toLowerCase(),
      cell: (t) => (
        <Link href={`/admin/agreements/${t.id}`} className="group block min-w-0">
          <span className="block truncate font-medium text-white group-hover:text-accent-hover">
            {t.businessName}
          </span>
          <span className="block truncate text-xs text-dim">{t.email}</span>
        </Link>
      ),
    },
    {
      key: "window",
      header: "Trial window",
      className: "whitespace-nowrap",
      sortValue: (t) => t.trialEndsOn ?? "",
      cell: (t) =>
        t.trialStartsOn && t.trialEndsOn ? (
          <span>
            {formatTrialDate(t.trialStartsOn)}
            <span className="text-dim"> to </span>
            {formatTrialDate(t.trialEndsOn)}
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "left",
      header: "Time left",
      className: "tabular-nums whitespace-nowrap",
      sortValue: (t) => t.trialDaysLeft ?? 9999,
      cell: (t) => {
        if (t.trialState === "converted") return <span className="text-dim">converted</span>;
        if (t.trialDaysLeft === null) return "—";
        if (t.trialDaysLeft < 0) {
          const d = Math.abs(t.trialDaysLeft);
          return <span className="text-danger">ended {d === 0 ? "today" : `${d}d ago`}</span>;
        }
        if (t.trialDaysLeft === 0) return <span className="text-warning">ends today</span>;
        return (
          <span className={t.trialDaysLeft <= 7 ? "text-warning" : undefined}>
            {t.trialDaysLeft}d
          </span>
        );
      },
    },
    {
      key: "state",
      header: "State",
      mobile: "trailing",
      sortValue: (t) => t.trialState ?? "",
      cell: (t) => {
        const s = t.trialState ? TRIAL_STATE[t.trialState] : null;
        if (!s) return <StatusBadge status={t.status} />;
        return <Badge tone={s.tone}>{s.label}</Badge>;
      },
    },
    {
      key: "actions",
      header: "",
      mobile: "actions",
      className: "text-right",
      cell: (t) => (
        <span className="flex flex-wrap items-center gap-2 md:justify-end">
          {t.trialState === "unsigned" && (
            <Button size="sm" onClick={() => resend(t)} loading={busyId === t.id}>
              {t.sentAt ? "Resend" : "Send"}
            </Button>
          )}
          {t.convertedToAgreementId ? (
            <Link
              href={`/admin/agreements/${t.convertedToAgreementId}`}
              className="inline-flex min-h-[38px] items-center px-2 text-sm text-muted transition-colors hover:text-white"
            >
              View agreement
            </Link>
          ) : (
            t.trialState !== "unsigned" && (
              <Button size="sm" variant="primary" onClick={() => openConvert(t)}>
                Convert to paid
              </Button>
            )
          )}
          <Link
            href={`/admin/agreements/${t.id}`}
            className="inline-flex min-h-[38px] items-center px-2 text-sm text-muted transition-colors hover:text-white"
          >
            Details
          </Link>
        </span>
      ),
    },
  ];

  return (
    <>
      <DataTable
        rows={trials}
        columns={columns}
        rowKey={(t) => t.id}
        searchText={(t) => `${t.businessName} ${t.contactName} ${t.email}`}
        searchPlaceholder="Search by business, contact, or email"
        filter={{
          label: "State",
          options: Object.entries(TRIAL_STATE).map(([value, v]) => ({ value, label: v.label })),
          match: (t, v) => t.trialState === v,
        }}
        emptyTitle="No trials yet."
        emptyHint="Send one to let a client try the receptionist before they buy."
      />

      <Modal
        open={converting !== null}
        onClose={() => setConverting(null)}
        title={`Convert ${converting?.businessName ?? ""} to paid`}
        description="Creates a new service agreement with their details already filled in. Nothing is sent until you send it."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConverting(null)} disabled={convertBusy}>
              Cancel
            </Button>
            <Button variant="primary" onClick={doConvert} loading={convertBusy}>
              Create agreement
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <Select label="Package" value={packageKey} onChange={(e) => applyPackage(e.target.value)}>
            <option value="">Custom (no package)</option>
            {PACKAGES.map((p) => (
              <option key={p.key} value={p.key}>
                {p.name}
              </option>
            ))}
          </Select>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Setup fee ($)"
              inputMode="decimal"
              value={setupFee}
              onChange={(e) => setSetupFee(e.target.value)}
            />
            <Input
              label="Monthly ($)"
              inputMode="decimal"
              value={monthly}
              onChange={(e) => setMonthly(e.target.value)}
            />
          </div>
          {convertError && <p className="text-sm text-danger">{convertError}</p>}
        </div>
      </Modal>
    </>
  );
}
