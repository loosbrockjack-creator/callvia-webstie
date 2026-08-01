import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Classnames helper. tailwind-merge resolves conflicts so a primitive can take
// an overriding className without the caller having to know which utilities the
// internals already set (a plain join leaves both in the string and lets source
// order decide, which is how you get a p-4 that silently ignores your p-6).
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
