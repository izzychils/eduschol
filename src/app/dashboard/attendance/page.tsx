"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, Check, Clock, Save, UserX } from "lucide-react";
import { PageTitle, Badge, Avatar, EmptyState, Progress } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { useSchool } from "@/lib/store";
import { useSession } from "@/lib/session";
import {
  attendanceSeries,
  attendanceSummary,
  className as roomName,
  guardianChildren,
  lastWeekdays,
  studentAttendanceRate,
  studentsInClass,
  todayDateKey,
} from "@/lib/analytics";
import { dateLabel, percent } from "@/lib/format";
import { cn, uid } from "@/lib/utils";
import type { AttendanceStatus } from "@/lib/types";

const statuses: { key: AttendanceStatus; label: string; short: string; tone: string }[] = [
  { key: "present", label: "Present", short: "P", tone: "bg-success text-white" },
  { key: "late", label: "Late", short: "L", tone: "bg-warning text-white" },
  { key: "excused", label: "Excused", short: "E", tone: "bg-info text-white" },
  { key: "absent", label: "Absent", short: "A", tone: "bg-danger text-white" },
];

export default function AttendancePage() {
  const { workspace, update } = useSchool();
  const { user } = useSession();
  const { toast } = useToast();
  const [date, setDate] = useState(todayDateKey());
  const [classId, setClassId] = useState("");
  const [draft, setDraft] = useState<Record<string, AttendanceStatus>>({});

  const myClasses = useMemo(() => {
    if (!workspace || !user) return [];
    if (user.role !== "teacher") return workspace.classes;
    const me =
      workspace.staff.find((member) => member.email.toLowerCase() === user.email.toLowerCase()) ??
      workspace.staff.find((member) => member.name.toLowerCase() === user.name.toLowerCase());
    const rooms = workspace.classes.filter((room) => room.teacherId === me?.id);
    return rooms.length ? rooms : workspace.classes;
  }, [workspace, user]);

  const activeClassId = classId || myClasses[0]?.id || "";

  const roster = useMemo(
    () => (workspace && activeClassId ? studentsInClass(workspace, activeClassId) : []),
    [workspace, activeClassId],
  );

  useEffect(() => {
    if (!workspace || !activeClassId) return;
    const next: Record<string, AttendanceStatus> = {};
    const existing = workspace.attendance.filter((row) => row.date === date && row.classId === activeClassId);
    studentsInClass(workspace, activeClassId).forEach((student) => {
      const match = existing.find((row) => row.studentId === student.id);
      next[student.id] = match?.status ?? "present";
    });
    setDraft(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace, activeClassId, date]);

  if (!workspace || !user) return null;

  const isParent = user.role === "parent";
  const children = isParent ? guardianChildren(workspace, user.email) : [];
  const summary = attendanceSummary(workspace, workspace.attendance.filter((row) => row.classId === activeClassId && row.date === date));
  const saved = workspace.attendance.some((row) => row.date === date && row.classId === activeClassId);
  const series = attendanceSeries(workspace, 10);
  const counts = {
    present: Object.values(draft).filter((value) => value === "present").length,
    late: Object.values(draft).filter((value) => value === "late").length,
    excused: Object.values(draft).filter((value) => value === "excused").length,
    absent: Object.values(draft).filter((value) => value === "absent").length,
  };

  if (isParent) {
    return (
      <div className="space-y-4">
        <PageTitle
          eyebrow="Attendance"
          title="My children's attendance"
          description="Every marked school day, with the reason where the school recorded one."
        />
        {children.map((child) => {
          const records = workspace.attendance
            .filter((row) => row.studentId === child.id)
            .sort((a, b) => (a.date < b.date ? 1 : -1));
          const summaryChild = attendanceSummary(workspace, records);
          const rate = studentAttendanceRate(workspace, child.id);
          return (
            <section key={child.id} className="card overflow-hidden">
              <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
                <Avatar name={`${child.firstName} ${child.lastName}`} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-bold text-ink">{child.firstName} {child.lastName}</p>
                  <p className="text-[9.5px] text-muted">{roomName(workspace, child.classId)}</p>
                </div>
                <Badge tone={rate >= 90 ? "success" : rate >= 80 ? "warning" : "danger"}>{percent(rate, 0)}% attended</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4">
                {[
                  { label: "Present", value: summaryChild.present, tone: "text-success" },
                  { label: "Late", value: summaryChild.late, tone: "text-warning" },
                  { label: "Excused", value: summaryChild.excused, tone: "text-info" },
                  { label: "Absent", value: summaryChild.absent, tone: "text-danger" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-line p-2.5">
                    <p className="text-[9px] text-muted">{item.label}</p>
                    <p className={cn("mt-1 text-[18px] font-extrabold leading-none tnum", item.tone)}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 pb-4">
                <div className="flex flex-wrap gap-1">
                  {records.slice(0, 40).reverse().map((row) => (
                    <span
                      key={row.id}
                      title={`${dateLabel(row.date)}: ${row.status}`}
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-md text-[8.5px] font-bold text-white",
                        row.status === "present" ? "bg-success/85" : row.status === "late" ? "bg-warning/85" : row.status === "excused" ? "bg-info/80" : "bg-danger/80",
                      )}
                    >
                      {statuses.find((item) => item.key === row.status)?.short}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-[9px] text-muted">P present, L late, E excused, A absent. Newest last.</p>
              </div>
            </section>
          );
        })}
        {!children.length ? (
          <EmptyState icon={CalendarCheck} title="No children linked" description="Ask the school office to link your email to your children's records." />
        ) : null}
      </div>
    );
  }

  function markAll(status: AttendanceStatus) {
    const next: Record<string, AttendanceStatus> = {};
    roster.forEach((student) => {
      next[student.id] = status;
    });
    setDraft(next);
  }

  function save() {
    if (!activeClassId) return;
    update((current) => {
      const kept = current.attendance.filter((row) => !(row.date === date && row.classId === activeClassId));
      const records = Object.entries(draft).map(([studentId, status]) => ({
        id: uid("att"),
        date,
        studentId,
        classId: activeClassId,
        status,
      }));
      return {
        ...current,
        attendance: [...kept, ...records],
        activity: [
          {
            id: uid("act"),
            kind: "attendance.saved",
            text: `${user?.name ?? "A teacher"} marked ${roomName(current, activeClassId)} attendance, ${counts.present} present, ${counts.absent} absent`,
            at: new Date().toISOString(),
          },
          ...current.activity,
        ],
      };
    });
    toast(`${roomName(workspace!, activeClassId)} register saved for ${dateLabel(date)}`, "success");
  }

  return (
    <div className="space-y-4">
      <PageTitle
        eyebrow="Academics"
        title="Attendance register"
        description="Mark the class, save once. Late and present both count toward the attendance rate."
        actions={
          <Button size="md" onClick={save} disabled={!roster.length}>
            <Save className="h-3.5 w-3.5" />
            Save register
          </Button>
        }
      />

      <div className="grid gap-3 lg:grid-cols-[1fr_280px]">
        <div className="card overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
            <Select value={activeClassId} onChange={(event) => setClassId(event.target.value)} className="h-9 w-[150px] text-[11px]">
              {myClasses.map((room) => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </Select>
            <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="h-9 w-[150px] text-[11px]" />
            <div className="ml-auto flex items-center gap-1.5">
              <Button size="sm" variant="secondary" onClick={() => markAll("present")}>
                <Check className="h-3 w-3" />
                All present
              </Button>
              <Badge tone={saved ? "success" : "warning"} dot>{saved ? "Saved" : "Not saved"}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-4 divide-x divide-line border-b border-line bg-canvas/50">
            {[
              { label: "Present", value: counts.present, tone: "text-success" },
              { label: "Late", value: counts.late, tone: "text-warning" },
              { label: "Excused", value: counts.excused, tone: "text-info" },
              { label: "Absent", value: counts.absent, tone: "text-danger" },
            ].map((item) => (
              <div key={item.label} className="px-3 py-2">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-muted">{item.label}</p>
                <p className={cn("mt-0.5 text-[16px] font-extrabold tnum", item.tone)}>{item.value}</p>
              </div>
            ))}
          </div>

          <div className="divide-y divide-line-soft">
            {roster.map((student, index) => {
              const current = draft[student.id] ?? "present";
              return (
                <div key={student.id} className="flex flex-wrap items-center gap-2 px-3 py-2 sm:flex-nowrap">
                  <span className="w-4 text-[9px] text-muted tnum">{index + 1}</span>
                  <Avatar name={`${student.firstName} ${student.lastName}`} size="sm" />
                  <div className="min-w-0 flex-1">
                    <Link href={`/dashboard/students/${student.id}`} className="block truncate text-[11px] font-semibold text-ink hover:text-brand">
                      {student.firstName} {student.lastName}
                    </Link>
                    <p className="text-[9px] text-muted">{student.admissionNo}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {statuses.map((status) => (
                      <button
                        key={status.key}
                        type="button"
                        onClick={() => setDraft((value) => ({ ...value, [student.id]: status.key }))}
                        aria-label={`${status.label} for ${student.firstName}`}
                        title={status.label}
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-md text-[9px] font-bold transition-all",
                          current === status.key ? status.tone : "bg-canvas text-muted hover:bg-line",
                        )}
                      >
                        {status.short}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          {!roster.length ? (
            <EmptyState icon={CalendarCheck} title="No students in this class" description="Choose another class or enrol a student first." />
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-3 py-2.5">
            <p className="text-[9.5px] text-muted">
              {dateLabel(date)} · {roomName(workspace, activeClassId)}
            </p>
            <Button size="sm" onClick={save} disabled={!roster.length}>
              <Save className="h-3 w-3" />
              Save register
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <section className="card p-4">
            <h2 className="text-[12px] font-bold text-ink">School attendance</h2>
            <p className="mt-0.5 text-[9.5px] text-muted">Last 10 marked days</p>
            <div className="mt-3 space-y-1.5">
              {series.map((day) => (
                <div key={day.date} className="flex items-center gap-2">
                  <span className="w-7 text-[9px] text-muted">{day.label}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line-soft">
                    <div className={cn("h-full rounded-full", day.rate >= 92 ? "bg-success" : day.rate >= 85 ? "bg-warning" : "bg-danger")} style={{ width: `${day.rate}%` }} />
                  </div>
                  <span className="w-8 text-right text-[9px] font-semibold text-ink tnum">{percent(day.rate, 0)}%</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-4">
            <h2 className="text-[12px] font-bold text-ink">Saved for this date</h2>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] text-muted">Present or late</span>
              <span className="text-[12px] font-bold text-ink tnum">{summary.total ? percent(summary.rate, 0) : 0}%</span>
            </div>
            <Progress value={summary.rate} tone={summary.rate >= 92 ? "success" : "warning"} className="mt-1.5" />
            <div className="mt-3 space-y-1.5 text-[10px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted"><Clock className="h-3 w-3" /> Late arrivals</span>
                <span className="font-semibold text-warning">{summary.late}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted"><UserX className="h-3 w-3" /> Absences</span>
                <span className="font-semibold text-danger">{summary.absent}</span>
              </div>
            </div>
          </section>

          <section className="card p-4">
            <h2 className="text-[12px] font-bold text-ink">Previous school days</h2>
            <div className="mt-2 flex flex-wrap gap-1">
              {lastWeekdays(10).map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setDate(day)}
                  className={cn(
                    "rounded-md px-2 py-1 text-[9px] font-semibold transition-colors",
                    date === day ? "bg-brand text-white" : "bg-canvas text-muted hover:bg-line-soft",
                  )}
                >
                  {dateLabel(day, { day: "numeric", month: "short" })}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
