import {
  Bell,
  Boxes,
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  MonitorCheck,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { AreaChart } from "@/components/ui/charts";
import { Mark } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Students", icon: Users },
  { label: "Staff", icon: GraduationCap },
  { label: "Attendance", icon: CalendarCheck },
  { label: "Results", icon: ClipboardList },
  { label: "CBT exams", icon: MonitorCheck },
  { label: "Fees", icon: Wallet },
  { label: "Inventory", icon: Boxes },
];

const stats = [
  { label: "Total students", value: "48", delta: "+6 this term", tone: "text-brand" },
  { label: "Teaching staff", value: "13", delta: "2 departments", tone: "text-info" },
  { label: "Attendance today", value: "94%", delta: "45 of 48 in", tone: "text-success" },
  { label: "Fees collected", value: "₦8.7m", delta: "78% of billed", tone: "text-warning" },
];

const classes = [
  { name: "P5", value: 6 },
  { name: "JSS1A", value: 8 },
  { name: "JSS1B", value: 7 },
  { name: "JSS2A", value: 8 },
  { name: "JSS3A", value: 7 },
  { name: "SS1", value: 6 },
  { name: "SS2", value: 6 },
];

const enrollment = [
  { label: "Mar", value: 32 },
  { label: "Apr", value: 34 },
  { label: "May", value: 36 },
  { label: "Jun", value: 36 },
  { label: "Jul", value: 40 },
  { label: "Aug", value: 43 },
  { label: "Sep", value: 45 },
  { label: "Oct", value: 48 },
];

export function DashboardMock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[20px] border border-white/25 bg-white text-left shadow-[0_60px_120px_-40px_rgba(18,8,60,0.55)]",
        className,
      )}
    >
      <div className="flex h-8 items-center gap-1.5 border-b border-line-soft bg-[#FBFAFE] px-3">
        <span className="h-2 w-2 rounded-full bg-[#FF7A7A]" />
        <span className="h-2 w-2 rounded-full bg-[#FFC96B]" />
        <span className="h-2 w-2 rounded-full bg-[#6AD6A4]" />
        <span className="mx-auto hidden items-center gap-1.5 rounded-md bg-white px-3 py-0.5 text-[8.5px] font-medium text-muted shadow-[inset_0_0_0_1px_hsl(var(--line))] sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          app.eduschol.com
        </span>
        <span className="w-10" />
      </div>

      <div className="flex">
        <aside className="hidden w-[158px] shrink-0 flex-col border-r border-line bg-white p-3 sm:flex">
          <div className="flex items-center gap-1.5 px-1 pb-3">
            <Mark className="h-4 w-4 text-brand" />
            <span className="font-display text-[11.5px] font-extrabold tracking-[-0.04em] text-ink">
              Eduschol
            </span>
          </div>
          <div className="space-y-0.5">
            {nav.map((item) => (
              <div
                key={item.label}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-[9px] font-semibold",
                  item.active ? "bg-brand text-white shadow-sm" : "text-muted",
                )}
              >
                <item.icon className="h-3 w-3" />
                {item.label}
              </div>
            ))}
            <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[9px] font-semibold text-brand">
              <Sparkles className="h-3 w-3" />
              AI assistant
            </div>
          </div>
          <div className="mt-auto rounded-lg bg-[#F5F2FF] p-2">
            <p className="text-[8px] font-bold text-brand-ink">Term 1, 2026/27</p>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white">
              <div className="h-full w-[62%] rounded-full bg-brand" />
            </div>
            <p className="mt-1 text-[7.5px] text-muted">Week 8 of 13</p>
          </div>
        </aside>

        <div className="min-w-0 flex-1 bg-[#F7F6FB]">
          <div className="flex h-11 items-center justify-between border-b border-line bg-white px-3 sm:px-4">
            <div>
              <p className="text-[9.5px] font-bold leading-tight text-ink">Welcome, Ngozi</p>
              <p className="text-[7.5px] leading-tight text-muted">Manage your school efficiently</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden h-6 w-[110px] items-center gap-1 rounded-md bg-line-soft px-2 text-[7.5px] text-muted sm:flex">
                <Search className="h-2.5 w-2.5" />
                Search anything
              </span>
              <span className="relative flex h-6 w-6 items-center justify-center rounded-md border border-line">
                <Bell className="h-3 w-3 text-muted" />
                <span className="absolute right-1.5 top-1.5 h-1 w-1 rounded-full bg-danger" />
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EFE9FF] text-[7.5px] font-bold text-brand-ink">
                NB
              </span>
            </div>
          </div>

          <div className="space-y-2.5 p-3 sm:p-3.5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[13px] font-extrabold tracking-[-0.03em] text-ink">Dashboard</p>
                <p className="text-[7.5px] text-muted">Overview of your school management system</p>
              </div>
              <span className="rounded-md border border-line bg-white px-2 py-1 text-[7px] font-semibold text-muted">
                This term
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              {stats.map((item) => (
                <div key={item.label} className="rounded-lg border border-line bg-white p-2.5 shadow-sm">
                  <p className="text-[7.5px] font-medium text-muted">{item.label}</p>
                  <p className="mt-1 text-[16px] font-extrabold leading-none tracking-[-0.03em] text-ink">
                    {item.value}
                  </p>
                  <p className={cn("mt-1 flex items-center gap-1 text-[6.5px] font-semibold", item.tone)}>
                    <TrendingUp className="h-2 w-2" />
                    {item.delta}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-2 lg:grid-cols-[1.45fr_1fr]">
              <div className="rounded-lg border border-line bg-white p-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[8.5px] font-bold text-ink">Student enrollment</p>
                    <p className="text-[6.5px] text-muted">Cumulative enrollment this year</p>
                  </div>
                  <span className="rounded-sm bg-success-soft px-1.5 py-0.5 text-[6.5px] font-bold text-success">
                    +16%
                  </span>
                </div>
                <AreaChart data={enrollment} height={118} label="Enrollment" />
              </div>

              <div className="rounded-lg border border-line bg-white p-2.5">
                <p className="text-[8.5px] font-bold text-ink">Class distribution</p>
                <p className="text-[6.5px] text-muted">Students per class</p>
                <div className="mt-3 flex h-[104px] items-end gap-1.5">
                  {classes.map((room) => (
                    <div key={room.name} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-[2px] bg-brand/85"
                        style={{ height: `${(room.value / 8) * 88}px` }}
                      />
                      <span className="text-[5.5px] font-medium text-muted">{room.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-2 lg:grid-cols-[1.45fr_1fr]">
              <div className="flex items-center gap-2.5 rounded-lg bg-[#2E1A76] p-2.5 text-white">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/15">
                  <Sparkles className="h-3 w-3" />
                </span>
                <div className="min-w-0">
                  <p className="text-[8px] font-bold">3 things need your attention</p>
                  <p className="truncate text-[6.5px] text-white/65">
                    4 students at risk, 6 unpaid families, Physics average dropped 6%
                  </p>
                </div>
                <span className="ml-auto hidden rounded-md bg-white px-2 py-1 text-[7px] font-bold text-brand-ink sm:block">
                  Review
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-line bg-white px-2.5 py-2">
                <div>
                  <p className="text-[7.5px] text-muted">Fees outstanding</p>
                  <p className="text-[12px] font-extrabold tracking-[-0.03em] text-ink">₦2.4m</p>
                </div>
                <div className="flex -space-x-1.5">
                  {["CO", "SE", "AD", "TM"].map((initials, index) => (
                    <span
                      key={initials}
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border-2 border-white text-[5.5px] font-bold",
                        ["bg-[#EEE9FF] text-brand-ink", "bg-[#E2F8EF] text-success", "bg-[#FFEFE2] text-warning", "bg-[#FFE9F0] text-danger"][index],
                      )}
                    >
                      {initials}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
