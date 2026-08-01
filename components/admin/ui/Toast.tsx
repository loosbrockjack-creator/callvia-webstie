"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, Check, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Replaces the alert() calls the admin used to fire after send / void / resend.
// alert() blocks the page, can't be styled, and on iOS it steals focus in a way
// that leaves the list underneath scrolled somewhere unexpected.

type ToastTone = "success" | "error" | "info";

interface Toast {
  id: number;
  tone: ToastTone;
  message: string;
  detail?: string;
}

interface ToastApi {
  success: (message: string, detail?: string) => void;
  error: (message: string, detail?: string) => void;
  info: (message: string, detail?: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const TONE: Record<ToastTone, { icon: ReactNode; className: string }> = {
  success: { icon: <Check size={16} />, className: "text-success" },
  error: { icon: <AlertCircle size={16} />, className: "text-danger" },
  info: { icon: <Info size={16} />, className: "text-muted" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (tone: ToastTone, message: string, detail?: string) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, tone, message, detail }]);
      // Errors stay longer: they usually carry something worth reading.
      window.setTimeout(() => dismiss(id), tone === "error" ? 8000 : 4500);
    },
    [dismiss]
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (m, d) => push("success", m, d),
      error: (m, d) => push("error", m, d),
      info: (m, d) => push("info", m, d),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className={cn(
          "pointer-events-none fixed z-[60] flex flex-col gap-2",
          // Full width above the thumb on mobile, corner on desktop.
          "inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)]",
          "sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[22rem]"
        )}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="toast-in pointer-events-auto flex items-start gap-3 rounded-xl border border-line bg-surface-raised p-4 shadow-2xl"
          >
            <span className={cn("mt-0.5 shrink-0", TONE[t.tone].className)} aria-hidden>
              {TONE[t.tone].icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-white">{t.message}</p>
              {t.detail && (
                <p className="mt-1 break-all text-xs leading-relaxed text-dim">{t.detail}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="-m-1.5 shrink-0 rounded-md p-1.5 text-faint transition-colors hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
