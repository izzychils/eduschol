import {
  BookOpen,
  Boxes,
  Check,
  ClipboardCheck,
  FileText,
  Globe2,
  GraduationCap,
  LayoutGrid,
  MonitorCheck,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Avatar, Badge } from "@/components/ui/surface";
import { Reveal, CountUp } from "./reveal";
import { cn } from "@/lib/utils";

const schools = [
  "Greenfield Academy",
  "Hillcrest Prep",
  "Aurora College",
  "Crescent International",
  "Riverside Montessori",
  "Kingsfield School",
];

export function TrustMarquee() {
  return (
    <section className="border-b border-line bg-white py-9">
      <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
          Built for schools like these
        </p>
        <div className="relative mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <div className="marquee-track items-center gap-10 sm:gap-14">
            {[...schools, ...schools].map((school, index) => (
              <div
                key={`${school}-${index}`}
                className="flex shrink-0 items-center gap-2.5 whitespace-nowrap"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-soft">
                  <GraduationCap className="h-3.5 w-3.5 text-brand" />
                </span>
                <span className="font-display text-[15px] font-bold tracking-[-0.03em] text-ink/45">
                  {school}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const stats = [
  { value: 12, suffix: "", label: "modules", copy: "One login from admissions to transport." },
  { value: 3, suffix: "", label: "portals", copy: "Admin, teacher and parent, each purpose built." },
  { value: 1, suffix: "", label: "record of truth", copy: "Every screen reads the same student record." },
  { value: 0, suffix: "", label: "invented facts", copy: "The AI cites records. It cannot fill a gap with fiction." },
];

export function StatsBand() {
  return (
    <section className="border-b border-line bg-white">
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-y-8 px-5 py-10 sm:py-12 lg:grid-cols-4 lg:gap-8 lg:px-8">
        {stats.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 70}>
            <div className={cn("px-1", index > 0 && "lg:border-l lg:border-line lg:pl-8")}>
              <p className="font-display text-[38px] font-extrabold leading-none tracking-[-0.05em] text-brand">
                <CountUp value={stat.value} suffix={stat.suffix} />
                <span className="ml-1.5 text-[12px] font-bold uppercase tracking-[0.12em] text-muted">
                  {stat.label}
                </span>
              </p>
              <p className="mt-2 max-w-[210px] text-[11.5px] leading-relaxed text-muted">{stat.copy}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function SectionIntro({
  eyebrow,
  title,
  copy,
  center = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  copy: string;
  center?: boolean;
}) {
  return (
    <div className={cn("max-w-[680px]", center && "mx-auto text-center")}>
      <Reveal>
        <p className="eyebrow">{eyebrow}</p>
      </Reveal>
      <Reveal delay={60}>
        <h2 className="mt-3 text-[clamp(2rem,3.6vw,3rem)] font-extrabold leading-[1.02] tracking-[-0.045em] text-ink">
          {title}
        </h2>
      </Reveal>
      <Reveal delay={120}>
        <p className="mt-4 text-[14px] leading-relaxed text-muted sm:text-[15px]">{copy}</p>
      </Reveal>
    </div>
  );
}

function LessonsVisual() {
  const files = [
    { name: "Lecture-3.pptx", rotate: "-8deg", left: "8%", top: 24 },
    { name: "Assignment.pdf", rotate: "-2deg", left: "26%", top: 12 },
    { name: "Practical-codes.txt", rotate: "5deg", left: "47%", top: 20 },
    { name: "Lecture-notes.docx", rotate: "10deg", left: "64%", top: 34 },
  ];
  return (
    <div className="relative h-[176px] overflow-hidden rounded-xl bg-[#F3EFFF]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(123,91,255,0.18),transparent_55%)]" />
      {files.map((file) => (
        <div
          key={file.name}
          className="absolute w-[116px] rounded-lg border border-white bg-white/95 p-2.5 shadow-[0_12px_24px_-14px_rgba(35,27,70,0.35)]"
          style={{ left: file.left, top: file.top, transform: `rotate(${file.rotate})` }}
        >
          <FileText className="h-3.5 w-3.5 text-brand" />
          <p className="mt-4 truncate text-[8px] font-semibold text-ink">{file.name}</p>
          <div className="mt-1.5 h-1 w-10 rounded-full bg-line" />
        </div>
      ))}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg border border-line bg-white px-2.5 py-1.5 shadow-sm">
        <BookOpen className="h-3.5 w-3.5 text-brand" />
        <span className="text-[8.5px] font-semibold text-ink">Lesson library, all classes</span>
      </div>
    </div>
  );
}

function ResultsVisual() {
  const rows = [
    ["CA 1", "17/20"],
    ["CA 2", "16/20"],
    ["Exam", "48/60"],
  ];
  return (
    <div className="relative h-[176px] overflow-hidden rounded-xl bg-[#F2F7FF] p-4">
      <div className="rounded-xl border border-white bg-white p-3 shadow-[0_14px_30px_-18px_rgba(35,27,70,0.3)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar name="Chidera Eze" size="xs" />
            <div>
              <p className="text-[9px] font-bold text-ink">Chidera Eze</p>
              <p className="text-[7.5px] text-muted">JSS 2A, Mathematics</p>
            </div>
          </div>
          <Badge tone="success">A</Badge>
        </div>
        <div className="mt-2 divide-y divide-line-soft">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between py-1.5">
              <span className="text-[8px] text-muted">{label}</span>
              <span className="text-[8px] font-bold text-ink">{value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute right-3 top-3">
        <Badge tone="accent">Published</Badge>
      </div>
    </div>
  );
}

function AdminVisual() {
  const rows = [
    { name: "Adaeze Nwosu", role: "JSS 1A teacher", tone: "accent" as const },
    { name: "Tunde Bello", role: "Vice principal", tone: "info" as const },
    { name: "Grace Etim", role: "Bursary", tone: "warning" as const },
  ];
  return (
    <div className="relative h-[176px] overflow-hidden rounded-xl bg-[#FBF7F0] p-4">
      <div className="rounded-xl border border-white bg-white p-2.5 shadow-[0_14px_30px_-18px_rgba(35,27,70,0.25)]">
        <div className="flex items-center justify-between px-1 pb-2">
          <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-muted">Staff records</span>
          <span className="text-[7.5px] font-semibold text-brand">13 active</span>
        </div>
        {rows.map((row) => (
          <div key={row.name} className="flex items-center gap-2 border-t border-line-soft py-2">
            <Avatar name={row.name} size="xs" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[8.5px] font-semibold text-ink">{row.name}</p>
              <p className="truncate text-[7.5px] text-muted">{row.role}</p>
            </div>
            <Badge tone={row.tone}>Active</Badge>
          </div>
        ))}
      </div>
      <div className="absolute bottom-3 right-4 inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[8px] font-semibold text-success shadow-sm">
        <ShieldCheck className="h-3 w-3" />
        Permissions checked
      </div>
    </div>
  );
}

function CbtVisual() {
  return (
    <div className="relative h-[176px] overflow-hidden rounded-xl bg-[#F0F8F5] p-4">
      <div className="rounded-xl border border-white bg-white p-3 shadow-[0_14px_30px_-18px_rgba(35,27,70,0.25)]">
        <div className="flex items-center justify-between">
          <span className="text-[8px] font-bold uppercase tracking-[0.08em] text-muted">JSS 2A, Maths</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-danger-soft px-1.5 py-0.5 text-[7px] font-bold text-danger">
            <span className="h-1 w-1 rounded-full bg-danger" />
            24:18 left
          </span>
        </div>
        <p className="mt-2 text-[9px] font-semibold leading-snug text-ink">
          Solve for x: 2x + 7 = 19
        </p>
        <div className="mt-2 space-y-1">
          {["A. 5", "B. 6", "C. 7"].map((option, index) => (
            <div
              key={option}
              className={cn(
                "rounded-md border px-2 py-1 text-[8px] font-medium",
                index === 1
                  ? "border-brand bg-brand-soft text-brand-ink"
                  : "border-line text-muted",
              )}
            >
              {option}
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-3 left-4 flex items-center gap-1.5 rounded-full bg-white px-2 py-1 text-[8px] font-semibold text-success shadow-sm">
        <span className="live-dot" />
        Auto marked
      </div>
    </div>
  );
}

function InventoryVisual() {
  return (
    <div className="relative h-[176px] overflow-hidden rounded-xl bg-[#F6F5F1] p-4">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 176" fill="none" aria-hidden="true">
        <path d="M150 92 C 110 92, 92 58, 62 58" stroke="hsl(var(--line))" strokeWidth="1.5" />
        <path d="M150 92 C 190 92, 208 58, 240 58" stroke="hsl(var(--line))" strokeWidth="1.5" />
        <path d="M150 92 C 150 120, 232 122, 232 136" stroke="hsl(var(--line))" strokeWidth="1.5" />
      </svg>
      <div className="absolute left-1/2 top-[74px] w-[86px] -translate-x-1/2 rounded-lg border border-line bg-white px-2 py-2 text-center shadow-sm">
        <Boxes className="mx-auto h-3.5 w-3.5 text-brand" />
        <p className="mt-1 text-[8px] font-bold text-ink">Central store</p>
        <p className="text-[6.5px] text-muted">640 packs ready</p>
      </div>
      {[
        { label: "Science lab", x: 14, y: 38, tone: "success" },
        { label: "Library", x: 216, y: 38, tone: "info" },
        { label: "Sports store", x: 194, y: 118, tone: "warning" },
      ].map((node) => (
        <div
          key={node.label}
          className="absolute rounded-lg border border-white bg-white/95 px-2 py-1.5 shadow-sm"
          style={{ left: `${node.x}px`, top: `${node.y}px` }}
        >
          <p className="text-[7.5px] font-semibold text-ink">{node.label}</p>
          <p
            className={cn(
              "text-[6.5px] font-medium",
              node.tone === "success" ? "text-success" : node.tone === "info" ? "text-info" : "text-warning",
            )}
          >
            {node.tone === "warning" ? "Reorder soon" : "Stocked"}
          </p>
        </div>
      ))}
    </div>
  );
}

function WebsiteVisual() {
  return (
    <div className="relative h-[176px] overflow-hidden rounded-xl bg-[#F4F1FF] p-4">
      <div className="mx-auto w-[86%] overflow-hidden rounded-lg border border-white bg-white shadow-[0_18px_34px_-20px_rgba(35,27,70,0.35)]">
        <div className="flex items-center gap-1.5 border-b border-line-soft bg-[#FBFAFE] px-2 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-line" />
          <span className="h-1.5 w-1.5 rounded-full bg-line" />
          <span className="ml-1 h-2 flex-1 rounded-sm bg-line-soft" />
        </div>
        <div className="p-3">
          <div className="flex items-center justify-between">
            <span className="font-display text-[7px] font-extrabold text-brand">Greenfield</span>
            <div className="flex gap-1.5">
              {[10, 8, 12].map((width, index) => (
                <span key={index} className="h-1 rounded-full bg-line" style={{ width }} />
              ))}
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <div className="flex-1">
              <p className="font-display text-[10px] font-extrabold leading-[1.05] tracking-[-0.04em] text-ink">
                Learning that
                <br />
                stays with you.
              </p>
              <p className="mt-1.5 text-[5.5px] leading-relaxed text-muted">
                A calm, ambitious school for curious children.
              </p>
              <span className="mt-2 inline-block rounded bg-brand px-1.5 py-0.5 text-[5.5px] font-bold text-white">
                Book a visit
              </span>
            </div>
            <div className="relative h-[70px] w-[84px] overflow-hidden rounded-md bg-gradient-to-br from-[#FFD9A8] to-[#FFB27A]">
              <div className="absolute -bottom-3 left-2 h-11 w-11 rounded-full bg-[#4B2BA8]/80" />
              <div className="absolute -right-2 top-2 h-8 w-8 rounded-full bg-[#7B5BFF]/70" />
              <div className="absolute bottom-2 right-2 h-5 w-12 rounded-sm bg-white/70" />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-3 right-4 inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[8px] font-semibold text-brand shadow-sm">
        <Globe2 className="h-3 w-3" />
        Live website included
      </div>
    </div>
  );
}

const features = [
  {
    icon: BookOpen,
    title: "Classes, lessons and assignments",
    copy: "Plan a term, share materials and set work that never leaves the school gate behind.",
    visual: <LessonsVisual />,
  },
  {
    icon: ClipboardCheck,
    title: "Results that publish themselves",
    copy: "Scores flow into report cards, positions and parent notifications with one approval.",
    visual: <ResultsVisual />,
  },
  {
    icon: LayoutGrid,
    title: "Administrative order",
    copy: "Every student, staff record, permission and session in a place that stays tidy.",
    visual: <AdminVisual />,
  },
  {
    icon: MonitorCheck,
    title: "CBT exams that run themselves",
    copy: "Build a paper, schedule it by class and let marking happen before the room clears.",
    visual: <CbtVisual />,
  },
  {
    icon: Boxes,
    title: "Inventory that warns you first",
    copy: "Know what is in the store, what moved this week and what needs reordering.",
    visual: <InventoryVisual />,
  },
  {
    icon: Globe2,
    title: "A school website you are proud of",
    copy: "Publish a clean public site and a parent portal without hiring another agency.",
    visual: <WebsiteVisual />,
  },
];

export function Features() {
  return (
    <section id="product" className="scroll-mt-24 bg-canvas py-20 sm:py-24">
      <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
        <SectionIntro
          eyebrow="The product"
          title={
            <>
              Run the whole school without running
              <span className="relative ml-2 inline-block text-brand">
                between systems.
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 320 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M2 9C70 3 180 2 318 7" stroke="hsl(var(--brand)/0.25)" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </>
          }
          copy="The average school day touches ten different systems. Eduschol brings the records, the money, the work and the people into one place, so nothing has to be copied twice."
        />

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={(index % 3) * 80}>
              <article className="hover-lift group flex h-full flex-col rounded-2xl border border-line bg-white p-3.5 shadow-sm">
                {feature.visual}
                <div className="flex flex-1 flex-col px-2 pb-1 pt-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-brand">
                    <feature.icon className="h-4 w-4" />
                  </span>
                  <h3 className="mt-3 text-[15.5px] font-bold tracking-[-0.02em] text-ink">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-muted">{feature.copy}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const roles = [
  {
    label: "Administrators",
    icon: Users,
    title: "See the whole school in one glance",
    bullets: [
      "Enrollment, attendance and fee collection on one dashboard",
      "Staff records, permissions and payroll ready exports",
      "Ask for a term summary and get one in seconds",
    ],
    preview: (
      <div className="space-y-2.5">
        {[
          { label: "Fees collected", value: "78%", width: "78%", tone: "bg-brand" },
          { label: "Attendance this week", value: "94%", width: "94%", tone: "bg-success" },
          { label: "Assignments submitted", value: "86%", width: "86%", tone: "bg-info" },
        ].map((row) => (
          <div key={row.label}>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted">{row.label}</span>
              <span className="font-bold text-ink">{row.value}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line-soft">
              <div className={cn("h-full rounded-full", row.tone)} style={{ width: row.width }} />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    label: "Teachers",
    icon: GraduationCap,
    title: "Teach first. Type less.",
    bullets: [
      "Mark a full class in under a minute on any phone",
      "Draft lesson notes and question sets from the curriculum",
      "Enter a score once, watch it flow into the report card",
    ],
    preview: (
      <div className="space-y-1.5">
        {[
          { name: "Chidera Eze", status: "Present", tone: "success" as const },
          { name: "Somto Eze", status: "Present", tone: "success" as const },
          { name: "Adaeze Nwosu", status: "Late", tone: "warning" as const },
        ].map((row) => (
          <div key={row.name} className="flex items-center gap-2 rounded-lg border border-line bg-white px-2 py-1.5">
            <Avatar name={row.name} size="xs" />
            <span className="flex-1 truncate text-[9px] font-medium text-ink">{row.name}</span>
            <Badge tone={row.tone}>{row.status}</Badge>
          </div>
        ))}
      </div>
    ),
  },
  {
    label: "Parents",
    icon: Sparkles,
    title: "Know before the meeting",
    bullets: [
      "Fees, results and attendance without calling the office",
      "A term calendar and announcements that reach the phone",
      "Ask a question in plain language, get the school's answer",
    ],
    preview: (
      <div className="space-y-2">
        <div className="flex items-center gap-2 rounded-lg border border-line bg-white p-2">
          <Avatar name="Somto Eze" size="sm" />
          <div className="flex-1">
            <p className="text-[9px] font-bold text-ink">Somto Eze</p>
            <p className="text-[7.5px] text-muted">JSS 3A, Term 1 average 63%</p>
          </div>
          <Badge tone="success">B</Badge>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-line bg-white px-2 py-1.5">
          <span className="text-[8.5px] text-muted">Fees balance</span>
          <span className="text-[8.5px] font-bold text-ink">₦0</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-line bg-white px-2 py-1.5">
          <span className="text-[8.5px] text-muted">Attendance</span>
          <span className="text-[8.5px] font-bold text-success">96%</span>
        </div>
      </div>
    ),
  },
];

export function Roles() {
  return (
    <section id="portals" className="scroll-mt-24 border-y border-line bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
        <SectionIntro
          eyebrow="Portals"
          title={
            <>
              One school.{" "}
              <span className="font-serif font-normal italic tracking-[-0.02em] text-brand">
                Three views.
              </span>
            </>
          }
          copy="Everyone sees the same truth, shaped for the decisions they actually make. Access is role based, so the bursary never sees lesson plans and a parent never sees another family."
        />

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {roles.map((role, index) => (
            <Reveal key={role.label} delay={index * 90}>
              <article className="hover-lift flex h-full flex-col rounded-2xl border border-line bg-canvas p-5">
                <div className="rounded-xl border border-line bg-white p-3.5 shadow-sm">{role.preview}</div>
                <div className="mt-5 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-soft text-brand">
                    <role.icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand">
                    {role.label}
                  </span>
                </div>
                <h3 className="mt-2 text-[19px] font-bold leading-tight tracking-[-0.03em] text-ink">
                  {role.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {role.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2 text-[12px] leading-relaxed text-muted">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white">
                        <Check className="h-2.5 w-2.5 text-success" />
                      </span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
