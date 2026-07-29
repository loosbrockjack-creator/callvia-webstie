"use client";

import { useEffect, useState } from "react";

const QUERY = "(hover: hover) and (pointer: fine)";

// Starts false so server and first client render agree; corrects on mount.
// Effects that would only ever fire from a real cursor should be gated on this
// rather than assuming pointer events imply a mouse.
export function useHasFinePointer() {
  const [hasFinePointer, setHasFinePointer] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    setHasFinePointer(mql.matches);

    const onChange = (e: MediaQueryListEvent) => setHasFinePointer(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return hasFinePointer;
}
