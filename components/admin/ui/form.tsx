"use client";

import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { useId } from "react";
import { cn } from "@/lib/utils";

// One rule drives the sizing here: text-base is 16px, and anything smaller
// makes iOS Safari zoom the whole viewport when the field takes focus. That
// single behaviour is the most common reason a form "feels broken" on a phone,
// so no input in this file is allowed to be smaller.

const CONTROL = cn(
  "w-full rounded-lg border border-line bg-surface px-4 text-base text-white",
  "min-h-[44px] outline-none transition-colors duration-200",
  "placeholder:text-faint",
  "focus:border-accent focus-visible:ring-1 focus-visible:ring-accent",
  "disabled:cursor-not-allowed disabled:opacity-50"
);

export function Field({
  label,
  htmlFor,
  hint,
  error,
  optional,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string | null;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 flex items-baseline gap-2 text-xs uppercase tracking-widest text-dim"
      >
        {label}
        {optional && <span className="normal-case tracking-normal text-faint">optional</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-sm text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-dim">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({
  label,
  hint,
  error,
  optional,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string | null;
  optional?: boolean;
}) {
  const auto = useId();
  const id = rest.id ?? auto;
  const control = (
    <input
      {...rest}
      id={id}
      className={cn(CONTROL, "py-3", className)}
      aria-invalid={error ? true : undefined}
    />
  );
  if (!label) return control;
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error} optional={optional}>
      {control}
    </Field>
  );
}

export function Textarea({
  label,
  hint,
  error,
  optional,
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string | null;
  optional?: boolean;
}) {
  const auto = useId();
  const id = rest.id ?? auto;
  const control = (
    <textarea
      {...rest}
      id={id}
      className={cn(CONTROL, "resize-none py-3", className)}
      aria-invalid={error ? true : undefined}
    />
  );
  if (!label) return control;
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error} optional={optional}>
      {control}
    </Field>
  );
}

export function Select({
  label,
  hint,
  error,
  optional,
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string | null;
  optional?: boolean;
}) {
  const auto = useId();
  const id = rest.id ?? auto;
  const control = (
    <select {...rest} id={id} className={cn(CONTROL, "appearance-none py-3 pr-10", className)}>
      {children}
    </select>
  );
  if (!label) return control;
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error} optional={optional}>
      {control}
    </Field>
  );
}

export function Checkbox({
  label,
  description,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode;
  description?: string;
}) {
  const auto = useId();
  const id = rest.id ?? auto;
  return (
    // The whole row is the hit target, not just the 16px box. On a phone a bare
    // checkbox is roughly a third of the minimum comfortable tap size.
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg py-2.5 transition-colors duration-200",
        className
      )}
    >
      <input
        {...rest}
        id={id}
        type="checkbox"
        className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[#7c5cfc]"
      />
      <span className="min-w-0">
        <span className="block text-sm leading-relaxed text-white">{label}</span>
        {description && (
          <span className="mt-1 block text-xs leading-relaxed text-dim">{description}</span>
        )}
      </span>
    </label>
  );
}
