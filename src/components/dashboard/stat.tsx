import type { ComponentType, ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  foot,
  delta,
  tone = "brand",
}: {
  label: string;
  value: ReactNode;
  icon: ComponentType<{ className?: string }>;
  foot?: ReactNode;
  delta?: number;
  tone?: "brand" | "success" | "warning" | "danger" | "violet";
}) {
  const tones = {
    brand: "bg-brand-soft text-brand",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    danger: "bg-danger-soft text-danger",
    violet: "bg-violet-soft text-violet",
  };
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10.5px] font-semibold leading-tight text-muted">{label}</p>
        <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", tones[tone])}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="mt-2.5 text-[26px] font-extrabold leading-none tracking-[-0.04em] text-ink tnum">
        {value}
      </p>
      <div className="mt-2 flex items-center gap-1.5">
        {typeof delta === "number" ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold",
              delta >= 0 ? "bg-success-soft text-success" : "bg-danger-soft text-danger",
            )}
          >
            {delta >= 0 ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        ) : null}
        {foot ? <p className="truncate text-[10px] text-muted">{foot}</p> : null}
      </div>
    </div>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("card flex flex-col", className)}>
      <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <h2 className="text-[12.5px] font-bold tracking-[-0.01em] text-ink">{title}</h2>
          {description ? <p className="mt-0.5 text-[10px] text-muted">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className={cn("flex-1 p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

export function MiniMeter({ label, value, tone = "brand" }: { label: string; value: number; tone?: "brand" | "success" | "warning" | "danger" }) {
  const colors = { brand: "bg-brand", success: "bg-success", warning: "bg-warning", danger: "bg-danger" };
  return (
    <div>
      <div className="flex items-center justify-between text-[10.5px]">
        <span className="font-medium text-ink/75">{label}</span>
        <span className="font-bold text-ink tnum">{Math.round(value)}%</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line-soft">
        <div className={cn("h-full rounded-full transition-[width] duration-700", colors[tone])} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  );
}
