"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Wordmark } from "@/components/ui/logo";
import { buttonClass } from "@/lib/button";
import { cn } from "@/lib/utils";

const links = [
  { label: "Products", href: "/products" },
  { label: "Intelligence", href: "/#intelligence" },
  { label: "Portals", href: "/#portals" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const purple = !scrolled;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        purple
          ? "border-white/10 bg-[#2C1279]"
          : "border-line bg-white/95 shadow-[0_10px_30px_-24px_rgba(35,27,70,0.45)] backdrop-blur-xl",
      )}
    >
      <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between px-5 lg:h-[76px] lg:px-8">
        <Link href="/" aria-label="Eduschol home" className="shrink-0">
          <Wordmark invert={purple} />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "relative text-[13px] font-medium transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:transition-all after:duration-300 hover:after:w-full",
                purple
                  ? "text-white/70 after:bg-white hover:text-white"
                  : "text-ink/65 after:bg-brand hover:text-brand",
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 lg:flex">
          <Link
            href="/auth/sign-in"
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-[10px] px-4 text-[12.5px] font-semibold transition-all duration-200",
              purple ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-ink/75 hover:bg-line-soft",
            )}
          >
            Sign in
          </Link>
          <Link
            href="/auth/sign-up"
            className={buttonClass(
              "primary",
              "md",
              purple
                ? "bg-white text-brand-ink shadow-[0_14px_30px_-16px_rgba(0,0,0,0.6)] hover:bg-white/90"
                : "",
            )}
          >
            Get started
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-colors lg:hidden",
            purple ? "border-white/25 text-white" : "border-line text-ink",
          )}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-4.5 w-4.5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div
          id="mobile-menu"
          className={cn(
            "sheet-in absolute inset-x-0 top-full max-h-[calc(100dvh-68px)] overflow-y-auto border-t px-5 pb-6 pt-3 shadow-[0_30px_60px_-30px_rgba(35,27,70,0.4)] lg:hidden",
            purple ? "border-white/10 bg-[#2C1279]" : "border-line bg-white",
          )}
        >
          <nav className="flex flex-col" aria-label="Mobile">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center justify-between border-b py-3.5 text-[14px] font-semibold",
                  purple ? "border-white/10 text-white" : "border-line-soft text-ink",
                )}
              >
                {link.label}
                <ArrowRight className={cn("h-3.5 w-3.5", purple ? "text-white/50" : "text-muted")} />
              </a>
            ))}
          </nav>
          <div className="mt-4 grid gap-2">
            <Link
              href="/auth/sign-in"
              className={buttonClass(
                "secondary",
                "lg",
                purple ? "border-white/25 bg-white/5 text-white hover:border-white/40 hover:bg-white/10" : "",
              )}
              onClick={() => setOpen(false)}
            >
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              className={buttonClass(
                "primary",
                "lg",
                purple ? "bg-white text-brand-ink hover:bg-white/90" : "",
              )}
              onClick={() => setOpen(false)}
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
