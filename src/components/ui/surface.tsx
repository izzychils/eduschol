import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";

export type Tone = "neutral" | "accent" | "success" | "warning" | "danger" | "info" | "violet";

const toneMap: Record<Tone, string> = {
  neutral: "bg-line-soft text-muted",
  accent: "bg-brand-soft text-brand-ink",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  violet: "bg-violet-soft text-violet",
};

export function Badge({
  children,
  tone = "neutral",
  className,
  dot,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold leading-5",
        toneMap[tone],
        className,
      )}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

export function Card({
  children,
  className,
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}) {
  return <As className={cn("card", className)}>{children}</As>;
}

const avatarTones = [
  "bg-[#EEE9FF] text-[#4B2BA8]",
  "bg-[#FFEFE2] text-[#9A531A]",
  "bg-[#E2F8EF] text-[#117A57]",
  "bg-[#E7F1FF] text-[#1F5D9E]",
  "bg-[#FFE9F0] text-[#A32A54]",
  "bg-[#FDF0CE] text-[#8C6307]",
  "bg-[#E9F6F8] text-[#1C6E7C]",
  "bg-[#F0EDE7] text-[#5C5245]",
];

export function Avatar({
  name,
  className,
  size = "md",
}: {
  name: string;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}) {
  const tone = avatarTones[(name.charCodeAt(0) + name.length) % avatarTones.length];
  const sizes = {
    xs: "h-6 w-6 text-[8.5px]",
    sm: "h-8 w-8 text-[10px]",
    md: "h-9 w-9 text-[11px]",
    lg: "h-12 w-12 text-[13px]",
    xl: "h-16 w-16 text-[18px]",
  };
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-bold tracking-wide",
        tone,
        sizes[size],
        className,
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

export function IconChip({
  icon: Icon,
  tone = "accent",
  className,
}: {
  icon: ComponentType<{ className?: string }>;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-[10px]",
        toneMap[tone],
        className,
      )}
    >
      <Icon className="h-4 w-4" />
    </span>
  );
}

export function Progress({
  value,
  tone = "brand",
  className,
}: {
  value: number;
  tone?: "brand" | "success" | "warning" | "danger";
  className?: string;
}) {
  const colors = {
    brand: "bg-brand",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  };
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-line-soft", className)}>
      <div
        className={cn("h-full rounded-full transition-[width] duration-700", colors[tone])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
  size = "md",
}: {
  tabs: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border border-line bg-white p-1",
        className,
      )}
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg font-semibold transition-all duration-200",
            size === "sm" ? "px-2.5 py-1.5 text-[10.5px]" : "px-3 py-1.5 text-[11.5px]",
            value === tab.id
              ? "bg-brand text-white shadow-[0_6px_14px_-8px_hsl(var(--brand)/0.8)]"
              : "text-muted hover:bg-line-soft hover:text-ink",
          )}
        >
          {tab.label}
          {typeof tab.count === "number" ? (
            <span
              className={cn(
                "rounded-full px-1.5 text-[9px] leading-4",
                value === tab.id ? "bg-white/20" : "bg-line-soft text-muted",
              )}
            >
              {tab.count}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-14 text-center", className)}>
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 text-[13px] font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-xs text-[11.5px] leading-relaxed text-muted">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function SectionHeading({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div>
        <h2 className="text-[14px] font-bold tracking-[-0.015em] text-ink">{title}</h2>
        {description ? <p className="mt-0.5 text-[11px] text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function PageTitle({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? <p className="eyebrow mb-1.5">{eyebrow}</p> : null}
        <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.035em] text-ink sm:text-[30px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-line", className)} />;
}
