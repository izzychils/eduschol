"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Building2,
  Check,
  Download,
  KeyRound,
  LogOut,
  RotateCcw,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { PageTitle, Badge, Avatar, Divider } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Modal, ConfirmDialog } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useSchool } from "@/lib/store";
import { useSession } from "@/lib/session";
import { ROLE_LABEL } from "@/lib/types";
import { dateLabel } from "@/lib/format";

export default function SettingsPage() {
  const router = useRouter();
  const { workspace, update, reset } = useSchool();
  const { user, updateName, changePassword, deleteAccount, signOut } = useSession();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name ?? "");
  const [schoolForm, setSchoolForm] = useState({
    name: workspace?.school.name ?? "",
    motto: workspace?.school.motto ?? "",
    address: workspace?.school.address ?? "",
    city: workspace?.school.city ?? "",
    phone: workspace?.school.phone ?? "",
    email: workspace?.school.email ?? "",
    session: workspace?.school.session ?? "",
    term: workspace?.school.term ?? "Term 1",
    headTeacher: workspace?.school.headTeacher ?? "",
    website: workspace?.school.website ?? "",
  });
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (!workspace || !user) return null;

  function saveName(event: React.FormEvent) {
    event.preventDefault();
    const result = updateName(name);
    if (!result.ok) {
      toast(result.error, "error");
      return;
    }
    toast("Your name has been updated", "success");
  }

  function saveSchool(event: React.FormEvent) {
    event.preventDefault();
    update((current) => ({
      ...current,
      school: {
        ...current.school,
        ...schoolForm,
      },
    }));
    setDetailsOpen(false);
    toast("School details saved", "success");
  }

  async function savePassword(event: React.FormEvent) {
    event.preventDefault();
    setPasswordError("");
    if (passwords.next !== passwords.confirm) {
      setPasswordError("The two new passwords do not match.");
      return;
    }
    const result = await changePassword(passwords.current, passwords.next);
    if (!result.ok) {
      setPasswordError(result.error);
      return;
    }
    setPasswords({ current: "", next: "", confirm: "" });
    toast("Password changed", "success");
  }

  function exportData() {
    if (!workspace) return;
    const payload = {
      exportedAt: new Date().toISOString(),
      account: { name: user?.name, email: user?.email, role: user?.role },
      workspace,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${workspace.school.name.toLowerCase().replace(/\s+/g, "-")}-eduschol.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast("Workspace exported as JSON", "success");
  }

  return (
    <div className="space-y-4">
      <PageTitle
        eyebrow="Workspace"
        title="Settings"
        description="Your account, your school's details and the records held for this workspace."
      />

      <div className="grid gap-3 lg:grid-cols-[1fr_300px]">
        <div className="space-y-3">
          <section className="card p-4">
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-brand" />
              <h2 className="text-[12px] font-bold text-ink">Your account</h2>
            </div>
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-canvas p-3">
              <Avatar name={user.name} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-bold text-ink">{user.name}</p>
                <p className="truncate text-[10px] text-muted">{user.email}</p>
                <div className="mt-1 flex gap-1">
                  <Badge tone="accent">{ROLE_LABEL[user.role]}</Badge>
                  <Badge tone="neutral">Joined {dateLabel(user.createdAt, { day: "numeric", month: "short", year: "numeric" })}</Badge>
                </div>
              </div>
            </div>
            <form onSubmit={saveName} className="mt-3 flex flex-wrap items-end gap-2">
              <Field label="Display name" htmlFor="display-name" className="min-w-[180px] flex-1">
                <Input id="display-name" value={name} onChange={(event) => setName(event.target.value)} />
              </Field>
              <Button type="submit" size="md">Save name</Button>
            </form>
          </section>

          {user.role === "admin" ? (
            <section className="card p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-brand" />
                  <h2 className="text-[12px] font-bold text-ink">School details</h2>
                </div>
                <Button size="sm" variant="secondary" onClick={() => setDetailsOpen(true)}>Edit details</Button>
              </div>
              <div className="mt-3 grid gap-x-4 gap-y-2 rounded-xl bg-canvas p-3 sm:grid-cols-2">
                {[
                  { label: "School", value: workspace.school.name },
                  { label: "Motto", value: workspace.school.motto },
                  { label: "Address", value: `${workspace.school.address}, ${workspace.school.city}` },
                  { label: "Head teacher", value: workspace.school.headTeacher },
                  { label: "Phone", value: workspace.school.phone },
                  { label: "Email", value: workspace.school.email },
                  { label: "Session", value: workspace.school.session },
                  { label: "Current term", value: workspace.school.term },
                ].map((row) => (
                  <div key={row.label} className="min-w-0">
                    <p className="text-[8.5px] font-bold uppercase tracking-[0.1em] text-muted">{row.label}</p>
                    <p className="truncate text-[10.5px] text-ink">{row.value}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="card p-4">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-brand" />
              <h2 className="text-[12px] font-bold text-ink">Password</h2>
            </div>
            <form onSubmit={savePassword} className="mt-3 grid gap-3 sm:grid-cols-3">
              <Field label="Current password" htmlFor="current-password">
                <Input id="current-password" type="password" autoComplete="current-password" value={passwords.current} onChange={(event) => setPasswords({ ...passwords, current: event.target.value })} />
              </Field>
              <Field label="New password" htmlFor="new-password">
                <Input id="new-password" type="password" autoComplete="new-password" value={passwords.next} onChange={(event) => setPasswords({ ...passwords, next: event.target.value })} />
              </Field>
              <Field label="Confirm new password" htmlFor="confirm-password">
                <Input id="confirm-password" type="password" autoComplete="new-password" value={passwords.confirm} onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })} />
              </Field>
              {passwordError ? <p className="sm:col-span-3 rounded-lg bg-danger-soft px-3 py-2 text-[11px] font-medium text-danger">{passwordError}</p> : null}
              <div className="sm:col-span-3">
                <Button type="submit" size="md" variant="secondary">Change password</Button>
              </div>
            </form>
          </section>

          <section className="card p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand" />
              <h2 className="text-[12px] font-bold text-ink">Data in this workspace</h2>
            </div>
            <p className="mt-1.5 text-[10px] leading-relaxed text-muted">
              This build keeps every record in this browser's localStorage. Nothing is sent to a
              server. Export a copy before clearing browser data or moving to another device.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "Students", value: workspace.students.length },
                { label: "Staff", value: workspace.staff.length },
                { label: "Results", value: workspace.results.length },
                { label: "Invoices", value: workspace.invoices.length },
              ].map((row) => (
                <div key={row.label} className="rounded-lg bg-canvas px-2.5 py-2">
                  <p className="text-[8.5px] text-muted">{row.label}</p>
                  <p className="text-[13px] font-bold text-ink tnum">{row.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={exportData}>
                <Download className="h-3 w-3" />
                Export JSON
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setResetOpen(true)}>
                <RotateCcw className="h-3 w-3" />
                Restore sample data
              </Button>
            </div>
          </section>

          <section className="card border-danger/25 p-4">
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-danger" />
              <h2 className="text-[12px] font-bold text-ink">Account removal</h2>
            </div>
            <p className="mt-1.5 text-[10px] leading-relaxed text-muted">
              Deleting your account removes the login and every record attached to it from this
              browser. It cannot be undone. Export first if you need a copy.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  signOut();
                  router.replace("/auth/sign-in");
                }}
              >
                <LogOut className="h-3 w-3" />
                Sign out
              </Button>
              <Button size="sm" variant="danger" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="h-3 w-3" />
                Delete account
              </Button>
            </div>
          </section>
        </div>

        <div className="space-y-3">
          <section className="card p-4">
            <h2 className="text-[11.5px] font-bold text-ink">Your access</h2>
            <p className="mt-0.5 text-[9.5px] text-muted">{ROLE_LABEL[user.role]} scope</p>
            <div className="mt-3 space-y-2">
              {[
                { label: "Student records", roles: ["admin", "teacher", "parent"] },
                { label: "Grades and reports", roles: ["admin", "teacher", "parent"] },
                { label: "Attendance register", roles: ["admin", "teacher"] },
                { label: "Bursary and payroll", roles: ["admin"] },
                { label: "School announcements", roles: ["admin", "teacher", "parent"] },
                { label: "Exam builder", roles: ["admin", "teacher"] },
              ].map((row) => {
                const allowed = row.roles.includes(user.role);
                return (
                  <div key={row.label} className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-muted">{row.label}</span>
                    <span className={allowed ? "flex items-center gap-1 text-[9px] font-semibold text-success" : "text-[9px] font-semibold text-muted/60"}>
                      {allowed ? <Check className="h-3 w-3" /> : null}
                      {allowed ? "Allowed" : "Restricted"}
                    </span>
                  </div>
                );
              })}
            </div>
            <Divider className="my-3" />
            <p className="text-[9px] leading-relaxed text-muted">
              Role rules live in the dashboard shell and page guards. When a backend is added, the
              same rules must be enforced on the server, not only in the interface.
            </p>
          </section>

          <section className="card p-4">
            <h2 className="text-[11.5px] font-bold text-ink">Session</h2>
            <div className="mt-2 space-y-1.5 text-[9.5px]">
              <div className="flex items-center justify-between">
                <span className="text-muted">Signed in as</span>
                <span className="font-semibold text-ink">{user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">School</span>
                <span className="font-semibold text-ink">{workspace.school.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Term</span>
                <span className="font-semibold text-ink">{workspace.school.term}</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Modal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title="School details"
        description="These values appear on report cards, the marketing copy and printed documents."
        size="lg"
        footer={
          <>
            <Button variant="ghost" size="md" onClick={() => setDetailsOpen(false)}>Cancel</Button>
            <Button size="md" type="submit" form="school-form">Save details</Button>
          </>
        }
      >
        <form id="school-form" onSubmit={saveSchool} className="grid gap-3 sm:grid-cols-2">
          <Field label="School name" htmlFor="school-name">
            <Input id="school-name" value={schoolForm.name} onChange={(event) => setSchoolForm({ ...schoolForm, name: event.target.value })} />
          </Field>
          <Field label="Motto" htmlFor="school-motto">
            <Input id="school-motto" value={schoolForm.motto} onChange={(event) => setSchoolForm({ ...schoolForm, motto: event.target.value })} />
          </Field>
          <Field label="Address" htmlFor="school-address" className="sm:col-span-2">
            <Input id="school-address" value={schoolForm.address} onChange={(event) => setSchoolForm({ ...schoolForm, address: event.target.value })} />
          </Field>
          <Field label="City and state" htmlFor="school-city">
            <Input id="school-city" value={schoolForm.city} onChange={(event) => setSchoolForm({ ...schoolForm, city: event.target.value })} />
          </Field>
          <Field label="Website" htmlFor="school-web">
            <Input id="school-web" value={schoolForm.website} onChange={(event) => setSchoolForm({ ...schoolForm, website: event.target.value })} />
          </Field>
          <Field label="Phone" htmlFor="school-phone">
            <Input id="school-phone" value={schoolForm.phone} onChange={(event) => setSchoolForm({ ...schoolForm, phone: event.target.value })} />
          </Field>
          <Field label="Email" htmlFor="school-email">
            <Input id="school-email" type="email" value={schoolForm.email} onChange={(event) => setSchoolForm({ ...schoolForm, email: event.target.value })} />
          </Field>
          <Field label="Head teacher" htmlFor="school-head">
            <Input id="school-head" value={schoolForm.headTeacher} onChange={(event) => setSchoolForm({ ...schoolForm, headTeacher: event.target.value })} />
          </Field>
          <Field label="Session" htmlFor="school-session">
            <Input id="school-session" value={schoolForm.session} onChange={(event) => setSchoolForm({ ...schoolForm, session: event.target.value })} />
          </Field>
          <Field label="Current term" htmlFor="school-term">
            <Select id="school-term" value={schoolForm.term} onChange={(event) => setSchoolForm({ ...schoolForm, term: event.target.value })}>
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Term 3">Term 3</option>
            </Select>
          </Field>
        </form>
      </Modal>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={() => {
          reset();
          setResetOpen(false);
          toast("Sample school restored", "success");
        }}
        title="Restore the sample school?"
        description="This replaces every student, result, invoice and notice in this workspace with the seeded sample. Your login stays."
        confirmLabel="Restore sample"
        tone="danger"
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          deleteAccount();
          router.replace("/");
        }}
        title="Delete this account?"
        description="The login and every record in this workspace will be removed from this browser. This cannot be undone."
        confirmLabel="Delete account"
        tone="danger"
      />
    </div>
  );
}
