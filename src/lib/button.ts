import { cn } from "./utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "soft" | "danger" | "success";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-white shadow-[0_10px_24px_-12px_hsl(var(--brand)/0.7)] hover:bg-brand-hover active:translate-y-px",
  secondary:
    "bg-white text-ink border border-line hover:border-brand/30 hover:bg-brand-soft/40",
  ghost: "text-muted hover:bg-line-soft hover:text-ink",
  soft: "bg-brand-soft text-brand-ink hover:bg-brand-soft-2",
  danger: "bg-danger text-white hover:brightness-95",
  success: "bg-success text-white hover:brightness-95",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[11.5px] gap-1.5 rounded-lg",
  md: "h-10 px-4 text-[12.5px] gap-2 rounded-[10px]",
  lg: "h-12 px-5 text-[13.5px] gap-2 rounded-xl",
  icon: "h-9 w-9 rounded-[10px] justify-center",
};

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
) {
  return cn(
    "inline-flex select-none items-center justify-center font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50",
    variantClass[variant],
    sizeClass[size],
    className,
  );
}
