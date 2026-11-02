"use client";

import { useState } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  Crown,
  HeartHandshake,
  Send,
  ShieldCheck,
  Sparkles,
  Wallet,
  Wrench,
} from "lucide-react";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

const assistants = [
  {
    id: "academic",
    label: "Academic",
    icon: BookOpenCheck,
    short: "Lesson plans, question sets, learning gaps",
    question: "Which topics is JSS 2A struggling with?",
    answer:
      "Basic Science is the weakest subject in JSS 2A at a 54% average. Forces and energy is the lowest topic across the last two assessments, with six students below 45%. I can build a 20 minute revision set from those questions.",
    sources: ["JSS 2A results", "24 assessments", "Term 1"],
    action: "Open the class report",
  },
  {
    id: "admin",
    label: "Administrator",
    icon: Wrench,
    short: "Attendance patterns, admissions, daily operations",
    question: "What needs my attention this week?",
    answer:
      "Four students have dropped below 82% attendance. Six families are partway through Term 1 fees. Physics slipped six points after the last assessment. None of this needs a new spreadsheet.",
    sources: ["Attendance, 12 days", "Term 1 invoices", "Subject averages"],
    action: "See the at-risk list",
  },
  {
    id: "finance",
    label: "Finance",
    icon: Wallet,
    short: "Collections, outstanding balances, anomalies",
    question: "How is Term 1 collection going?",
    answer:
      "₦8.7m has been collected of ₦11.2m billed, so 78%. JSS 1B is the lowest class at 61%, while Primary 5 is fully paid. Two part payments share the same reference, so I flagged them for the bursar.",
    sources: ["Term 1 invoices", "48 payment records", "Bursary ledger"],
    action: "Open the fee report",
  },
  {
    id: "parent",
    label: "Parent",
    icon: HeartHandshake,
    short: "Progress, fees, schedules, school notices",
    question: "How is my child doing this term?",
    answer:
      "Somto is averaging 63% this term, strongest in English at 71%. He has missed two mornings. Physics fell from 68% to 59%, so revision should start with motion and forces.",
    sources: ["Somto's results", "Attendance record", "Term 1 fees"],
    action: "View the full report",
  },
  {
    id: "leadership",
    label: "Leadership",
    icon: Crown,
    short: "Institutional trends and decision support",
    question: "Which classes need support?",
    answer:
      "SS 1 Science leads attendance at 97%. Primary 5 is lowest at 88%, mostly Monday lateness. JSS 2A has the widest gap between good attendance and weak results, which makes it the clearest teaching support case.",
    sources: ["12 days of attendance", "All class averages", "Enrollment"],
    action: "Compare the classes",
  },
];

export function AiSection() {
  const [active, setActive] = useState(assistants[0]);
  const [prompt, setPrompt] = useState("");

  return (
    <section id="intelligence" className="scroll-mt-24 overflow-hidden bg-[#1D0D52] py-20 text-white sm:py-24">
      <div className="relative mx-auto max-w-[1280px] px-5 lg:px-8">
        <div className="pointer-events-none absolute -right-20 top-10 h-[380px] w-[380px] rounded-full bg-[#6A43E8]/30 blur-[120px]" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-[320px] w-[320px] rounded-full bg-[#8A63FF]/20 blur-[120px]" />

        <div className="relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-white/80">
                <Sparkles className="h-3 w-3 text-[#C7B4FF]" />
                The intelligence layer
              </span>
            </Reveal>
            <Reveal delay={70}>
              <h2 className="mt-5 text-[clamp(2rem,3.5vw,3.1rem)] font-extrabold leading-[1.02] tracking-[-0.045em]">
                The AI is in the workflow,{" "}
                <span className="font-serif font-normal italic tracking-[-0.02em] text-[#C7B4FF]">
                  not in a sidebar.
                </span>
              </h2>
            </Reveal>
            <Reveal delay={130}>
              <p className="mt-4 max-w-[480px] text-[14px] leading-relaxed text-white/60">
                Five assistants sit on top of the same records your team works in. Each answer
                names the data it used, and nothing is created without a human approving it.
              </p>
            </Reveal>

            <div className="mt-7 space-y-1.5">
              {assistants.map((assistant, index) => (
                <Reveal key={assistant.id} delay={150 + index * 40}>
                  <button
                    type="button"
                    onClick={() => setActive(assistant)}
                    aria-pressed={active.id === assistant.id}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-200",
                      active.id === assistant.id
                        ? "border-white/20 bg-white/10"
                        : "border-transparent hover:bg-white/5",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                        active.id === assistant.id
                          ? "bg-white text-brand-ink"
                          : "bg-white/10 text-white/70",
                      )}
                    >
                      <assistant.icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12.5px] font-semibold">{assistant.label}</span>
                      <span className="block truncate text-[10.5px] text-white/45">{assistant.short}</span>
                    </span>
                    <ArrowRight
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 transition-transform",
                        active.id === assistant.id
                          ? "text-white"
                          : "text-white/25 group-hover:translate-x-0.5 group-hover:text-white/60",
                      )}
                    />
                  </button>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={160} className="lg:pt-5">
            <div className="overflow-hidden rounded-2xl border border-white/15 bg-white text-ink shadow-[0_40px_100px_-30px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between border-b border-line-soft px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[12px] font-bold leading-tight text-ink">Eduschol AI</p>
                    <p className="text-[9.5px] leading-tight text-muted">Greenfield Academy, Term 1</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2 py-1 text-[9px] font-bold text-success">
                  <span className="live-dot" />
                  Records connected
                </span>
              </div>

              <div className="min-h-[330px] space-y-3 bg-[#FBFAFE] p-4 sm:p-5">
                <div className="flex justify-end">
                  <p className="max-w-[330px] rounded-2xl rounded-tr-sm bg-brand px-3.5 py-2.5 text-[12px] leading-relaxed text-white">
                    {active.question}
                  </p>
                </div>

                <div key={active.id} className="route-in flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line bg-white text-brand">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-line bg-white px-3.5 py-3">
                    <p className="text-[12px] leading-relaxed text-ink">{active.answer}</p>
                    <div className="mt-3 border-t border-line-soft pt-2.5">
                      <p className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-muted">
                        Sources
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {active.sources.map((source) => (
                          <span
                            key={source}
                            className="inline-flex items-center gap-1 rounded-md bg-line-soft px-1.5 py-0.5 text-[9px] font-medium text-muted"
                          >
                            <span className="h-1 w-1 rounded-full bg-brand" />
                            {source}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="mt-3 inline-flex items-center gap-1 text-[10.5px] font-bold text-brand transition-colors hover:text-brand-hover"
                    >
                      {active.action}
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <p className="flex items-center gap-1.5 pl-1 text-[9px] text-muted">
                  <ShieldCheck className="h-3 w-3 text-success" />
                  Nothing is saved or published without a human approving it.
                </p>
              </div>

              <div className="border-t border-line-soft bg-white p-3.5">
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!prompt.trim()) return;
                    const match =
                      assistants.find((assistant) =>
                        prompt.toLowerCase().includes(assistant.label.toLowerCase()),
                      ) ?? active;
                    setActive(match);
                    setPrompt("");
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder="Ask about attendance, results, fees..."
                    className="field flex-1"
                    aria-label="Ask Eduschol AI"
                  />
                  <button
                    type="submit"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-brand text-white transition-colors hover:bg-brand-hover"
                    aria-label="Send question"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
                <p className="mt-2 pl-1 text-[9px] text-muted">
                  Illustrative answers. In your workspace, every figure comes from your own records.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
