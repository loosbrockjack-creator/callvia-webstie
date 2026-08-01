"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

// Escape to close, focus moved in and restored on close, focus trapped while
// open, and the page behind locked from scrolling. Hand-rolled rather than
// pulled from Radix because this is the only overlay behaviour the admin needs.
function useOverlay(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    restoreTo.current = document.activeElement as HTMLElement | null;

    // Compensate for the scrollbar so the page doesn't shift as it locks.
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPad = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;

    const focusables = () =>
      Array.from(
        ref.current?.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
        ) ?? []
      );

    // Focus the panel itself, not its first control: on mobile, focusing an
    // input here would throw the keyboard up over the content being read.
    ref.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPad;
      restoreTo.current?.focus?.();
    };
  }, [open, onClose]);

  return ref;
}

// Slide-in drawer. Used for the admin sidebar below md.
export function Sheet({
  open,
  onClose,
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
}) {
  const ref = useOverlay(open, onClose);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-black/70 backdrop-blur-sm"
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={cn(
          "absolute inset-y-0 left-0 flex w-[min(19rem,85vw)] flex-col border-r border-line bg-black outline-none",
          "sheet-in"
        )}
      >
        {children}
      </div>
    </div>
  );
}

// Centered dialog on desktop, bottom sheet on mobile. A centered dialog on a
// phone sits under the thumb badly and fights the keyboard when it has a form.
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useOverlay(open, onClose);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-black/70 backdrop-blur-sm"
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[90vh] w-full flex-col overflow-hidden border border-line bg-black outline-none",
          "rounded-t-2xl sm:max-w-lg sm:rounded-2xl",
          "pb-[env(safe-area-inset-bottom)] sm:pb-0"
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line p-5 sm:p-6">
          <div className="min-w-0">
            <h2 id="modal-title" className="text-base font-semibold tracking-tight text-white">
              {title}
            </h2>
            {description && <p className="mt-1.5 text-sm text-muted">{description}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="-m-2 shrink-0 rounded-lg p-2 text-dim transition-colors hover:bg-surface-hover hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {children && <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">{children}</div>}

        {footer && (
          <div className="flex flex-col-reverse gap-2.5 border-t border-line p-5 sm:flex-row sm:justify-end sm:p-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Replaces window.confirm() and window.prompt(). Optionally collects a reason,
// which is what voiding an agreement needs.
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  destructive = false,
  reasonLabel,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void | Promise<void>;
  title: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
  /** When set, a required free-text reason is collected before confirming. */
  reasonLabel?: string;
}) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setReason("");
      setBusy(false);
    }
  }, [open]);

  const confirm = useCallback(async () => {
    setBusy(true);
    try {
      await onConfirm(reason.trim());
    } finally {
      setBusy(false);
    }
  }, [onConfirm, reason]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant={destructive ? "danger" : "primary"}
            onClick={confirm}
            loading={busy}
            disabled={reasonLabel !== undefined && reason.trim().length === 0}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {reasonLabel && (
        <div>
          <label
            htmlFor="confirm-reason"
            className="mb-2 block text-xs uppercase tracking-widest text-dim"
          >
            {reasonLabel}
          </label>
          <textarea
            id="confirm-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full resize-none rounded-lg border border-line bg-surface px-4 py-3 text-base text-white outline-none transition-colors placeholder:text-faint focus:border-accent"
            placeholder="Kept on the record."
          />
        </div>
      )}
    </Modal>
  );
}
