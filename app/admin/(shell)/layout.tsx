import type { ReactNode } from "react";
import { requireAdminPage } from "@/lib/require-admin";
import { AdminShell } from "@/components/admin/AdminShell";

// The (shell) route group exists so this layout can gate on auth without also
// wrapping /admin/login. A layout at app/admin/layout.tsx would run for the
// login page too, and requireAdminPage() would redirect it to itself forever.
//
// The gate is repeated here and in each page rather than trusted to proxy.ts,
// which is defence in depth only.
export default async function AdminShellLayout({ children }: { children: ReactNode }) {
  await requireAdminPage();
  return <AdminShell>{children}</AdminShell>;
}
