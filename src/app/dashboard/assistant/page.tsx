"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, BookOpenCheck, Database, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { PageTitle, Badge, Avatar } from "@/components/ui/surface";
import { useSchool } from "@/lib/store";
import { useSession } from "@/lib/session";
import { askAssistant, assistantSuggestions, type AssistantReply } from "@/lib/assistant";
import { atRiskStudents, feeSummary, guardianChildren, lowStock, studentAverage } from "@/lib/analytics";
import { compactNaira, percent } from "@/lib/format";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  author: "user" | "assistant";
  text: string;
  sources?: string[];
  facts?: { label: string; value: string }[];
};

export default function AssistantPage() {
  const { workspace } = useSchool();
  const { user } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [asked, setAsked] = useState<string[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!workspace || !user || messages.length) return;
    setMessages([
      {
        id: "greeting",
        author: "assistant",
        text:
          user.role === "parent"
            ? `Good day, ${user.name.split(" ")[0]}. I can read your children's results, attendance, fees and school notices. I will never add a fact that is not already on file. What would you like to know?`
            : user.role === "teacher"
              ? `Good day, ${user.name.split(" ")[0]}. I read the classes, registers, results and exam records in this workspace. Ask me about attendance, students who need support, or a class. I do not invent scores or comments without showing you the source.`
              : `Good day, ${user.name.split(" ")[0]}. I read the same records you do: students, staff, attendance, results, fees, stock and exams. Every answer below names the records it used. Ask me anything about ${workspace.school.name}.`,
        sources: ["Workspace records"],
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace, user]);

  useEffect(() => {
    const query = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("q") : null;
    if (query && workspace && user && messages.length === 1) {
      send(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace, user, messages.length]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (!workspace || !user) return null;

  const suggestions = assistantSuggestions[user.role];
  const risk =
    user.role === "parent"
      ? atRiskStudents(workspace).filter((row) => guardianChildren(workspace, user.email).some((child) => child.id === row.student.id))
      : atRiskStudents(workspace);
  const fees = feeSummary(
    workspace,
    user.role === "parent"
      ? workspace.invoices.filter((invoice) => guardianChildren(workspace, user.email).some((child) => child.id === invoice.studentId))
      : undefined,
  );
  const average = user.role === "parent"
    ? guardianChildren(workspace, user.email).reduce((total, child) => total + studentAverage(workspace, child.id), 0) / Math.max(1, guardianChildren(workspace, user.email).length)
    : 0;

  function send(question: string) {
    const clean = question.trim();
    if (!clean || !workspace || !user) return;
    const reply: AssistantReply = askAssistant(
      { workspace, role: user.role, name: user.name, email: user.email },
      clean,
    );
    setMessages((current) => [
      ...current,
      { id: `u-${Date.now()}`, author: "user", text: clean },
    ]);
    setAsked((current) => [...current, clean]);
    setInput("");
    setThinking(true);
    timer.current = setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: `a-${Date.now()}`,
          author: "assistant",
          text: reply.answer,
          sources: reply.sources,
          facts: reply.facts,
        },
      ]);
      setThinking(false);
    }, 560);
  }

  const records =
    workspace.students.length +
    workspace.staff.length +
    workspace.results.length +
    workspace.attendance.length +
    workspace.invoices.length +
    workspace.inventory.length +
    workspace.exams.length;

  return (
    <div className="space-y-4">
      <PageTitle
        eyebrow="Intelligence"
        title="School assistant"
        description="Ask in plain language. Answers are assembled from records in this workspace, and the source of every number is named."
        actions={
          <button
            type="button"
            onClick={() => {
              setMessages([]);
              setAsked([]);
            }}
            className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-line bg-white px-3.5 text-[11.5px] font-semibold text-ink transition-colors hover:border-brand/30 hover:bg-brand-soft/40"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New conversation
          </button>
        }
      />

      <div className="grid gap-3 xl:grid-cols-[1fr_290px]">
        <section className="card flex min-h-[560px] flex-col overflow-hidden">
          <div className="flex items-center gap-2.5 border-b border-line bg-gradient-to-r from-brand-soft/60 to-transparent px-4 py-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-white">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11.5px] font-bold text-ink">Eduschol assistant</p>
              <p className="flex items-center gap-1 text-[9px] text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Reading {records.toLocaleString()} workspace records
              </p>
            </div>
            <Badge tone="accent">{user.role}</Badge>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-3 py-4 sm:px-4">
            {messages.map((message) =>
              message.author === "assistant" ? (
                <div key={message.id} className="flex gap-2.5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand text-white">
                    <Sparkles className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 max-w-[92%] sm:max-w-[85%]">
                    <div className="rounded-2xl rounded-tl-md border border-line bg-canvas/70 px-3.5 py-3">
                      <p className="whitespace-pre-line text-[11.5px] leading-[1.75] text-ink/85">{message.text}</p>
                      {message.facts?.length ? (
                        <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                          {message.facts.map((fact) => (
                            <div key={fact.label} className="rounded-lg bg-white px-2 py-1.5">
                              <p className="truncate text-[8px] font-semibold uppercase tracking-wide text-muted">{fact.label}</p>
                              <p className="mt-0.5 truncate text-[10.5px] font-bold text-ink">{fact.value}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    {message.sources?.length ? (
                      <div className="mt-1.5 flex flex-wrap items-center gap-1">
                        <Database className="h-2.5 w-2.5 text-muted" />
                        {message.sources.map((source) => (
                          <span key={source} className="rounded-full border border-line bg-white px-1.5 py-0.5 text-[8.5px] text-muted">
                            {source}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div key={message.id} className="flex justify-end gap-2.5">
                  <div className="max-w-[85%] rounded-2xl rounded-br-md bg-brand px-3.5 py-2.5 text-[11.5px] leading-relaxed text-white">
                    {message.text}
                  </div>
                  <Avatar name={user.name} size="xs" />
                </div>
              ),
            )}

            {thinking ? (
              <div className="flex gap-2.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand text-white">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-line bg-white px-3 py-2.5">
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand/50"
                      style={{ animationDelay: `${dot * 120}ms` }}
                    />
                  ))}
                </div>
              </div>
            ) : null}
            <div ref={endRef} />
          </div>

          <div className="border-t border-line px-3 pb-3 pt-2.5 sm:px-4">
            <div className="mb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
              {suggestions
                .filter((suggestion) => !asked.includes(suggestion))
                .slice(0, 4)
                .map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => send(suggestion)}
                    className="whitespace-nowrap rounded-full border border-line bg-white px-2.5 py-1 text-[9.5px] font-medium text-muted transition-colors hover:border-brand/30 hover:bg-brand-soft hover:text-brand-ink"
                  >
                    {suggestion}
                  </button>
                ))}
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                send(input);
              }}
              className="flex items-end gap-2"
            >
              <label htmlFor="assistant-input" className="sr-only">
                Ask the school assistant
              </label>
              <textarea
                id="assistant-input"
                rows={1}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Ask about attendance, fees, results or a student"
                className="field max-h-[120px] min-h-[42px] flex-1 resize-none py-2.5 text-[11.5px]"
              />
              <button
                type="submit"
                disabled={!input.trim() || thinking}
                className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-brand text-white transition-all hover:bg-brand-hover disabled:opacity-40"
                aria-label="Send question"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-1.5 text-center text-[8.5px] text-muted">
              Answers come from records already on file. Nothing is invented or sent without a human.
            </p>
          </div>
        </section>

        <div className="space-y-3">
          <section className="card p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand" />
              <h2 className="text-[11.5px] font-bold text-ink">What this assistant can see</h2>
            </div>
            <div className="mt-3 space-y-2">
              {[
                { label: "Students", value: user.role === "parent" ? guardianChildren(workspace, user.email).length : workspace.students.length },
                { label: "Attendance records", value: workspace.attendance.length },
                { label: "Published results", value: workspace.results.length },
                { label: "Invoices", value: fees.count },
                { label: "Exam papers", value: workspace.exams.length },
                { label: "Flagged students", value: risk.length },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-[10px]">
                  <span className="text-muted">{row.label}</span>
                  <span className="font-bold text-ink tnum">{row.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-lg bg-canvas px-2.5 py-2 text-[9px] leading-relaxed text-muted">
              {user.role === "parent"
                ? "Your scope is limited to your own children. Staff, payroll and school-wide finance are not readable from this account."
                : "Access follows your role. A teacher scope covers classes and records assigned to that teacher."}
            </div>
          </section>

          <section className="card p-4">
            <div className="flex items-center gap-2">
              <BookOpenCheck className="h-4 w-4 text-brand" />
              <h2 className="text-[11.5px] font-bold text-ink">At a glance</h2>
            </div>
            <div className="mt-3 space-y-2.5">
              <div className="rounded-xl bg-canvas p-2.5">
                <p className="text-[8.5px] font-semibold uppercase tracking-wide text-muted">Collection rate</p>
                <p className="mt-0.5 text-[16px] font-extrabold text-ink tnum">{percent(fees.rate, 1)}%</p>
                <p className="text-[8.5px] text-muted">{compactNaira(fees.outstanding)} outstanding</p>
              </div>
              {user.role === "parent" ? (
                <div className="rounded-xl bg-canvas p-2.5">
                  <p className="text-[8.5px] font-semibold uppercase tracking-wide text-muted">Children's average</p>
                  <p className="mt-0.5 text-[16px] font-extrabold text-ink tnum">{percent(average, 1)}%</p>
                  <p className="text-[8.5px] text-muted">Across published results</p>
                </div>
              ) : (
                <div className="rounded-xl bg-canvas p-2.5">
                  <p className="text-[8.5px] font-semibold uppercase tracking-wide text-muted">Low stock items</p>
                  <p className="mt-0.5 text-[16px] font-extrabold text-ink tnum">{lowStock(workspace).length}</p>
                  <p className="text-[8.5px] text-muted">At or below reorder level</p>
                </div>
              )}
            </div>
          </section>

          <section className={cn("card p-4", "border-brand/20 bg-brand-soft/30")}>
            <h2 className="text-[10px] font-bold uppercase tracking-[0.1em] text-brand">The rule</h2>
            <p className="mt-1.5 text-[10px] leading-relaxed text-ink/70">
              No invented degrees, scores, payments or staff. If the record is missing, the assistant
              says so. Draft comments are labelled and require review before publishing.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
