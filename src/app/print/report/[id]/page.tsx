"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { useSchool } from "@/lib/store";
import {
  attendanceSummary,
  classResults,
  className as roomName,
  studentAverage,
  studentResults,
  subjectName,
} from "@/lib/analytics";
import { dateLabel, gradeFor, percent } from "@/lib/format";
import { GRADES } from "@/lib/types";

export default function ReportCardPage() {
  const params = useParams<{ id: string }>();
  const { workspace } = useSchool();

  if (!workspace) {
    return <div className="flex min-h-screen items-center justify-center text-[12px] text-muted">Loading report</div>;
  }

  const student = workspace.students.find((item) => item.id === params.id);
  if (!student) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-[12px] text-muted">
        <p>That student record was not found.</p>
        <Link href="/dashboard/students" className="font-semibold text-brand">Back to students</Link>
      </div>
    );
  }

  const room = workspace.classes.find((item) => item.id === student.classId);
  const teacher = workspace.staff.find((member) => member.id === room?.teacherId);
  const results = studentResults(workspace, student.id);
  const average = studentAverage(workspace, student.id);
  const grade = gradeFor(average);
  const records = workspace.attendance.filter((row) => row.studentId === student.id);
  const attendance = attendanceSummary(workspace, records);
  const ranking = classResults(workspace, student.classId);
  const position = ranking.find((row) => row.student.id === student.id)?.position ?? 0;
  const attendanceRate = attendance.total ? ((attendance.present + attendance.late) / attendance.total) * 100 : 0;

  const comment =
    average >= 75
      ? `${student.firstName} finished the term at ${percent(average, 1)}%, with ${attendance.present} of ${attendance.total} marked days present. This is strong, consistent work across ${results.length} subjects. Keep the same routine next term.`
      : average >= 60
        ? `${student.firstName} finished the term at ${percent(average, 1)}% and attended ${percent(attendanceRate, 0)}% of marked days. The foundation is solid. Focused revision in the weakest two subjects would move the average into the top band.`
        : average >= 45
          ? `${student.firstName} finished the term at ${percent(average, 1)}% with ${percent(attendanceRate, 0)}% attendance. The result is below the class target. A structured revision plan and a check in with the form teacher are recommended for next term.`
          : `${student.firstName} finished the term at ${percent(average, 1)}% with ${percent(attendanceRate, 0)}% attendance. This needs immediate support. The school will contact the guardian to agree a plan before resumption.`;

  return (
    <div className="min-h-screen bg-[#EDEBF6] py-6 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-4 flex max-w-[820px] flex-wrap items-center justify-between gap-2 px-4">
        <Link
          href={`/dashboard/students/${student.id}`}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted hover:text-brand"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to profile
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand px-4 text-[11.5px] font-semibold text-white hover:bg-brand-hover"
        >
          <Printer className="h-3.5 w-3.5" />
          Print or save as PDF
        </button>
      </div>

      <article className="print-sheet mx-auto max-w-[820px] bg-white px-7 py-8 shadow-[0_30px_60px_-30px_rgba(35,27,70,0.35)] print:max-w-none print:px-0 print:py-0 print:shadow-none">
        <header className="flex items-start justify-between gap-6 border-b-[3px] border-brand pb-4">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-[15px] font-extrabold text-white">
              {workspace.school.name.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <h1 className="text-[22px] font-extrabold leading-none tracking-[-0.04em] text-ink">
                {workspace.school.name}
              </h1>
              <p className="mt-1 text-[9.5px] text-muted">{workspace.school.address}, {workspace.school.city}</p>
              <p className="text-[9.5px] text-muted">{workspace.school.phone} · {workspace.school.email}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-brand">Terminal report</p>
            <p className="mt-1 text-[11px] font-bold text-ink">{workspace.school.term}</p>
            <p className="text-[9.5px] text-muted">{workspace.school.session} session</p>
          </div>
        </header>

        <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg bg-canvas px-4 py-3 sm:grid-cols-4 print:bg-[#F5F3FB]">
          {[
            { label: "Student", value: `${student.firstName} ${student.lastName}` },
            { label: "Admission no", value: student.admissionNo },
            { label: "Class", value: roomName(workspace, student.classId) },
            { label: "House", value: student.house },
            { label: "Form teacher", value: teacher?.name ?? "Not assigned" },
            { label: "Days present", value: `${attendance.present + attendance.late} of ${attendance.total}` },
            { label: "Position", value: position ? `${position} of ${ranking.length}` : "Not ranked" },
            { label: "Issued", value: dateLabel(new Date().toISOString()) },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-muted">{item.label}</p>
              <p className="mt-0.5 text-[10.5px] font-semibold text-ink">{item.value}</p>
            </div>
          ))}
        </div>

        <table className="mt-5 w-full border-collapse text-left">
          <thead>
            <tr className="bg-brand text-white">
              <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-[0.08em]">Subject</th>
              <th className="px-2 py-2 text-right text-[9px] font-bold uppercase tracking-[0.08em]">CA1 (20)</th>
              <th className="px-2 py-2 text-right text-[9px] font-bold uppercase tracking-[0.08em]">CA2 (20)</th>
              <th className="px-2 py-2 text-right text-[9px] font-bold uppercase tracking-[0.08em]">Exam (60)</th>
              <th className="px-2 py-2 text-right text-[9px] font-bold uppercase tracking-[0.08em]">Total</th>
              <th className="px-3 py-2 text-right text-[9px] font-bold uppercase tracking-[0.08em]">Grade</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row) => {
              const total = row.ca1 + row.ca2 + row.exam;
              const rowGrade = gradeFor(total);
              return (
                <tr key={row.id} className="border-b border-line">
                  <td className="px-3 py-1.5 text-[10.5px] font-medium text-ink">{subjectName(workspace, row.subjectId)}</td>
                  <td className="px-2 py-1.5 text-right text-[10.5px] text-muted tnum">{row.ca1}</td>
                  <td className="px-2 py-1.5 text-right text-[10.5px] text-muted tnum">{row.ca2}</td>
                  <td className="px-2 py-1.5 text-right text-[10.5px] text-muted tnum">{row.exam}</td>
                  <td className="px-2 py-1.5 text-right text-[10.5px] font-bold text-ink tnum">{total}</td>
                  <td className="px-3 py-1.5 text-right text-[10.5px] font-bold text-ink">{rowGrade.grade}</td>
                </tr>
              );
            })}
            <tr className="bg-canvas print:bg-[#F5F3FB]">
              <td colSpan={4} className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-ink">
                Term average
              </td>
              <td className="px-2 py-2 text-right text-[12px] font-extrabold text-ink tnum">{percent(average, 1)}%</td>
              <td className="px-3 py-2 text-right text-[11px] font-extrabold text-brand">{grade.grade}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-5 grid gap-4 sm:grid-cols-[1.4fr_1fr]">
          <section>
            <h2 className="text-[9px] font-bold uppercase tracking-[0.14em] text-brand">Form teacher's comment</h2>
            <p className="mt-2 text-[10.5px] leading-[1.7] text-ink/80">{comment}</p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="border-t border-ink/30 pt-1 text-[9px] font-semibold text-ink">{teacher?.name ?? "Form teacher"}</p>
                <p className="text-[8px] text-muted">Form teacher</p>
              </div>
              <div>
                <p className="border-t border-ink/30 pt-1 text-[9px] font-semibold text-ink">{workspace.school.headTeacher}</p>
                <p className="text-[8px] text-muted">Head teacher</p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-line p-3">
            <h2 className="text-[8.5px] font-bold uppercase tracking-[0.12em] text-muted">Grading scale</h2>
            <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1">
              {GRADES.map((band) => (
                <div key={band.grade} className="flex items-center justify-between text-[8.5px]">
                  <span className="text-muted">{band.min}% and above</span>
                  <span className="font-bold text-ink">{band.grade}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 border-t border-line pt-2">
              <div className="flex items-center justify-between text-[8.5px]">
                <span className="text-muted">Attendance</span>
                <span className="font-bold text-ink">{percent(attendanceRate, 1)}%</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[8.5px]">
                <span className="text-muted">Next term begins</span>
                <span className="font-bold text-ink">6 January</span>
              </div>
            </div>
          </section>
        </div>

        <footer className="mt-6 flex items-center justify-between border-t border-line pt-2 text-[8px] text-muted">
          <span>{workspace.school.motto}</span>
          <span>Generated by Eduschol from records on file. No result is altered by the assistant.</span>
        </footer>
      </article>
    </div>
  );
}
