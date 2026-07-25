"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

const LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

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
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors duration-200 ${
                isActive(link.href) ? "text-white" : "text-white/50 hover:text-white"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right cluster */}
        <div className="hidden md:flex items-center gap-6">
          <a
            href="/login"
            className={`text-sm transition-colors duration-200 ${
              isActive("/login") ? "text-white" : "text-white/50 hover:text-white"
            }`}
          >
            Login
          </a>
          <a
            href="/build"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-accent border border-accent/40 rounded-full hover:bg-accent hover:text-white transition-all duration-200"
          >
            Build My Receptionist
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-[5px]"
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
            className="md:hidden absolute top-16 left-0 right-0 bg-black/95 backdrop-blur-md border-b border-white/5"
          >
            <div className="flex flex-col px-6 py-4 gap-1">
              {[...LINKS, { label: "Login", href: "/login" }].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`py-2.5 text-sm border-b border-white/5 last:border-0 transition-colors duration-200 ${
                    isActive(link.href) ? "text-white" : "text-white/60"
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="/build"
                onClick={() => setOpen(false)}
                className="mt-3 inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-accent border border-accent/40 rounded-full"
              >
                Build My Receptionist
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
