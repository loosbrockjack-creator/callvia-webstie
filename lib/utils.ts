// Minimal classnames helper. This project isn't a full shadcn setup, so we
// don't pull in clsx/tailwind-merge; className conflicts are avoided by
// convention (callers pass the radius/padding, internals use rounded-[inherit]).
export function cn(...inputs: Array<string | undefined | null | false>): string {
  return inputs.filter(Boolean).join(" ");
}
