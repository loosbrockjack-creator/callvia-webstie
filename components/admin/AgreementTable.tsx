"use client";

import { useState } from "react";
import Link from "next/link";
import { formatCents } from "@/lib/money";
import { STATUSES, statusLabel } from "@/lib/agreement/status";
import { DataTable, type Column } from "./ui/DataTable";
import { StatusBadge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { ConfirmDialog } from "./ui/overlays";
import { useToast } from "./ui/Toast";
import type { AdminAgreement } from "./types";

function shortDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function AgreementTable({ agreements }: { agreements: AdminAgreement[] }) {
  const toast = useToast();
  const [voiding, setVoiding] = useState<AdminAgreement | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function resend(a: AdminAgreement) {
    setBusyId(a.id);
    try {
      const res = await fetch(`/api/admin/agreements/${a.id}/send`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (data.url) {
        // Best effort: clipboard access can be denied, and the link is shown in
        // the toast either way so it is never lost.
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

  async function confirmVoid(reason: string) {
    if (!voiding) return;
    const res = await fetch(`/api/admin/agreements/${voiding.id}/void`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    if (res.ok) {
      toast.success(`Voided ${voiding.businessName}.`);
      setVoiding(null);
      window.location.reload();
    } else {
      toast.error("Could not void.");
    }
  }

  const columns: Column<AdminAgreement>[] = [
    {
      key: "client",
      header: "Client",
      mobile: "title",
      sortValue: (a) => a.businessName.toLowerCase(),
      cell: (a) => (
        <Link href={`/admin/agreements/${a.id}`} className="group block min-w-0">
          <span className="block truncate font-medium text-white group-hover:text-accent-hover">
            {a.businessName}
          </span>
          <span className="block truncate text-xs text-dim">{a.email}</span>
        </Link>
      ),
    },
    {
      key: "package",
      header: "Package",
      cell: (a) => <span className="truncate">{a.packageName}</span>,
    },
    {
      key: "price",
      header: "Price",
      className: "tabular-nums",
      sortValue: (a) => a.setupFeeCents + a.monthlyCents,
      cell: (a) => (
        <span className="whitespace-nowrap">
          {a.monthlyCents > 0 ? `${formatCents(a.monthlyCents)}/mo` : formatCents(a.setupFeeCents)}
          {a.monthlyCents > 0 && a.setupFeeCents > 0 && (
            <span className="text-dim"> + {formatCents(a.setupFeeCents)}</span>
          )}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      mobile: "trailing",
      sortValue: (a) => a.status,
      cell: (a) => <StatusBadge status={a.status} />,
    },
    {
      key: "views",
      header: "Views",
      className: "tabular-nums",
      sortValue: (a) => a.viewCount,
      cell: (a) => (a.viewCount === 0 ? <span className="text-faint">0</span> : a.viewCount),
    },
    {
      key: "created",
      header: "Created",
      className: "whitespace-nowrap",
      sortValue: (a) => a.createdAt,
      cell: (a) => shortDate(a.createdAt),
    },
    {
      key: "actions",
      header: "",
      mobile: "actions",
      className: "text-right",
      cell: (a) => (
        <span className="flex flex-wrap items-center gap-2 md:justify-end">
          <Button size="sm" onClick={() => resend(a)} loading={busyId === a.id}>
            {a.sentAt ? "Resend" : "Send"}
          </Button>
          {a.status !== "void" && (
            <Button size="sm" variant="ghost" onClick={() => setVoiding(a)}>
              Void
            </Button>
          )}
          <Link
            href={`/admin/agreements/${a.id}`}
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
        rows={agreements}
        columns={columns}
        rowKey={(a) => a.id}
        searchText={(a) => `${a.businessName} ${a.contactName} ${a.email} ${a.packageName}`}
        searchPlaceholder="Search by business, contact, or email"
        filter={{
          label: "Status",
          options: STATUSES.map((s) => ({ value: s, label: statusLabel(s) })),
          match: (a, v) => a.status === v,
        }}
        emptyTitle="No agreements yet."
        emptyHint="Create one to send a client their contract."
      />

      <ConfirmDialog
        open={voiding !== null}
        onClose={() => setVoiding(null)}
        onConfirm={confirmVoid}
        title={`Void the agreement for ${voiding?.businessName ?? ""}?`}
        description="The record and any signed PDF are kept. The link stops working."
        confirmLabel="Void agreement"
        destructive
        reasonLabel="Reason"
      />
    </>
  );
}
