"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Menu, PanelLeft } from "lucide-react";
import { Sheet } from "./ui/overlays";
import { IconButton } from "./ui/Button";
import { ToastProvider } from "./ui/Toast";
import { WaveformMark } from "@/components/WaveformMark";
import { cn } from "@/lib/utils";

// The rail is typographic. A stock icon next to every destination added no
// information (five glyphs that all mean "a list of things") and read as
// decoration; the active row is marked with an accent rule instead.
interface NavItem {
  href: string;
  label: string;
}

const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: "Workspace",
    items: [
      { href: "/admin", label: "Overview" },
      { href: "/admin/clients", label: "Clients" },
    ],
  },
  {
    group: "Pipeline",
    items: [
      { href: "/admin/agreements", label: "Agreements" },
      { href: "/admin/trials", label: "Trials" },
      { href: "/admin/onboarding", label: "Onboarding" },
    ],
  },
];

const ALL_ITEMS = NAV.flatMap((g) => g.items);

// /admin must match exactly or it would light up for every child route, but
// /admin/agreements should stay active on /admin/agreements/<id>.
function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function currentTitle(pathname: string): string {
  const match = [...ALL_ITEMS]
    .sort((a, b) => b.href.length - a.href.length)
    .find((i) => isActive(pathname, i.href));
  return match?.label ?? "Admin";
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-7 px-3">
      {NAV.map((group) => (
        <div key={group.group}>
          <p className="mb-2 px-3 text-xs font-medium tracking-wide text-dim">{group.group}</p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href} className="relative">
                  {/* Sits at the rail's own left edge, outside the pill, so the
                      accent reads as a margin marker rather than as a fill. */}
                  {active && (
                    <span
                      className="absolute -left-3 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full bg-accent"
                      aria-hidden
                    />
                  )}
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-[44px] items-center rounded-lg px-3 text-[15px] transition-colors duration-200",
                      active
                        ? "bg-surface-raised font-medium text-white"
                        : "text-muted hover:bg-surface hover:text-white"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <>
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-line px-6">
        <WaveformMark size={18} compact />
        <span className="text-lg font-semibold tracking-tight text-white">Callvia</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-6">
        <NavLinks onNavigate={onNavigate} />
      </div>

      <div className="shrink-0 border-t border-line p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <a
          href="https://callvia.io"
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[44px] items-center justify-between gap-3 rounded-lg px-3 text-sm text-muted transition-colors hover:bg-surface hover:text-white"
        >
          View site
          <span className="text-dim" aria-hidden>
            &#8599;
          </span>
        </a>
        <button
          onClick={signOut}
          className="flex min-h-[44px] w-full items-center rounded-lg px-3 text-sm text-muted transition-colors hover:bg-surface hover:text-white"
        >
          Sign out
        </button>
        <p className="px-3 pt-3 text-xs text-faint">&copy; {new Date().getFullYear()} Callvia</p>
      </div>
    </>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Read after mount rather than during render: reading localStorage while
  // rendering would make the server and client markup disagree.
  useEffect(() => {
    setCollapsed(window.localStorage.getItem("cv_admin_nav_collapsed") === "1");
  }, []);

  function toggleCollapsed() {
    setCollapsed((c) => {
      const next = !c;
      window.localStorage.setItem("cv_admin_nav_collapsed", next ? "1" : "0");
      return next;
    });
  }

  // Close the drawer on navigation, including a back/forward that changes route
  // without the link handler firing.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const label = currentTitle(pathname);

  return (
    <ToastProvider>
      <div className="flex min-h-[100dvh] bg-black text-white">
        {/* Persistent rail from md up. */}
        <aside
          className={cn(
            "hidden shrink-0 flex-col border-r border-line md:flex",
            collapsed ? "md:hidden" : "w-[230px]"
          )}
        >
          <SidebarBody />
        </aside>

        {/* Drawer below md. */}
        <Sheet open={drawerOpen} onClose={() => setDrawerOpen(false)} label="Admin navigation">
          <SidebarBody onNavigate={() => setDrawerOpen(false)} />
        </Sheet>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-black/90 px-4 backdrop-blur-sm sm:px-6">
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation"
              className="-ml-1 rounded-lg p-2.5 text-muted transition-colors hover:bg-surface hover:text-white md:hidden"
            >
              <Menu size={20} />
            </button>
            <button
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Show navigation" : "Hide navigation"}
              className="-ml-1 hidden rounded-lg p-2.5 text-muted transition-colors hover:bg-surface hover:text-white md:block"
            >
              <PanelLeft size={18} />
            </button>

            <div className="flex min-w-0 items-center">
              <h1 className="truncate text-[15px] font-medium text-white">{label}</h1>
            </div>

            <div className="ml-auto">
              <IconButton
                label="Open callvia.io"
                icon={<ExternalLink size={16} />}
                onClick={() => window.open("https://callvia.io", "_blank", "noopener,noreferrer")}
              />
            </div>
          </header>

          <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
