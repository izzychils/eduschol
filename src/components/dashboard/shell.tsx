"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Boxes,
  Bus,
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MonitorCheck,
  Search,
  Settings,
  Sparkles,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { Wordmark } from "@/components/ui/logo";
import { Avatar } from "@/components/ui/surface";
import { useSession } from "@/lib/session";
import { useSchool } from "@/lib/store";
import { atRiskStudents, guardianChildren, lowStock, outstandingInvoices } from "@/lib/analytics";
import { naira } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

type NavItem = {
  href: string;
  label: string;
  parentLabel?: string;
  teacherLabel?: string;
  icon: ComponentType<{ className?: string }>;
  roles: Role[];
  badge?: "students" | "risk" | "low" | "unpaid";
};

type Group = { label: string; items: NavItem[] };

const groups: Group[] = [
  {
    label: "School",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard, roles: ["admin", "teacher", "parent"] },
      {
        href: "/dashboard/students",
        label: "Students",
        parentLabel: "My children",
        teacherLabel: "My students",
        icon: Users,
        roles: ["admin", "teacher", "parent"],
        badge: "students",
      },
      { href: "/dashboard/staff", label: "Staff", icon: GraduationCap, roles: ["admin"] },
      { href: "/dashboard/classes", label: "Classes and timetable", teacherLabel: "My classes", icon: BookOpen, roles: ["admin", "teacher"] },
    ],
  },
  {
    label: "Academics",
    items: [
      { href: "/dashboard/attendance", label: "Attendance", icon: CalendarCheck, roles: ["admin", "teacher", "parent"] },
      { href: "/dashboard/results", label: "Results", icon: ClipboardList, roles: ["admin", "teacher", "parent"] },
      { href: "/dashboard/exams", label: "Exams and CBT", icon: MonitorCheck, roles: ["admin", "teacher"] },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        href: "/dashboard/fees",
        label: "Fees and finance",
        icon: Wallet,
        roles: ["admin", "parent"],
        badge: "unpaid",
      },
      { href: "/dashboard/inventory", label: "Inventory", icon: Boxes, roles: ["admin"], badge: "low" },
      { href: "/dashboard/transport", label: "Transport", icon: Bus, roles: ["admin", "parent"] },
    ],
  },
  {
    label: "Community",
    items: [
      { href: "/dashboard/communication", label: "Announcements", icon: Megaphone, roles: ["admin", "teacher", "parent"] },
      { href: "/dashboard/assistant", label: "AI assistant", icon: Sparkles, roles: ["admin", "teacher", "parent"] },
    ],
  },
];

const roleShortLabels: Record<Role, string> = {
  admin: "Admin",
  teacher: "Teacher",
  parent: "Parent",
};

export function roleHome(role: Role) {
  return role === "parent" ? "/dashboard/students" : "/dashboard";
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, ready, signOut } = useSession();
  const { workspace, ready: storeReady } = useSchool();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ready && !user) router.replace("/auth/sign-in");
  }, [ready, user, router]);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setAlertsOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setSearchOpen(false);
      if (alertRef.current && !alertRef.current.contains(event.target as Node)) setAlertsOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  const myChildren = useMemo(
    () => (workspace && user?.role === "parent" ? guardianChildren(workspace, user.email) : []),
    [workspace, user],
  );
  const childIds = useMemo(() => new Set(myChildren.map((child) => child.id)), [myChildren]);
  const myClassIds = useMemo(() => {
    if (!workspace || user?.role !== "teacher") return new Set<string>();
    const me =
      workspace.staff.find((member) => member.email.toLowerCase() === user.email.toLowerCase()) ??
      workspace.staff.find((member) => member.name.toLowerCase() === user.name.toLowerCase());
    return new Set(workspace.classes.filter((room) => room.teacherId === me?.id).map((room) => room.id));
  }, [workspace, user]);
  const scopedStudents = useMemo(() => {
    if (!workspace) return [];
    if (user?.role === "parent") return myChildren;
    if (user?.role === "teacher") {
      return workspace.students.filter((student) => student.status === "active" && myClassIds.has(student.classId));
    }
    return workspace.students.filter((student) => student.status === "active");
  }, [workspace, user, myChildren, myClassIds]);
  const risk = useMemo(() => (workspace ? atRiskStudents(workspace) : []), [workspace]);
  const unpaid = useMemo(() => (workspace ? outstandingInvoices(workspace) : []), [workspace]);
  const low = useMemo(() => (workspace ? lowStock(workspace) : []), [workspace]);

  const badges = {
    students: scopedStudents.length,
    risk: user?.role === "parent" ? risk.filter((row) => childIds.has(row.student.id)).length : risk.length,
    low: low.length,
    unpaid:
      user?.role === "parent"
        ? unpaid.filter((invoice) => childIds.has(invoice.studentId)).length
        : unpaid.length,
  };

  const results = useMemo(() => {
    const clean = query.trim().toLowerCase();
    if (!clean || !workspace) return [];
    const pages = groups
      .flatMap((group) => group.items)
      .filter((item) => user && item.roles.includes(user.role))
      .filter((item) => item.label.toLowerCase().includes(clean))
      .slice(0, 3)
      .map((item) => ({ href: item.href, title: item.label, meta: "Page", icon: item.icon }));
    const students = workspace.students
      .filter(
        (student) =>
          `${student.firstName} ${student.lastName}`.toLowerCase().includes(clean) ||
          student.admissionNo.toLowerCase().includes(clean),
      )
      .slice(0, 4)
      .map((student) => ({
        href: `/dashboard/students/${student.id}`,
        title: `${student.firstName} ${student.lastName}`,
        meta: student.admissionNo,
        icon: Users,
      }));
    const staff = workspace.staff
      .filter((member) => member.name.toLowerCase().includes(clean))
      .slice(0, 3)
      .map((member) => ({
        href: "/dashboard/staff",
        title: member.name,
        meta: member.title,
        icon: GraduationCap,
      }));
    return [...pages, ...students, ...staff];
  }, [query, workspace, user]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="flex flex-col items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand text-white">
            <GraduationCap className="h-5 w-5" />
          </span>
          <p className="text-[11.5px] text-muted">Opening your workspace</p>
        </div>
      </div>
    );
  }

  const visibleGroups = groups
    .map((group) => ({ ...group, items: group.items.filter((item) => item.roles.includes(user.role)) }))
    .filter((group) => group.items.length > 0);

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const scopedRisk =
    user.role === "parent"
      ? risk.filter((row) => childIds.has(row.student.id))
      : user.role === "teacher"
        ? risk.filter((row) => myClassIds.has(row.student.classId))
        : risk;
  const scopedUnpaid = user.role === "parent" ? unpaid.filter((invoice) => childIds.has(invoice.studentId)) : unpaid;
  const showFinanceAlerts = user.role === "admin" || user.role === "parent";

  const notifications = [
    ...scopedRisk.slice(0, 3).map((row) => ({
      id: `risk-${row.student.id}`,
      title: `${row.student.firstName} ${row.student.lastName} needs attention`,
      copy: row.reasons[0],
      href: `/dashboard/students/${row.student.id}`,
      tone: "warning" as const,
    })),
    ...(showFinanceAlerts ? scopedUnpaid.slice(0, 2) : []).map((invoice) => {
      const student = workspace?.students.find((item) => item.id === invoice.studentId);
      const balance = invoice.items.reduce((total, item) => total + item.amount, 0) - invoice.paid;
      return {
        id: invoice.id,
        title: `${student?.firstName ?? "Student"} has an unpaid balance`,
        copy: `${naira(balance)} still outstanding this term`,
        href: "/dashboard/fees",
        tone: "danger" as const,
      };
    }),
    ...(user.role === "admin" ? low.slice(0, 2) : []).map((item) => ({
      id: item.id,
      title: `${item.name} is below its reorder level`,
      copy: `${item.quantity} ${item.unit} left in ${item.location}`,
      href: "/dashboard/inventory",
      tone: "info" as const,
    })),
  ];

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-[68px] shrink-0 items-center justify-between px-5">
        <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
          <Wordmark />
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-line-soft lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mx-3 mb-4 rounded-xl border border-line bg-canvas/70 p-2.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand text-[11px] font-extrabold text-white">
            {workspace?.school.name.slice(0, 2).toUpperCase() ?? "GF"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11.5px] font-bold text-ink">
              {workspace?.school.name ?? "Greenfield Academy"}
            </p>
            <p className="truncate text-[9.5px] text-muted">
              {workspace ? `${workspace.school.term}, ${workspace.school.session}` : "Term 1"}
            </p>
          </div>
          <span className="rounded-md bg-white px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wide text-brand">
            {roleShortLabels[user.role]}
          </span>
        </div>
      </div>

      <nav className="no-scrollbar flex-1 space-y-5 overflow-y-auto px-3 pb-4" aria-label="Dashboard">
        {visibleGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-2.5 text-[9px] font-bold uppercase tracking-[0.16em] text-muted/70">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                const count = item.badge ? badges[item.badge] : 0;
                const label =
                  user.role === "parent" && item.parentLabel
                    ? item.parentLabel
                    : user.role === "teacher" && item.teacherLabel
                      ? item.teacherLabel
                      : item.label;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[11.5px] font-semibold transition-all duration-200",
                      active ? "bg-brand text-white shadow-[0_8px_18px_-12px_hsl(var(--brand)/0.9)]" : "text-ink/65 hover:bg-canvas hover:text-ink",
                    )}
                  >
                    <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-muted group-hover:text-brand")} />
                    <span className="flex-1 truncate">{label}</span>
                    {item.badge && count > 0 ? (
                      <span
                        className={cn(
                          "rounded-full px-1.5 text-[9px] font-bold leading-4",
                          active
                            ? "bg-white/20 text-white"
                            : item.badge === "unpaid" || item.badge === "low"
                              ? "bg-danger-soft text-danger"
                              : "bg-line-soft text-muted",
                        )}
                      >
                        {count}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 space-y-2 border-t border-line p-3">
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[11.5px] font-semibold transition-colors",
            isActive("/dashboard/settings") ? "bg-brand-soft text-brand-ink" : "text-ink/60 hover:bg-canvas hover:text-ink",
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <div className="flex items-center gap-2.5 rounded-xl border border-line bg-white p-2">
          <Avatar name={user.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-bold text-ink">{user.name}</p>
            <p className="truncate text-[9.5px] text-muted">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              signOut();
              router.replace("/auth/sign-in");
            }}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger-soft hover:text-danger"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[236px] border-r border-line bg-white lg:block">
        {sidebar}
      </aside>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu overlay"
          />
          <div className="sheet-in absolute inset-y-0 left-0 w-[268px] max-w-[82vw] border-r border-line bg-white shadow-2xl">
            {sidebar}
          </div>
        </div>
      ) : null}

      <div className="lg:pl-[236px]">
        <header className="sticky top-0 z-20 border-b border-line bg-canvas/85 backdrop-blur-xl">
          <div className="flex h-[60px] items-center gap-2 px-4 sm:px-6 lg:h-[64px]">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-white text-ink lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div ref={searchRef} className="relative w-full max-w-[340px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search students, staff or a page"
                aria-label="Search the workspace"
                className="field field-flat h-9 pl-9 pr-3 text-[11.5px]"
              />
              {searchOpen && query.trim() ? (
                <div className="sheet-in absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-xl border border-line bg-white p-1.5 shadow-[0_24px_50px_-20px_rgba(35,27,70,0.35)]">
                  {results.length ? (
                    results.map((result) => (
                      <Link
                        key={`${result.href}-${result.title}`}
                        href={result.href}
                        onClick={() => {
                          setSearchOpen(false);
                          setQuery("");
                        }}
                        className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-canvas"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-soft text-brand">
                          <result.icon className="h-3.5 w-3.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[11.5px] font-semibold text-ink">{result.title}</span>
                          <span className="block truncate text-[9.5px] text-muted">{result.meta}</span>
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted" />
                      </Link>
                    ))
                  ) : (
                    <p className="px-2 py-4 text-center text-[11px] text-muted">
                      Nothing matches that search yet.
                    </p>
                  )}
                </div>
              ) : null}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1.5 text-[10px] font-semibold text-muted md:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                {workspace ? `${workspace.school.term} · ${workspace.school.session}` : "Term 1"}
              </span>

              <div ref={alertRef} className="relative">
                <button
                  type="button"
                  onClick={() => setAlertsOpen((value) => !value)}
                  className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-ink transition-colors hover:bg-brand-soft/40"
                  aria-label="Notifications"
                  aria-expanded={alertsOpen}
                >
                  <Bell className="h-4 w-4" />
                  {notifications.length ? (
                    <span className="absolute right-1.5 top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-danger px-0.5 text-[8px] font-bold text-white">
                      {notifications.length}
                    </span>
                  ) : null}
                </button>
                {alertsOpen ? (
                  <div className="sheet-in absolute right-0 top-[calc(100%+8px)] z-30 w-[290px] overflow-hidden rounded-xl border border-line bg-white shadow-[0_24px_50px_-20px_rgba(35,27,70,0.35)] sm:w-[330px]">
                    <div className="flex items-center justify-between border-b border-line px-3.5 py-2.5">
                      <p className="text-[11.5px] font-bold text-ink">Needs a look</p>
                      <span className="text-[9.5px] font-semibold text-muted">{notifications.length} signals</span>
                    </div>
                    <div className="max-h-[320px] overflow-y-auto p-1.5">
                      {notifications.map((item) => (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={() => setAlertsOpen(false)}
                          className="flex gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-canvas"
                        >
                          <span
                            className={cn(
                              "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                              item.tone === "danger" ? "bg-danger" : item.tone === "warning" ? "bg-warning" : "bg-info",
                            )}
                          />
                          <span className="min-w-0">
                            <span className="block text-[10.5px] font-semibold leading-snug text-ink">{item.title}</span>
                            <span className="mt-0.5 block text-[9.5px] leading-snug text-muted">{item.copy}</span>
                          </span>
                        </Link>
                      ))}
                      {!notifications.length ? (
                        <p className="px-2 py-5 text-center text-[11px] text-muted">Nothing flagged right now.</p>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>

              <Link
                href="/dashboard/settings"
                className="hidden items-center gap-2 rounded-lg border border-line bg-white py-1 pl-1 pr-2.5 sm:flex"
              >
                <Avatar name={user.name} size="xs" />
                <span className="max-w-[90px] truncate text-[10.5px] font-semibold text-ink">
                  {user.name.split(" ")[0]}
                </span>
              </Link>
            </div>
          </div>
        </header>

        <main key={pathname} className="route-in px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
          {!storeReady ? (
            <div className="flex min-h-[50vh] items-center justify-center">
              <p className="text-[11.5px] text-muted">Loading school records</p>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
