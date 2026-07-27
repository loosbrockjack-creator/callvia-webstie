"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { VariableFontHover } from "@/components/ui/variable-font-hover";
import { FlowButton } from "@/components/ui/flow-button";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Live Demo", href: "/#demo" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hash, setHash] = useState("");

  // pathname alone can't distinguish "/#how-it-works" from "/#demo" from plain
  // "/" — they all resolve to the same route. Scroll-spy instead: whichever
  // section's top has scrolled past the fixed nav is the active one, so the
  // bold link follows what's actually in view, not just the last click.
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

  const isActive = (href: string) => {
    const [path, rawHash] = href.split("#");
    const pathMatches = path === "/" ? pathname === "/" : pathname.startsWith(path);
    if (!pathMatches) return false;
    const targetHash = rawHash ? `#${rawHash}` : "";
    return targetHash === hash;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-black/80 backdrop-blur-md border-b border-white/5">
      <div className="relative max-w-6xl mx-auto h-full px-6 flex items-center justify-between">
        {/* Wordmark */}
        <a href="/" className="flex items-center" onClick={() => setOpen(false)}>
          <span
            className="text-white font-[200] uppercase"
            style={{ fontSize: "13px", letterSpacing: "0.22em" }}
          >
            Callvia
          </span>
        </a>

        {/* Center links, absolutely centered so uneven side widths can't skew them */}
        <div className="hidden lg:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors duration-200 ${
                isActive(link.href) ? "text-white" : "text-white/50 hover:text-white"
              }`}
            >
              <VariableFontHover
                label={link.label}
                fromFontVariationSettings="'wght' 400"
                toFontVariationSettings="'wght' 700"
                staggerFrom="center"
                staggerDuration={0.03}
                active={isActive(link.href)}
              />
            </a>
          ))}
        </div>

        {/* Right cluster */}
        <div className="hidden lg:flex items-center gap-3">
          <FlowButton
            href="/login"
            variant="neutral"
            size="sm"
            className={isActive("/login") ? "text-white border-white/25" : undefined}
          >
            Login
          </FlowButton>
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
          className="lg:hidden flex flex-col justify-center items-center w-9 h-9 gap-[5px]"
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
            className="lg:hidden absolute top-16 left-0 right-0 bg-black/95 backdrop-blur-md border-b border-white/5"
          >
            <div className="flex flex-col px-6 py-4 gap-1">
              {LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`py-2.5 text-sm border-b border-white/5 transition-colors duration-200 ${
                    isActive(link.href) ? "text-white" : "text-white/60"
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-4 flex flex-col gap-2">
                <FlowButton
                  href="/login"
                  variant="neutral"
                  size="sm"
                  onClick={() => setOpen(false)}
                  className="justify-center"
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
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
