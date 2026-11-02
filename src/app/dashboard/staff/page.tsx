"use client";

import { useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  GraduationCap,
  Mail,
  Phone,
  Plus,
  Users,
  Wallet,
} from "lucide-react";
import { PageTitle, Badge, Avatar, EmptyState, Progress } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, SearchField } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useSchool } from "@/lib/store";
import { useSession } from "@/lib/session";
import { staffByDepartment, studentsInClass } from "@/lib/analytics";
import { compactNaira, dateLabel, naira, percent } from "@/lib/format";
import { uid, cn } from "@/lib/utils";
import type { Staff } from "@/lib/types";

const departments = ["Science", "Languages", "Humanities", "Mathematics", "Arts", "Administration", "Early Years"];

export default function StaffPage() {
  const { workspace, update } = useSchool();
  const { user } = useSession();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("all");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Staff | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    title: "Subject teacher",
    department: "Science",
    salary: "180000",
    subjects: "",
    formClassId: "",
  });
  const [error, setError] = useState("");

  const staff = useMemo(() => {
    if (!workspace) return [];
    const clean = query.trim().toLowerCase();
    return workspace.staff
      .filter((member) => department === "all" || member.department === department)
      .filter((member) =>
        clean
          ? `${member.name} ${member.title} ${member.email} ${member.department}`.toLowerCase().includes(clean)
          : true,
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [workspace, query, department]);

  if (!workspace || !user) return null;

  if (user.role !== "admin") {
    return (
      <EmptyState
        icon={Users}
        title="Staff records are restricted"
        description="Only an administrator can view payroll and staff records."
      />
    );
  }

  const departmentsData = staffByDepartment(workspace);
  const payroll = workspace.staff.reduce((total, member) => total + member.salary, 0);
  const onLeave = workspace.staff.filter((member) => member.status === "on leave").length;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim()) {
      setError("A name and email address are required.");
      return;
    }
    if (workspace?.staff.some((member) => member.email.toLowerCase() === form.email.trim().toLowerCase())) {
      setError("That email is already on the staff list.");
      return;
    }
    const member: Staff = {
      id: uid("stf"),
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || "+234 800 000 0000",
      title: form.title.trim(),
      department: form.department,
      subjects: form.subjects
        .split(",")
        .map((subject) => subject.trim())
        .filter(Boolean),
      formClassId: form.formClassId || undefined,
      status: "active",
      joinedAt: new Date().toISOString().slice(0, 10),
      salary: Number(form.salary) || 0,
    };
    update((current) => ({
      ...current,
      staff: [member, ...current.staff],
      activity: [
        {
          id: uid("act"),
          kind: "staff.added",
          text: `${user?.name ?? "An administrator"} added ${member.name} to the ${member.department} department`,
          at: new Date().toISOString(),
        },
        ...current.activity,
      ],
    }));
    setOpen(false);
    setForm({ name: "", email: "", phone: "", title: "Subject teacher", department: "Science", salary: "180000", subjects: "", formClassId: "" });
    toast(`${member.name} added to staff`, "success");
  }

  return (
    <div className="space-y-4">
      <PageTitle
        eyebrow="People"
        title="Staff and payroll"
        description="Teaching and administrative staff, their classes, their departments and the monthly payroll position."
        actions={
          <Button size="md" onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add staff
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total staff", value: workspace.staff.length, icon: Users, foot: `${workspace.staff.filter((member) => member.status === "active").length} active` },
          { label: "Teaching staff", value: workspace.staff.filter((member) => member.title.toLowerCase().includes("teacher") || member.title.toLowerCase().includes("head")).length, icon: GraduationCap, foot: `${departmentsData.length} departments` },
          { label: "On leave", value: onLeave, icon: BriefcaseBusiness, foot: onLeave ? "Cover arranged" : "Everyone in school" },
          { label: "Monthly payroll", value: compactNaira(payroll), icon: Wallet, foot: `${compactNaira(payroll * 12)} annualised` },
        ].map((item) => (
          <div key={item.label} className="card p-4">
            <div className="flex items-start justify-between">
              <p className="text-[10.5px] font-semibold text-muted">{item.label}</p>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-soft text-brand">
                <item.icon className="h-3.5 w-3.5" />
              </span>
            </div>
            <p className="mt-2 text-[24px] font-extrabold leading-none tracking-[-0.04em] text-ink tnum">{item.value}</p>
            <p className="mt-1.5 text-[10px] text-muted">{item.foot}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_260px]">
        <div className="card overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
            <SearchField value={query} onChange={setQuery} placeholder="Search staff" className="min-w-[160px] flex-1" />
            <Select value={department} onChange={(event) => setDepartment(event.target.value)} className="h-9 w-[160px] text-[11px]">
              <option value="all">Every department</option>
              {departmentsData.map((item) => (
                <option key={item.department} value={item.department}>{item.department}</option>
              ))}
            </Select>
          </div>

          <div className="hidden grid-cols-[1.6fr_1fr_1fr_0.7fr] gap-3 border-b border-line bg-canvas/60 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-muted sm:grid">
            <span>Staff member</span>
            <span>Department</span>
            <span>Form class</span>
            <span>Status</span>
          </div>
          <div className="divide-y divide-line-soft">
            {staff.map((member) => {
              const room = workspace.classes.find((item) => item.id === member.formClassId);
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setSelected(member)}
                  className="grid w-full gap-2 px-4 py-3 text-left transition-colors hover:bg-canvas/50 sm:grid-cols-[1.6fr_1fr_1fr_0.7fr] sm:items-center sm:gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar name={member.name} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-[11.5px] font-semibold text-ink">{member.name}</p>
                      <p className="truncate text-[9.5px] text-muted">{member.title}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted">{member.department}</span>
                  <span className="text-[10px] text-muted">{room ? `${room.name}, ${studentsInClass(workspace, room.id).length} students` : "No form class"}</span>
                  <Badge tone={member.status === "active" ? "success" : "warning"} dot>{member.status}</Badge>
                </button>
              );
            })}
          </div>
          {!staff.length ? (
            <EmptyState icon={Users} title="No staff match this search" description="Try a different name or department." />
          ) : null}
        </div>

        <div className="space-y-3">
          <section className="card p-4">
            <h2 className="text-[12px] font-bold text-ink">Departments</h2>
            <div className="mt-3 space-y-2.5">
              {departmentsData.map((item) => (
                <div key={item.department}>
                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="text-ink/75">{item.department}</span>
                    <span className="font-bold text-ink">{item.count}</span>
                  </div>
                  <Progress value={(item.count / workspace.staff.length) * 100} className="mt-1 h-1" />
                </div>
              ))}
            </div>
          </section>
          <section className="card p-4">
            <h2 className="text-[12px] font-bold text-ink">Payroll note</h2>
            <p className="mt-2 text-[10px] leading-relaxed text-muted">
              Payroll is calculated from the staff records on file. It does not include allowances,
              deductions or tax. Approve the schedule outside this demo before payment.
            </p>
            <p className="mt-3 text-[16px] font-extrabold text-ink tnum">{naira(payroll)}</p>
            <p className="text-[9px] text-muted">Monthly base, {workspace.staff.length} staff</p>
          </section>
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add a staff member"
        size="lg"
        footer={
          <>
            <Button variant="ghost" size="md" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="md" type="submit" form="staff-form">Add to staff</Button>
          </>
        }
      >
        <form id="staff-form" onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <Field label="Full name" htmlFor="sname">
            <Input id="sname" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Adaeze Nwosu" />
          </Field>
          <Field label="Role or title" htmlFor="stitle">
            <Input id="stitle" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Subject teacher" />
          </Field>
          <Field label="Email" htmlFor="semail">
            <Input id="semail" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="name@greenfield.school" />
          </Field>
          <Field label="Phone" htmlFor="sphone">
            <Input id="sphone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+234 800 000 0000" />
          </Field>
          <Field label="Department" htmlFor="sdept">
            <Select id="sdept" value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })}>
              {departments.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
          </Field>
          <Field label="Monthly salary" htmlFor="ssalary">
            <Input id="ssalary" inputMode="numeric" value={form.salary} onChange={(event) => setForm({ ...form, salary: event.target.value })} />
          </Field>
          <Field label="Subjects" htmlFor="ssubjects" hint="Separate with commas" className="sm:col-span-2">
            <Input id="ssubjects" value={form.subjects} onChange={(event) => setForm({ ...form, subjects: event.target.value })} placeholder="Mathematics, Further Mathematics" />
          </Field>
          <Field label="Form class" htmlFor="sclass" className="sm:col-span-2">
            <Select id="sclass" value={form.formClassId} onChange={(event) => setForm({ ...form, formClassId: event.target.value })}>
              <option value="">No form class</option>
              {workspace.classes.map((room) => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </Select>
          </Field>
          {error ? <p className="sm:col-span-2 rounded-lg bg-danger-soft px-3 py-2 text-[11px] font-medium text-danger">{error}</p> : null}
        </form>
      </Modal>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.name ?? "Staff member"}
        description={selected ? `${selected.title} · ${selected.department}` : undefined}
        size="md"
        footer={
          <>
            <Button variant="ghost" size="md" onClick={() => setSelected(null)}>Close</Button>
            {selected ? (
              <Button
                size="md"
                variant={selected.status === "active" ? "secondary" : "success"}
                onClick={() => {
                  update((current) => ({
                    ...current,
                    staff: current.staff.map((member) =>
                      member.id === selected.id
                        ? { ...member, status: member.status === "active" ? "on leave" : "active" }
                        : member,
                    ),
                  }));
                  setSelected({ ...selected, status: selected.status === "active" ? "on leave" : "active" });
                  toast(`${selected.name} marked ${selected.status === "active" ? "on leave" : "active"}`, "success");
                }}
              >
                {selected.status === "active" ? "Mark on leave" : "Mark active"}
              </Button>
            ) : null}
          </>
        }
      >
        {selected ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-canvas p-3">
              <Avatar name={selected.name} size="lg" />
              <div>
                <p className="text-[12px] font-bold text-ink">{selected.name}</p>
                <p className="text-[10px] text-muted">Joined {dateLabel(selected.joinedAt)}</p>
                <div className="mt-1 flex gap-1">
                  <Badge tone={selected.status === "active" ? "success" : "warning"}>{selected.status}</Badge>
                  <Badge tone="accent">{selected.department}</Badge>
                </div>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex items-center gap-2 rounded-lg border border-line px-3 py-2">
                <Mail className="h-3.5 w-3.5 text-brand" />
                <span className="truncate text-[10.5px] text-ink">{selected.email}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-line px-3 py-2">
                <Phone className="h-3.5 w-3.5 text-brand" />
                <span className="truncate text-[10.5px] text-ink">{selected.phone}</span>
              </div>
            </div>
            <div className="rounded-xl border border-line p-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">Teaching load</p>
              <p className="mt-1 text-[11px] text-ink">{selected.subjects.join(", ") || "No subjects assigned"}</p>
              <p className="mt-1 text-[10px] text-muted">
                Form class: {workspace.classes.find((room) => room.id === selected.formClassId)?.name ?? "None"}
              </p>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-canvas px-3 py-2.5">
              <span className="text-[10px] text-muted">Monthly salary</span>
              <span className="text-[12px] font-bold text-ink tnum">{naira(selected.salary)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-canvas px-3 py-2.5">
              <span className="text-[10px] text-muted">Attendance of form class</span>
              <span className={cn("text-[11px] font-bold", studentsInClass(workspace, selected.formClassId ?? "").length ? "text-ink" : "text-muted")}>
                {studentsInClass(workspace, selected.formClassId ?? "").length} students
              </span>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
