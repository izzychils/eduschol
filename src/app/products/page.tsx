import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { PageLanding, SectionBlock } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "Products",
  description:
    "The Eduschol modules: admissions, attendance, results and CBT, fees, staff records and the parent portal.",
};

const modules = [
  {
    name: "Admissions",
    audience: "For the front office",
    copy: "Applications, offers, enrolment and class placement in one flow. An admitted student becomes a full record instead of a row in a spreadsheet.",
  },
  {
    name: "Attendance",
    audience: "For form teachers",
    copy: "One-hand roll call per class, per day. Absences roll up into the term summary a parent sees, with no separate register to reconcile.",
  },
  {
    name: "Results and CBT",
    audience: "For academic staff",
    copy: "Scores are entered once per subject and assessment. Eduschol totals them, assigns grades on your scale, ranks the class, and lays out a printable report sheet for review.",
  },
  {
    name: "Fees and billing",
    audience: "For the bursary",
    copy: "Invoices, payments and balances against the student record, so term-end reconciliation is a report rather than three days of matching.",
  },
  {
    name: "Staff and roles",
    audience: "For administrators",
    copy: "Staff records, departments and role-based access. Teachers see their classes; payroll and whole-school finance stay with the bursar and head.",
  },
  {
    name: "Parent portal",
    audience: "For guardians",
    copy: "Attendance, invoices and published results for their own children only, readable on a phone in four taps.",
  },
];

export default function ProductsPage() {
  return (
    <PageLanding
      eyebrow="Products"
      title="Six modules,"
      accent="one record of truth."
      intro="Every Eduschol module reads and writes the same student record. You can adopt them together or start with admissions and grow into results and fees."
      meta={`${site.companyLine} Sample school included.`}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {modules.map((module) => (
          <div key={module.name} className="rounded-[18px] border border-line bg-canvas p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-[15px] font-bold tracking-[-0.02em] text-ink">{module.name}</h2>
              <span className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-muted/70">
                {module.audience}
              </span>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-muted">{module.copy}</p>
          </div>
        ))}
      </div>

      <SectionBlock title="Who Eduschol serves">
        <p>
          Administrators, head teachers, bursars, form teachers and parents at schools that would
          rather keep one accurate record than reconcile several. If your terms currently end with
          three departments comparing spreadsheets, this is the problem Eduschol removes.
        </p>
      </SectionBlock>

      <SectionBlock title="The intelligence layer">
        <p>
          The academic assistants read from the records already in the workspace. Ask for a class
          summary, a draft report comment or a parent letter and the answer is built from real
          scores and real attendance — then shown to a human for approval before anything is sent.
        </p>
      </SectionBlock>

      <p>
        Ready to try it?{" "}
        <Link
          href="/auth/sign-in"
          className="font-semibold text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand"
        >
          Open the sample school
        </Link>{" "}
        or{" "}
        <Link
          href="/contact"
          className="font-semibold text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand"
        >
          talk to {site.company}
        </Link>
        .
      </p>
    </PageLanding>
  );
}
