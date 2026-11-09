import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { PageLanding, SectionBlock, Bullets } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "About",
  description:
    "Eduschol is a school management system: admissions, attendance, results, CBT, fees and parent communication in one workspace.", // "Eduschol is a school management system from Ivents: admissions, attendance, results, CBT, fees and parent communication in one workspace.",
};

export default function AboutPage() {
  return (
    <PageLanding
      eyebrow="About"
      title="School software that keeps"
      accent="the record straight."
      intro={`Eduschol is a school operating system from ${site.company}. It holds admissions, attendance, results, CBT, fees, staff and parents in one place, so the office stops reconciling four versions of the same student.`}
      meta={`${site.companyLine} ${site.location}.`}
    >
      <SectionBlock title="What Eduschol does">
        <p>
          A student is admitted once. That record then carries them through the register, the
          gradebook, the fee ledger, the parent portal and the report card. Nothing is retyped
          between departments, and the term-end reconciliation is already finished when the term
          ends.
        </p>
        <p>
          The AI layer sits on top of those records rather than beside them. Every assistant answer
          is grounded in data the school actually holds; when a field is missing, it says so and
          points at the field instead of inventing a value. Draft comments and letters are always
          shown for a teacher or administrator to approve.
        </p>
      </SectionBlock>

      <SectionBlock title="Who it is for">
        <Bullets
          items={[
            "Private and international schools that run admissions, fees and results in-house.",
            "Head teachers and bursars who need one accurate view instead of spreadsheet handoffs.",
            "Teachers who want the arithmetic and the report narrative to come from the same scores.",
            "Parents who want attendance, invoices and published results without calling the office.",
          ]}
        />
      </SectionBlock>

      <SectionBlock title="How it is built">
        <p>
          Eduschol ships with a complete sample school so a team can click through every screen
          before entering real data. Each role — administrator, teacher, bursar, parent — sees only
          what that role should see: teachers do not see payroll or whole-school finance, and
          parents see only their own children.
        </p>
        <p>
          This build is a frontend demonstration. Accounts, records, payments and announcements
          live in your browser through local storage and are seeded with a realistic school.
          Nothing is sent anywhere.
        </p>
      </SectionBlock>

      <SectionBlock title="Who builds it">
        <p>
          {site.companyLine} Eduschol is built in {site.location}. For commercial enquiries,
          onboarding a school, or a question about the demo, write to{" "}
          <a
            className="font-semibold text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand"
            href={`mailto:${site.email}`}
          >
            {site.email}
          </a>
          .
        </p>
      </SectionBlock>

      <p>
        <Link
          href="/products"
          className="font-semibold text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand"
        >
          See the modules Eduschol includes
        </Link>{" "}
        or{" "}
        <Link
          href="/contact"
          className="font-semibold text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand"
        >
          contact the team
        </Link>
        .
      </p>
    </PageLanding>
  );
}
