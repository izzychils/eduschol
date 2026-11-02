"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Download,
  Filter,
  Plus,
  Search,
  ShieldAlert,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { PageTitle, Badge, Avatar, EmptyState } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, SearchField } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useSchool } from "@/lib/store";
import { useSession } from "@/lib/session";
import {
  atRiskStudents,
  className as roomName,
  guardianChildren,
  invoiceBalance,
  studentAttendanceRate,
  studentAverage,
  studentInvoices,
  studentsInClass,
} from "@/lib/analytics";
import { gradeFor, naira, percent } from "@/lib/format";
import { todayISO, uid, cn } from "@/lib/utils";
import type { Student } from "@/lib/types";

type FilterKey = "all" | "risk" | "new" | "fees";

const emptyForm = {
  firstName: "",
  lastName: "",
  gender: "female" as "female" | "male",
  dateOfBirth: "",
  classId: "",
  guardianName: "",
  guardianPhone: "",
  guardianEmail: "",
  address: "",
  house: "Emerald",
};

export default function StudentsPage() {
  const { workspace, update } = useSchool();
  const { user } = useSession();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [classId, setClassId] = useState("all");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("new") === "1" && user?.role === "admin") setOpen(true);
    if (params.get("filter") === "risk") setFilter("risk");
    const classParam = params.get("class");
    if (classParam) setClassId(classParam);
  }, [user?.role]);

  const riskRows = useMemo(() => (workspace ? atRiskStudents(workspace) : []), [workspace]);

  const scoped = useMemo(() => {
    if (!workspace || !user) return [];
    if (user.role === "parent") return guardianChildren(workspace, user.email);
    if (user.role === "teacher") {
      const me =
        workspace.staff.find((member) => member.email.toLowerCase() === user.email.toLowerCase()) ??
        workspace.staff.find((member) => member.name.toLowerCase() === user.name.toLowerCase());
      const myClassIds = workspace.classes.filter((room) => room.teacherId === me?.id).map((room) => room.id);
      return workspace.students.filter((student) => myClassIds.includes(student.classId));
    }
    return workspace.students;
  }, [workspace, user]);

  const students = useMemo(() => {
    if (!workspace || !user) return [];
    let rows = scoped;
    if (classId !== "all") rows = rows.filter((student) => student.classId === classId);
    if (filter === "risk") rows = rows.filter((student) => riskRows.some((row) => row.student.id === student.id));
    if (filter === "fees") rows = rows.filter((student) => studentInvoices(workspace, student.id).some((invoice) => invoiceBalance(invoice) > 0));
    if (filter === "new") rows = rows.filter((student) => student.admittedAt >= `${new Date().getFullYear()}-08-01`);

    const clean = query.trim().toLowerCase();
    if (clean) {
      rows = rows.filter((student) =>
        [
          student.firstName,
          student.lastName,
          student.admissionNo,
          student.guardianName,
          student.guardianPhone,
        ]
          .join(" ")
          .toLowerCase()
          .includes(clean),
      );
    }
    return [...rows].sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
  }, [workspace, user, scoped, classId, filter, query, riskRows]);

  if (!workspace || !user) return null;

  const visibleClasses = user.role === "parent" ? workspace.classes : workspace.classes;
  const isAdmin = user.role === "admin";

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!workspace) return;
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("A first and last name are required.");
      return;
    }
    if (!form.classId) {
      setError("Choose the class the student is joining.");
      return;
    }
    if (!form.guardianName.trim() || !form.guardianPhone.trim()) {
      setError("A guardian name and phone number are required.");
      return;
    }
    const year = new Date().getFullYear();
    const number = workspace.students.length + 1;
    const admissionNo = `GFA/${String(year).slice(2)}/${String(number).padStart(3, "0")}`;
    const student: Student = {
      id: uid("stu"),
      admissionNo,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      gender: form.gender,
      dateOfBirth: form.dateOfBirth || `${year - 12}-01-15`,
      classId: form.classId,
      status: "active",
      guardianName: form.guardianName.trim(),
      guardianPhone: form.guardianPhone.trim(),
      guardianEmail: form.guardianEmail.trim() || `${form.firstName.trim().toLowerCase()}.guardian@mail.com`,
      address: form.address.trim() || "Lagos",
      admittedAt: todayISO(),
      house: form.house,
    };
    update((current) => ({
      ...current,
      students: [student, ...current.students],
      activity: [
        {
          id: uid("act"),
          kind: "student.added",
          text: `${user?.name ?? "An administrator"} enrolled ${student.firstName} ${student.lastName} into ${roomName(current, student.classId)}`,
          at: new Date().toISOString(),
        },
        ...current.activity,
      ],
    }));
    toast(`${student.firstName} ${student.lastName} enrolled in ${roomName(workspace, student.classId)}`, "success");
    setForm(emptyForm);
    setOpen(false);
  }

  function exportCsv() {
    if (!workspace) return;
    const header = ["Admission no", "First name", "Last name", "Class", "Guardian", "Phone", "Attendance %", "Average %"];
    const lines = students.map((student) =>
      [
        student.admissionNo,
        student.firstName,
        student.lastName,
        roomName(workspace, student.classId),
        student.guardianName,
        student.guardianPhone,
        percent(studentAttendanceRate(workspace, student.id), 1),
        percent(studentAverage(workspace, student.id), 1),
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${workspace.school.name.toLowerCase().replace(/\s+/g, "-")}-students.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast(`${students.length} student records exported`, "success");
  }

  const scopedRisk = riskRows.filter((row) => scoped.some((student) => student.id === row.student.id));
  const counts = {
    all: scoped.length,
    risk: scopedRisk.length,
    new: scoped.filter((student) => student.admittedAt >= `${new Date().getFullYear()}-08-01`).length,
    fees: scoped.filter((student) => studentInvoices(workspace, student.id).some((invoice) => invoiceBalance(invoice) > 0)).length,
  };

  return (
    <div className="space-y-5">
      <PageTitle
        eyebrow={user.role === "parent" ? "Family" : "Records"}
        title={user.role === "parent" ? "My children" : "Students"}
        description={
          user.role === "parent"
            ? "Profiles, results, attendance and fee position for each child."
            : user.role === "teacher"
              ? "Every student in the classes you lead, with the numbers that matter."
              : `${counts.all} records on file. Admission, guardians, class placement and academic standing.`
        }
        actions={
          <>
            <Button variant="secondary" size="md" onClick={exportCsv}>
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
            {isAdmin ? (
              <Button size="md" onClick={() => setOpen(true)}>
                <UserPlus className="h-3.5 w-3.5" />
                Enrol student
              </Button>
            ) : null}
          </>
        }
      />

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {([
              { id: "all", label: "All", count: counts.all },
              { id: "risk", label: "Needs support", count: counts.risk },
              { id: "fees", label: "Fees owing", count: counts.fees },
              { id: "new", label: "New this term", count: counts.new },
            ] as { id: FilterKey; label: string; count: number }[]).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors",
                  filter === tab.id ? "bg-brand text-white" : "text-muted hover:bg-canvas hover:text-ink",
                )}
              >
                {tab.label}
                <span className={cn("rounded-full px-1.5 text-[9px] leading-4", filter === tab.id ? "bg-white/20" : "bg-line-soft")}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
          <div className="ml-auto flex flex-1 items-center gap-2 sm:flex-none">
            <SearchField value={query} onChange={setQuery} placeholder="Name, admission no, guardian" className="min-w-[180px] flex-1 sm:w-[250px] sm:flex-none" />
            {user.role !== "parent" ? (
              <div className="relative hidden sm:block">
                <Select value={classId} onChange={(event) => setClassId(event.target.value)} className="h-9 w-[140px] pr-7 text-[11px]">
                  <option value="all">Every class</option>
                  {visibleClasses.map((room) => (
                    <option key={room.id} value={room.id}>{room.name}</option>
                  ))}
                </Select>
              </div>
            ) : null}
          </div>
        </div>

        <div className="hidden grid-cols-[minmax(200px,1.6fr)_0.8fr_1.2fr_0.7fr_0.6fr_0.8fr_40px] gap-3 border-b border-line bg-canvas/60 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-muted lg:grid">
          <span>Student</span>
          <span>Class</span>
          <span>Guardian</span>
          <span>Attendance</span>
          <span>Average</span>
          <span>Fees</span>
          <span />
        </div>

        <div className="divide-y divide-line-soft">
          {students.map((student) => {
            const attendance = studentAttendanceRate(workspace, student.id);
            const average = studentAverage(workspace, student.id);
            const grade = gradeFor(average);
            const balance = studentInvoices(workspace, student.id).reduce((total, invoice) => total + invoiceBalance(invoice), 0);
            const isRisk = riskRows.some((row) => row.student.id === student.id);
            return (
              <Link
                key={student.id}
                href={`/dashboard/students/${student.id}`}
                className="group grid gap-2 px-4 py-3 transition-colors hover:bg-canvas/50 lg:grid-cols-[minmax(200px,1.6fr)_0.8fr_1.2fr_0.7fr_0.6fr_0.8fr_40px] lg:items-center lg:gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <Avatar name={`${student.firstName} ${student.lastName}`} size="sm" />
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate text-[11.5px] font-semibold text-ink">
                      {student.firstName} {student.lastName}
                      {isRisk ? <ShieldAlert className="h-3 w-3 shrink-0 text-warning" /> : null}
                    </p>
                    <p className="truncate text-[9.5px] text-muted">
                      {student.admissionNo} · {student.gender === "female" ? "Female" : "Male"}, {new Date().getFullYear() - new Date(`${student.dateOfBirth}T00:00:00`).getFullYear()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="rounded-md bg-canvas px-1.5 py-0.5 text-[9.5px] font-semibold text-ink/70 lg:bg-transparent lg:p-0">
                    {roomName(workspace, student.classId)}
                  </span>
                </div>
                <div className="hidden min-w-0 lg:block">
                  <p className="truncate text-[10.5px] text-ink/80">{student.guardianName}</p>
                  <p className="truncate text-[9px] text-muted">{student.guardianPhone}</p>
                </div>
                <div className="hidden items-center gap-1.5 lg:flex">
                  <div className="h-1 w-12 overflow-hidden rounded-full bg-line-soft">
                    <div className={cn("h-full rounded-full", attendance >= 90 ? "bg-success" : "bg-warning")} style={{ width: `${attendance}%` }} />
                  </div>
                  <span className="text-[10px] font-semibold text-ink tnum">{percent(attendance, 0)}%</span>
                </div>
                <div className="hidden lg:block">
                  <Badge tone={grade.tone === "success" ? "success" : grade.tone === "info" ? "info" : grade.tone === "warning" ? "warning" : "danger"}>
                    {percent(average, 0)}%
                  </Badge>
                </div>
                <div className="hidden lg:block">
                  <span className={cn("text-[10px] font-semibold tnum", balance > 0 ? "text-danger" : "text-success")}>
                    {balance > 0 ? naira(balance) : "Paid"}
                  </span>
                </div>
                <div className="hidden text-right lg:block">
                  <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
                </div>
                <div className="flex items-center gap-2 lg:hidden">
                  <Badge tone={grade.tone === "success" ? "success" : "warning"}>{percent(average, 0)}%</Badge>
                  <span className="text-[9.5px] text-muted">Attendance {percent(attendance, 0)}%</span>
                  <span className={cn("ml-auto text-[9.5px] font-semibold", balance > 0 ? "text-danger" : "text-success")}>
                    {balance > 0 ? naira(balance) : "Fees paid"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {!students.length ? (
          <EmptyState
            icon={Users}
            title="No student matches this view"
            description="Change the filter or clear the search to see more records."
            action={
              <Button variant="soft" size="sm" onClick={() => { setQuery(""); setClassId("all"); setFilter("all"); }}>
                <X className="h-3 w-3" />
                Clear filters
              </Button>
            }
          />
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-2.5">
          <p className="text-[10px] text-muted">
            Showing {students.length} of {scoped.length} records
          </p>
          <p className="flex items-center gap-1.5 text-[9.5px] text-muted">
            <Filter className="h-3 w-3" />
            {filter === "all" ? "Every status" : filter === "risk" ? "Low average or attendance" : filter === "fees" ? "Balance above zero" : "Admitted this term"}
          </p>
        </div>
      </div>

      {isAdmin ? (
        <div className="grid gap-3 md:grid-cols-3">
          {workspace.classes.slice(0, 3).map((room) => {
            const roster = studentsInClass(workspace, room.id);
            return (
              <div key={room.id} className="card flex items-center gap-3 p-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <Users className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-ink">{room.name}</p>
                  <p className="text-[9.5px] text-muted">{roster.length} of {room.capacity} seats filled</p>
                </div>
                <Badge tone={roster.length / room.capacity > 0.9 ? "warning" : "success"}>
                  {percent((roster.length / room.capacity) * 100, 0)}%
                </Badge>
              </div>
            );
          })}
        </div>
      ) : null}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Enrol a new student"
        description="This creates the record, places the student in a class and notifies the dashboard."
        size="lg"
        footer={
          <>
            <Button variant="ghost" size="md" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="md" type="submit" form="enrol-form">
              <Plus className="h-3.5 w-3.5" />
              Enrol student
            </Button>
          </>
        }
      >
        <form id="enrol-form" onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <Field label="First name" htmlFor="first">
            <Input id="first" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} placeholder="Amara" />
          </Field>
          <Field label="Last name" htmlFor="last">
            <Input id="last" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} placeholder="Okonkwo" />
          </Field>
          <Field label="Gender" htmlFor="gender">
            <Select id="gender" value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value as "female" | "male" })}>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </Select>
          </Field>
          <Field label="Date of birth" htmlFor="dob">
            <Input id="dob" type="date" value={form.dateOfBirth} onChange={(event) => setForm({ ...form, dateOfBirth: event.target.value })} />
          </Field>
          <Field label="Class" htmlFor="class">
            <Select id="class" value={form.classId} onChange={(event) => setForm({ ...form, classId: event.target.value })}>
              <option value="">Choose a class</option>
              {workspace.classes.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name} ({studentsInClass(workspace, room.id).length}/{room.capacity})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="House" htmlFor="house">
            <Select id="house" value={form.house} onChange={(event) => setForm({ ...form, house: event.target.value })}>
              {["Emerald", "Sapphire", "Ruby", "Amber"].map((house) => (
                <option key={house} value={house}>{house}</option>
              ))}
            </Select>
          </Field>
          <Field label="Guardian name" htmlFor="guardian">
            <Input id="guardian" value={form.guardianName} onChange={(event) => setForm({ ...form, guardianName: event.target.value })} placeholder="Chika Okonkwo" />
          </Field>
          <Field label="Guardian phone" htmlFor="phone">
            <Input id="phone" value={form.guardianPhone} onChange={(event) => setForm({ ...form, guardianPhone: event.target.value })} placeholder="+234 803 000 0000" />
          </Field>
          <Field label="Guardian email" htmlFor="gemail" className="sm:col-span-2">
            <Input id="gemail" type="email" value={form.guardianEmail} onChange={(event) => setForm({ ...form, guardianEmail: event.target.value })} placeholder="guardian@mail.com" />
          </Field>
          <Field label="Home address" htmlFor="address" className="sm:col-span-2">
            <Input id="address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="12 Bourdillon Road, Ikoyi" />
          </Field>
          {error ? <p className="sm:col-span-2 rounded-lg bg-danger-soft px-3 py-2 text-[11px] font-medium text-danger">{error}</p> : null}
        </form>
      </Modal>
    </div>
  );
}
