"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen, Building2, Plus, Users } from "lucide-react";
import { PageTitle, Badge, Avatar, EmptyState, Progress } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useSchool } from "@/lib/store";
import { useSession } from "@/lib/session";
import { classAverage, className, studentsInClass, subjectName } from "@/lib/analytics";
import { percent } from "@/lib/format";
import { cn, uid } from "@/lib/utils";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const periods = [0, 1, 2, 3, 4, 5];
const periodLabels = ["08:00", "09:00", "10:00", "11:30", "12:30", "14:00"];

export default function ClassesPage() {
  const { workspace, update } = useSchool();
  const { user } = useSession();
  const { toast } = useToast();
  const [selected, setSelected] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", level: "Junior Secondary", section: "A", teacherId: "", room: "", capacity: "36" });
  const [error, setError] = useState("");

  const activeClassId = selected ?? workspace?.classes[0]?.id ?? null;

  const timetable = useMemo(() => {
    if (!workspace || !activeClassId) return [];
    return workspace.timetable.filter((slot) => slot.classId === activeClassId);
  }, [workspace, activeClassId]);

  if (!workspace || !user) return null;

  const teacherClasses =
    user.role === "teacher"
      ? workspace.classes.filter((room) => {
          const me =
            workspace.staff.find((member) => member.email.toLowerCase() === user.email.toLowerCase()) ??
            workspace.staff.find((member) => member.name.toLowerCase() === user.name.toLowerCase());
          return room.teacherId === me?.id;
        })
      : workspace.classes;

  const rooms = teacherClasses.length ? teacherClasses : workspace.classes;
  const current = rooms.find((room) => room.id === activeClassId) ?? rooms[0];
  const slots = current ? workspace.timetable.filter((slot) => slot.classId === current.id) : timetable;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Give the class a name.");
      return;
    }
    if (!form.teacherId) {
      setError("Choose a form teacher.");
      return;
    }
    const level = form.level;
    const subjects = workspace?.subjects.filter((subject) =>
      level === "Senior Secondary" ? ["Mathematics", "English Language", "Physics", "Basic Science", "Literature"].includes(subject.name) : ["Mathematics", "English Language", "Basic Science", "Social Studies", "Computer Studies"].includes(subject.name),
    ) ?? [];
    const classId = uid("cls");
    update((value) => ({
      ...value,
      classes: [
        ...value.classes,
        {
          id: classId,
          name: form.name.trim(),
          level,
          section: form.section.trim() || "A",
          teacherId: form.teacherId,
          room: form.room.trim() || "Unassigned",
          capacity: Number(form.capacity) || 36,
        },
      ],
      staff: value.staff.map((member) =>
        member.id === form.teacherId ? { ...member, formClassId: classId } : member,
      ),
      timetable: [
        ...value.timetable,
        ...days.flatMap((_, day) =>
          periods.map((period) => ({
            id: uid("tt"),
            classId,
            day,
            period,
            subjectId: subjects[(day * 2 + period * 3) % Math.max(1, subjects.length)]?.id ?? value.subjects[0].id,
          })),
        ),
      ],
      activity: [
        { id: uid("act"), kind: "student.added", text: `${user?.name ?? "An administrator"} created ${form.name.trim()} and assigned a timetable`, at: new Date().toISOString() },
        ...value.activity,
      ],
    }));
    setSelected(classId);
    setOpen(false);
    setForm({ name: "", level: "Junior Secondary", section: "A", teacherId: "", room: "", capacity: "36" });
    toast(`${form.name.trim()} created with a full week timetable`, "success");
  }

  return (
    <div className="space-y-4">
      <PageTitle
        eyebrow="Academics"
        title="Classes and timetable"
        description={
          user.role === "teacher"
            ? "The classes you lead, their rooms, their roster and the week ahead."
            : "Every class, its form teacher, capacity and weekly timetable."
        }
        actions={
          user.role === "admin" ? (
            <Button size="md" onClick={() => setOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              New class
            </Button>
          ) : null
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {rooms.map((room) => {
          const roster = studentsInClass(workspace, room.id);
          const average = classAverage(workspace, room.id);
          const teacher = workspace.staff.find((member) => member.id === room.teacherId);
          const fill = (roster.length / room.capacity) * 100;
          const active = current?.id === room.id;
          return (
            <button
              key={room.id}
              type="button"
              onClick={() => setSelected(room.id)}
              className={cn(
                "card p-4 text-left transition-colors duration-200",
                active && "border-brand/40 ring-2 ring-brand/10",
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[13px] font-bold text-ink">{room.name}</p>
                  <p className="mt-0.5 text-[9.5px] text-muted">{room.level}, {room.section} · {room.room}</p>
                </div>
                <Badge tone={average >= 60 ? "success" : average >= 50 ? "info" : "warning"}>{percent(average, 0)}%</Badge>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Avatar name={teacher?.name ?? "Unassigned"} size="xs" />
                <span className="truncate text-[10px] text-muted">{teacher?.name ?? "No form teacher"}</span>
              </div>
              <div className="mt-3">
                <div className="flex items-center justify-between text-[9.5px]">
                  <span className="text-muted">{roster.length} of {room.capacity} seats</span>
                  <span className={cn("font-semibold", fill > 90 ? "text-warning" : "text-ink")}>{percent(fill, 0)}% full</span>
                </div>
                <Progress value={fill} tone={fill > 90 ? "warning" : "brand"} className="mt-1.5 h-1.5" />
              </div>
            </button>
          );
        })}
        {!rooms.length ? (
          <EmptyState icon={BookOpen} title="No class assigned" description="An administrator has not attached you to a form class yet." className="sm:col-span-2 xl:col-span-3" />
        ) : null}
      </div>

      {current ? (
        <section className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
            <div>
              <h2 className="text-[12.5px] font-bold text-ink">{current.name} timetable</h2>
              <p className="text-[10px] text-muted">{current.room} · {studentsInClass(workspace, current.id).length} students</p>
            </div>
            <Link href="/dashboard/attendance" className="text-[10px] font-bold text-brand">
              Take register
            </Link>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[640px] p-3">
              <div className="grid grid-cols-[64px_repeat(5,1fr)] gap-1.5">
                <div />
                {days.map((day) => (
                  <div key={day} className="rounded-md bg-canvas py-1.5 text-center text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted">
                    {day.slice(0, 3)}
                  </div>
                ))}
                {periods.map((period) => (
                  <div key={period} className="contents">
                    <div className="flex flex-col justify-center rounded-md bg-canvas px-1.5 py-2">
                      <span className="text-[9px] font-bold text-ink">P{period + 1}</span>
                      <span className="text-[8px] text-muted">{periodLabels[period]}</span>
                    </div>
                    {days.map((_, day) => {
                      const slot = slots.find((item) => item.day === day && item.period === period);
                      const subject = slot ? workspace.subjects.find((item) => item.id === slot.subjectId) : null;
                      const teacher = workspace.staff.find((member) => member.id === subject?.teacherId);
                      return (
                        <div
                          key={`${day}-${period}`}
                          className={cn(
                            "min-h-[52px] rounded-md border px-1.5 py-1.5",
                            subject ? "border-line bg-white" : "border-dashed border-line bg-canvas/40",
                          )}
                        >
                          {subject ? (
                            <>
                              <p className="text-[9.5px] font-semibold leading-tight text-ink">{subject.name}</p>
                              <p className="mt-0.5 truncate text-[8px] text-muted">{teacher?.name.split(" ")[0] ?? "Staff"}</p>
                            </>
                          ) : (
                            <p className="text-[8px] text-muted">Free</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid border-t border-line sm:grid-cols-2">
            <div className="border-b border-line p-4 sm:border-b-0 sm:border-r">
              <h3 className="flex items-center gap-1.5 text-[10.5px] font-bold text-ink">
                <Users className="h-3.5 w-3.5 text-brand" />
                Roster
              </h3>
              <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                {studentsInClass(workspace, current.id).slice(0, 8).map((student) => (
                  <Link key={student.id} href={`/dashboard/students/${student.id}`} className="flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-canvas">
                    <Avatar name={`${student.firstName} ${student.lastName}`} size="xs" />
                    <span className="truncate text-[10px] text-ink">{student.firstName} {student.lastName}</span>
                  </Link>
                ))}
              </div>
              <Link href={`/dashboard/students?class=${current.id}`} className="mt-2 inline-block text-[9.5px] font-bold text-brand">
                Open the class list
              </Link>
            </div>
            <div className="p-4">
              <h3 className="flex items-center gap-1.5 text-[10.5px] font-bold text-ink">
                <Building2 className="h-3.5 w-3.5 text-brand" />
                Subjects on the timetable
              </h3>
              <div className="mt-2 space-y-1.5">
                {[...new Set(slots.map((slot) => slot.subjectId))].map((subjectId) => {
                  const subject = workspace.subjects.find((item) => item.id === subjectId);
                  const teacher = workspace.staff.find((member) => member.id === subject?.teacherId);
                  return (
                    <div key={subjectId} className="flex items-center justify-between text-[10px]">
                      <span className="text-ink">{subjectName(workspace, subjectId)}</span>
                      <span className="text-muted">{teacher?.name ?? "Unassigned"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create a class"
        description="A timetable is generated for the new class from the subjects for its level."
        size="md"
        footer={
          <>
            <Button variant="ghost" size="md" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="md" type="submit" form="class-form">Create class</Button>
          </>
        }
      >
        <form id="class-form" onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <Field label="Class name" htmlFor="cname" className="sm:col-span-2">
            <Input id="cname" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="JSS 2B" />
          </Field>
          <Field label="Level" htmlFor="clevel">
            <Select id="clevel" value={form.level} onChange={(event) => setForm({ ...form, level: event.target.value })}>
              <option value="Primary">Primary</option>
              <option value="Junior Secondary">Junior Secondary</option>
              <option value="Senior Secondary">Senior Secondary</option>
            </Select>
          </Field>
          <Field label="Section" htmlFor="csection">
            <Input id="csection" value={form.section} onChange={(event) => setForm({ ...form, section: event.target.value })} placeholder="A" />
          </Field>
          <Field label="Form teacher" htmlFor="cteacher">
            <Select id="cteacher" value={form.teacherId} onChange={(event) => setForm({ ...form, teacherId: event.target.value })}>
              <option value="">Choose a teacher</option>
              {workspace.staff.filter((member) => member.status === "active").map((member) => (
                <option key={member.id} value={member.id}>{member.name} · {member.title}</option>
              ))}
            </Select>
          </Field>
          <Field label="Room" htmlFor="croom">
            <Input id="croom" value={form.room} onChange={(event) => setForm({ ...form, room: event.target.value })} placeholder="Block B, Room 18" />
          </Field>
          <Field label="Capacity" htmlFor="ccapacity">
            <Input id="ccapacity" inputMode="numeric" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} />
          </Field>
          {error ? <p className="sm:col-span-2 rounded-lg bg-danger-soft px-3 py-2 text-[11px] font-medium text-danger">{error}</p> : null}
        </form>
      </Modal>
    </div>
  );
}
