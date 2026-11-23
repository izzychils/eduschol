import type { Metadata } from "next";
import Link from "next/link";
import { Bell, Calendar, CreditCard, FileText, GraduationCap, Shield, Smartphone, Users } from "lucide-react";
import { site } from "@/lib/site";
import { PageLanding, SectionBlock, Bullets } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "Portals",
  description:
    "Role-based access for parents, teachers, students and administrators. Everyone sees what they need, nothing they should not.",
};

export default function PortalsPage() {
  return (
    <PageLanding
      eyebrow="Portals"
      title="One platform,"
      accent="four views."
      intro="Eduschol gives every role its own portal: parents see their children's records, teachers see their classes, students access their results, and administrators see the whole school. No shared passwords, no universal access."
      meta={`${site.companyLine} Role-based from the start.`}
    >
      <SectionBlock title="The four portals">
        <div className="space-y-5">
          <div className="rounded-[18px] border border-line bg-canvas p-5">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-brand/20 bg-brand/5">
                <Users className="h-5 w-5 text-brand" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-bold tracking-[-0.01em] text-ink">Parent portal</h3>
                <p className="mt-2 text-[12px] leading-relaxed text-muted">
                  Parents log in with their phone number or email and see their own children only:
                  attendance summary, published results, fee invoices and payment history,
                  announcements from the school, and direct messaging with teachers. Everything is
                  readable on a phone in four taps.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Attendance", "Results", "Invoices", "Announcements", "Messages"].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-line bg-white px-2.5 py-1 text-[10px] font-semibold text-muted"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[18px] border border-line bg-canvas p-5">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-brand/20 bg-brand/5">
                <GraduationCap className="h-5 w-5 text-brand" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-bold tracking-[-0.01em] text-ink">Teacher portal</h3>
                <p className="mt-2 text-[12px] leading-relaxed text-muted">
                  Teachers see their assigned classes, subjects and students. They can mark
                  attendance, enter scores, draft report comments with AI assistance, and message
                  parents directly. Teachers do not see payroll, whole-school finance or students
                  outside their classes.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Attendance", "Gradebook", "Report comments", "Parent messages", "Class lists"].map(
                    (item) => (
                      <span
                        key={item}
                        className="rounded-full border border-line bg-white px-2.5 py-1 text-[10px] font-semibold text-muted"
                      >
                        {item}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[18px] border border-line bg-canvas p-5">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-brand/20 bg-brand/5">
                <Smartphone className="h-5 w-5 text-brand" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-bold tracking-[-0.01em] text-ink">Student portal</h3>
                <p className="mt-2 text-[12px] leading-relaxed text-muted">
                  Students access their own attendance, published results, timetable and CBT exams.
                  They cannot see other students' records, fee balances or administrative data. The
                  student portal is optional and can be disabled per class or whole school.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["My results", "Attendance", "Timetable", "CBT exams", "Announcements"].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-line bg-white px-2.5 py-1 text-[10px] font-semibold text-muted"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[18px] border border-line bg-canvas p-5">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-brand/20 bg-brand/5">
                <Shield className="h-5 w-5 text-brand" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-bold tracking-[-0.01em] text-ink">
                  Administrator portal
                </h3>
                <p className="mt-2 text-[12px] leading-relaxed text-muted">
                  School administrators, head teachers and bursars see the full workspace: admissions,
                  enrolment, staff records, fee ledger, results publication, system settings and
                  AI-assisted queries across all modules. Permissions are granular - a bursar can see
                  fees but not edit academic results.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    "Admissions",
                    "Staff",
                    "Fees",
                    "Results",
                    "Settings",
                    "Reports",
                    "AI assistant",
                  ].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-line bg-white px-2.5 py-1 text-[10px] font-semibold text-muted"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionBlock>

      <SectionBlock title="What every portal includes">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-[14px] border border-line bg-white p-4">
            <Bell className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand" />
            <div>
              <h4 className="text-[12.5px] font-bold text-ink">Real-time notifications</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">
                Announcements, fee reminders and result publications appear immediately in the
                relevant portal.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-[14px] border border-line bg-white p-4">
            <Smartphone className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand" />
            <div>
              <h4 className="text-[12.5px] font-bold text-ink">Mobile first</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">
                Every portal works on phones and tablets. Parents do not need a laptop to check
                invoices or attendance.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-[14px] border border-line bg-white p-4">
            <FileText className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand" />
            <div>
              <h4 className="text-[12.5px] font-bold text-ink">Offline reading</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">
                Results, invoices and announcements can be read offline after they are loaded once.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-[14px] border border-line bg-white p-4">
            <CreditCard className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand" />
            <div>
              <h4 className="text-[12.5px] font-bold text-ink">Payment integration</h4>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">
                Parents can pay invoices directly from the portal via card, bank transfer or USSD.
              </p>
            </div>
          </div>
        </div>
      </SectionBlock>

      <SectionBlock title="Security and privacy">
        <Bullets
          items={[
            "Every login is scoped to a single role. A parent cannot log in as a teacher, and vice versa.",
            "Parents see only their own children - never classmates or other families.",
            "Students cannot access fee balances, staff records or administrative data.",
            "Teachers see only their assigned classes and subjects.",
            "All communication between portals is logged and can be audited by administrators.",
          ]}
        />
      </SectionBlock>

      <SectionBlock title="Inviting users">
        <p>
          Administrators send portal invitations by email or SMS. Parents and students receive a link
          to set their own password. Teachers and staff are onboarded through the staff module and
          assigned classes and permissions from the administrator portal.
        </p>
        <p>
          Invitations can be sent in bulk during enrolment or individually as new students join. No
          spreadsheet coordination required.
        </p>
      </SectionBlock>

      <div className="mt-10 rounded-[20px] border border-line bg-gradient-to-br from-canvas to-white p-6">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-brand/20 bg-brand/5">
            <Users className="h-5 w-5 text-brand" />
          </span>
          <div>
            <h3 className="text-[14px] font-bold tracking-[-0.01em] text-ink">
              See all four portals in the sample school
            </h3>
            <p className="mt-2 text-[12px] leading-relaxed text-muted">
              The demonstration workspace includes sample accounts for a parent, teacher, student and
              administrator. Switch between roles to see how each portal presents the same underlying
              data.
            </p>
            <Link
              href="/auth/sign-in"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-[10px] border-2 border-brand px-5 text-[12.5px] font-semibold text-brand transition-all hover:bg-brand hover:text-white"
            >
              Explore the demo
            </Link>
          </div>
        </div>
      </div>

      <p>
        <Link
          href="/products"
          className="font-semibold text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand"
        >
          See the modules each portal includes
        </Link>{" "}
        or{" "}
        <Link
          href="/contact"
          className="font-semibold text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand"
        >
          ask {site.company} about onboarding
        </Link>
        .
      </p>
    </PageLanding>
  );
}
