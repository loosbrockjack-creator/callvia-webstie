"use client";

import Link from "next/link";
import { DataTable, type Column } from "./ui/DataTable";
import { Badge } from "./ui/Badge";

export interface AdminClient {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string | null;
  createdAt: string;
  agreementCount: number;
  trialCount: number;
  hasActive: boolean;
}

function formatPhone(digits: string | null): string {
  if (!digits || digits.length !== 10) return digits ?? "—";
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function ClientTable({ clients }: { clients: AdminClient[] }) {
  const columns: Column<AdminClient>[] = [
    {
      key: "business",
      header: "Business",
      mobile: "title",
      sortValue: (c) => c.businessName.toLowerCase(),
      cell: (c) => (
        <Link href={`/admin/clients/${c.id}`} className="group block min-w-0">
          <span className="block truncate font-medium text-white group-hover:text-accent-hover">
            {c.businessName}
          </span>
          <span className="block truncate text-xs text-dim">{c.contactName}</span>
        </Link>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      cell: (c) => (
        <span className="block min-w-0">
          <span className="block truncate">{c.email}</span>
          <span className="block text-xs text-dim">{formatPhone(c.phone)}</span>
        </span>
      ),
    },
    {
      key: "agreements",
      header: "Agreements",
      className: "tabular-nums",
      sortValue: (c) => c.agreementCount,
      cell: (c) => (
        <span>
          {c.agreementCount}
          {c.trialCount > 0 && <span className="text-dim"> + {c.trialCount} trial</span>}
        </span>
      ),
    },
    {
      key: "state",
      header: "State",
      mobile: "trailing",
      sortValue: (c) => (c.hasActive ? 0 : 1),
      cell: (c) =>
        c.hasActive ? <Badge tone="success">Active</Badge> : <Badge tone="neutral">No plan</Badge>,
    },
    {
      key: "actions",
      header: "",
      mobile: "actions",
      className: "text-right",
      cell: (c) => (
        <Link
          href={`/admin/clients/${c.id}`}
          className="inline-flex min-h-[38px] items-center px-2 text-sm text-muted transition-colors hover:text-white"
        >
          Open
        </Link>
      ),
    },
  ];

  return (
    <DataTable
      rows={clients}
      columns={columns}
      rowKey={(c) => c.id}
      searchText={(c) => `${c.businessName} ${c.contactName} ${c.email} ${c.phone ?? ""}`}
      searchPlaceholder="Search by business, contact, email, or phone"
      filter={{
        label: "State",
        options: [
          { value: "active", label: "Active" },
          { value: "inactive", label: "No plan" },
        ],
        match: (c, v) => (v === "active" ? c.hasActive : !c.hasActive),
      }}
      emptyTitle="No clients yet."
      emptyHint="A client record is created the first time you send them an agreement."
    />
  );
}
