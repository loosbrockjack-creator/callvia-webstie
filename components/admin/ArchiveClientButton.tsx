"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "./ui/Button";
import { ConfirmDialog } from "./ui/overlays";
import { useToast } from "./ui/Toast";

// Delete (soft-archive) a client from their own detail page. Cascades to
// every agreement, trial, and onboarding form tied to them -- see
// lib/admin/archive.ts. Mirrors RevokeSessionsButton's shape.
export function ArchiveClientButton({
  clientId,
  businessName,
}: {
  clientId: string;
  businessName: string;
}) {
  const toast = useToast();
  const [open, setOpen] = useState(false);

  async function confirmDelete() {
    const res = await fetch(`/api/admin/clients/${clientId}/archive`, { method: "POST" });
    if (res.ok) {
      toast.success(`Deleted ${businessName}.`);
      window.location.href = "/admin/clients";
    } else {
      toast.error("Could not delete.");
    }
  }

  return (
    <>
      <Button size="sm" variant="danger" icon={<Trash2 size={14} />} onClick={() => setOpen(true)}>
        Delete client
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={confirmDelete}
        title={`Delete ${businessName}?`}
        description="This removes the business, and every agreement, trial, and onboarding form tied to it, from your dashboard and analytics. Nothing is permanently erased -- signed contracts stay on file for compliance -- but there's no way to bring it back from here."
        confirmLabel="Delete"
        destructive
      />
    </>
  );
}
