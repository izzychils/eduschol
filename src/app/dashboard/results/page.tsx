"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Printer, Save, Trophy } from "lucide-react";
import { PageTitle, Badge, Avatar, EmptyState, Progress, Tabs } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { useSchool } from "@/lib/store";
import { useSession } from "@/lib/session";
import {
  classAverage,
  classResults,
  className as roomName,
  guardianChildren,
  studentAttendanceRate,
  studentAverage,
  studentResults,
  subjectName,
  subjectPerformance,
  studentsInClass,
} from "@/lib/analytics";
import { gradeFor, percent } from "@/lib/format";
import { cn, uid } from "@/lib/utils";

type Score = { ca1: number; ca2: number; exam: number };
type ViewKey = "broadsheet" | "entry";

export default function ResultsPage() {
  const { workspace, update } = useSchool();
  const { user } = useSession();
  const { toast } = useToast();
  const [view, setView] = useState<ViewKey>("broadsheet");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [draft, setDraft] = useState<Record<string, Score>>({});

  const classes = useMemo(() => {
    if (!workspace || !user) return [];
    if (user.role !== "teacher") return workspace.classes;
    const me =
      workspace.staff.find((member) => member.email.toLowerCase() === user.email.toLowerCase()) ??
      workspace.staff.find((member) => member.name.toLowerCase() === user.name.toLowerCase());
    const rooms = workspace.classes.filter((room) => room.teacherId === me?.id);
    return rooms.length ? rooms : workspace.classes;
  }, [workspace, user]);

  const activeClass = classId || classes[0]?.id || "";
  const subjects = useMemo(() => {
    if (!workspace) return [];
    const ids = new Set(workspace.results.filter((row) => row.classId === activeClass).map((row) => row.subjectId));
    return workspace.subjects.filter((subject) => ids.has(subject.id));
  }, [workspace, activeClass]);

  const activeSubject = subjectId && subjects.some((subject) => subject.id === subjectId) ? subjectId : subjects[0]?.id ?? "";

  const roster = useMemo(
    () => (workspace && activeClass ? studentsInClass(workspace, activeClass) : []),
    [workspace, activeClass],
  );

  useEffect(() => {
    if (!workspace || !activeClass || !activeSubject) return;
    const next: Record<string, Score> = {};
    studentsInClass(workspace, activeClass).forEach((student) => {
      const row = workspace.results.find(
        (result) => result.studentId === student.id && result.classId === activeClass && result.subjectId === activeSubject,
      );
      next[student.id] = row ? { ca1: row.ca1, ca2: row.ca2, exam: row.exam } : { ca1: 0, ca2: 0, exam: 0 };
    });
    setDraft(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace, activeClass, activeSubject]);

  if (!workspace || !user) return null;

  if (user.role === "parent") {
    const children = guardianChildren(workspace, user.email);
    return (
      <div className="space-y-4">
        <PageTitle
          eyebrow="Academics"
          title="My children's results"
          description="Published scores for the current term, subject by subject."
        />
        {children.map((child) => {
          const results = studentResults(workspace, child.id);
          const average = studentAverage(workspace, child.id);
          const grade = gradeFor(average);
          const room = workspace.classes.find((item) => item.id === child.classId);
          const best = [...results].sort((a, b) => b.ca1 + b.ca2 + b.exam - (a.ca1 + a.ca2 + a.exam))[0];
          return (
            <section key={child.id} className="card overflow-hidden">
              <div className="flex flex-wrap items-center gap-3 border-b border-line bg-gradient-to-r from-brand-soft/60 to-transparent px-4 py-3">
                <Avatar name={`${child.firstName} ${child.lastName}`} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-bold text-ink">{child.firstName} {child.lastName}</p>
                  <p className="text-[9.5px] text-muted">{room?.name} · {workspace.school.term}</p>
                </div>
                <Badge tone={grade.tone}>{grade.grade} · {grade.remark}</Badge>
                <Link href={`/print/report/${child.id}`} target="_blank" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 text-[10px] font-semibold text-ink">
                  <Printer className="h-3 w-3" />
                  Report card
                </Link>
              </div>
              <div className="grid grid-cols-3 divide-x divide-line border-b border-line bg-canvas/40">
                <div className="px-4 py-2.5">
                  <p className="text-[9px] text-muted">Average</p>
                  <p className="mt-0.5 text-[17px] font-extrabold text-ink tnum">{percent(average, 1)}%</p>
                </div>
                <div className="px-4 py-2.5">
                  <p className="text-[9px] text-muted">Subjects</p>
                  <p className="mt-0.5 text-[17px] font-extrabold text-ink tnum">{results.length}</p>
                </div>
                <div className="px-4 py-2.5">
                  <p className="text-[9px] text-muted">Attendance</p>
                  <p className="mt-0.5 text-[17px] font-extrabold text-ink tnum">{percent(studentAttendanceRate(workspace, child.id), 0)}%</p>
                </div>
              </div>
              <div className="divide-y divide-line-soft">
                {results.map((row) => {
                  const total = row.ca1 + row.ca2 + row.exam;
                  const rowGrade = gradeFor(total);
                  return (
                    <div key={row.id} className="flex items-center gap-2 px-4 py-2">
                      <span className="w-[150px] shrink-0 truncate text-[10.5px] text-ink">{subjectName(workspace, row.subjectId)}</span>
                      <Progress value={total} tone={total >= 65 ? "success" : total >= 45 ? "brand" : "danger"} className="h-1 flex-1" />
                      <span className="w-7 text-right text-[10px] text-muted tnum">{row.ca1}</span>
                      <span className="w-7 text-right text-[10px] text-muted tnum">{row.ca2}</span>
                      <span className="w-8 text-right text-[10px] text-muted tnum">{row.exam}</span>
                      <span className="w-9 text-right text-[10.5px] font-bold text-ink tnum">{total}</span>
                      <Badge tone={rowGrade.tone}>{rowGrade.grade}</Badge>
                    </div>
                  );
                })}
              </div>
              <p className="border-t border-line px-4 py-2 text-[9px] text-muted">
                CA1 20, CA2 20, examination 60. {best ? `Strongest subject: ${subjectName(workspace, best.subjectId)}.` : ""}
              </p>
            </section>
          );
        })}
        {!children.length ? (
          <EmptyState icon={ClipboardList} title="No results to show" description="Results appear once the school publishes them for your children." />
        ) : null}
      </div>
    );
  }

  const ranking = activeClass ? classResults(workspace, activeClass) : [];
  const average = activeClass ? classAverage(workspace, activeClass) : 0;
  const performance = subjectPerformance(workspace, activeClass).filter((row) => row.entries > 0);

  function updateScore(studentId: string, field: keyof Score, value: string) {
    const max = field === "exam" ? 60 : 20;
    const parsed = Math.max(0, Math.min(max, Number(value) || 0));
    setDraft((current) => ({
      ...current,
      [studentId]: { ...(current[studentId] ?? { ca1: 0, ca2: 0, exam: 0 }), [field]: parsed },
    }));
  }

  function save() {
    if (!activeClass || !activeSubject) return;
    update((current) => {
      const kept = current.results.filter(
        (row) => !(row.classId === activeClass && row.subjectId === activeSubject),
      );
      const entries = Object.entries(draft).map(([studentId, score]) => ({
        id: uid("res"),
        studentId,
        classId: activeClass,
        subjectId: activeSubject,
        term: current.school.term,
        session: current.school.session,
        ca1: score.ca1,
        ca2: score.ca2,
        exam: score.exam,
      }));
      return {
        ...current,
        results: [...kept, ...entries],
        activity: [
          {
            id: uid("act"),
            kind: "result.saved",
            text: `${user?.name ?? "A teacher"} published ${subjectName(current, activeSubject)} scores for ${roomName(current, activeClass)}`,
            at: new Date().toISOString(),
          },
          ...current.activity,
        ],
      };
    });
    toast(`${subjectName(workspace!, activeSubject)} scores published for ${roomName(workspace!, activeClass)}`, "success");
  }

  return (
    <div className="space-y-4">
      <PageTitle
        eyebrow="Academics"
        title="Results and gradebook"
        description="Scores are entered once per subject. Totals, grades, positions and report cards follow automatically."
        actions={
          <>
            <Select value={activeClass} onChange={(event) => setClassId(event.target.value)} className="h-10 w-[150px] text-[11.5px]">
              {classes.map((room) => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </Select>
            <Button size="md" onClick={save} disabled={view !== "entry"}>
              <Save className="h-3.5 w-3.5" />
              Publish scores
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Class average", value: `${percent(average, 1)}%`, foot: `${ranking.length} students ranked` },
          { label: "Top of class", value: ranking[0] ? `${ranking[0].student.firstName} ${ranking[0].student.lastName.slice(0, 1)}.` : "-", foot: ranking[0] ? `${percent(ranking[0].average, 0)}% average` : "No scores yet" },
          { label: "Best subject", value: performance[0] ? performance[0].subject.name : "-", foot: performance[0] ? `${percent(performance[0].average, 0)}% average` : "No entries" },
          { label: "Below 50%", value: ranking.filter((row) => row.average < 50).length, foot: "Students needing support" },
        ].map((item) => (
          <div key={item.label} className="card p-4">
            <p className="text-[10px] font-semibold text-muted">{item.label}</p>
            <p className="mt-1.5 truncate text-[20px] font-extrabold leading-tight tracking-[-0.03em] text-ink">{item.value}</p>
            <p className="mt-1 text-[9.5px] text-muted">{item.foot}</p>
          </div>
        ))}
      </div>

      <Tabs
        tabs={[
          { id: "broadsheet", label: "Broadsheet", count: ranking.length },
          { id: "entry", label: "Score entry", count: roster.length },
        ]}
        value={view}
        onChange={setView}
      />

      {view === "broadsheet" ? (
        <div className="grid gap-3 xl:grid-cols-[1.6fr_1fr]">
          <section className="card overflow-hidden">
            <div className="hidden grid-cols-[30px_1.6fr_0.8fr_0.6fr_0.6fr_40px] gap-2 border-b border-line bg-canvas/60 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-muted sm:grid">
              <span>#</span>
              <span>Student</span>
              <span>Average</span>
              <span>Grade</span>
              <span>Attendance</span>
              <span />
            </div>
            <div className="divide-y divide-line-soft">
              {ranking.map((row) => (
                <div key={row.student.id} className="grid grid-cols-[24px_1fr_auto] items-center gap-2 px-4 py-2.5 sm:grid-cols-[30px_1.6fr_0.8fr_0.6fr_0.6fr_40px]">
                  <span className={cn("text-[10px] font-bold tnum", row.position === 1 ? "text-warning" : "text-muted")}>
                    {row.position === 1 ? <Trophy className="h-3.5 w-3.5" /> : row.position}
                  </span>
                  <div className="flex min-w-0 items-center gap-2">
                    <Avatar name={`${row.student.firstName} ${row.student.lastName}`} size="xs" />
                    <Link href={`/dashboard/students/${row.student.id}`} className="truncate text-[10.5px] font-semibold text-ink hover:text-brand">
                      {row.student.firstName} {row.student.lastName}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="hidden h-1 w-14 overflow-hidden rounded-full bg-line-soft sm:block">
                      <div className={cn("h-full rounded-full", row.average >= 65 ? "bg-success" : row.average >= 45 ? "bg-brand" : "bg-danger")} style={{ width: `${row.average}%` }} />
                    </div>
                    <span className="w-10 text-right text-[10.5px] font-bold text-ink tnum">{percent(row.average, 1)}%</span>
                  </div>
                  <div className="hidden sm:block">
                    <Badge tone={row.grade.tone}>{row.grade.grade}</Badge>
                  </div>
                  <span className="hidden text-[10px] text-muted tnum sm:block">{percent(studentAttendanceRate(workspace, row.student.id), 0)}%</span>
                  <Link href={`/print/report/${row.student.id}`} target="_blank" className="hidden text-right text-muted hover:text-brand sm:block" aria-label="Print report card">
                    <Printer className="ml-auto h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
            {!ranking.length ? <EmptyState icon={ClipboardList} title="No results in this class" description="Use score entry to record the first subject." /> : null}
          </section>

          <section className="card p-4">
            <h2 className="text-[12px] font-bold text-ink">Subject performance</h2>
            <p className="mt-0.5 text-[9.5px] text-muted">Average per subject, {roomName(workspace, activeClass)}</p>
            <div className="mt-3 space-y-2.5">
              {performance.map((row) => (
                <div key={row.subject.id}>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-ink/75">{row.subject.name}</span>
                    <span className="font-bold text-ink tnum">{percent(row.average, 1)}%</span>
                  </div>
                  <Progress value={row.average} tone={row.average >= 65 ? "success" : row.average >= 50 ? "brand" : "warning"} className="mt-1 h-1" />
                </div>
              ))}
              {!performance.length ? <p className="text-[10px] text-muted">No scores recorded for this class yet.</p> : null}
            </div>
          </section>
        </div>
      ) : (
        <section className="card overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
            <Select value={activeSubject} onChange={(event) => setSubjectId(event.target.value)} className="h-9 w-[180px] text-[11px]">
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </Select>
            <p className="text-[10px] text-muted">CA1 and CA2 out of 20, examination out of 60.</p>
            <Button size="sm" className="ml-auto" onClick={save}>
              <Save className="h-3 w-3" />
              Save subject
            </Button>
          </div>
          <div className="grid grid-cols-[1fr_46px_46px_46px_40px] gap-2 border-b border-line bg-canvas/60 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-muted sm:grid-cols-[1.6fr_70px_70px_70px_60px]">
            <span>Student</span>
            <span className="text-center">CA1</span>
            <span className="text-center">CA2</span>
            <span className="text-center">Exam</span>
            <span className="text-right">Total</span>
          </div>
          <div className="divide-y divide-line-soft">
            {roster.map((student) => {
              const score = draft[student.id] ?? { ca1: 0, ca2: 0, exam: 0 };
              const total = score.ca1 + score.ca2 + score.exam;
              return (
                <div key={student.id} className="grid grid-cols-[1fr_46px_46px_46px_40px] items-center gap-2 px-4 py-1.5 sm:grid-cols-[1.6fr_70px_70px_70px_60px]">
                  <div className="flex min-w-0 items-center gap-2">
                    <Avatar name={`${student.firstName} ${student.lastName}`} size="xs" />
                    <span className="truncate text-[10.5px] font-medium text-ink">{student.firstName} {student.lastName}</span>
                  </div>
                  {(["ca1", "ca2", "exam"] as const).map((field) => (
                    <input
                      key={field}
                      inputMode="numeric"
                      value={score[field]}
                      onChange={(event) => updateScore(student.id, field, event.target.value)}
                      aria-label={`${field.toUpperCase()} for ${student.firstName}`}
                      className="field h-8 w-full px-1 text-center text-[10.5px] tnum"
                    />
                  ))}
                  <span className={cn("text-right text-[10.5px] font-bold tnum", total >= 50 ? "text-success" : "text-danger")}>{total}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
