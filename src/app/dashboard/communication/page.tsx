"use client";

import { useMemo, useState } from "react";
import { Mail, Megaphone, Pin, Send, Sparkles, Trash2 } from "lucide-react";
import { PageTitle, Badge, Avatar, EmptyState } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useSchool } from "@/lib/store";
import { useSession } from "@/lib/session";
import { dateLabel, timeLabel } from "@/lib/format";
import { cn, uid } from "@/lib/utils";
import type { Audience } from "@/lib/types";

const starters = [
  {
    label: "Term meeting",
    title: "Parent teacher meeting",
    body: "Dear parents, our parent teacher meeting for this term holds on Saturday at 10:00 in the school hall. Form teachers will share each child's results, attendance and next steps. Please arrive ten minutes early.",
  },
  {
    label: "Fees reminder",
    title: "A reminder about outstanding fees",
    body: "Dear parents, the current term's fees are now due. You can see your exact balance in the parent portal and record a payment at the bursary. If you have already paid, please share your receipt with the office so the ledger can be updated.",
  },
  {
    label: "Resumption",
    title: "Resumption date and requirements",
    body: "Dear parents, school resumes on Monday, 6 January. Please ensure your child returns with the complete booklist, a filled water bottle and the school uniform. The gates open at 07:00 and lessons begin at 08:00.",
  },
];

export default function CommunicationPage() {
  const { workspace, update } = useSchool();
  const { user } = useSession();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [audience, setAudience] = useState<"all" | Audience>("all");
  const [form, setForm] = useState({ title: "", body: "", audience: "parents" as Audience, channel: "app" as "app" | "email" | "sms", pinned: false });
  const [error, setError] = useState("");

  const notices = useMemo(() => {
    if (!workspace) return [];
    return [...workspace.announcements]
      .filter((notice) => audience === "all" || notice.audience === audience)
      .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || new Date(b.at).getTime() - new Date(a.at).getTime());
  }, [workspace, audience]);

  if (!workspace || !user) return null;

  const isParent = user.role === "parent";
  const visible = isParent
    ? notices.filter((notice) => notice.audience === "all" || notice.audience === "parents")
    : notices;

  function send(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!form.title.trim() || form.body.trim().length < 10) {
      setError("Add a title and at least a sentence of body copy.");
      return;
    }
    update((current) => ({
      ...current,
      announcements: [
        {
          id: uid("ann"),
          title: form.title.trim(),
          body: form.body.trim(),
          audience: form.audience,
          channel: form.channel,
          author: user?.name ?? "School office",
          at: new Date().toISOString(),
          pinned: form.pinned,
        },
        ...current.announcements,
      ],
      activity: [
        {
          id: uid("act"),
          kind: "announcement.sent",
          text: `${user?.name ?? "The school office"} sent "${form.title.trim()}" to ${form.audience === "all" ? "the whole school" : form.audience}`,
          at: new Date().toISOString(),
        },
        ...current.activity,
      ],
    }));
    setOpen(false);
    setForm({ title: "", body: "", audience: "parents", channel: "app", pinned: false });
    toast("Announcement published", "success");
  }

  return (
    <div className="space-y-4">
      <PageTitle
        eyebrow="Community"
        title="Announcements"
        description={
          isParent
            ? "Everything the school has shared with families, newest first."
            : "One message, the right audience. Notices appear in the app and are logged as sent."
        }
        actions={
          !isParent ? (
            <Button size="md" onClick={() => setOpen(true)}>
              <Megaphone className="h-3.5 w-3.5" />
              New announcement
            </Button>
          ) : null
        }
      />

      <div className="grid gap-3 lg:grid-cols-[1fr_260px]">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-line bg-white p-1.5">
            {(["all", "parents", "staff", "students"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setAudience(tab)}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 text-[10.5px] font-semibold capitalize transition-colors",
                  audience === tab ? "bg-brand text-white" : "text-muted hover:bg-canvas hover:text-ink",
                )}
              >
                {tab === "all" ? "Everything" : tab}
              </button>
            ))}
          </div>

          {visible.map((notice) => (
            <article key={notice.id} className="card p-4">
              <div className="flex items-start gap-3">
                <Avatar name={notice.author} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h2 className="text-[12px] font-bold text-ink">{notice.title}</h2>
                    {notice.pinned ? <Pin className="h-3 w-3 text-brand" /> : null}
                  </div>
                  <p className="mt-0.5 text-[9px] text-muted">
                    {notice.author} · {dateLabel(notice.at, { day: "numeric", month: "short" })} at {timeLabel(notice.at)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Badge tone={notice.audience === "parents" ? "violet" : notice.audience === "staff" ? "info" : "neutral"}>
                    {notice.audience}
                  </Badge>
                  {!isParent ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          update((current) => ({
                            ...current,
                            announcements: current.announcements.map((item) => item.id === notice.id ? { ...item, pinned: !item.pinned } : item),
                          }));
                          toast(notice.pinned ? "Notice unpinned" : "Notice pinned to the top", "success");
                        }}
                        className={cn("flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-brand-soft", notice.pinned ? "text-brand" : "text-muted")}
                        aria-label="Pin notice"
                      >
                        <Pin className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          update((current) => ({
                            ...current,
                            announcements: current.announcements.filter((item) => item.id !== notice.id),
                          }));
                          toast("Announcement removed", "success");
                        }}
                        className="flex h-6 w-6 items-center justify-center rounded-md text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                        aria-label="Delete notice"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
              <p className="mt-3 whitespace-pre-line text-[11.5px] leading-[1.7] text-ink/75">{notice.body}</p>
              <div className="mt-3 flex items-center gap-2 border-t border-line pt-2.5">
                <span className="inline-flex items-center gap-1 text-[9px] text-muted">
                  <Mail className="h-3 w-3" />
                  Delivered in {notice.channel}
                </span>
                <span className="ml-auto text-[9px] text-muted">
                  {notice.audience === "all" ? workspace.students.length + workspace.staff.length : notice.audience === "parents" ? workspace.students.length : notice.audience === "staff" ? workspace.staff.length : workspace.students.length} recipients
                </span>
              </div>
            </article>
          ))}
          {!visible.length ? (
            <EmptyState icon={Megaphone} title="No announcements yet" description={isParent ? "The school has not posted anything for families this term." : "Write the first notice and it appears here for the selected audience."} />
          ) : null}
        </div>

        <div className="space-y-3">
          <section className="card p-4">
            <h2 className="text-[12px] font-bold text-ink">Reaching families</h2>
            <div className="mt-3 space-y-2.5">
              {[
                { label: "Parents linked", value: new Set(workspace.students.map((student) => student.guardianEmail.toLowerCase())).size },
                { label: "Staff on the list", value: workspace.staff.filter((member) => member.status === "active").length },
                { label: "Notices this term", value: workspace.announcements.length },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-[10.5px]">
                  <span className="text-muted">{row.label}</span>
                  <span className="font-bold text-ink tnum">{row.value}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 border-t border-line pt-2.5 text-[9px] leading-relaxed text-muted">
              This demo records delivery in the ledger. It does not send email or SMS. Connect a
              provider when the backend is added.
            </p>
          </section>

          <section className="card p-4">
            <h2 className="text-[12px] font-bold text-ink">Suggested wording</h2>
            <p className="mt-0.5 text-[9.5px] text-muted">Starters you can edit before sending</p>
            <div className="mt-2.5 space-y-1.5">
              {starters.map((starter) => (
                <button
                  key={starter.label}
                  type="button"
                  disabled={isParent}
                  onClick={() => {
                    setForm({ ...form, title: starter.title, body: starter.body, audience: "parents" });
                    setOpen(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg border border-line px-2.5 py-2 text-left text-[10px] font-semibold text-ink transition-colors hover:border-brand/30 hover:bg-brand-soft/40 disabled:opacity-50"
                >
                  <Sparkles className="h-3 w-3 text-brand" />
                  {starter.label}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New announcement"
        description="Appears immediately for the chosen audience in this workspace."
        size="md"
        footer={
          <>
            <Button variant="ghost" size="md" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="md" type="submit" form="announce-form">
              <Send className="h-3.5 w-3.5" />
              Publish notice
            </Button>
          </>
        }
      >
        <form id="announce-form" onSubmit={send} className="space-y-3">
          <Field label="Title" htmlFor="atitle">
            <Input id="atitle" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Parent teacher meeting" />
          </Field>
          <Field label="Message" htmlFor="abody">
            <Textarea id="abody" rows={6} value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} placeholder="Dear parents, ..." />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Audience" htmlFor="aaudience">
              <Select id="aaudience" value={form.audience} onChange={(event) => setForm({ ...form, audience: event.target.value as Audience })}>
                <option value="parents">Parents and guardians</option>
                <option value="staff">Staff</option>
                <option value="students">Students</option>
                <option value="all">Whole school</option>
              </Select>
            </Field>
            <Field label="Channel" htmlFor="achannel">
              <Select id="achannel" value={form.channel} onChange={(event) => setForm({ ...form, channel: event.target.value as typeof form.channel })}>
                <option value="app">In the app</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </Select>
            </Field>
          </div>
          <label className="flex items-center gap-2 text-[10.5px] text-ink">
            <input
              type="checkbox"
              checked={form.pinned}
              onChange={(event) => setForm({ ...form, pinned: event.target.checked })}
              className="h-3.5 w-3.5 accent-[hsl(var(--brand))]"
            />
            Pin to the top of the notice board
          </label>
          {error ? <p className="rounded-lg bg-danger-soft px-3 py-2 text-[11px] font-medium text-danger">{error}</p> : null}
        </form>
      </Modal>
    </div>
  );
}
