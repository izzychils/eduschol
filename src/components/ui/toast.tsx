"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { uid } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Tone = "success" | "error" | "info";

type ToastInput = {
  title: string;
  description?: string;
  tone?: Tone;
};

type ToastItem = ToastInput & { id: string };

type ToastContextValue = {
  toast: (input: ToastInput | string, tone?: Tone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const toneStyle: Record<Tone, string> = {
  success: "border-success/20 bg-white",
  error: "border-danger/20 bg-white",
  info: "border-line bg-white",
};

const toneIcon: Record<Tone, ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4 text-success" />,
  error: <AlertTriangle className="h-4 w-4 text-danger" />,
  info: <Info className="h-4 w-4 text-info" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput | string, tone: Tone = "info") => {
      const payload: ToastInput = typeof input === "string" ? { title: input, tone } : input;
      const item = { ...payload, id: uid("toast") };
      setItems((current) => [...current.slice(-2), item]);
      window.setTimeout(() => dismiss(item.id), 4200);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-end sm:pr-6">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "sheet-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-3.5 shadow-[0_20px_50px_-20px_rgba(35,27,70,0.35)]",
              toneStyle[item.tone ?? "info"],
            )}
            role="status"
          >
            <span className="mt-0.5 shrink-0">{toneIcon[item.tone ?? "info"]}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-semibold text-ink">{item.title}</p>
              {item.description ? (
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">{item.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="rounded-md p-1 text-muted transition-colors hover:bg-line-soft hover:text-ink"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
