import Link from "next/link";
import { ArrowRight, Check, PlayCircle, Sparkles, TrendingUp } from "lucide-react";
import { DashboardMock } from "./dashboard-mock";
import { Reveal } from "./reveal";
import { buttonClass } from "@/lib/button";

const assurances = ["Admissions to SS3", "Grounded in your records", "Every role has a portal"];

export function Hero() {
  return (
    <section className="hero-shell mesh grain relative overflow-hidden">
      <div className="pointer-events-none absolute -left-32 top-24 h-[380px] w-[380px] rounded-full bg-[#7B5BFF]/25 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 top-0 h-[420px] w-[420px] rounded-full bg-[#A98BFF]/20 blur-[130px]" />

      <div className="relative mx-auto max-w-[1280px] px-5 pb-16 pt-14 sm:pt-16 lg:px-8 lg:pb-24 lg:pt-20">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/90 backdrop-blur">
            <span className="live-dot" />
            AI-native school management
          </span>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="mt-6 max-w-[980px] text-[clamp(2.7rem,6.4vw,5.3rem)] font-extrabold leading-[0.96] tracking-[-0.055em] text-white">
            Every part of your school,
            <br className="hidden sm:block" /> finally on the{" "}
            <span className="font-serif font-normal italic tracking-[-0.02em] text-[#D8C7FF]">
              same page.
            </span>
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="mt-6 max-w-[620px] text-[15px] leading-[1.75] text-white/85 sm:text-[16px]">
            Eduschol is the operating system for schools that think ahead. Admissions,
            attendance, results, CBT, fees, staff and parents in one calm place, with an AI
            layer that reads the same records your team does.
          </p>
        </Reveal>

        <Reveal delay={220}>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/auth/sign-up"
              className={buttonClass(
                "primary",
                "lg",
                "bg-white text-brand-ink shadow-[0_18px_40px_-18px_rgba(0,0,0,0.5)] hover:bg-white/90",
              )}
            >
              Start free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth/sign-in"
              className={buttonClass(
                "secondary",
                "lg",
                "border-white/25 bg-white/5 text-white hover:border-white/40 hover:bg-white/10",
              )}
            >
              <PlayCircle className="h-4 w-4" />
              Open the live demo
            </Link>
          </div>
        </Reveal>

        <Reveal delay={280}>
          <ul className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2">
            {assurances.map((item) => (
              <li key={item} className="flex items-center gap-1.5 text-[11.5px] font-medium text-white/75">
                <Check className="h-3.5 w-3.5 text-[#9FE9CF]" />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={180} className="relative mt-12 lg:mt-16">
          <div className="pointer-events-none absolute -inset-x-6 bottom-0 top-16 rounded-[36px] bg-[#1B0B4D]/30 blur-2xl" />
          <div className="relative mx-auto max-w-[1120px]">
            <div className="absolute -left-6 -top-14 z-10 hidden w-[214px] rounded-2xl border border-white/60 bg-white p-3.5 shadow-[0_30px_60px_-24px_rgba(18,8,60,0.45)] xl:block float-soft">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-soft text-brand">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-brand">Eduschol AI</span>
              </div>
              <p className="mt-2 text-[11.5px] font-semibold leading-snug text-ink">
                4 students crossed the at-risk threshold this week.
              </p>
              <p className="mt-1 text-[9.5px] leading-relaxed text-muted">
                Attendance and Mathematics scores, reviewed together.
              </p>
              <div className="mt-2.5 flex items-center gap-1 text-[9px] font-semibold text-brand">
                See the students
                <ArrowRight className="h-2.5 w-2.5" />
              </div>
            </div>

            <div className="absolute -right-5 bottom-20 z-10 hidden w-[196px] rounded-2xl border border-white/60 bg-white p-3.5 shadow-[0_30px_60px_-24px_rgba(18,8,60,0.45)] xl:block">
              <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted">
                Fees collected
              </p>
              <div className="mt-1.5 flex items-end justify-between">
                <span className="text-[22px] font-extrabold tracking-[-0.04em] text-ink">78%</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-1.5 py-0.5 text-[8.5px] font-bold text-success">
                  <TrendingUp className="h-2.5 w-2.5" />
                  +9%
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line-soft">
                <div className="h-full w-[78%] rounded-full bg-brand" />
              </div>
              <p className="mt-2 text-[9px] text-muted">₦8.7m of ₦11.2m this term</p>
            </div>

            <div className="relative overflow-hidden rounded-[22px] border border-white/20">
              <DashboardMock />
            </div>
          </div>
        </Reveal>
      </div>

      <div className="relative h-px w-full bg-gradient-to-r from-transparent via-white/25 to-transparent" />
    </section>
  );
}
