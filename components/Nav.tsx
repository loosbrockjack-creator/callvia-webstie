"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { VariableFontHover } from "@/components/ui/variable-font-hover";
import { FlowButton } from "@/components/ui/flow-button";
import { NAV_LINK_GROUPS, type NavLinkGroup } from "@/lib/nav-links";

const HOME_LINK = { label: "Home", href: "/" };

// Product/Company mirror the footer's link taxonomy (single source of truth
// in lib/nav-links.ts). Company drops Build/Login since those already have
// their own buttons in the right cluster.
const DESKTOP_GROUPS: NavLinkGroup[] = NAV_LINK_GROUPS.filter(
  (g) => g.label === "Product" || g.label === "Company"
).map((g) =>
  g.label === "Company"
    ? { ...g, links: g.links.filter((l) => l.href !== "/build" && l.href !== "/login") }
    : g
);

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hash, setHash] = useState("");
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);

  // pathname alone can't distinguish "/#how-it-works" from "/#demo" from plain
  // "/" — they all resolve to the same route. Scroll-spy instead: whichever
  // section's top has scrolled past the fixed nav is the active one, so the
  // active state follows what's actually in view, not just the last click.
  useEffect(() => {
    if (pathname !== "/") return;

    const NAV_HEIGHT = 64; // matches h-16 on <nav>
    const sectionIds = ["how-it-works", "demo"];

    let frame = 0;
    const updateActiveSection = () => {
      let current = "";
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= NAV_HEIGHT) {
          current = id;
        }
      }
      setHash(current ? `#${current}` : "");
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  // Close any open menu on navigation, and let Escape dismiss a dropdown.
  useEffect(() => {
    setOpen(false);
    setOpenGroup(null);
    setOpenMobileGroup(null);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenGroup(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) => {
    const [path, rawHash] = href.split("#");
    const pathMatches = path === "/" ? pathname === "/" : pathname.startsWith(path);
    if (!pathMatches) return false;
    const targetHash = rawHash ? `#${rawHash}` : "";
    return targetHash === hash;
  };

  const isGroupActive = (group: NavLinkGroup) => group.links.some((l) => isActive(l.href));

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-black/80 backdrop-blur-md border-b border-white/5">
      <div className="relative max-w-6xl mx-auto h-full px-6 flex items-center justify-between">
        {/* Left cluster: primary nav */}
        <div className="hidden lg:flex items-center gap-7">
          <a href={HOME_LINK.href} className="text-sm transition-colors duration-200">
            <VariableFontHover
              label={HOME_LINK.label}
              fromFontVariationSettings="'wght' 400"
              toFontVariationSettings="'wght' 700"
              staggerFrom="center"
              staggerDuration={0.03}
              active={isActive(HOME_LINK.href)}
              className={isActive(HOME_LINK.href) ? "text-white" : "text-white/50 hover:text-white"}
            />
          </a>

          {DESKTOP_GROUPS.map((group) => {
            const active = isGroupActive(group) || openGroup === group.label;
            return (
              <div
                key={group.label}
                className="relative"
                onMouseEnter={() => setOpenGroup(group.label)}
                onMouseLeave={() => setOpenGroup((g) => (g === group.label ? null : g))}
              >
                <button
                  type="button"
                  className={`flex items-center gap-1 text-sm transition-colors duration-200 ${
                    active ? "text-white" : "text-white/50 hover:text-white"
                  }`}
                >
                  {group.label}
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      openGroup === group.label ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {openGroup === group.label && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className="absolute left-0 top-full pt-3 w-60"
                    >
                      <div
                        className="rounded-2xl border p-2 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
                        style={{ background: "#0d0d0d", borderColor: "#1f1f1f" }}
                      >
                        {group.links.map((link) => (
                          <a
                            key={link.href}
                            href={link.href}
                            className="block px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors duration-150"
                          >
                            {link.title}
                          </a>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Wordmark, absolutely centered so uneven side widths can't skew it */}
        <a
          href="/"
          className="absolute left-1/2 -translate-x-1/2 flex items-center"
          onClick={() => setOpen(false)}
        >
          <span
            className="text-white font-[200] uppercase"
            style={{ fontSize: "13px", letterSpacing: "0.22em" }}
          >
            Callvia
          </span>
        </a>

        {/* Right cluster: account actions */}
        <div className="hidden lg:flex items-center gap-4">
          <a
            href="/login"
            className={`text-sm transition-colors duration-200 ${
              isActive("/login") ? "text-white" : "text-white/60 hover:text-white"
            }`}
          >
            Login
          </a>
          <span className="h-4 w-px bg-white/10" />
          <FlowButton href="/build" variant="accent" size="sm">
            Build My Receptionist
          </FlowButton>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="ml-auto lg:hidden flex flex-col justify-center items-center w-9 h-9 gap-[5px]"
        >
          <span
            className={`block w-5 h-px bg-white/70 transition-transform duration-200 ${open ? "translate-y-[6px] rotate-45" : ""}`}
          />
          <span className={`block w-5 h-px bg-white/70 transition-opacity duration-200 ${open ? "opacity-0" : ""}`} />
          <span
            className={`block w-5 h-px bg-white/70 transition-transform duration-200 ${open ? "-translate-y-[6px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden absolute top-16 left-0 right-0 bg-black border-b border-white/5"
          >
            <div className="flex flex-col px-6 py-4">
              <a
                href={HOME_LINK.href}
                onClick={() => setOpen(false)}
                className={`py-2.5 text-sm border-b border-white/5 transition-colors duration-200 ${
                  isActive(HOME_LINK.href) ? "text-white" : "text-white/60"
                }`}
              >
                {HOME_LINK.label}
              </a>

              {DESKTOP_GROUPS.map((group) => (
                <div key={group.label} className="border-b border-white/5">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMobileGroup((g) => (g === group.label ? null : group.label))
                    }
                    className={`w-full flex items-center justify-between py-2.5 text-sm transition-colors duration-200 ${
                      isGroupActive(group) ? "text-white" : "text-white/60"
                    }`}
                  >
                    {group.label}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        openMobileGroup === group.label ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openMobileGroup === group.label && (
                    <div className="pb-2.5 pl-3 flex flex-col gap-1">
                      {group.links.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className="py-1.5 text-sm text-white/50 hover:text-white transition-colors duration-200"
                        >
                          {link.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="mt-4 flex flex-col gap-2">
                <FlowButton
                  href="/login"
                  variant="neutral"
                  size="sm"
                  onClick={() => setOpen(false)}
                  className="justify-center"
                  showArrow={false}
                >
                  Login
                </FlowButton>
                <FlowButton
                  href="/build"
                  variant="accent"
                  size="sm"
                  onClick={() => setOpen(false)}
                  className="justify-center"
                >
                  Build My Receptionist
                </FlowButton>
                <p className="mt-1 text-center text-xs text-white/30">
                  Everyone gets a free trial. If it doesn&#39;t pay for itself, you walk away.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
