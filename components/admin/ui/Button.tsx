"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Every interactive control in the admin is at least 44px tall on touch. That
// is the accessibility floor, and it is also the difference between a
// dashboard you can use one-handed on a phone and one you can't.

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const VARIANT: Record<Variant, string> = {
  // Accent is spent here and on the active nav item. Nowhere else.
  primary: "bg-accent text-white hover:bg-accent-hover",
  secondary:
    "border border-line bg-surface text-white hover:border-line-strong hover:bg-surface-hover",
  ghost: "text-muted hover:bg-surface-hover hover:text-white",
  danger: "border border-line text-danger hover:border-danger/40 hover:bg-danger/10",
};

const SIZE: Record<Size, string> = {
  sm: "min-h-[38px] px-3.5 text-sm gap-1.5",
  md: "min-h-[44px] px-5 text-sm gap-2",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  icon,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        "disabled:cursor-not-allowed disabled:opacity-50",
        VARIANT[variant],
        SIZE[size],
        className
      )}
    >
      {loading ? <Loader2 size={15} className="animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
}

export function IconButton({
  label,
  icon,
  className,
  ...rest
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  label: string;
  icon: ReactNode;
}) {
  return (
    <button
      {...rest}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line text-muted transition-colors duration-200",
        "hover:border-line-strong hover:bg-surface-hover hover:text-white",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        className
      )}
    >
      {icon}
    </button>
  );
}
