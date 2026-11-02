"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Clock,
  GraduationCap,
  Megaphone,
  Sparkles,
  TriangleAlert,
  Users,
  Wallet,
} from "lucide-react";
import { PageTitle, Badge, Avatar, Progress } from "@/components/ui/surface";
import { buttonClass } from "@/lib/button";
import { useSchool } from "@/lib/store";
import { useSession } from "@/lib/session";
import {
  atRiskStudents,
  attendanceRate,
  attendanceSeries,
  attendanceSummary,
  classAverage,
  classResults,
  enrollmentSeries,
  feeSummary,
  guardianChildren,
  lowStock,
  recentPayments,
  studentAttendanceRate,
  studentAverage,
  studentOutstanding,
  studentsInClass,
  upcomingExams,
} from "@/lib/analytics";
import {
  compactNaira,
  dateLabel,
  gradeFor,
  naira,
  percent,
  timeLabel,
} from "@/lib/format";
import { AreaChart, BarChart, Donut } from "@/components/ui/charts";
import { StatCard } from "@/components/dashboard/stat";
import { cn } from "@/lib/utils";

const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function DashboardPage() {
  const { user } = useSession();
  const { workspace } = useSchool();
  if (!workspace || !user) return null;

  const today = new Date();
  const dateCopy = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(today);

  return (
    <div className="space-y-5">
      <PageTitle
        eyebrow={dateCopy}
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description={
          user.role === "admin"
            ? `${workspace.school.name} is open. Here is where the school stands in ${workspace.school.term}.`
            : user.role === "teacher"
              ? "Your classes, your register, and the students who need a closer look."
              : "Your children's term in one place: results, attendance, fees and school notices."
        }
        actions={
          user.role === "parent" ? (
            <Link href="/dashboard/assistant" className={buttonClass("primary", "md")}>
              <Sparkles className="h-3.5 w-3.5" />
              Ask about my children
            </Link>
          ) : (
            <>
              <Link href="/dashboard/attendance" className={buttonClass("secondary", "md")}>
                <CalendarCheck className="h-3.5 w-3.5" />
                Take register
              </Link>
              {user.role === "admin" ? (
                <Link href="/dashboard/students?new=1" className={buttonClass("primary", "md")}>
                  <Users className="h-3.5 w-3.5" />
                  Add student
                </Link>
              ) : (
                <Link href="/dashboard/results" className={buttonClass("primary", "md")}>
                  <ClipboardList className="h-3.5 w-3.5" />
                  Open gradebook
                </Link>
              )}
            </>
          )
        }
      />

      {user.role === "admin" ? <AdminOverview /> : null}
      {user.role === "teacher" ? <TeacherOverview /> : null}
      {user.role === "parent" ? <ParentOverview /> : null}
    </div>
  );
}

function AdminOverview() {
  const { workspace } = useSchool();
  if (!workspace) return null;

  const students = workspace.students.filter((student) => student.status === "active");
  const series = enrollmentSeries(workspace, 8);
  const fees = feeSummary(workspace);
  const attendanceDays = attendanceSeries(workspace, 8);
  const latest = attendanceDays[attendanceDays.length - 1];
  const todayRate = latest?.rate ?? attendanceRate(workspace.attendance);
  const risk = atRiskStudents(workspace).slice(0, 4);
  const upcoming = upcomingExams(workspace).slice(0, 3);
  const payments = recentPayments(workspace, 4);
  const low = lowStock(workspace);
  const paidShare = fees.rate;

  const gender = {
    female: students.filter((student) => student.gender === "female").length,
    male: students.filter((student) => student.gender === "male").length,
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Active students"
          value={students.length}
          icon={Users}
          foot={`${workspace.classes.length} classes, ${workspace.staff.length} staff`}
        />
        <StatCard
          label="Attendance today"
          value={`${percent(todayRate, 0)}%`}
          icon={CalendarCheck}
          tone="success"
          foot={`${latest?.present ?? 0} present, ${latest?.absent ?? 0} absent`}
        />
        <StatCard
          label="Fees collected"
          value={compactNaira(fees.collected)}
          icon={Wallet}
          tone="violet"
          foot={`${compactNaira(fees.outstanding)} outstanding`}
        />
        <StatCard
          label="Students at risk"
          value={risk.length ? atRiskStudents(workspace).length : 0}
          icon={TriangleAlert}
          tone="warning"
          foot={low.length ? `${low.length} inventory items low` : "Inventory healthy"}
        />
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.55fr_1fr]">
        <section className="card p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-[12.5px] font-bold text-ink">Enrollment this session</h2>
              <p className="mt-0.5 text-[10px] text-muted">
                Cumulative admissions, {workspace.school.session}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="success" dot>
                {students.length} active
              </Badge>
              <span className="rounded-md border border-line px-2 py-1 text-[9.5px] font-semibold text-muted">
                {workspace.school.term}
              </span>
            </div>
          </div>
          <AreaChart data={series} height={196} label="Enrollment" className="mt-3" />

          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3">
            {[
              { label: "Girls", value: gender.female },
              { label: "Boys", value: gender.male },
              { label: "Staff", value: workspace.staff.length },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-muted">{item.label}</p>
                <p className="mt-0.5 text-[15px] font-bold text-ink tnum">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="card flex flex-col p-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[12.5px] font-bold text-ink">Fee position</h2>
              <p className="mt-0.5 text-[10px] text-muted">{workspace.school.term} collections</p>
            </div>
            <Link href="/dashboard/fees" className="text-[10px] font-bold text-brand hover:underline">
              Open ledger
            </Link>
          </div>
          <div className="mt-4 flex flex-1 items-center justify-center">
            <Donut
              size={158}
              thickness={16}
              centerValue={`${percent(paidShare, 0)}%`}
              centerLabel="collected"
              segments={[
                { value: fees.paid, color: "hsl(var(--success))", label: "Paid" },
                { value: fees.partial, color: "hsl(var(--warning))", label: "Part paid" },
                { value: fees.unpaid, color: "hsl(var(--danger))", label: "Unpaid" },
              ]}
            />
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Collected", value: compactNaira(fees.collected), tone: "text-success" },
              { label: "Outstanding", value: compactNaira(fees.outstanding), tone: "text-danger" },
              { label: "Billed", value: compactNaira(fees.billed), tone: "text-ink" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-canvas px-1.5 py-2">
                <p className="text-[9px] font-semibold text-muted">{item.label}</p>
                <p className={cn("mt-0.5 text-[11.5px] font-bold tnum", item.tone)}>{item.value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1fr_1fr]">
        <section className="card p-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[12.5px] font-bold text-ink">Attendance, last 8 school days</h2>
              <p className="mt-0.5 text-[10px] text-muted">Present and late count as attended</p>
            </div>
            <Badge tone={todayRate >= 92 ? "success" : "warning"}>{percent(todayRate, 0)}% today</Badge>
          </div>
          <BarChart
            data={attendanceDays.map((day, index) => ({
              label: day.label,
              value: Math.round(day.rate),
              highlight: index === attendanceDays.length - 1,
            }))}
            height={168}
            valueSuffix="%"
            className="mt-4"
          />
          <div className="mt-3 flex items-center justify-between rounded-lg bg-canvas px-3 py-2">
            <p className="text-[10px] text-muted">
              {latest ? `${latest.total} records marked on the last school day` : "No register yet"}
            </p>
            <Link href="/dashboard/attendance" className="inline-flex items-center gap-1 text-[10px] font-bold text-brand">
              Register
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </section>

        <section className="card p-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[12.5px] font-bold text-ink">Students who need attention</h2>
              <p className="mt-0.5 text-[10px] text-muted">Low average, attendance, or both</p>
            </div>
            <Link href="/dashboard/students?filter=risk" className="text-[10px] font-bold text-brand hover:underline">
              All {atRiskStudents(workspace).length}
            </Link>
          </div>
          <div className="mt-3 divide-y divide-line-soft">
            {risk.map((row) => (
              <Link
                key={row.student.id}
                href={`/dashboard/students/${row.student.id}`}
                className="flex items-center gap-2.5 py-2.5 transition-colors hover:bg-canvas/60"
              >
                <Avatar name={`${row.student.firstName} ${row.student.lastName}`} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11.5px] font-semibold text-ink">
                    {row.student.firstName} {row.student.lastName}
                  </p>
                  <p className="truncate text-[9.5px] text-muted">{row.reasons[0]}</p>
                </div>
                <div className="text-right">
                  <p className={cn("text-[11px] font-bold tnum", row.average < 50 ? "text-danger" : "text-warning")}>
                    {Math.round(row.average)}%
                  </p>
                  <p className="text-[9px] text-muted">{gradeFor(row.average).grade}</p>
                </div>
              </Link>
            ))}
            {!risk.length ? (
              <p className="py-8 text-center text-[11px] text-muted">No student is currently flagged.</p>
            ) : null}
          </div>
        </section>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <section className="card p-4">
          <h2 className="text-[12.5px] font-bold text-ink">Recent payments</h2>
          <div className="mt-3 space-y-2.5">
            {payments.map((payment) => {
              const student = workspace.students.find((item) => item.id === payment.studentId);
              return (
                <div key={payment.id} className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-success-soft text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10.5px] font-semibold text-ink">
                      {student?.firstName} {student?.lastName}
                    </p>
                    <p className="text-[9px] text-muted">
                      {payment.method} at {timeLabel(payment.at)}
                    </p>
                  </div>
                  <p className="text-[10.5px] font-bold text-success tnum">{compactNaira(payment.amount)}</p>
                </div>
              );
            })}
          </div>
          <Link href="/dashboard/fees" className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-brand">
            Full ledger
            <ArrowRight className="h-3 w-3" />
          </Link>
        </section>

        <section className="card p-4">
          <h2 className="text-[12.5px] font-bold text-ink">Upcoming assessments</h2>
          <div className="mt-3 space-y-2.5">
            {upcoming.map((exam) => (
              <div key={exam.id} className="flex items-start gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-soft text-brand">
                  <MonitorCheckIcon />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10.5px] font-semibold text-ink">{exam.title}</p>
                  <p className="text-[9px] text-muted">
                    {dateLabel(exam.scheduledFor)} at {timeLabel(exam.scheduledFor)}. {exam.duration} min
                  </p>
                </div>
                <Badge tone={exam.status === "scheduled" ? "success" : "neutral"}>{exam.status}</Badge>
              </div>
            ))}
          </div>
          <Link href="/dashboard/exams" className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-brand">
            Exam room
            <ArrowRight className="h-3 w-3" />
          </Link>
        </section>

        <section className="card p-4">
          <h2 className="text-[12.5px] font-bold text-ink">What changed</h2>
          <div className="mt-3 space-y-2.5">
            {workspace.activity.slice(0, 4).map((item) => (
              <div key={item.id} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand/50" />
                <div className="min-w-0">
                  <p className="text-[10.5px] leading-snug text-ink/80">{item.text}</p>
                  <p className="mt-0.5 text-[9px] text-muted">{dateLabel(item.at, { day: "numeric", month: "short" })}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function MonitorCheckIcon() {
  return <ClipboardList className="h-3.5 w-3.5" />;
}

function TeacherOverview() {
  const { workspace } = useSchool();
  const { user } = useSession();
  if (!workspace || !user) return null;

  const staffMember =
    workspace.staff.find((member) => member.email.toLowerCase() === user.email.toLowerCase()) ??
    workspace.staff.find((member) => member.name.toLowerCase() === user.name.toLowerCase()) ??
    workspace.staff[0];
  const myClasses = workspace.classes.filter((room) => room.teacherId === staffMember.id);
  const myStudents = workspace.students.filter(
    (student) => student.status === "active" && myClasses.some((room) => room.id === student.classId),
  );
  const myRisk = atRiskStudents(workspace).filter((row) =>
    myClasses.some((room) => room.id === row.student.classId),
  );
  const todaySlots = workspace.timetable
    .filter((slot) => slot.day === new Date().getDay() && myClasses.some((room) => room.id === slot.classId))
    .sort((a, b) => a.period - b.period)
    .slice(0, 5);
  const avg = myClasses.length ? myClasses.reduce((total, room) => total + classAverage(workspace, room.id), 0) / myClasses.length : 0;
  const registerDone = workspace.attendance.some((row) => {
    const date = new Date();
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return row.date === key && myClasses.some((room) => room.id === row.classId);
  });

  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Classes I lead" value={myClasses.length} icon={BookOpen} foot={myClasses.map((room) => room.name).join(", ") || "No form class"} />
        <StatCard label="My students" value={myStudents.length} icon={Users} tone="violet" foot={`${myStudents.filter((student) => student.gender === "female").length} girls, ${myStudents.filter((student) => student.gender === "male").length} boys`} />
        <StatCard label="Class average" value={`${percent(avg, 0)}%`} icon={GraduationCap} tone="success" foot={`Grade ${gradeFor(avg).grade}`} />
        <StatCard label="Flagged students" value={myRisk.length} icon={TriangleAlert} tone="warning" foot={registerDone ? "Register taken today" : "Register not taken"} />
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.35fr_1fr]">
        <section className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[12.5px] font-bold text-ink">{weekdayNames[new Date().getDay()]} timetable</h2>
              <p className="mt-0.5 text-[10px] text-muted">Your periods for today, in order</p>
            </div>
            <Link href="/dashboard/classes" className="text-[10px] font-bold text-brand">
              Full timetable
            </Link>
          </div>
          <div className="mt-3 space-y-1.5">
            {todaySlots.map((slot) => {
              const subject = workspace.subjects.find((item) => item.id === slot.subjectId);
              const room = workspace.classes.find((item) => item.id === slot.classId);
              return (
                <div key={slot.id} className="flex items-center gap-3 rounded-lg border border-line bg-white px-3 py-2">
                  <span className="w-12 shrink-0 text-[10px] font-bold text-brand">P{slot.period}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-semibold text-ink">{subject?.name ?? "Subject"}</p>
                    <p className="text-[9.5px] text-muted">{room?.name} in {room?.room}</p>
                  </div>
                  <Clock className="h-3 w-3 text-muted" />
                </div>
              );
            })}
            {!todaySlots.length ? (
              <p className="rounded-lg border border-dashed border-line px-3 py-6 text-center text-[10.5px] text-muted">
                No periods scheduled for today.
              </p>
            ) : null}
          </div>
        </section>

        <section className="card p-4">
          <h2 className="text-[12.5px] font-bold text-ink">A closer look</h2>
          <p className="mt-0.5 text-[10px] text-muted">Students in your classes who need support</p>
          <div className="mt-3 space-y-2">
            {myRisk.slice(0, 5).map((row) => (
              <Link key={row.student.id} href={`/dashboard/students/${row.student.id}`} className="flex items-center gap-2.5 rounded-lg px-1 py-1.5 hover:bg-canvas">
                <Avatar name={`${row.student.firstName} ${row.student.lastName}`} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold text-ink">{row.student.firstName} {row.student.lastName}</p>
                  <p className="truncate text-[9.5px] text-muted">{row.reasons[0]}</p>
                </div>
                <Badge tone={row.severity === "high" ? "danger" : "warning"}>{Math.round(row.average)}%</Badge>
              </Link>
            ))}
            {!myRisk.length ? (
              <p className="py-6 text-center text-[10.5px] text-muted">Nothing flagged in your classes.</p>
            ) : null}
          </div>
          <Link href="/dashboard/assistant?q=Which%20of%20my%20students%20need%20support%3F" className={buttonClass("soft", "sm", "mt-3 w-full")}>
            <Sparkles className="h-3 w-3" />
            Ask the assistant
          </Link>
        </section>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <section className="card p-4">
          <h2 className="text-[12.5px] font-bold text-ink">My classes</h2>
          <div className="mt-3 space-y-2.5">
            {myClasses.map((room) => {
              const roster = studentsInClass(workspace, room.id);
              const average = classAverage(workspace, room.id);
              return (
                <div key={room.id} className="rounded-xl border border-line bg-white p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11.5px] font-bold text-ink">{room.name}</p>
                      <p className="text-[9.5px] text-muted">{roster.length} students, {room.room}</p>
                    </div>
                    <Badge tone={average >= 60 ? "success" : average >= 50 ? "info" : "warning"}>
                      {percent(average, 0)}%
                    </Badge>
                  </div>
                  <Progress value={average} tone={average >= 60 ? "success" : average >= 50 ? "brand" : "warning"} className="mt-2.5" />
                </div>
              );
            })}
            {!myClasses.length ? <p className="text-[10.5px] text-muted">No class assigned yet.</p> : null}
          </div>
        </section>

        <section className="card p-4">
          <h2 className="text-[12.5px] font-bold text-ink">Recent results</h2>
          <div className="mt-3 space-y-2">
            {classResults(workspace, myClasses[0]?.id ?? workspace.classes[0].id).slice(0, 5).map((row) => (
              <div key={row.student.id} className="flex items-center gap-2.5">
                <Avatar name={`${row.student.firstName} ${row.student.lastName}`} size="xs" />
                <p className="min-w-0 flex-1 truncate text-[10.5px] font-medium text-ink">
                  {row.student.firstName} {row.student.lastName}
                </p>
                <span className="text-[10px] font-bold text-ink tnum">{percent(row.average, 0)}%</span>
                <Badge tone={row.grade.tone === "success" ? "success" : row.grade.tone === "info" ? "info" : row.grade.tone === "warning" ? "warning" : "danger"}>
                  {row.grade.grade}
                </Badge>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function ParentOverview() {
  const { workspace } = useSchool();
  const { user } = useSession();
  if (!workspace || !user) return null;

  const children = guardianChildren(workspace, user.email);
  const notices = workspace.announcements.filter((notice) => notice.audience === "all" || notice.audience === "parents").slice(0, 3);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Children" value={children.length} icon={Users} foot={children.map((child) => child.firstName).join(", ")} />
        <StatCard
          label="Family fees balance"
          value={compactNaira(children.reduce((total, child) => total + studentOutstanding(workspace, child.id), 0))}
          icon={Wallet}
          tone="violet"
          foot={`${workspace.school.term}, ${workspace.school.session}`}
        />
        <StatCard
          label="Combined average"
          value={`${percent(children.length ? children.reduce((total, child) => total + studentAverage(workspace, child.id), 0) / children.length : 0, 0)}%`}
          icon={GraduationCap}
          tone="success"
          foot="Across published results"
        />
        <StatCard
          label="School notices"
          value={notices.length}
          icon={Megaphone}
          tone="warning"
          foot={notices[0]?.title ?? "Nothing new"}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {children.map((child) => {
          const room = workspace.classes.find((item) => item.id === child.classId);
          const attendance = studentAttendanceRate(workspace, child.id);
          const average = studentAverage(workspace, child.id);
          const grade = gradeFor(average);
          const balance = studentOutstanding(workspace, child.id);
          return (
            <section key={child.id} className="card overflow-hidden">
              <div className="flex items-center gap-3 border-b border-line bg-gradient-to-r from-brand-soft/70 to-transparent px-4 py-3">
                <Avatar name={`${child.firstName} ${child.lastName}`} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-ink">{child.firstName} {child.lastName}</p>
                  <p className="text-[10px] text-muted">{room?.name ?? "Unassigned"} · {child.admissionNo}</p>
                </div>
                <Link href={`/dashboard/students/${child.id}`} className="text-[10px] font-bold text-brand">
                  Profile
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-2 p-4">
                <div className="rounded-xl bg-canvas p-2.5">
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-muted">Average</p>
                  <p className="mt-1 text-[18px] font-extrabold leading-none text-ink tnum">{percent(average, 0)}%</p>
                  <Badge tone={grade.tone} className="mt-1.5">{grade.grade} {grade.remark}</Badge>
                </div>
                <div className="rounded-xl bg-canvas p-2.5">
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-muted">Attendance</p>
                  <p className="mt-1 text-[18px] font-extrabold leading-none text-ink tnum">{percent(attendance, 0)}%</p>
                  <Progress value={attendance} tone={attendance >= 90 ? "success" : "warning"} className="mt-2" />
                </div>
                <div className="rounded-xl bg-canvas p-2.5">
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-muted">Fees due</p>
                  <p className="mt-1 text-[18px] font-extrabold leading-none text-ink tnum">{compactNaira(balance)}</p>
                  <p className="mt-1 text-[9px] text-muted">{balance ? "Payment outstanding" : "Fully paid"}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 border-t border-line px-4 py-2.5">
                <Link href="/dashboard/results" className={buttonClass("soft", "sm")}>
                  <ClipboardList className="h-3 w-3" />
                  Results
                </Link>
                <Link href="/dashboard/fees" className={buttonClass("secondary", "sm")}>
                  <Wallet className="h-3 w-3" />
                  Pay fees
                </Link>
                <Link href="/dashboard/attendance" className={buttonClass("ghost", "sm")}>
                  <CalendarCheck className="h-3 w-3" />
                  Attendance
                </Link>
              </div>
            </section>
          );
        })}
      </div>

      <section className="card p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[12.5px] font-bold text-ink">From the school</h2>
          <Link href="/dashboard/communication" className="text-[10px] font-bold text-brand">
            All notices
          </Link>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {notices.map((notice) => (
            <article key={notice.id} className="rounded-xl border border-line bg-white p-3">
              <div className="flex items-center justify-between">
                <Badge tone={notice.audience === "parents" ? "violet" : "neutral"}>{notice.audience}</Badge>
                <span className="text-[9px] text-muted">{dateLabel(notice.at, { day: "numeric", month: "short" })}</span>
              </div>
              <h3 className="mt-2 text-[11.5px] font-bold leading-snug text-ink">{notice.title}</h3>
              <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-muted">{notice.body}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
