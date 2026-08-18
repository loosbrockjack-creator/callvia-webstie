"use client";

import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

// Same shape as useHasFinePointer: starts false so server and first client
// render agree, then corrects on mount.
//
// This exists rather than framer-motion's useReducedMotion because that hook
// was observed returning false on this page even with the media query matching,
// which left the scroll stroke stranded part-drawn. Reading matchMedia directly
// is what the shader background does too, and it is verifiable.
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    setReduced(mql.matches);

    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
