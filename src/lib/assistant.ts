import type { Role, Workspace } from "./types";
import {
  atRiskStudents,
  attendanceRate,
  attendanceSummary,
  classAverage,
  classResults,
  className,
  feeSummary,
  guardianChildren,
  lowStock,
  studentAttendanceRate,
  studentAverage,
  studentInvoices,
  studentOutstanding,
  studentResults,
  studentsInClass,
  subjectName,
  subjectPerformance,
  upcomingExams,
  invoiceBalance,
} from "./analytics";
import { compactNaira, dateLabel, gradeFor, naira, percent, timeLabel } from "./format";

export type AssistantReply = {
  answer: string;
  sources: string[];
  facts?: { label: string; value: string }[];
};

type Scope = {
  workspace: Workspace;
  role: Role;
  name: string;
  email: string;
};

function teacherClassIds(scope: Scope) {
  const me =
    scope.workspace.staff.find((member) => member.email.toLowerCase() === scope.email.toLowerCase()) ??
    scope.workspace.staff.find((member) => member.name.toLowerCase() === scope.name.toLowerCase());
  return new Set(scope.workspace.classes.filter((room) => room.teacherId === me?.id).map((room) => room.id));
}

function scopedClassrooms(scope: Scope) {
  const { workspace, role } = scope;
  if (role === "admin") return workspace.classes;
  if (role === "parent") {
    const classIds = new Set(guardianChildren(workspace, scope.email).map((child) => child.classId));
    return workspace.classes.filter((room) => classIds.has(room.id));
  }
  return workspace.classes.filter((room) => teacherClassIds(scope).has(room.id));
}

function findStudent(scope: Scope, question: string) {
  const text = question.toLowerCase();
  const eligible =
    scope.role === "parent"
      ? guardianChildren(scope.workspace, scope.email)
      : scope.role === "teacher"
        ? scope.workspace.students.filter(
            (student) => teacherClassIds(scope).has(student.classId),
          )
        : scope.workspace.students;
  return (
    eligible.find((student) => {
      const first = student.firstName.toLowerCase();
      const last = student.lastName.toLowerCase();
      return (
        (first.length > 2 && text.includes(first)) ||
        (last.length > 2 && text.includes(last)) ||
        text.includes(student.admissionNo.toLowerCase())
      );
    }) ?? null
  );
}

function has(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function classMention(workspace: Workspace, text: string) {
  return workspace.classes.find((room) => {
    const name = room.name.toLowerCase();
    const compact = name.replace(/\s+/g, "");
    return text.includes(name) || text.includes(compact) || text.includes(room.section.toLowerCase() && name);
  }) ?? null;
}

export function askAssistant(scope: Scope, question: string): AssistantReply {
  const { workspace, role, name } = scope;
  const text = question.toLowerCase().trim();
  const student = findStudent(scope, text);
  const children = role === "parent" ? guardianChildren(workspace, scope.email) : [];
  const myClassIds = role === "teacher" ? teacherClassIds(scope) : new Set<string>();
  const scopedClasses = scopedClassrooms(scope);
  const scopedStudents =
    role === "parent"
      ? children
      : role === "teacher"
        ? workspace.students.filter((item) => item.status === "active" && myClassIds.has(item.classId))
        : workspace.students.filter((item) => item.status === "active");

  if (!text) {
    return {
      answer: "Ask me about attendance, fees, results, staff, stock, exams or the students who need support. I only read the records already in this workspace.",
      sources: [],
    };
  }

  if (has(text, ["invent", "fabricat", "make up", "hallucinat"])) {
    return {
      answer:
        "I do not invent records. I read the students, staff, results, invoices, stock, exams and routes already stored in this workspace, and I say so when the data needed for an answer is not there. Anything I draft is marked for a human to review before it is sent or published.",
      sources: ["Workspace record count", "Assistant policy"],
    };
  }

  if (student) {
    const average = studentAverage(workspace, student.id);
    const attendance = studentAttendanceRate(workspace, student.id);
    const balance = studentOutstanding(workspace, student.id);
    const room = className(workspace, student.classId);
    const results = studentResults(workspace, student.id);
    const strongest = [...results].sort((a, b) => b.ca1 + b.ca2 + b.exam - (a.ca1 + a.ca2 + a.exam))[0];
    const weakest = [...results].sort((a, b) => a.ca1 + a.ca2 + a.exam - (b.ca1 + b.ca2 + b.exam))[0];
    const bills = studentInvoices(workspace, student.id);

    if (has(text, ["comment", "report card", "remark", "draft"])) {
      return {
        answer: `Draft comment for ${student.firstName} ${student.lastName}, ${room}, ${workspace.school.term}\n\n"${student.firstName} finished the term at ${percent(average, 1)}% across ${results.length} subjects and attended ${percent(attendance, 0)}% of marked school days. ${
          average >= 65
            ? "The work is consistent and the habits are sound. Keep the same revision routine next term."
            : average >= 50
              ? "This is a fair result with room to grow. Focused support in the weaker subjects would lift the average."
              : "This result needs support. A short revision plan and a conversation with the guardian are recommended."
        }${weakest ? ` The clearest opportunity is ${subjectName(workspace, weakest.subjectId)} (${weakest.ca1 + weakest.ca2 + weakest.exam}%).` : ""}"\n\nThis is a draft built only from recorded scores and attendance. Review and edit it before publishing.`,
        sources: [`${results.length} subject results`, `${student.firstName}'s attendance record`],
        facts: [
          { label: "Average", value: `${percent(average, 1)}%` },
          { label: "Grade", value: gradeFor(average).grade },
          { label: "Attendance", value: `${percent(attendance, 0)}%` },
        ],
      };
    }

    return {
      answer: `${student.firstName} ${student.lastName} is in ${room}, admission number ${student.admissionNo}.\n\nAverage: ${percent(average, 1)}% (${gradeFor(average).grade}, ${gradeFor(average).remark}). Attendance: ${percent(attendance, 0)}%. Fee balance: ${naira(balance)} across ${bills.length} invoices.\n\n${
        strongest ? `Strongest subject is ${subjectName(workspace, strongest.subjectId)} at ${strongest.ca1 + strongest.ca2 + strongest.exam}%. ` : ""
      }${
        weakest ? `The subject to watch is ${subjectName(workspace, weakest.subjectId)} at ${weakest.ca1 + weakest.ca2 + weakest.exam}%.` : ""
      }${average < 55 || attendance < 85 ? " This student meets the school's support criteria." : " No support flag is raised for this student."}`,
      sources: [`${student.firstName}'s profile`, `${results.length} results`, `${bills.length} invoices`],
      facts: [
        { label: "Class", value: room },
        { label: "Average", value: `${percent(average, 1)}%` },
        { label: "Attendance", value: `${percent(attendance, 0)}%` },
        { label: "Balance", value: naira(balance) },
      ],
    };
  }

  if (has(text, ["fee", "fees", "owe", "owes", "payment", "paid", "balance", "collect", "billed", "invoice"])) {
    if (role === "parent") {
      const total = children.reduce((sum, child) => sum + studentOutstanding(workspace, child.id), 0);
      const rows = children.map((child) => {
        const balance = studentOutstanding(workspace, child.id);
        const bills = studentInvoices(workspace, child.id);
        return `${child.firstName}: ${naira(balance)} outstanding across ${bills.length} invoice${bills.length === 1 ? "" : "s"}.`;
      });
      return {
        answer: `Your family balance for ${workspace.school.term} is ${naira(total)}.\n\n${rows.join("\n")}\n\nPayments recorded at the bursary or in this portal appear in Fees and on each child's profile.`,
        sources: [...children.map((child) => `${child.firstName}'s invoices`), "Payment ledger"],
        facts: [
          { label: "Family balance", value: naira(total) },
          { label: "Term", value: workspace.school.term },
        ],
      };
    }

    if (role === "teacher") {
      return {
        answer:
          "Fees and family balances are held by the bursary, so they are outside a teacher's access scope. I can answer questions about your classes, attendance, results and exam papers.",
        sources: ["Teacher access scope"],
      };
    }

    const summary = feeSummary(workspace);
    const owing = workspace.invoices.filter((invoice) => invoiceBalance(invoice) > 0);
    return {
      answer: `For ${workspace.school.term} ${workspace.school.session}, the school billed ${naira(summary.billed)} and has collected ${naira(summary.collected)}. Outstanding fees are ${naira(summary.outstanding)}, a collection rate of ${percent(summary.rate, 1)}%.\n\n${summary.paid} invoices are settled, ${summary.partial} are part paid and ${summary.unpaid} are untouched. ${owing.length} invoices still carry a balance.`,
      sources: ["All invoices", "All recorded payments"],
      facts: [
        { label: "Billed", value: compactNaira(summary.billed) },
        { label: "Collected", value: compactNaira(summary.collected) },
        { label: "Outstanding", value: compactNaira(summary.outstanding) },
        { label: "Collection rate", value: `${percent(summary.rate, 1)}%` },
      ],
    };
  }

  if (has(text, ["attendance", "absent", "absence", "late", "register"])) {
    if (role === "parent") {
      return {
        answer: children
          .map((child) => {
            const rows = workspace.attendance.filter((row) => row.studentId === child.id);
            const summary = attendanceSummary(workspace, rows);
            return `${child.firstName}: ${percent(studentAttendanceRate(workspace, child.id), 0)}% attended over ${rows.length} marked days. ${summary.present} present, ${summary.late} late, ${summary.excused} excused, ${summary.absent} absent.`;
          })
          .join("\n"),
        sources: children.map((child) => `${child.firstName}'s register`),
      };
    }
    const mentionedRaw = classMention(workspace, text);
    const mentioned = mentionedRaw && (role !== "teacher" || myClassIds.has(mentionedRaw.id)) ? mentionedRaw : null;
    const scopeIds = new Set(scopedClasses.map((room) => room.id));
    const records = mentioned
      ? workspace.attendance.filter((row) => row.classId === mentioned.id)
      : role === "teacher"
        ? workspace.attendance.filter((row) => scopeIds.has(row.classId))
        : workspace.attendance;
    const summary = attendanceSummary(workspace, records);
    const worst = [...scopedClasses]
      .map((room) => ({ room, rate: attendanceRate(workspace.attendance.filter((row) => row.classId === room.id)) }))
      .sort((a, b) => a.rate - b.rate)[0];
    return {
      answer: `${mentioned ? `${mentioned.name}` : role === "teacher" ? "Your classes" : "The school"} has ${summary.total} attendance records on file, with ${percent(summary.rate, 1)}% present or late. There are ${summary.absent} absences and ${summary.late} late arrivals.\n\n${worst ? `${worst.room.name} has the lowest rate at ${percent(worst.rate, 1)}%.` : ""} Absences are the first thing to check; a student below 85% is flagged for support.`,
      sources: [`${summary.total} attendance records`, "Class register"],
      facts: [
        { label: "Attendance rate", value: `${percent(summary.rate, 1)}%` },
        { label: "Absences", value: String(summary.absent) },
        { label: "Late arrivals", value: String(summary.late) },
      ],
    };
  }

  if (has(text, ["risk", "struggl", "behind", "support", "failing", "fail", "weak", "attention"])) {
    const rows = atRiskStudents(workspace).filter((row) => {
      if (role === "parent") return children.some((child) => child.id === row.student.id);
      if (role === "teacher") return myClassIds.has(row.student.classId);
      return true;
    });
    if (!rows.length) {
      return {
        answer:
          "No student currently meets the support criteria: an average below 55%, attendance below 82%, or two or more subjects failing. Every active student is above the threshold on the records I can see.",
        sources: ["All published results", "All attendance records"],
      };
    }
    return {
      answer: `${rows.length} student${rows.length === 1 ? "" : "s"} meet the support criteria.\n\n${rows
        .slice(0, 6)
        .map(
          (row) =>
            `${row.student.firstName} ${row.student.lastName} (${className(workspace, row.student.classId)}): ${percent(row.average, 1)}% average, ${percent(row.attendance, 0)}% attendance. ${row.reasons.join(". ")}.`,
        )
        .join("\n")}\n\nThese are flags from recorded numbers, not predictions. A teacher or guardian should review before any action is agreed.`,
      sources: ["Published results", "Attendance register"],
      facts: rows.slice(0, 4).map((row) => ({
        label: `${row.student.firstName} ${row.student.lastName}`,
        value: `${percent(row.average, 0)}%`,
      })),
    };
  }

  if (has(text, ["result", "average", "performance", "score", "grade", "academic", "best"])) {
    if (role === "parent") {
      return {
        answer: children
          .map((child) => {
            const average = studentAverage(workspace, child.id);
            const results = studentResults(workspace, child.id);
            const best = [...results].sort((a, b) => b.ca1 + b.ca2 + b.exam - (a.ca1 + a.ca2 + a.exam))[0];
            return `${child.firstName}: ${percent(average, 1)}% average (${gradeFor(average).grade}). ${results.length} subjects recorded.${best ? ` Highest is ${subjectName(workspace, best.subjectId)} at ${best.ca1 + best.ca2 + best.exam}%.` : ""}`;
          })
          .join("\n"),
        sources: children.map((child) => `${child.firstName}'s published results`),
      };
    }

    const meantRaw = classMention(workspace, text);
    const meant =
      meantRaw && (role !== "teacher" || myClassIds.has(meantRaw.id)) ? meantRaw : null;
    if (meant) {
      const ranking = classResults(workspace, meant.id);
      const performance = subjectPerformance(workspace, meant.id).filter((row) => row.entries > 0);
      return {
        answer: `${meant.name} averages ${percent(classAverage(workspace, meant.id), 1)}% across ${ranking.length} ranked students.\n\n${performance
          .slice(0, 3)
          .map((row) => `${row.subject.name}: ${percent(row.average, 1)}%`)
          .join("\n")}\n\nTop of the class is ${ranking[0]?.student.firstName} ${ranking[0]?.student.lastName} at ${percent(ranking[0]?.average ?? 0, 1)}%.`,
        sources: [`${meant.name} results`, "Subject averages"],
        facts: [
          { label: "Class average", value: `${percent(classAverage(workspace, meant.id), 1)}%` },
          { label: "Ranked students", value: String(ranking.length) },
          { label: "Below 50%", value: String(ranking.filter((row) => row.average < 50).length) },
        ],
      };
    }

    const ranked = scopedClasses
      .map((room) => ({ room, average: classAverage(workspace, room.id) }))
      .sort((a, b) => b.average - a.average);
    return {
      answer: `${role === "teacher" ? "Across your classes" : "Across the school"}, ${ranked[0]?.room.name} leads with a ${percent(ranked[0]?.average ?? 0, 1)}% average. ${ranked[ranked.length - 1]?.room.name} is lowest at ${percent(ranked[ranked.length - 1]?.average ?? 0, 1)}%.\n\nThe average is ${percent(ranked.reduce((total, row) => total + row.average, 0) / Math.max(1, ranked.length), 1)}%. ${classResults(workspace, ranked[ranked.length - 1]?.room.id ?? "").filter((row) => row.average < 50).length} students in the lowest class are below 50%.`,
      sources: [role === "teacher" ? "Your class results" : "All published results", "Class averages"],
      facts: ranked.slice(0, 3).map((row) => ({ label: row.room.name, value: `${percent(row.average, 0)}%` })),
    };
  }

  if (has(text, ["how many student", "enrol", "enroll", "population", "admission", "girls", "boys"])) {
    const students = scopedStudents;
    const girls = students.filter((item) => item.gender === "female").length;
    const boys = students.filter((item) => item.gender === "male").length;
    const rows = scopedClasses
      .map((room) => ({ room, count: students.filter((item) => item.classId === room.id).length }))
      .filter((row) => row.count > 0);
    return {
      answer: `${students.length} active students are on file: ${girls} girls and ${boys} boys across ${rows.length} classes.\n\n${rows
        .map((row) => `${row.room.name}: ${row.count}`)
        .join("\n")}\n\n${role === "admin" ? `${workspace.students.filter((item) => item.status !== "active").length} records are not active (graduated or withdrawn).` : "This list follows your access scope."}`,
      sources: [`${students.length} student records`, "Class placement"],
      facts: [
        { label: "Active", value: String(students.length) },
        { label: "Girls", value: String(girls) },
        { label: "Boys", value: String(boys) },
        { label: "Classes", value: String(rows.length) },
      ],
    };
  }

  if (has(text, ["staff", "teacher", "payroll", "department", "leave"])) {
    if (role !== "admin") {
      return {
        answer:
          "Staff records and payroll are held by the school office, so they are outside your access scope. Form teachers are shown on the relevant class and student profiles.",
        sources: ["Role access scope"],
      };
    }
    const onLeave = workspace.staff.filter((member) => member.status === "on leave");
    const payroll = workspace.staff.reduce((total, member) => total + member.salary, 0);
    return {
      answer: `The school has ${workspace.staff.length} staff, ${workspace.staff.filter((member) => member.status === "active").length} of them active. ${onLeave.length ? `${onLeave.map((member) => member.name).join(", ")} ${onLeave.length === 1 ? "is" : "are"} on leave.` : "Nobody is currently on leave."}\n\nMonthly base payroll is ${naira(payroll)}. Departments on file: ${[...new Set(workspace.staff.map((member) => member.department))].join(", ")}.`,
      sources: ["Staff records", "Payroll fields"],
      facts: [
        { label: "Staff", value: String(workspace.staff.length) },
        { label: "On leave", value: String(onLeave.length) },
        { label: "Monthly payroll", value: compactNaira(payroll) },
      ],
    };
  }

  if (has(text, ["stock", "inventory", "reorder", "supplies", "textbook", "books"])) {
    if (role !== "admin") {
      return { answer: "Inventory is an administrative record, so it is outside your access scope. Ask the school office if you need to confirm a booklist item.", sources: ["Role access scope"] };
    }
    const low = lowStock(workspace);
    const value = workspace.inventory.reduce((total, item) => total + item.quantity * item.unitCost, 0);
    return {
      answer: low.length
        ? `${low.length} item${low.length === 1 ? "" : "s"} sit at or below the reorder level:\n\n${low.map((item) => `${item.name}: ${item.quantity} ${item.unit} left, minimum ${item.reorderLevel} (${item.location}).`).join("\n")}\n\nTotal stock value on file is ${naira(value)}.`
        : `Every inventory item is above its reorder level. Total stock value on file is ${naira(value)} across ${workspace.inventory.length} line items.`,
      sources: [`${workspace.inventory.length} inventory items`],
      facts: [
        { label: "Low stock", value: String(low.length) },
        { label: "Stock value", value: compactNaira(value) },
      ],
    };
  }

  if (has(text, ["exam", "cbt", "test", "paper", "assessment"])) {
    const exams = upcomingExams(workspace);
    if (!exams.length) {
      return { answer: "No exam or CBT paper is currently scheduled. Drafts live in Exams and CBT.", sources: ["Exam records"] };
    }
    return {
      answer: `The next papers are:\n\n${exams
        .slice(0, 4)
        .map(
          (exam) =>
            `${exam.title} for ${className(workspace, exam.classId)} on ${dateLabel(exam.scheduledFor)} at ${timeLabel(exam.scheduledFor)}, ${exam.duration} minutes, ${exam.questions.length} questions.`,
        )
        .join("\n")}\n\n${workspace.exams.filter((exam) => exam.submissions > 0).length} papers already have submissions.`,
      sources: ["Exam records", "Class timetable"],
      facts: exams.slice(0, 3).map((exam) => ({ label: exam.title, value: dateLabel(exam.scheduledFor) })),
    };
  }

  if (has(text, ["bus", "transport", "route", "driver"])) {
    if (role === "teacher") {
      return { answer: "Transport records are managed by operations and are outside a teacher's access scope.", sources: ["Teacher access scope"] };
    }
    if (role === "parent") {
      const routes = workspace.routes.filter((route) => children.some((child) => route.studentIds.includes(child.id)));
      return {
        answer: routes.length
          ? routes
              .map(
                (route) =>
                  `${route.name}: driver ${route.driver} on ${route.phone}, plate ${route.plate}, departs ${route.departure}. Stops: ${route.stops.join(", ")}.`,
              )
              .join("\n")
          : "No school transport route is assigned to your children. The school office can add one.",
        sources: children.map((child) => `${child.firstName}'s transport record`),
      };
    }
    const assigned = new Set(workspace.routes.flatMap((route) => route.studentIds));
    const unassigned = workspace.students.filter((student) => student.status === "active" && !assigned.has(student.id));
    return {
      answer: `${workspace.routes.filter((route) => route.active).length} of ${workspace.routes.length} routes are running, carrying ${assigned.size} students. ${unassigned.length} active students are not on a route.\n\n${workspace.routes
        .map((route) => `${route.name}: ${route.studentIds.length}/${route.capacity} seats, departs ${route.departure}, driver ${route.driver}.`)
        .join("\n")}`,
      sources: ["Transport routes", "Student records"],
      facts: [
        { label: "Routes", value: `${workspace.routes.length}` },
        { label: "Riders", value: String(assigned.size) },
        { label: "Unassigned", value: String(unassigned.length) },
      ],
    };
  }

  if (has(text, ["announcement", "notice", "message", "communicat"])) {
    const notices = workspace.announcements.slice(0, 3);
    return {
      answer: `The last ${notices.length} notices on the board:\n\n${notices
        .map((notice) => `${notice.title} (${notice.audience}, ${dateLabel(notice.at)}): ${notice.body.slice(0, 120)}${notice.body.length > 120 ? "..." : ""}`)
        .join("\n")}`,
      sources: ["Announcement board"],
    };
  }

  if (has(text, ["which class", "compare", "best class", "lowest class", "needs support"])) {
    const ranked = scopedClasses
      .map((room) => ({
        room,
        average: classAverage(workspace, room.id),
        attendance: attendanceRate(workspace.attendance.filter((row) => row.classId === room.id)),
      }))
      .sort((a, b) => b.average - a.average);
    return {
      answer: `Class comparison, strongest to weakest by average:\n\n${ranked
        .map(
          (row) =>
            `${row.room.name}: ${percent(row.average, 1)}% average, ${percent(row.attendance, 0)}% attendance.`,
        )
        .join("\n")}\n\nThe clearest support case is ${ranked[ranked.length - 1]?.room.name}, where the average is ${percent(ranked[ranked.length - 1]?.average ?? 0, 1)}%.`,
      sources: ["All class results", "All attendance records"],
      facts: ranked.slice(0, 3).map((row) => ({ label: row.room.name, value: `${percent(row.average, 0)}%` })),
    };
  }

  return {
    answer: `I can answer from the school's own records, ${name.split(" ")[0]}. Try one of these:\n\n• Who needs support this term?\n• How are fees looking?\n• What is the attendance rate?\n• Which class is weakest?\n• What exams are coming up?\n• Tell me about a student by name\n\nI do not generate students, scores, payments or staff. If a record is missing, I will say it is missing.`,
    sources: ["No records read for this reply"],
  };
}

export const assistantSuggestions: Record<Role, string[]> = {
  admin: [
    "Who needs support this term?",
    "How are fees looking?",
    "Which class is weakest?",
    "What exams are coming up?",
    "How much stock is low?",
    "How many students are enrolled?",
  ],
  teacher: [
    "Who needs support in my classes?",
    "How is attendance this week?",
    "Which subject is weakest?",
    "What exams are coming up?",
    "Tell me about a student by name",
  ],
  parent: [
    "How is my child doing?",
    "Do I owe any fees?",
    "How is attendance?",
    "When is the next exam?",
    "What has the school announced?",
  ],
};
