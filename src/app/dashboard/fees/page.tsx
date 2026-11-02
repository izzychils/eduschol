"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  CreditCard,
  FilePlus2,
  Receipt,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { PageTitle, Badge, Avatar, EmptyState, Tabs } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, SearchField } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useSchool } from "@/lib/store";
import { useSession } from "@/lib/session";
import {
  className as roomName,
  feeByClass,
  feeSummary,
  guardianChildren,
  invoiceBalance,
  invoiceStatus,
  invoiceTotal,
  recentPayments,
  studentInvoices,
} from "@/lib/analytics";
import { compactNaira, dateLabel, naira, percent, relativeTime } from "@/lib/format";
import { cn, todayISO, uid } from "@/lib/utils";
import type { Invoice, PaymentMethod } from "@/lib/types";

type Filter = "all" | "unpaid" | "partial" | "paid";

export default function FeesPage() {
  const { workspace, update } = useSchool();
  const { user } = useSession();
  const { toast } = useToast();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [payInvoice, setPayInvoice] = useState<Invoice | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("transfer");
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({ studentId: "", tuition: "185000", other: "25000", dueDate: todayISO() });

  const scopedStudents = useMemo(() => {
    if (!workspace || !user) return [];
    return user.role === "parent"
      ? guardianChildren(workspace, user.email)
      : workspace.students.filter((student) => student.status === "active");
  }, [workspace, user]);

  const scopedIds = new Set(scopedStudents.map((student) => student.id));

  const invoices = useMemo(() => {
    if (!workspace) return [];
    const clean = query.trim().toLowerCase();
    return workspace.invoices
      .filter((invoice) => (user?.role === "parent" ? scopedIds.has(invoice.studentId) : true))
      .filter((invoice) => filter === "all" || invoiceStatus(invoice).key === filter)
      .filter((invoice) => {
        if (!clean) return true;
        const student = workspace.students.find((item) => item.id === invoice.studentId);
        return `${student?.firstName} ${student?.lastName} ${student?.admissionNo}`.toLowerCase().includes(clean);
      })
      .sort((a, b) => invoiceBalance(b) - invoiceBalance(a));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace, user, filter, query, scopedStudents]);

  if (!workspace || !user) return null;

  const summary = feeSummary(
    workspace,
    user.role === "parent" ? workspace.invoices.filter((invoice) => scopedIds.has(invoice.studentId)) : undefined,
  );
  const byClass = feeByClass(workspace);
  const payments = recentPayments(workspace, 6).filter((payment) =>
    user.role === "parent" ? scopedIds.has(payment.studentId) : true,
  );
  const isAdmin = user.role === "admin";

  function openPayment(invoice: Invoice) {
    setPayInvoice(invoice);
    setAmount(String(Math.max(0, invoiceTotal(invoice) - invoice.paid)));
  }

  function recordPayment(event: React.FormEvent) {
    event.preventDefault();
    if (!payInvoice) return;
    const value = Number(amount.replace(/[^\d.]/g, ""));
    if (!value || value <= 0) {
      toast("Enter an amount above zero", "error");
      return;
    }
    const applied = Math.min(value, Math.max(0, invoiceTotal(payInvoice) - payInvoice.paid));
    const student = workspace?.students.find((item) => item.id === payInvoice.studentId);
    update((current) => ({
      ...current,
      invoices: current.invoices.map((invoice) =>
        invoice.id === payInvoice.id ? { ...invoice, paid: invoice.paid + applied } : invoice,
      ),
      payments: [
        {
          id: uid("pay"),
          invoiceId: payInvoice.id,
          studentId: payInvoice.studentId,
          amount: applied,
          method,
          reference: `PAY-${Date.now().toString().slice(-6)}`,
          at: new Date().toISOString(),
          recordedBy: user?.role === "parent" ? "Parent portal" : user?.name ?? "Bursary",
        },
        ...current.payments,
      ],
      activity: [
        {
          id: uid("act"),
          kind: "payment.recorded",
          text: `${user?.role === "parent" ? "A parent" : user?.name} paid ${naira(applied)} for ${student?.firstName} ${student?.lastName}`,
          at: new Date().toISOString(),
        },
        ...current.activity,
      ],
    }));
    setPayInvoice(null);
    setAmount("");
    toast(`${naira(applied)} recorded for ${student?.firstName}`, "success");
  }

  function createInvoice(event: React.FormEvent) {
    event.preventDefault();
    if (!invoiceForm.studentId) {
      toast("Choose a student", "error");
      return;
    }
    const tuition = Number(invoiceForm.tuition) || 0;
    const other = Number(invoiceForm.other) || 0;
    if (!tuition && !other) {
      toast("Add at least one charge", "error");
      return;
    }
    const invoice: Invoice = {
      id: uid("inv"),
      studentId: invoiceForm.studentId,
      term: workspace!.school.term,
      session: workspace!.school.session,
      items: [
        ...(tuition ? [{ label: "Tuition", amount: tuition }] : []),
        ...(other ? [{ label: "Development levy", amount: other }] : []),
      ],
      paid: 0,
      dueDate: invoiceForm.dueDate,
      issuedAt: todayISO(),
    };
    update((current) => ({ ...current, invoices: [invoice, ...current.invoices] }));
    setInvoiceOpen(false);
    toast("Invoice issued", "success");
  }

  return (
    <div className="space-y-4">
      <PageTitle
        eyebrow="Finance"
        title={isAdmin ? "Fees and finance" : "Fees and payments"}
        description={
          isAdmin
            ? "What the school billed, what came in, and what is still owed. Every figure comes from the same invoice records."
            : "Your family's invoices, balances and payment history for this term."
        }
        actions={
          isAdmin ? (
            <>
              <Button variant="secondary" size="md" onClick={() => setInvoiceOpen(true)}>
                <FilePlus2 className="h-3.5 w-3.5" />
                New invoice
              </Button>
              <Button size="md" onClick={() => setInvoiceOpen(true)}>
                <Wallet className="h-3.5 w-3.5" />
                Record payment
              </Button>
            </>
          ) : null
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: isAdmin ? "Billed this term" : "Family billed", value: compactNaira(summary.billed), foot: `${summary.count} invoices`, icon: Receipt, tone: "bg-brand-soft text-brand" },
          { label: "Collected", value: compactNaira(summary.collected), foot: `${summary.paid} settled`, icon: TrendingUp, tone: "bg-success-soft text-success" },
          { label: "Outstanding", value: compactNaira(summary.outstanding), foot: `${summary.partial + summary.unpaid} with a balance`, icon: Wallet, tone: "bg-danger-soft text-danger" },
          { label: "Collection rate", value: `${percent(summary.rate, 1)}%`, foot: `${workspace.school.term}, ${workspace.school.session}`, icon: CreditCard, tone: "bg-violet-soft text-violet" },
        ].map((item) => (
          <div key={item.label} className="card p-4">
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-semibold text-muted">{item.label}</p>
              <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", item.tone)}>
                <item.icon className="h-3.5 w-3.5" />
              </span>
            </div>
            <p className="mt-2 text-[22px] font-extrabold leading-none tracking-[-0.03em] text-ink tnum">{item.value}</p>
            <p className="mt-1.5 text-[9.5px] text-muted">{item.foot}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.6fr_1fr]">
        <div className="card overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
            <SearchField value={query} onChange={setQuery} placeholder="Student or admission number" className="min-w-[160px] flex-1" />
            <Tabs
              tabs={[
                { id: "all", label: "All" },
                { id: "unpaid", label: "Unpaid" },
                { id: "partial", label: "Part paid" },
                { id: "paid", label: "Paid" },
              ]}
              value={filter}
              onChange={(value) => setFilter(value as Filter)}
              size="sm"
            />
          </div>

          <div className="hidden grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr_0.7fr] gap-2 border-b border-line bg-canvas/60 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-muted sm:grid">
            <span>Student</span>
            <span className="text-right">Billed</span>
            <span className="text-right">Paid</span>
            <span className="text-right">Balance</span>
            <span className="text-right">Status</span>
          </div>
          <div className="divide-y divide-line-soft">
            {invoices.map((invoice) => {
              const student = workspace.students.find((item) => item.id === invoice.studentId);
              const status = invoiceStatus(invoice);
              const total = invoiceTotal(invoice);
              return (
                <div key={invoice.id} className="grid grid-cols-2 gap-2 px-4 py-2.5 sm:grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr_0.7fr] sm:items-center">
                  <div className="flex items-center gap-2">
                    <Avatar name={`${student?.firstName ?? "?"} ${student?.lastName ?? ""}`} size="xs" />
                    <div className="min-w-0">
                      <p className="truncate text-[10.5px] font-semibold text-ink">{student?.firstName} {student?.lastName}</p>
                      <p className="truncate text-[9px] text-muted">{roomName(workspace, student?.classId ?? "")} · {invoice.term}</p>
                    </div>
                  </div>
                  <p className="hidden text-right text-[10px] text-ink tnum sm:block">{naira(total)}</p>
                  <p className="hidden text-right text-[10px] text-success tnum sm:block">{naira(invoice.paid)}</p>
                  <p className={cn("text-right text-[10px] font-semibold tnum", invoiceBalance(invoice) ? "text-danger" : "text-success")}>
                    {invoiceBalance(invoice) ? naira(invoiceBalance(invoice)) : "Settled"}
                  </p>
                  <div className="flex justify-end">
                    {invoiceBalance(invoice) > 0 ? (
                      <button
                        type="button"
                        onClick={() => openPayment(invoice)}
                        className="inline-flex items-center gap-1 rounded-md bg-brand-soft px-1.5 py-1 text-[9px] font-bold text-brand-ink transition-colors hover:bg-brand-soft-2"
                      >
                        <CreditCard className="h-2.5 w-2.5" />
                        Pay
                      </button>
                    ) : (
                      <Badge tone={status.tone}>{status.label}</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {!invoices.length ? <EmptyState icon={Wallet} title="No invoices in this view" description="Change the filter or search for another student." /> : null}
        </div>

        <div className="space-y-3">
          {isAdmin ? (
          <section className="card p-4">
            <h2 className="text-[12px] font-bold text-ink">Collection by class</h2>
            <p className="mt-0.5 text-[9.5px] text-muted">Share of billed fees collected</p>
            <div className="mt-3 space-y-2.5">
              {byClass.map((row) => (
                <div key={row.room.id}>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-ink/75">{row.room.name}</span>
                    <span className="font-bold text-ink tnum">{percent(row.rate, 0)}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line-soft">
                    <div className={cn("h-full rounded-full", row.rate >= 80 ? "bg-success" : row.rate >= 55 ? "bg-warning" : "bg-danger")} style={{ width: `${row.rate}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
          ) : (
            <section className="card p-4">
              <h2 className="text-[12px] font-bold text-ink">Paying school fees</h2>
              <div className="mt-2.5 space-y-2 text-[10px] leading-relaxed text-muted">
                <p>Payments can be made at the bursary or by transfer to the school account. A receipt is issued for every payment.</p>
                <p>Once the bursary records a payment, the balance here updates and the receipt appears below.</p>
              </div>
              <div className="mt-3 rounded-lg bg-canvas px-3 py-2">
                <p className="text-[8.5px] font-bold uppercase tracking-[0.1em] text-muted">Family balance</p>
                <p className="mt-0.5 text-[18px] font-extrabold text-ink tnum">{naira(summary.outstanding)}</p>
              </div>
            </section>
          )}

          <section className="card p-4">
            <h2 className="text-[12px] font-bold text-ink">{isAdmin ? "Recent receipts" : "My receipts"}</h2>
            <div className="mt-2.5 space-y-2.5">
              {payments.map((payment) => {
                const student = workspace.students.find((item) => item.id === payment.studentId);
                return (
                  <div key={payment.id} className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-success-soft text-success">
                      <Receipt className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] font-semibold text-ink">{student?.firstName} {student?.lastName}</p>
                      <p className="text-[9px] text-muted">{payment.method} · {relativeTime(payment.at)}</p>
                    </div>
                    <p className="text-[10px] font-bold text-success tnum">{compactNaira(payment.amount)}</p>
                  </div>
                );
              })}
              {!payments.length ? <p className="py-4 text-center text-[10px] text-muted">No payments recorded yet.</p> : null}
            </div>
          </section>
        </div>
      </div>

      <Modal
        open={Boolean(payInvoice)}
        onClose={() => setPayInvoice(null)}
        title="Record a payment"
        description={payInvoice ? `${workspace.students.find((item) => item.id === payInvoice.studentId)?.firstName ?? "Student"}, ${payInvoice.term}. Balance ${naira(invoiceBalance(payInvoice))}.` : undefined}
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="md" onClick={() => setPayInvoice(null)}>Cancel</Button>
            <Button size="md" type="submit" form="fee-payment">Record payment</Button>
          </>
        }
      >
        <form id="fee-payment" onSubmit={recordPayment} className="space-y-3">
          <Field label="Amount" htmlFor="fee-amount">
            <Input id="fee-amount" inputMode="numeric" value={amount} onChange={(event) => setAmount(event.target.value)} />
          </Field>
          <Field label="Method" htmlFor="fee-method">
            <Select id="fee-method" value={method} onChange={(event) => setMethod(event.target.value as PaymentMethod)}>
              <option value="transfer">Bank transfer</option>
              <option value="card">Card</option>
              <option value="cash">Cash</option>
              <option value="pos">POS</option>
            </Select>
          </Field>
          <p className="rounded-lg bg-canvas px-3 py-2 text-[9.5px] leading-relaxed text-muted">
            A receipt reference is generated and the balance updates immediately. Overpayment is
            capped at the outstanding balance.
          </p>
        </form>
      </Modal>

      <Modal
        open={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        title="Issue an invoice"
        description="Charges are attached to the current term and appear immediately in the family's balance."
        size="md"
        footer={
          <>
            <Button variant="ghost" size="md" onClick={() => setInvoiceOpen(false)}>Cancel</Button>
            <Button size="md" type="submit" form="invoice-form">Issue invoice</Button>
          </>
        }
      >
        <form id="invoice-form" onSubmit={createInvoice} className="grid gap-3 sm:grid-cols-2">
          <Field label="Student" htmlFor="invstudent" className="sm:col-span-2">
            <Select id="invstudent" value={invoiceForm.studentId} onChange={(event) => setInvoiceForm({ ...invoiceForm, studentId: event.target.value })}>
              <option value="">Choose a student</option>
              {workspace.students.filter((student) => student.status === "active").map((student) => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName} · {student.admissionNo}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tuition" htmlFor="invtuition">
            <Input id="invtuition" inputMode="numeric" value={invoiceForm.tuition} onChange={(event) => setInvoiceForm({ ...invoiceForm, tuition: event.target.value })} />
          </Field>
          <Field label="Development levy" htmlFor="invother">
            <Input id="invother" inputMode="numeric" value={invoiceForm.other} onChange={(event) => setInvoiceForm({ ...invoiceForm, other: event.target.value })} />
          </Field>
          <Field label="Due date" htmlFor="invdate" className="sm:col-span-2">
            <Input id="invdate" type="date" value={invoiceForm.dueDate} onChange={(event) => setInvoiceForm({ ...invoiceForm, dueDate: event.target.value })} />
          </Field>
        </form>
      </Modal>

      <p className="flex items-center gap-1.5 text-[9.5px] text-muted">
        <ArrowRight className="h-3 w-3" />
        Figures update from the invoice and payment records. Unpaid balances are also visible on the
        student profile and the dashboard.
      </p>
    </div>
  );
}
