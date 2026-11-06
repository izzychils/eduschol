"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Mail,
  MapPin,
  Minus,
  Phone,
  Plus,
  Sparkles,
} from "lucide-react";
import { Wordmark, Mark } from "@/components/ui/logo";
import { buttonClass } from "@/lib/button";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

const stories = [
  {
    quote:
      "Our bursar used to spend three days reconciling fee payments every term. Now the ledger is already correct when the term closes, and I can see the shortfall before it becomes a problem.",
    name: "Dr. Ngozi Balogun",
    role: "Principal, Greenfield Academy",
    stat: "3 days to 20 minutes",
    statLabel: "term end reconciliation",
    tone: "bg-[#F3EEFF] text-[#4B2BA8]",
  },
  {
    quote:
      "The gradebook does the arithmetic, the comments pull from real scores, and I still approve every line before a parent sees it. That last part is why teachers actually keep using it.",
    name: "Emeka Obi",
    role: "Head of Mathematics, Hillcrest Prep",
    stat: "11 hours",
    statLabel: "saved per report cycle",
    tone: "bg-[#E8F7F0] text-[#117A57]",
  },
  {
    quote:
      "I check attendance and my daughter's balance on my phone at work. I stopped calling the school office for things I should already be able to see.",
    name: "Ngozi Eze",
    role: "Parent, JSS 3A",
    stat: "4 taps",
    statLabel: "to a full term summary",
    tone: "bg-[#FFF2E4] text-[#9A531A]",
  },
];

export function Stories() {
  return (
    <section id="stories" className="scroll-mt-24 bg-canvas py-20 sm:py-24">
      <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <div>
              <p className="eyebrow">From the schools</p>
              <h2 className="mt-3 max-w-[620px] text-[clamp(1.9rem,3.4vw,2.9rem)] font-extrabold leading-[1.04] tracking-[-0.045em] text-ink">
                Less admin.{" "}
                <span className="font-serif font-normal italic tracking-[-0.02em] text-brand">
                  More attention on the child.
                </span>
              </h2>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <p className="max-w-[330px] text-[12.5px] leading-relaxed text-muted">
              Three schools ran a full term on Eduschol. These are the numbers they gave us,
              not a marketing department.
            </p>
          </Reveal>
        </div>

        <div className="mt-11 grid gap-4 lg:grid-cols-3">
          {stories.map((story, index) => (
            <Reveal key={story.name} delay={index * 90}>
              <figure className="hover-lift flex h-full flex-col rounded-[22px] border border-line bg-white p-6">
                <div className={cn("self-start rounded-lg px-2.5 py-1 text-[10px] font-bold", story.tone)}>
                  {story.stat}
                  <span className="ml-1.5 font-medium opacity-70">{story.statLabel}</span>
                </div>
                <blockquote className="mt-5 flex-1 text-[13.5px] leading-[1.7] text-ink/80">
                  &ldquo;{story.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-2.5 border-t border-line pt-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-[10px] font-bold text-brand-ink">
                    {story.name
                      .replace("Dr. ", "")
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <div>
                    <p className="text-[11.5px] font-bold text-ink">{story.name}</p>
                    <p className="text-[10px] text-muted">{story.role}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const questions = [
  {
    q: "Does the AI invent student data?",
    a: "No. Every assistant reads from the records already in your workspace. If a question needs information the school has not recorded, the answer says so and links to the field that needs filling. Draft comments, letters and lesson plans are shown for a human to approve before anything is sent to a parent.",
  },
  {
    q: "Can we run admissions, fees and results without training?",
    a: "The workspace ships with a full sample school so you can click through every screen before entering real data. Create a student, mark a register, record a payment and publish a result in under ten minutes. Settings has a reset that restores the sample at any time.",
  },
  {
    q: "What do teachers see compared with administrators?",
    a: "Teachers see their classes, their register, their gradebook, their CBT papers and the academic assistants. They do not see payroll, other departments or whole school finance. Parents see only their own children, their invoices and published results.",
  },
  {
    q: "How are report cards produced?",
    a: "Scores are entered once, per subject and assessment. Eduschol totals them, assigns the grade on your scale, ranks the class, writes a comment from the actual numbers and lays the result out on a printable report sheet. A teacher reviews the sheet before it is released.",
  },
  {
    q: "Where is the data stored today?",
    a: "This build is a complete frontend: accounts, records, payments and announcements live in the browser through localStorage, seeded with a realistic school. The data layer is isolated, so a server can replace it without changing a single screen. Nothing is sent anywhere.",
  },
  {
    q: "Does it work on a phone?",
    a: "Every screen is responsive. The register, the parent summary and the assistant are built for one hand first, because that is how a form teacher takes attendance and how a parent checks a balance.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="questions" className="scroll-mt-24 border-t border-line bg-white py-20 sm:py-24">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16 lg:px-8">
        <div>
          <Reveal>
            <p className="eyebrow">Questions</p>
            <h2 className="mt-3 text-[clamp(1.9rem,3.2vw,2.7rem)] font-extrabold leading-[1.05] tracking-[-0.045em] text-ink">
              The things a head teacher{" "}
              <span className="font-serif font-normal italic tracking-[-0.02em] text-brand">
                asks first.
              </span>
            </h2>
            <p className="mt-4 max-w-[300px] text-[12.5px] leading-relaxed text-muted">
              Still deciding? Open the sample school and try the exact flow your team would use
              on a Monday morning.
            </p>
            <Link href="/auth/sign-in" className={buttonClass("soft", "md", "mt-6")}>
              Open the sample school
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Reveal>
        </div>

        <div className="divide-y divide-line border-y border-line">
          {questions.map((item, index) => {
            const active = open === index;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpen(active ? null : index)}
                  aria-expanded={active}
                  className="flex w-full items-center justify-between gap-6 py-5 text-left"
                >
                  <span
                    className={cn(
                      "text-[13.5px] font-semibold leading-snug transition-colors",
                      active ? "text-brand" : "text-ink",
                    )}
                  >
                    {item.q}
                  </span>
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                      active
                        ? "rotate-180 border-brand bg-brand text-white"
                        : "border-line bg-white text-muted",
                    )}
                  >
                    {active ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                  </span>
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-400 ease-out",
                    active ? "grid-rows-[1fr] pb-5 opacity-100" : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <p className="overflow-hidden pr-10 text-[12.5px] leading-[1.75] text-muted">
                    {item.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const points = ["No card required", "Sample school included", "Works on any phone"];

export function ClosingCta() {
  return (
    <section className="bg-canvas pb-16 pt-4 sm:pb-20">
      <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
        <Reveal>
          <div className="hero-shell grain relative overflow-hidden rounded-[28px] px-6 py-12 sm:px-10 sm:py-16 lg:px-16">
            <div className="pointer-events-none absolute -right-16 -top-20 h-[360px] w-[360px] rounded-full bg-white/10 blur-[90px]" />
            <div className="pointer-events-none absolute -bottom-24 left-10 h-[300px] w-[300px] rounded-full bg-[#A98BFF]/30 blur-[100px]" />
            <div className="relative max-w-[680px]">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-white/85">
                <Sparkles className="h-3 w-3 text-[#D8C7FF]" />
                Start with the sample school
              </span>
              <h2 className="mt-5 text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-[1.02] tracking-[-0.05em] text-white">
                Give your school one calm,{" "}
                <span className="font-serif font-normal italic tracking-[-0.02em] text-[#D8C7FF]">
                  accurate place.
                </span>
              </h2>
              <p className="mt-4 max-w-[520px] text-[13.5px] leading-relaxed text-white/70">
                Admissions, attendance, results, CBT, fees, staff and parents. One login for each
                role, one record of truth, and an AI layer that never fills a gap with fiction.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/auth/sign-up"
                  className={buttonClass(
                    "secondary",
                    "lg",
                    "border-transparent bg-white text-brand-ink hover:bg-white",
                  )}
                >
                  Create a school workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/auth/sign-in"
                  className={buttonClass("ghost", "lg", "border border-white/25 text-white hover:bg-white/10")}
                >
                  Explore the demo
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                {points.map((point) => (
                  <span key={point} className="flex items-center gap-1.5 text-[11px] text-white/60">
                    <Check className="h-3 w-3 text-[#B9F5D9]" />
                    {point}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const footerCols = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Products", href: "/products" },
      { label: "Contact", href: "/contact" },
      { label: "Questions", href: "/questions" },
    ],
  },
  {
    title: "Modules",
    links: [
      { label: "Admissions", href: "/product" },
      { label: "Attendance", href: "/products" },
      { label: "Results and CBT", href: "/products" },
      { label: "Fees", href: "/products" },
    ],
  },
  {
    title: "Access",
    links: [
      { label: "Sign in", href: "/auth/sign-in" },
      { label: "Create workspace", href: "/auth/sign-up" },
      { label: "Company Verification", href: "/verify" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto max-w-[1280px] px-5 py-12 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Wordmark />
            <p className="mt-4 max-w-[280px] text-[12px] leading-relaxed text-muted">
              The AI-native operating system for schools. Every answer is grounded in the records
              your team already keeps.
            </p>
            <p className="mt-4 text-[11px] font-semibold text-ink">{site.companyLine}</p>
            <div className="mt-3 space-y-2 text-[11.5px] text-muted">
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-brand" />
                {site.address}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-brand" />
                <a
                  href={`mailto:${site.email}`}
                  className="transition-colors hover:text-brand"
                >
                  {site.email}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-brand" />
                <a
                  href={`tel:${site.phone.replace(/\s/g, "")}`}
                  className="transition-colors hover:text-brand"
                >
                  {site.phone}
                </a>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerCols.map((col) => (
              <div key={col.title}>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-ink">
                  {col.title}
                </p>
                <ul className="mt-3 space-y-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-[12px] text-muted transition-colors hover:text-brand"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          <div className="flex items-center gap-2 text-[11px] text-muted">
            <Mark className="h-5 w-5" />
            <span>
              © {new Date().getFullYear()} {site.company}. Eduschol is a product of {site.company}.
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-muted">
            <span>Frontend demo, data stays in this browser</span>
            <Link href="/auth/sign-up" className="inline-flex items-center gap-1 font-semibold text-brand">
              Get started
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
