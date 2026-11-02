import { cn } from "@/lib/utils";

export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("h-8 w-8", className)}
    >
      <path d="M4.4 9.1 16 4l11.6 5.1L16 14.3 4.4 9.1Z" fill="currentColor" opacity="0.35" />
      <path d="M4.4 14.6 16 9.5l11.6 5.1L16 19.8 4.4 14.6Z" fill="currentColor" opacity="0.65" />
      <path d="M4.4 20.1 16 15l11.6 5.1L16 25.3 4.4 20.1Z" fill="currentColor" />
      <path d="M16 25.3v2.4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function Wordmark({
  className,
  invert = false,
}: {
  className?: string;
  invert?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Mark className={cn("h-8 w-8", invert ? "text-white" : "text-brand")} />
      <span
        className={cn(
          "font-display text-[21px] font-extrabold tracking-[-0.045em]",
          invert ? "text-white" : "text-ink",
        )}
      >
        Eduschol
      </span>
    </span>
  );
}
