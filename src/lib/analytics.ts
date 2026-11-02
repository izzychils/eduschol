import type {
  Attendance,
  ClassRoom,
  Invoice,
  Result,
  Student,
  Workspace,
} from "./types";
import { addDays, average, sum } from "./utils";
import { gradeFor } from "./format";

export function studentName(student: Pick<Student, "firstName" | "lastName">) {
  return `${student.firstName} ${student.lastName}`;
}

export function className(workspace: Workspace, classId: string) {
  return workspace.classes.find((room) => room.id === classId)?.name ?? "Unassigned";
}

export function subjectName(workspace: Workspace, subjectId: string) {
  return workspace.subjects.find((subject) => subject.id === subjectId)?.name ?? "Subject";
}

export function getClass(workspace: Workspace, classId: string) {
  return workspace.classes.find((room) => room.id === classId) ?? null;
}

export function studentsInClass(workspace: Workspace, classId: string) {
  return workspace.students.filter((student) => student.classId === classId && student.status === "active");
}

export function guardianChildren(workspace: Workspace, email: string) {
  const clean = email.trim().toLowerCase();
  return workspace.students.filter(
    (student) => student.guardianEmail.trim().toLowerCase() === clean,
  );
}

export function invoiceBalance(invoice: Invoice) {
  const total = invoiceTotal(invoice);
  return Math.max(0, total - invoice.paid);
}

export function invoiceTotal(invoice: Invoice) {
  return sum(invoice.items.map((item) => item.amount));
}

export function invoiceStatus(invoice: Invoice): {
  key: "paid" | "partial" | "unpaid";
  label: string;
  tone: "success" | "warning" | "danger";
} {
  const balance = invoiceBalance(invoice);
  if (balance <= 0) return { key: "paid", label: "Paid", tone: "success" };
  if (invoice.paid > 0) return { key: "partial", label: "Part paid", tone: "warning" };
  return { key: "unpaid", label: "Unpaid", tone: "danger" };
}

export function attendanceRate(records: Attendance[]) {
  if (!records.length) return 0;
  const present = records.filter((row) => row.status === "present" || row.status === "late").length;
  return (present / records.length) * 100;
}

export function studentAttendanceRate(workspace: Workspace, studentId: string) {
  return attendanceRate(workspace.attendance.filter((row) => row.studentId === studentId));
}

export function attendanceSummary(workspace: Workspace, records?: Attendance[]) {
  const rows = records ?? workspace.attendance;
  const present = rows.filter((row) => row.status === "present").length;
  const late = rows.filter((row) => row.status === "late").length;
  const absent = rows.filter((row) => row.status === "absent").length;
  const excused = rows.filter((row) => row.status === "excused").length;
  return {
    present,
    late,
    absent,
    excused,
    total: rows.length,
    rate: rows.length ? ((present + late) / rows.length) * 100 : 0,
  };
}

export function attendanceForDate(workspace: Workspace, date: string, classId?: string) {
  return workspace.attendance.filter(
    (row) => row.date === date && (!classId || row.classId === classId),
  );
}

export function attendanceSeries(workspace: Workspace, points = 10) {
  const dates = [...new Set(workspace.attendance.map((row) => row.date))].sort().slice(-points);
  return dates.map((date) => {
    const rows = workspace.attendance.filter((row) => row.date === date);
    const summary = attendanceSummary(workspace, rows);
    const parsed = new Date(`${date}T00:00:00`);
    return {
      date,
      label: new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(parsed),
      day: new Intl.DateTimeFormat("en-GB", { day: "numeric" }).format(parsed),
      rate: summary.rate,
      present: summary.present,
      absent: summary.absent,
      late: summary.late,
      total: summary.total,
    };
  });
}

export function resultTotal(row: Result) {
  return row.ca1 + row.ca2 + row.exam;
}

export function studentResults(workspace: Workspace, studentId: string) {
  return workspace.results.filter((row) => row.studentId === studentId);
}

export function studentAverage(workspace: Workspace, studentId: string) {
  const rows = studentResults(workspace, studentId);
  if (!rows.length) return 0;
  return average(rows.map(resultTotal));
}

export function studentGrade(workspace: Workspace, studentId: string) {
  return gradeFor(studentAverage(workspace, studentId));
}

export function subjectAverage(workspace: Workspace, subjectId: string, classId?: string) {
  const rows = workspace.results.filter(
    (row) => row.subjectId === subjectId && (!classId || row.classId === classId),
  );
  return rows.length ? average(rows.map(resultTotal)) : 0;
}

export function classResults(workspace: Workspace, classId: string) {
  const students = studentsInClass(workspace, classId);
  const rows = students.map((student) => {
    const results = workspace.results.filter(
      (row) => row.studentId === student.id && row.classId === classId,
    );
    const scored = results.map(resultTotal);
    const averageScore = scored.length ? average(scored) : 0;
    return {
      student,
      results,
      average: averageScore,
      grade: gradeFor(averageScore),
    };
  });
  const ordered = [...rows].sort((a, b) => b.average - a.average);
  return rows.map((row) => ({
    ...row,
    position: ordered.findIndex((item) => item.student.id === row.student.id) + 1,
  }));
}

export function classAverage(workspace: Workspace, classId: string) {
  const rows = classResults(workspace, classId);
  return rows.length ? average(rows.map((row) => row.average)) : 0;
}

export function feeSummary(workspace: Workspace, invoices?: Invoice[]) {
  const rows = invoices ?? workspace.invoices;
  const billed = sum(rows.map(invoiceTotal));
  const collected = sum(rows.map((invoice) => invoice.paid));
  const outstanding = Math.max(0, billed - collected);
  const paid = rows.filter((invoice) => invoiceBalance(invoice) <= 0).length;
  const partial = rows.filter((invoice) => invoice.paid > 0 && invoiceBalance(invoice) > 0).length;
  const unpaid = rows.filter((invoice) => invoice.paid <= 0).length;
  return {
    billed,
    collected,
    outstanding,
    rate: billed ? (collected / billed) * 100 : 0,
    paid,
    partial,
    unpaid,
    count: rows.length,
  };
}

export function feeByClass(workspace: Workspace) {
  return workspace.classes.map((room) => {
    const students = studentsInClass(workspace, room.id);
    const invoices = workspace.invoices.filter((invoice) =>
      students.some((student) => student.id === invoice.studentId),
    );
    const summary = feeSummary(workspace, invoices);
    return { room, ...summary };
  });
}

export function atRiskStudents(workspace: Workspace) {
  const rows = workspace.students
    .filter((student) => student.status === "active")
    .map((student) => {
      const attendance = studentAttendanceRate(workspace, student.id);
      const resultAverage = studentAverage(workspace, student.id);
      const reasons: string[] = [];
      if (attendance < 82) reasons.push("Attendance below 82%");
      if (resultAverage < 55) reasons.push("Average below 55%");
      if (resultAverage < 45) reasons.push("Two or more subjects failing");
      return {
        student,
        attendance,
        average: resultAverage,
        grade: gradeFor(resultAverage),
        reasons,
      };
    })
    .filter((row) => row.reasons.length > 0)
    .sort((a, b) => a.average - b.average);

  return rows.map((row) => ({
    ...row,
    severity: row.average < 50 || row.attendance < 75 ? ("high" as const) : ("medium" as const),
  }));
}

export function enrollmentSeries(workspace: Workspace, months = 8) {
  const now = new Date();
  const points: { label: string; value: number; month: string }[] = [];
  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const cursor = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const value = workspace.students.filter(
      (student) => new Date(`${student.admittedAt}T00:00:00`) <= end,
    ).length;
    points.push({
      label: new Intl.DateTimeFormat("en-GB", { month: "short" }).format(cursor),
      value,
      month: `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`,
    });
  }
  return points;
}

export function classDistribution(workspace: Workspace) {
  return workspace.classes.map((room) => ({
    id: room.id,
    name: room.name,
    value: studentsInClass(workspace, room.id).length,
    capacity: room.capacity,
  }));
}

export function genderCounts(workspace: Workspace) {
  const students = workspace.students.filter((student) => student.status === "active");
  return {
    female: students.filter((student) => student.gender === "female").length,
    male: students.filter((student) => student.gender === "male").length,
    total: students.length,
  };
}

export function subjectPerformance(workspace: Workspace, classId?: string) {
  const subjects = classId
    ? workspace.subjects.filter((subject) =>
        workspace.results.some((row) => row.subjectId === subject.id && row.classId === classId),
      )
    : workspace.subjects;
  return subjects
    .map((subject) => ({
      subject,
      average: subjectAverage(workspace, subject.id, classId),
      entries: workspace.results.filter(
        (row) => row.subjectId === subject.id && (!classId || row.classId === classId),
      ).length,
    }))
    .sort((a, b) => b.average - a.average);
}

export function lowStock(workspace: Workspace) {
  return workspace.inventory.filter((item) => item.quantity <= item.reorderLevel);
}

export function staffByDepartment(workspace: Workspace) {
  const map = new Map<string, number>();
  workspace.staff.forEach((member) => {
    map.set(member.department, (map.get(member.department) ?? 0) + 1);
  });
  return [...map.entries()].map(([department, count]) => ({ department, count }));
}

export function outstandingInvoices(workspace: Workspace) {
  return workspace.invoices
    .filter((invoice) => invoiceBalance(invoice) > 0)
    .sort((a, b) => invoiceBalance(b) - invoiceBalance(a));
}

export function studentInvoices(workspace: Workspace, studentId: string) {
  return workspace.invoices.filter((invoice) => invoice.studentId === studentId);
}

export function studentOutstanding(workspace: Workspace, studentId: string) {
  return sum(studentInvoices(workspace, studentId).map(invoiceBalance));
}

export function recentPayments(workspace: Workspace, limit = 6) {
  return [...workspace.payments]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, limit);
}

export function upcomingExams(workspace: Workspace) {
  return [...workspace.exams]
    .filter((exam) => exam.status !== "completed")
    .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());
}

export function classOptions(workspace: Workspace): ClassRoom[] {
  return workspace.classes;
}

export function todayDateKey() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

export function lastWeekdays(count: number) {
  const dates: string[] = [];
  let cursor = new Date();
  while (dates.length < count) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) {
      const offset = cursor.getTimezoneOffset();
      dates.push(new Date(cursor.getTime() - offset * 60_000).toISOString().slice(0, 10));
    }
    cursor = addDays(cursor, -1);
  }
  return dates.reverse();
}

export function percentageChange(current: number, previous: number) {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
}
