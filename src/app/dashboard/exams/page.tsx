"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  FileQuestion,
  MonitorCheck,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { PageTitle, Badge, EmptyState, Progress, Tabs } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useSchool } from "@/lib/store";
import { useSession } from "@/lib/session";
import { className as roomName, subjectName } from "@/lib/analytics";
import { dateLabel, percent, timeLabel } from "@/lib/format";
import { cn, uid } from "@/lib/utils";
import type { Exam } from "@/lib/types";

type QuestionDraft = { prompt: string; options: string[]; answer: number };
type Filter = "all" | "draft" | "scheduled" | "completed";

const blankQuestion = (): QuestionDraft => ({ prompt: "", options: ["", "", "", ""], answer: 0 });

export default function ExamsPage() {
  const { workspace, update } = useSchool();
  const { user } = useSession();
  const { toast } = useToast();
  const [filter, setFilter] = useState<Filter>("all");
  const [builderOpen, setBuilderOpen] = useState(false);
  const [take, setTake] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subjectId: "",
    classId: "",
    duration: "40",
    scheduledFor: new Date(Date.now() + 86_400_000).toISOString().slice(0, 16),
  });
  const [questions, setQuestions] = useState<QuestionDraft[]>([blankQuestion()]);
  const [error, setError] = useState("");

  const exams = useMemo(() => {
    if (!workspace) return [];
    return [...workspace.exams]
      .filter((exam) => filter === "all" || exam.status === filter)
      .sort((a, b) => new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime());
  }, [workspace, filter]);

  if (!workspace || !user) return null;

  if (user.role === "parent") {
    return (
      <EmptyState
        icon={MonitorCheck}
        title="The exam room is for teachers"
        description="Your children's published scores and report cards are in Results."
      />
    );
  }

  const counts = {
    all: workspace.exams.length,
    draft: workspace.exams.filter((exam) => exam.status === "draft").length,
    scheduled: workspace.exams.filter((exam) => exam.status === "scheduled").length,
    completed: workspace.exams.filter((exam) => exam.status === "completed").length,
  };

  function openBuilder() {
    setForm({
      title: "",
      subjectId: workspace?.subjects[0]?.id ?? "",
      classId: workspace?.classes[0]?.id ?? "",
      duration: "40",
      scheduledFor: new Date(Date.now() + 86_400_000).toISOString().slice(0, 16),
    });
    setQuestions([blankQuestion()]);
    setError("");
    setBuilderOpen(true);
  }

  function submitExam(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!form.title.trim()) {
      setError("Give the paper a title.");
      return;
    }
    const valid = questions.filter(
      (question) => question.prompt.trim() && question.options.every((option) => option.trim()),
    );
    if (!valid.length) {
      setError("Add at least one complete question with four options.");
      return;
    }
    const exam: Exam = {
      id: uid("exm"),
      title: form.title.trim(),
      subjectId: form.subjectId,
      classId: form.classId,
      duration: Number(form.duration) || 40,
      questions: valid,
      status: "scheduled",
      scheduledFor: new Date(form.scheduledFor).toISOString(),
      submissions: 0,
      average: 0,
    };
    update((current) => ({
      ...current,
      exams: [exam, ...current.exams],
      activity: [
        { id: uid("act"), kind: "exam.created", text: `${user?.name ?? "A teacher"} scheduled ${exam.title} for ${roomName(current, exam.classId)}`, at: new Date().toISOString() },
        ...current.activity,
      ],
    }));
    setBuilderOpen(false);
    toast(`${exam.title} scheduled with ${valid.length} questions`, "success");
  }

  function openExam(exam: Exam) {
    setTake(exam);
    setAnswers({});
    setSubmitted(false);
  }

  function submitPaper() {
    if (!take) return;
    const correct = take.questions.filter((question, index) => answers[index] === question.answer).length;
    const score = take.questions.length ? (correct / take.questions.length) * 100 : 0;
    update((current) => ({
      ...current,
      exams: current.exams.map((exam) =>
        exam.id === take.id
          ? {
              ...exam,
              submissions: exam.submissions + 1,
              average: exam.submissions ? (exam.average * exam.submissions + score) / (exam.submissions + 1) : score,
            }
          : exam,
      ),
    }));
    setSubmitted(true);
    toast(`Paper submitted: ${correct} of ${take.questions.length} correct`, "success");
  }

  const correctCount = take ? take.questions.filter((question, index) => answers[index] === question.answer).length : 0;

  return (
    <div className="space-y-4">
      <PageTitle
        eyebrow="Academics"
        title="Exams and computer based tests"
        description="Build a paper, schedule it for a class, and let students sit it on any screen. Objective papers mark themselves."
        actions={
          <Button size="md" onClick={openBuilder}>
            <Plus className="h-3.5 w-3.5" />
            New paper
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Papers on file", value: counts.all, foot: `${counts.scheduled} scheduled` },
          { label: "Drafts", value: counts.draft, foot: "Still being written" },
          { label: "Submissions", value: workspace.exams.reduce((total, exam) => total + exam.submissions, 0), foot: "Across all papers" },
          { label: "Average score", value: `${percent(workspace.exams.filter((exam) => exam.submissions > 0).reduce((total, exam) => total + exam.average, 0) / Math.max(1, workspace.exams.filter((exam) => exam.submissions > 0).length), 0)}%`, foot: "Papers with submissions" },
        ].map((item) => (
          <div key={item.label} className="card p-4">
            <p className="text-[10px] font-semibold text-muted">{item.label}</p>
            <p className="mt-1.5 text-[22px] font-extrabold leading-none tracking-[-0.03em] text-ink tnum">{item.value}</p>
            <p className="mt-1.5 text-[9.5px] text-muted">{item.foot}</p>
          </div>
        ))}
      </div>

      <Tabs
        tabs={[
          { id: "all", label: "All papers", count: counts.all },
          { id: "scheduled", label: "Scheduled", count: counts.scheduled },
          { id: "draft", label: "Drafts", count: counts.draft },
          { id: "completed", label: "Completed", count: counts.completed },
        ]}
        value={filter}
        onChange={setFilter}
        className="max-w-full overflow-x-auto no-scrollbar"
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {exams.map((exam) => (
          <article key={exam.id} className="card flex flex-col p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <MonitorCheck className="h-4 w-4" />
              </span>
              <Badge tone={exam.status === "scheduled" ? "success" : exam.status === "draft" ? "warning" : "neutral"} dot>
                {exam.status}
              </Badge>
            </div>
            <h3 className="mt-3 text-[12px] font-bold leading-snug text-ink">{exam.title}</h3>
            <p className="mt-0.5 text-[9.5px] text-muted">
              {subjectName(workspace, exam.subjectId)} · {roomName(workspace, exam.classId)}
            </p>
            <div className="mt-3 grid grid-cols-3 gap-1.5 rounded-lg bg-canvas p-2">
              <div>
                <p className="text-[8.5px] text-muted">Questions</p>
                <p className="text-[11px] font-bold text-ink tnum">{exam.questions.length}</p>
              </div>
              <div>
                <p className="text-[8.5px] text-muted">Duration</p>
                <p className="text-[11px] font-bold text-ink tnum">{exam.duration}m</p>
              </div>
              <div>
                <p className="text-[8.5px] text-muted">Average</p>
                <p className="text-[11px] font-bold text-ink tnum">{exam.submissions ? `${percent(exam.average, 0)}%` : "-"}</p>
              </div>
            </div>
            <p className="mt-2.5 flex items-center gap-1.5 text-[9px] text-muted">
              <Clock className="h-3 w-3" />
              {dateLabel(exam.scheduledFor)} at {timeLabel(exam.scheduledFor)} · {exam.submissions} submissions
            </p>
            <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
              <Button size="sm" variant="soft" className="flex-1" onClick={() => openExam(exam)}>
                Preview paper
                <ChevronRight className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  update((current) => ({
                    ...current,
                    exams: current.exams.map((item) =>
                      item.id === exam.id
                        ? { ...item, status: item.status === "completed" ? "scheduled" : "completed" }
                        : item,
                    ),
                  }));
                  toast(`${exam.title} marked ${exam.status === "completed" ? "scheduled" : "completed"}`, "success");
                }}
              >
                {exam.status === "completed" ? "Reopen" : "Close"}
              </Button>
            </div>
          </article>
        ))}
      </div>

      {!exams.length ? (
        <EmptyState icon={FileQuestion} title="No papers in this view" description="Create a paper and add objective questions. It can be sat immediately." />
      ) : null}

      <Modal
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        title="Build a paper"
        description="Objective questions mark themselves. A student's score is added to the class record on submit."
        size="lg"
        footer={
          <>
            <Button variant="ghost" size="md" onClick={() => setBuilderOpen(false)}>Cancel</Button>
            <Button size="md" type="submit" form="exam-form">Schedule paper</Button>
          </>
        }
      >
        <form id="exam-form" onSubmit={submitExam} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Paper title" htmlFor="etitle" className="sm:col-span-2">
              <Input id="etitle" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="JSS 2A Mathematics, mid term CBT" />
            </Field>
            <Field label="Subject" htmlFor="esubject">
              <Select id="esubject" value={form.subjectId} onChange={(event) => setForm({ ...form, subjectId: event.target.value })}>
                {workspace.subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Class" htmlFor="eclass">
              <Select id="eclass" value={form.classId} onChange={(event) => setForm({ ...form, classId: event.target.value })}>
                {workspace.classes.map((room) => (
                  <option key={room.id} value={room.id}>{room.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Duration (minutes)" htmlFor="eduration">
              <Input id="eduration" inputMode="numeric" value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} />
            </Field>
            <Field label="Date and time" htmlFor="edate">
              <Input id="edate" type="datetime-local" value={form.scheduledFor} onChange={(event) => setForm({ ...form, scheduledFor: event.target.value })} />
            </Field>
          </div>

          <div className="rounded-xl border border-line">
            <div className="flex items-center justify-between border-b border-line px-3 py-2">
              <p className="text-[11px] font-bold text-ink">Questions ({questions.length})</p>
              <Button size="sm" variant="soft" type="button" onClick={() => setQuestions((current) => [...current, blankQuestion()])}>
                <Plus className="h-3 w-3" />
                Add question
              </Button>
            </div>
            <div className="max-h-[320px] space-y-3 overflow-y-auto p-3">
              {questions.map((question, index) => (
                <div key={index} className="rounded-lg bg-canvas p-3">
                  <div className="flex items-start gap-2">
                    <span className="mt-2 text-[10px] font-bold text-muted tnum">{index + 1}.</span>
                    <div className="flex-1 space-y-2">
                      <Textarea
                        rows={2}
                        value={question.prompt}
                        onChange={(event) =>
                          setQuestions((current) =>
                            current.map((item, itemIndex) => (itemIndex === index ? { ...item, prompt: event.target.value } : item)),
                          )
                        }
                        placeholder="What is 12 multiplied by 8?"
                        aria-label={`Question ${index + 1}`}
                      />
                      <div className="grid gap-1.5 sm:grid-cols-2">
                        {question.options.map((option, optionIndex) => (
                          <label key={optionIndex} className="flex items-center gap-2 rounded-md border border-line bg-white px-2 py-1.5">
                            <input
                              type="radio"
                              name={`answer-${index}`}
                              checked={question.answer === optionIndex}
                              onChange={() =>
                                setQuestions((current) =>
                                  current.map((item, itemIndex) => (itemIndex === index ? { ...item, answer: optionIndex } : item)),
                                )
                              }
                              aria-label={`Mark option ${String.fromCharCode(65 + optionIndex)} correct`}
                              className="h-3 w-3 accent-[hsl(var(--brand))]"
                            />
                            <span className="text-[9px] font-bold text-muted">{String.fromCharCode(65 + optionIndex)}</span>
                            <input
                              value={option}
                              onChange={(event) =>
                                setQuestions((current) =>
                                  current.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? { ...item, options: item.options.map((value, valueIndex) => (valueIndex === optionIndex ? event.target.value : value)) }
                                      : item,
                                  ),
                                )
                              }
                              placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                              aria-label={`Option ${String.fromCharCode(65 + optionIndex)} for question ${index + 1}`}
                              className="w-full border-0 bg-transparent text-[10.5px] text-ink outline-none placeholder:text-muted/60"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                    {questions.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => setQuestions((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                        className="mt-1.5 flex h-6 w-6 items-center justify-center rounded-md text-muted hover:bg-danger-soft hover:text-danger"
                        aria-label={`Remove question ${index + 1}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {error ? <p className="rounded-lg bg-danger-soft px-3 py-2 text-[11px] font-medium text-danger">{error}</p> : null}
        </form>
      </Modal>

      <Modal
        open={Boolean(take)}
        onClose={() => setTake(null)}
        title={take?.title ?? "Paper"}
        description={take ? `${take.questions.length} questions, ${take.duration} minutes, ${roomName(workspace, take.classId)}` : undefined}
        size="lg"
        footer={
          submitted ? (
            <Button size="md" type="button" onClick={() => setTake(null)}>Close</Button>
          ) : (
            <>
              <Button variant="ghost" size="md" onClick={() => setTake(null)}>Exit</Button>
              <Button size="md" type="button" onClick={submitPaper} disabled={Object.keys(answers).length !== take?.questions.length}>
                Submit paper
              </Button>
            </>
          )
        }
      >
        {take ? (
          submitted ? (
            <div className="py-6 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success">
                <CheckCircle2 className="h-7 w-7" />
              </span>
              <p className="mt-4 text-[28px] font-extrabold tracking-[-0.04em] text-ink tnum">
                {percent((correctCount / take.questions.length) * 100, 0)}%
              </p>
              <p className="mt-1 text-[11.5px] text-muted">
                {correctCount} of {take.questions.length} correct
              </p>
              <div className="mt-4 space-y-2 text-left">
                {take.questions.map((question, index) => {
                  const isCorrect = answers[index] === question.answer;
                  return (
                    <div key={index} className={cn("rounded-lg border p-2.5", isCorrect ? "border-success/30 bg-success-soft/30" : "border-danger/25 bg-danger-soft/30")}>
                      <p className="text-[10px] font-semibold text-ink">{index + 1}. {question.prompt}</p>
                      <p className="mt-1 text-[9.5px] text-muted">
                        Your answer: {question.options[answers[index]] ?? "No answer"}.
                        {!isCorrect ? ` Correct answer: ${question.options[question.answer]}.` : ""}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-canvas px-3 py-2">
                <span className="text-[10px] text-muted">Answer every question to submit</span>
                <span className="text-[10px] font-bold text-ink tnum">
                  {Object.keys(answers).length}/{take.questions.length} answered
                </span>
              </div>
              <Progress value={(Object.keys(answers).length / take.questions.length) * 100} className="h-1" />
              {take.questions.map((question, index) => (
                <div key={index} className="rounded-xl border border-line p-3">
                  <p className="text-[11px] font-semibold leading-snug text-ink">
                    {index + 1}. {question.prompt}
                  </p>
                  <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                    {question.options.map((option, optionIndex) => {
                      const chosen = answers[index] === optionIndex;
                      return (
                        <button
                          key={optionIndex}
                          type="button"
                          onClick={() => setAnswers((current) => ({ ...current, [index]: optionIndex }))}
                          className={cn(
                            "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-[10.5px] transition-all",
                            chosen ? "border-brand bg-brand-soft text-brand-ink" : "border-line bg-white text-ink hover:border-brand/30",
                          )}
                        >
                          <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold", chosen ? "border-brand bg-brand text-white" : "border-line text-muted")}>
                            {String.fromCharCode(65 + optionIndex)}
                          </span>
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => setAnswers({})} className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-muted hover:text-danger">
                <X className="h-3 w-3" />
                Clear all answers
              </button>
            </div>
          )
        ) : null}
      </Modal>
    </div>
  );
}
