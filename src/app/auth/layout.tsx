import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { Wordmark } from "@/components/ui/logo";

const promises = [
  "One record of truth for every student",
  "Registers, results and fees in one place",
  "AI answers that cite your own data",
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[1.02fr_1fr]">
      <aside className="hero-shell grain relative hidden overflow-hidden p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="pointer-events-none absolute -right-20 top-10 h-[380px] w-[380px] rounded-full bg-white/10 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-[320px] w-[320px] rounded-full bg-[#A98BFF]/25 blur-[100px]" />

        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-2 text-[11.5px] text-white/60 transition-colors hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to the site
          </Link>
          <div className="mt-10 [&_*]:!text-white">
            <Wordmark />
          </div>
          <h1 className="mt-10 max-w-[420px] text-[clamp(2rem,3.2vw,2.9rem)] font-extrabold leading-[1.03] tracking-[-0.05em] text-white">
            The whole school,{" "}
            <span className="font-serif font-normal italic tracking-[-0.02em] text-[#D8C7FF]">
              on one calm page.
            </span>
          </h1>
          <p className="mt-4 max-w-[380px] text-[13px] leading-relaxed text-white/65">
            Admissions, attendance, results, CBT, fees and parents. Built for administrators,
            teachers and families who share the same record.
          </p>
        </div>

        <div className="relative mt-10 space-y-2.5">
          {promises.map((promise) => (
            <div key={promise} className="flex items-center gap-2.5 text-[12px] text-white/70">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/12">
                <Check className="h-3 w-3 text-[#B9F5D9]" />
              </span>
              {promise}
            </div>
          ))}
        </div>

        <div className="relative mt-10 rounded-2xl border border-white/15 bg-white/[0.07] p-4 backdrop-blur">
          <p className="text-[11.5px] leading-relaxed text-white/75">
            &ldquo;The bursar closes the term in twenty minutes now. The numbers were already
            right.&rdquo;
          </p>
          <p className="mt-2.5 text-[10.5px] font-semibold text-white/45">
            Dr. Ngozi Balogun, Principal, Greenfield Academy
          </p>
        </div>
      </aside>

      <main className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between border-b border-line px-5 py-4 lg:hidden">
          <Link href="/">
            <Wordmark />
          </Link>
          <Link href="/" className="text-[11.5px] font-semibold text-muted">
            Back to site
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
        <p className="px-6 pb-6 text-center text-[10.5px] leading-relaxed text-muted">
          Frontend demo. Accounts, records and sessions stay in this browser.
        </p>
      </main>
    </div>
  );
}
