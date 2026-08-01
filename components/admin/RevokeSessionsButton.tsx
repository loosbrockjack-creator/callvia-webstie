"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "./ui/Button";
import { ConfirmDialog } from "./ui/overlays";
import { useToast } from "./ui/Toast";

// Admin force-logout for one client. Confirms first because it invalidates
// every device the client is currently logged in on.
export function RevokeSessionsButton({ clientId }: { clientId: string }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);

  async function revoke() {
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/revoke-sessions`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Could not log them out.");
        return;
      }
      toast.success(
        `Logged out of ${data.revoked} session${data.revoked === 1 ? "" : "s"}.`,
      );
      setOpen(false);
    } catch {
      toast.error("Network error.");
    }
  }

  return (
    <>
      <Button size="sm" icon={<LogOut size={14} />} onClick={() => setOpen(true)}>
        Force log out
      </Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={revoke}
        title="Log this client out of all devices?"
        description="Every session they have open is ended immediately. They can log back in any time with a fresh link."
        confirmLabel="Log them out"
        destructive
      />
    </>
  );
}
