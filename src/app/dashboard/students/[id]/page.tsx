"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Bus,
  ClipboardList,
  CreditCard,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Printer,
  UserRound,
  Wallet,
} from "lucide-react";
import { PageTitle, Badge, Avatar, Progress, Tabs, EmptyState } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useSchool } from "@/lib/store";
import { useSession } from "@/lib/session";
import {
  classResults,
  className as roomName,
  invoiceStatus,
  invoiceTotal,
  studentAttendanceRate,
  studentAverage,
  studentInvoices,
  studentResults,
  subjectName,
  attendanceSummary,
} from "@/lib/analytics";
import { ageFrom, dateLabel, gradeFor, naira, percent, relativeTime } from "@/lib/format";
import { cn, uid } from "@/lib/utils";

type TabKey = "overview" | "results" | "attendance" | "fees";

export default function StudentProfilePage() {
  const params = useParams<{ id: string }>();
  const { workspace, update } = useSchool();
  const { user } = useSession();
  const { toast } = useToast();
  const [tab, setTab] = useState<TabKey>("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState<"transfer" | "card" | "cash" | "pos">("transfer");
  const [edit, setEdit] = useState({ guardianName: "", guardianPhone: "", guardianEmail: "", classId: "", address: "", status: "active" as "active" | "graduated" | "withdrawn" });

  if (!workspace || !user) return null;
  const student = workspace.students.find((item) => item.id === params.id);

  if (!student) {
    return (
      <EmptyState
        icon={UserRound}
        title="Student not found"
        description="That record is not in this workspace. It may have been removed."
        action={
          <Link href="/dashboard/students" className={buttonLink}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to students
          </Link>
        }
      />
    );
  }

  const room = workspace.classes.find((item) => item.id === student.classId);
  const teacher = workspace.staff.find((member) => member.id === room?.teacherId);
  const attendance = studentAttendanceRate(workspace, student.id);
  const average = studentAverage(workspace, student.id);
  const grade = gradeFor(average);
  const results = studentResults(workspace, student.id);
  const invoices = studentInvoices(workspace, student.id);
  const balance = invoices.reduce((total, invoice) => total + Math.max(0, invoiceTotal(invoice) - invoice.paid), 0);
  const records = workspace.attendance
    .filter((row) => row.studentId === student.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const summary = attendanceSummary(workspace, records);
  const position = classResults(workspace, student.classId).find((row) => row.student.id === student.id)?.position ?? 0;
  const route = workspace.routes.find((item) => item.id === student.busRouteId);
  const canEdit = user.role === "admin";

  function openEdit() {
    if (!student) return;
    setEdit({
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
      guardianEmail: student.guardianEmail,
      classId: student.classId,
      address: student.address,
      status: student.status,
    });
    setEditOpen(true);
  }

  function saveEdit(event: React.FormEvent) {
    event.preventDefault();
    if (!student) return;
    update((current) => ({
      ...current,
      students: current.students.map((item) =>
        item.id === student.id
          ? {
              ...item,
              guardianName: edit.guardianName.trim(),
              guardianPhone: edit.guardianPhone.trim(),
              guardianEmail: edit.guardianEmail.trim(),
              classId: edit.classId,
              address: edit.address.trim(),
              status: edit.status,
            }
          : item,
      ),
      activity: [
        { id: uid("act"), kind: "student.added", text: `${user?.name ?? "An administrator"} updated ${student.firstName} ${student.lastName}'s record`, at: new Date().toISOString() },
        ...current.activity,
      ],
    }));
    setEditOpen(false);
    toast("Student record updated", "success");
  }

  function recordPayment(event: React.FormEvent) {
    event.preventDefault();
    if (!student) return;
    const amount = Number(payAmount.replace(/[^\d.]/g, ""));
    const target = invoices.find((invoice) => invoiceTotal(invoice) - invoice.paid > 0);
    if (!target) {
      toast("This student has no outstanding invoice", "error");
      return;
    }
    if (!amount || amount <= 0) {
      toast("Enter an amount above zero", "error");
      return;
    }
    const outstanding = invoiceTotal(target) - target.paid;
    const applied = Math.min(amount, outstanding);
    update((current) => ({
      ...current,
      invoices: current.invoices.map((invoice) =>
        invoice.id === target.id ? { ...invoice, paid: invoice.paid + applied } : invoice,
      ),
      payments: [
        {
          id: uid("pay"),
          invoiceId: target.id,
          studentId: student.id,
          amount: applied,
          method: payMethod,
          reference: `PAY-${Date.now().toString().slice(-6)}`,
          at: new Date().toISOString(),
          recordedBy: user?.name ?? "Front desk",
        },
        ...current.payments,
      ],
      activity: [
        { id: uid("act"), kind: "payment.recorded", text: `${user?.name ?? "Front desk"} recorded a ${naira(applied)} ${payMethod} payment for ${student.firstName} ${student.lastName}`, at: new Date().toISOString() },
        ...current.activity,
      ],
    }));
    setPayOpen(false);
    setPayAmount("");
    toast(`${naira(applied)} recorded for ${student.firstName}`, "success");
  }

  return (
    <div className="space-y-4">
      <Link href="/dashboard/students" className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold text-muted hover:text-brand">
        <ArrowLeft className="h-3.5 w-3.5" />
        All students
      </Link>

      <section className="card overflow-hidden">
        <div className="relative bg-gradient-to-br from-brand-soft/80 via-white to-white px-5 pb-4 pt-5">
          <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-brand/10 blur-2xl" />
          <div className="relative flex flex-wrap items-start gap-4">
            <Avatar name={`${student.firstName} ${student.lastName}`} size="xl" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[24px] font-extrabold leading-tight tracking-[-0.035em] text-ink">
                  {student.firstName} {student.lastName}
                </h1>
                <Badge tone={student.status === "active" ? "success" : "neutral"} dot>{student.status}</Badge>
              </div>
              <p className="mt-1 text-[11px] text-muted">
                {student.admissionNo} · {roomName(workspace, student.classId)} · {student.house} house
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge tone="accent">Average {percent(average, 0)}%</Badge>
                <Badge tone={grade.tone}>{grade.grade} · {grade.remark}</Badge>
                <Badge tone={attendance >= 90 ? "success" : "warning"}>Attendance {percent(attendance, 0)}%</Badge>
                {balance > 0 ? <Badge tone="danger">Balance {naira(balance)}</Badge> : <Badge tone="success">Fees cleared</Badge>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/print/report/${student.id}`} target="_blank" className={buttonLinkSecondary}>
                <Printer className="h-3.5 w-3.5" />
                Report card
              </Link>
              {canEdit ? (
                <Button size="md" variant="secondary" onClick={openEdit}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit record
                </Button>
              ) : null}
              {balance > 0 ? (
                <Button size="md" onClick={() => { setPayAmount(String(balance)); setPayOpen(true); }}>
                  <CreditCard className="h-3.5 w-3.5" />
                  Record payment
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid divide-y divide-line border-t border-line sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
          {[
            { label: "Class", value: room?.name ?? "Unassigned", hint: `${room?.room ?? ""} · ${teacher ? teacher.name : "No form teacher"}` },
            { label: "Age", value: `${ageFrom(student.dateOfBirth)} years`, hint: dateLabel(student.dateOfBirth) },
            { label: "Class position", value: position ? `${position} of ${classResults(workspace, student.classId).length}` : "Not ranked", hint: `${workspace.school.term} results` },
            { label: "Bus route", value: route ? route.name : "Not enrolled", hint: route ? `${route.departure} departure` : "Walk or parent pickup" },
          ].map((item, index) => (
            <div key={item.label} className={cn("px-4 py-3", index > 0 && "sm:border-l sm:border-line")}>
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">{item.label}</p>
              <p className="mt-1 truncate text-[12px] font-bold text-ink">{item.value}</p>
              <p className="mt-0.5 truncate text-[9.5px] text-muted">{item.hint}</p>
            </div>
          ))}
        </div>
      </section>

      <Tabs
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "results", label: "Results", count: results.length },
          { id: "attendance", label: "Attendance", count: records.length },
          { id: "fees", label: "Fees", count: invoices.length },
        ]}
        value={tab}
        onChange={setTab}
        className="max-w-full overflow-x-auto no-scrollbar"
      />

      {tab === "overview" ? (
        <div className="grid gap-3 lg:grid-cols-[1.15fr_1fr]">
          <section className="card p-4">
            <h2 className="text-[12.5px] font-bold text-ink">Academic standing</h2>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-canvas p-3">
                <p className="text-[9.5px] font-semibold text-muted">Average</p>
                <p className="mt-1 text-[20px] font-extrabold leading-none text-ink tnum">{percent(average, 0)}%</p>
              </div>
              <div className="rounded-xl bg-canvas p-3">
                <p className="text-[9.5px] font-semibold text-muted">Position</p>
                <p className="mt-1 text-[20px] font-extrabold leading-none text-ink tnum">{position || "-"}</p>
              </div>
              <div className="rounded-xl bg-canvas p-3">
                <p className="text-[9.5px] font-semibold text-muted">Subjects</p>
                <p className="mt-1 text-[20px] font-extrabold leading-none text-ink tnum">{results.length}</p>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {results.map((row) => {
                const total = row.ca1 + row.ca2 + row.exam;
                return (
                  <div key={row.id} className="flex items-center gap-2">
                    <p className="w-[130px] shrink-0 truncate text-[10.5px] text-ink/75">{subjectName(workspace, row.subjectId)}</p>
                    <div className="flex-1">
                      <Progress value={total} tone={total >= 65 ? "success" : total >= 50 ? "brand" : total >= 40 ? "warning" : "danger"} className="h-1" />
                    </div>
                    <span className="w-8 text-right text-[10px] font-bold text-ink tnum">{total}</span>
                  </div>
                );
              })}
            </div>
            <button type="button" onClick={() => setTab("results")} className="mt-3 text-[10px] font-bold text-brand">
              Open full breakdown
            </button>
          </section>

          <section className="card p-4">
            <h2 className="text-[12.5px] font-bold text-ink">Guardian and contact</h2>
            <div className="mt-3 space-y-2.5">
              {[
                { icon: UserRound, label: "Guardian", value: student.guardianName },
                { icon: Phone, label: "Phone", value: student.guardianPhone },
                { icon: Mail, label: "Email", value: student.guardianEmail },
                { icon: MapPin, label: "Home", value: student.address },
              ].map((row) => (
                <div key={row.label} className="flex items-start gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-canvas text-muted">
                    <row.icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-wide text-muted">{row.label}</p>
                    <p className="break-words text-[11px] text-ink">{row.value || "Not provided"}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-canvas px-3 py-2">
              <Bus className="h-3.5 w-3.5 text-brand" />
              <p className="text-[10px] text-muted">
                {route ? `${route.name}, ${route.driver}, ${route.departure}` : "No school transport assigned"}
              </p>
            </div>
          </section>

          <section className="card p-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-[12.5px] font-bold text-ink">Attendance pattern</h2>
              <Link href="/dashboard/attendance" className="text-[10px] font-bold text-brand">Register</Link>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "Present", value: summary.present, tone: "text-success" },
                { label: "Late", value: summary.late, tone: "text-warning" },
                { label: "Excused", value: summary.excused, tone: "text-info" },
                { label: "Absent", value: summary.absent, tone: "text-danger" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-line p-3">
                  <p className="text-[9.5px] text-muted">{item.label}</p>
                  <p className={cn("mt-1 text-[20px] font-extrabold leading-none tnum", item.tone)}>{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {records.slice(0, 40).reverse().map((row) => (
                <span
                  key={row.id}
                  title={`${dateLabel(row.date)}: ${row.status}`}
                  className={cn(
                    "h-5 w-5 rounded-[5px]",
                    row.status === "present" ? "bg-success/80" : row.status === "late" ? "bg-warning/80" : row.status === "excused" ? "bg-info/70" : "bg-danger/75",
                  )}
                />
              ))}
            </div>
            <p className="mt-2 text-[9px] text-muted">Each square is one school day. Hover for the status.</p>
          </section>
        </div>
      ) : null}

      {tab === "results" ? (
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <h2 className="text-[12.5px] font-bold text-ink">{workspace.school.term} results</h2>
              <p className="text-[10px] text-muted">{workspace.school.session} session. CA1 20, CA2 20, exam 60.</p>
            </div>
            <Link href={`/print/report/${student.id}`} target="_blank" className={buttonLinkSecondary}>
              <Printer className="h-3.5 w-3.5" />
              Print
            </Link>
          </div>
          <div className="hidden grid-cols-[1.5fr_repeat(3,0.6fr)_0.6fr_0.6fr] gap-2 border-b border-line bg-canvas/60 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-muted sm:grid">
            <span>Subject</span>
            <span className="text-right">CA1</span>
            <span className="text-right">CA2</span>
            <span className="text-right">Exam</span>
            <span className="text-right">Total</span>
            <span className="text-right">Grade</span>
          </div>
          <div className="divide-y divide-line-soft">
            {results.map((row) => {
              const total = row.ca1 + row.ca2 + row.exam;
              const subjectGrade = gradeFor(total);
              return (
                <div key={row.id} className="grid grid-cols-2 gap-2 px-4 py-2.5 sm:grid-cols-[1.5fr_repeat(3,0.6fr)_0.6fr_0.6fr] sm:items-center">
                  <p className="text-[11px] font-semibold text-ink">{subjectName(workspace, row.subjectId)}</p>
                  <p className="hidden text-right text-[10.5px] text-muted tnum sm:block">{row.ca1}</p>
                  <p className="hidden text-right text-[10.5px] text-muted tnum sm:block">{row.ca2}</p>
                  <p className="hidden text-right text-[10.5px] text-muted tnum sm:block">{row.exam}</p>
                  <p className="text-right text-[11px] font-bold text-ink tnum">{total}</p>
                  <div className="flex justify-end">
                    <Badge tone={subjectGrade.tone}>{subjectGrade.grade}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between border-t border-line bg-canvas/50 px-4 py-3">
            <p className="text-[10.5px] text-muted">Term average</p>
            <p className="text-[13px] font-extrabold text-ink tnum">{percent(average, 1)}% · {grade.grade}</p>
          </div>
        </section>
      ) : null}

      {tab === "attendance" ? (
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <h2 className="text-[12.5px] font-bold text-ink">Register history</h2>
              <p className="text-[10px] text-muted">{records.length} marked school days</p>
            </div>
            <Badge tone={attendance >= 90 ? "success" : "warning"}>{percent(attendance, 0)}% attended</Badge>
          </div>
          <div className="divide-y divide-line-soft">
            {records.slice(0, 24).map((row) => (
              <div key={row.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="w-24 shrink-0 text-[10.5px] text-muted">{dateLabel(row.date, { day: "numeric", month: "short" })}</span>
                <Badge
                  tone={row.status === "present" ? "success" : row.status === "late" ? "warning" : row.status === "excused" ? "info" : "danger"}
                  dot
                >
                  {row.status}
                </Badge>
                <span className="ml-auto truncate text-[9.5px] text-muted">{row.note ?? ""}</span>
              </div>
            ))}
            {!records.length ? (
              <p className="px-4 py-8 text-center text-[11px] text-muted">No attendance has been marked for this student.</p>
            ) : null}
          </div>
        </section>
      ) : null}

      {tab === "fees" ? (
        <div className="space-y-3">
          {invoices.map((invoice) => {
            const total = invoiceTotal(invoice);
            const status = invoiceStatus(invoice);
            return (
              <section key={invoice.id} className="card overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
                  <div>
                    <h2 className="text-[12px] font-bold text-ink">{invoice.term}, {invoice.session}</h2>
                    <p className="text-[9.5px] text-muted">Issued {dateLabel(invoice.issuedAt)}. Due {dateLabel(invoice.dueDate)}.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={status.tone}>{status.label}</Badge>
                    <span className="text-[11px] font-bold text-ink tnum">{naira(invoice.paid)} of {naira(total)}</span>
                  </div>
                </div>
                <div className="divide-y divide-line-soft">
                  {invoice.items.map((item) => (
                    <div key={item.label} className="flex items-center justify-between px-4 py-2">
                      <span className="text-[10.5px] text-ink/75">{item.label}</span>
                      <span className="text-[10.5px] font-medium text-ink tnum">{naira(item.amount)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-line bg-canvas/50 px-4 py-2.5">
                  <span className="text-[10px] text-muted">Balance</span>
                  <div className="flex items-center gap-3">
                    <span className={cn("text-[11.5px] font-bold tnum", status.key === "paid" ? "text-success" : "text-danger")}>
                      {naira(Math.max(0, total - invoice.paid))}
                    </span>
                    {user.role === "admin" || user.role === "parent" ? (
                      <Button size="sm" variant="soft" onClick={() => { setPayAmount(String(Math.max(0, total - invoice.paid))); setPayOpen(true); }}>
                        <Wallet className="h-3 w-3" />
                        Record payment
                      </Button>
                    ) : null}
                  </div>
                </div>
              </section>
            );
          })}

          <section className="card p-4">
            <h2 className="text-[12.5px] font-bold text-ink">Payment history</h2>
            <div className="mt-2 divide-y divide-line-soft">
              {workspace.payments.filter((payment) => payment.studentId === student.id).map((payment) => (
                <div key={payment.id} className="flex items-center gap-2 py-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-success-soft text-success">
                    <ClipboardList className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10.5px] font-semibold text-ink">{naira(payment.amount)} via {payment.method}</p>
                    <p className="text-[9px] text-muted">{payment.reference} · {relativeTime(payment.at)}</p>
                  </div>
                  <span className="text-[9px] text-muted">{payment.recordedBy}</span>
                </div>
              ))}
              {!workspace.payments.some((payment) => payment.studentId === student.id) ? (
                <p className="py-5 text-center text-[10.5px] text-muted">No payments recorded yet.</p>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={`Edit ${student.firstName}'s record`}
        size="md"
        footer={
          <>
            <Button variant="ghost" size="md" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button size="md" type="submit" form="edit-student">Save changes</Button>
          </>
        }
      >
        <form id="edit-student" onSubmit={saveEdit} className="grid gap-3 sm:grid-cols-2">
          <Field label="Guardian name" htmlFor="eg">
            <Input id="eg" value={edit.guardianName} onChange={(event) => setEdit({ ...edit, guardianName: event.target.value })} />
          </Field>
          <Field label="Guardian phone" htmlFor="ep">
            <Input id="ep" value={edit.guardianPhone} onChange={(event) => setEdit({ ...edit, guardianPhone: event.target.value })} />
          </Field>
          <Field label="Guardian email" htmlFor="ee" className="sm:col-span-2">
            <Input id="ee" type="email" value={edit.guardianEmail} onChange={(event) => setEdit({ ...edit, guardianEmail: event.target.value })} />
          </Field>
          <Field label="Class" htmlFor="ec">
            <Select id="ec" value={edit.classId} onChange={(event) => setEdit({ ...edit, classId: event.target.value })}>
              {workspace.classes.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Status" htmlFor="es">
            <Select id="es" value={edit.status} onChange={(event) => setEdit({ ...edit, status: event.target.value as typeof edit.status })}>
              <option value="active">Active</option>
              <option value="graduated">Graduated</option>
              <option value="withdrawn">Withdrawn</option>
            </Select>
          </Field>
          <Field label="Home address" htmlFor="ea" className="sm:col-span-2">
            <Input id="ea" value={edit.address} onChange={(event) => setEdit({ ...edit, address: event.target.value })} />
          </Field>
        </form>
      </Modal>

      <Modal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        title="Record a payment"
        description={`${student.firstName} ${student.lastName} · balance ${naira(balance)}`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="md" onClick={() => setPayOpen(false)}>Cancel</Button>
            <Button size="md" type="submit" form="pay-form">
              <CreditCard className="h-3.5 w-3.5" />
              Record payment
            </Button>
          </>
        }
      >
        <form id="pay-form" onSubmit={recordPayment} className="space-y-3">
          <Field label="Amount" htmlFor="amount">
            <Input id="amount" inputMode="numeric" value={payAmount} onChange={(event) => setPayAmount(event.target.value)} placeholder="50000" />
          </Field>
          <Field label="Method" htmlFor="method">
            <Select id="method" value={payMethod} onChange={(event) => setPayMethod(event.target.value as typeof payMethod)}>
              <option value="transfer">Bank transfer</option>
              <option value="card">Card</option>
              <option value="cash">Cash</option>
              <option value="pos">POS</option>
            </Select>
          </Field>
          <p className="rounded-lg bg-canvas px-3 py-2 text-[10px] leading-relaxed text-muted">
            This records the payment against the oldest outstanding invoice and adds a receipt line
            to the finance ledger.
          </p>
        </form>
      </Modal>
    </div>
  );
}

const buttonLink =
  "inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-brand px-4 text-[12.5px] font-semibold text-white transition-colors hover:bg-brand-hover";
const buttonLinkSecondary =
  "inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-line bg-white px-4 text-[12.5px] font-semibold text-ink transition-colors hover:border-brand/30 hover:bg-brand-soft/40";

