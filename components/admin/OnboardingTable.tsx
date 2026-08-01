"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { DataTable, type Column } from "./ui/DataTable";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Modal } from "./ui/overlays";
import { Checkbox, Input } from "./ui/form";
import { useToast } from "./ui/Toast";

export interface AdminOnboarding {
  id: string;
  businessName: string | null;
  contactName: string | null;
  email: string;
  status: "sent" | "viewed" | "submitted" | "void";
  clientId: string | null;
  createdAt: string;
  sentAt: string | null;
  submittedAt: string | null;
  viewCount: number;
  answerCount: number;
}

const STATUS: Record<
  AdminOnboarding["status"],
  { label: string; tone: Parameters<typeof Badge>[0]["tone"] }
> = {
  sent: { label: "Sent", tone: "info" },
  viewed: { label: "Opened", tone: "accent" },
  submitted: { label: "Submitted", tone: "success" },
  void: { label: "Void", tone: "neutral" },
};

function shortDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function OnboardingTable({ forms }: { forms: AdminOnboarding[] }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [sendNow, setSendNow] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, businessName, contactName, sendNow }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not create the form.");
        setSubmitting(false);
        return;
      }
      if (data.emailed) toast.success(`Sent to ${email}.`, data.url);
      else toast.info("Created. Copy this link now, it cannot be shown again.", data.url);

      setOpen(false);
      setSubmitting(false);
      window.location.reload();
    } catch {
      setError("Network error. Try again.");
      setSubmitting(false);
    }
  }

  async function resend(f: AdminOnboarding) {
    setBusyId(f.id);
    try {
      const res = await fetch(`/api/admin/onboarding/${f.id}/send`, { method: "POST" });
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

  const columns: Column<AdminOnboarding>[] = [
    {
      key: "who",
      header: "Sent to",
      mobile: "title",
      sortValue: (f) => (f.businessName ?? f.email).toLowerCase(),
      cell: (f) => (
        <Link href={`/admin/onboarding/${f.id}`} className="group block min-w-0">
          <span className="block truncate font-medium text-white group-hover:text-accent-hover">
            {f.businessName ?? f.contactName ?? f.email}
          </span>
          <span className="block truncate text-xs text-dim">{f.email}</span>
        </Link>
      ),
    },
    {
      key: "status",
      header: "Status",
      mobile: "trailing",
      sortValue: (f) => f.status,
      cell: (f) => <Badge tone={STATUS[f.status].tone}>{STATUS[f.status].label}</Badge>,
    },
    {
      key: "answers",
      header: "Answers",
      className: "tabular-nums",
      sortValue: (f) => f.answerCount,
      cell: (f) =>
        f.answerCount === 0 ? <span className="text-faint">—</span> : `${f.answerCount} filled`,
    },
    {
      key: "views",
      header: "Views",
      className: "tabular-nums",
      sortValue: (f) => f.viewCount,
      cell: (f) => (f.viewCount === 0 ? <span className="text-faint">0</span> : f.viewCount),
    },
    {
      key: "sent",
      header: "Sent",
      className: "whitespace-nowrap",
      sortValue: (f) => f.sentAt ?? f.createdAt,
      cell: (f) => shortDate(f.sentAt ?? f.createdAt),
    },
    {
      key: "actions",
      header: "",
      mobile: "actions",
      className: "text-right",
      cell: (f) => (
        <span className="flex flex-wrap items-center gap-2 md:justify-end">
          {f.status !== "submitted" && f.status !== "void" && (
            <Button size="sm" onClick={() => resend(f)} loading={busyId === f.id}>
              Resend
            </Button>
          )}
          <Link
            href={`/admin/onboarding/${f.id}`}
            className="inline-flex min-h-[38px] items-center px-2 text-sm text-muted transition-colors hover:text-white"
          >
            {f.status === "submitted" ? "View answers" : "Details"}
          </Link>
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          {forms.length} {forms.length === 1 ? "form" : "forms"}
          {forms.filter((f) => f.status === "submitted").length > 0 && (
            <span className="text-success">
              {" "}
              · {forms.filter((f) => f.status === "submitted").length} submitted
            </span>
          )}
        </p>
        <Button variant="primary" icon={<Plus size={16} />} onClick={() => setOpen(true)}>
          Send onboarding form
        </Button>
      </div>

      <DataTable
        rows={forms}
        columns={columns}
        rowKey={(f) => f.id}
        searchText={(f) => `${f.businessName ?? ""} ${f.contactName ?? ""} ${f.email}`}
        searchPlaceholder="Search by business, contact, or email"
        filter={{
          label: "Status",
          options: Object.entries(STATUS).map(([value, v]) => ({ value, label: v.label })),
          match: (f, v) => f.status === v,
        }}
        emptyTitle="No onboarding forms yet."
        emptyHint="Send one when you close a client, to collect what you need to build their agent."
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Send an onboarding form"
        description="Goes to any email. If it matches a client already in the system, the answers attach to them automatically."
      >
        <form onSubmit={create} className="flex flex-col gap-5" noValidate>
          <Input
            label="Email"
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Business name"
              optional
              hint="Prefills their form."
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              autoComplete="organization"
            />
            <Input
              label="Contact name"
              optional
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <Checkbox
            checked={sendNow}
            onChange={(e) => setSendNow(e.target.checked)}
            label="Email the form to them now."
          />

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" variant="primary" loading={submitting} className="sm:self-start">
            {sendNow ? "Create and send" : "Create link only"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
