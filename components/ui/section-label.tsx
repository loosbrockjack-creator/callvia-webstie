"use client";

// The purple eyebrow above every section heading. Previously this exact block
// was written out at eleven call sites, each one hardcoding #7c5cfc inline
// rather than using the accent token, so the one place the brand colour is
// allowed to appear was also the one place it could silently drift.

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn("mb-5 text-xs uppercase tracking-widest text-accent", className)}
    >
      {children}
    </motion.p>
  );
}
