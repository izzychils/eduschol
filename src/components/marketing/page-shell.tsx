import type { ReactNode } from "react";
import Link from "next/link";
import { MarketingNav } from "./nav";
import { Footer } from "./closing";

/**
 * Shared layout for the marketing detail pages (about, products, contact,
 * privacy, terms) so they inherit the same navigation, type scale and footer
 * as the landing page.
 */
export function PageLanding({
  eyebrow,
  title,
  accent,
  intro,
  meta,
  children,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  intro: string;
  meta?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas">
      <MarketingNav />
      <main>
        <section className="border-b border-line bg-white pb-12 pt-10 sm:pb-16 sm:pt-14">
          <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
            <Link
              href="/"
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted transition-colors hover:text-brand"
            >
              ← Back to Eduschol
            </Link>
            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.5fr] lg:items-end">
              <div>
                <p className="eyebrow">{eyebrow}</p>
                <h1 className="mt-3 max-w-[760px] text-[clamp(2.1rem,4.4vw,3.6rem)] font-extrabold leading-[1.02] tracking-[-0.05em] text-ink">
                  {title}
                  {accent ? (
                    <>
                      {" "}
                      <span className="font-serif font-normal italic tracking-[-0.02em] text-brand">
                        {accent}
                      </span>
                    </>
                  ) : null}
                </h1>
                <p className="mt-4 max-w-[560px] text-[12.5px] leading-relaxed text-muted">
                  {intro}
                </p>
              </div>
              {meta ? (
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted/70 lg:text-right">
                  {meta}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[200px_minmax(0,800px)]">
              <aside className="hidden lg:block">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink">
                  On this page
                </p>
                <div className="mt-3 flex flex-col gap-1">
                  <Link
                    href="/about"
                    className="text-[12px] text-muted transition-colors hover:text-brand"
                  >
                    About
                  </Link>
                  <Link
                    href="/products"
                    className="text-[12px] text-muted transition-colors hover:text-brand"
                  >
                    Products
                  </Link>
                  <Link
                    href="/contact"
                    className="text-[12px] text-muted transition-colors hover:text-brand"
                  >
                    Contact
                  </Link>
                  <Link
                    href="/privacy"
                    className="text-[12px] text-muted transition-colors hover:text-brand"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/terms"
                    className="text-[12px] text-muted transition-colors hover:text-brand"
                  >
                    Terms of Service
                  </Link>
                </div>
              </aside>

              <article className="min-w-0 rounded-[22px] border border-line bg-white p-6 sm:p-9">
                <div className="space-y-8 text-[12.5px] leading-[1.75] text-muted">
                  {children}
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export function SectionBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-[16px] font-bold tracking-[-0.02em] text-ink">{title}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}

export function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand" />
          {item}
        </li>
      ))}
    </ul>
  );
}
