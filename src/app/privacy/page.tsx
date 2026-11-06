import type { Metadata } from "next";
import { site } from "@/lib/site";
import { PageLanding, SectionBlock, Bullets } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} handles student, staff and parent information. This demo build keeps everything in your browser.`,
};

export default function PrivacyPage() {
  return (
    <PageLanding
      eyebrow="Privacy Policy"
      title="Student records deserve"
      accent="careful handling."
      intro={`${site.name} is currently a frontend demonstration with no backend and no analytics service connected. This page explains exactly what that means for the school records you see in the demo.`}
      meta={`Last updated ${site.lastUpdated}`}
    >
      <SectionBlock title="Who we are">
        <p>
          {site.name} is a product of {site.company}, {site.location}. For any privacy question, or
          to ask that something be removed, write to{" "}
          <a
            className="font-semibold text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand"
            href={`mailto:${site.email}`}
          >
            {site.email}
          </a>
          .
        </p>
      </SectionBlock>

      <SectionBlock title="What the demo stores">
        <p>
          Accounts, student records, attendance, scores, invoices and announcements are kept in
          your browser's local storage on the device you used, seeded with a realistic sample
          school. Nothing is sent to an {site.name} server.
        </p>
        <p>
          There is no account database to look up, no email is delivered by the demo and no payment
          is processed.
        </p>
      </SectionBlock>

      <SectionBlock title="What we do not collect">
        <Bullets
          items={[
            "No analytics, advertising identifiers or tracking pixels.",
            "No payment or card details. Invoices in the demo are illustrative.",
            "No passwords are stored. The demo keeps only the signed-in profile.",
            "No uploaded documents are transmitted or stored.",
            "No student data leaves the browser you used.",
          ]}
        />
      </SectionBlock>

      <SectionBlock title="School data in a real deployment">
        <p>
          A live school running {site.name} would hold the personal data of minors, which requires a
          higher standard than most software. When a backend is connected, this page will state
          what is stored on the server, the lawful basis for processing it, how long it is
          retained, who can access it and how a guardian can request correction or deletion.
        </p>
        <p>
          The school remains the data controller for its students and staff; {site.company}
          provides the tooling and processes that data only on the school's instructions.
        </p>
      </SectionBlock>

      <SectionBlock title="Access and your choices">
        <p>
          Each role in the demo sees only what that role should see: teachers see their classes,
          parents see only their own children, and finance stays with the bursar and head. Clearing
          site data for this address removes everything the demo stored.
        </p>
      </SectionBlock>

      <section className="rounded-xl border border-line bg-canvas p-4">
        <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-muted/70">Demo note</p>
        <p className="mt-2 text-[11px] leading-relaxed text-muted">
          This policy describes a prototype build and is not legal advice. It should be reviewed
          before a production launch.
        </p>
      </section>
    </PageLanding>
  );
}
