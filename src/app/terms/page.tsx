import type { Metadata } from "next";
import { site } from "@/lib/site";
import { PageLanding, SectionBlock, Bullets } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms that apply to using ${site.name}, a school management product from ${site.company}.`,
};

export default function TermsPage() {
  return (
    <PageLanding
      eyebrow="Terms of Service"
      title="What you can expect from us,"
      accent="and what we expect from you."
      intro={`These terms govern your use of ${site.name}, a school operating system from ${site.company}. By using the site you accept them.`}
      meta={`Last updated ${site.lastUpdated}`}
    >
      <SectionBlock title="Who you are agreeing with">
        <p>
          {site.name} is operated by {site.company}, {site.address}. Where these terms say "we" or
          "us", that is {site.company}; "you" means the person or school using the site.
        </p>
      </SectionBlock>

      <SectionBlock title="This is a demonstration build">
        <p>
          The current site is a frontend demo with no backend. The sample school, any records you
          create, invoices and announcements live only in your browser and disappear if you clear
          site data. No fee is charged and no service obligation is created by using the demo.
        </p>
      </SectionBlock>

      <SectionBlock title="Acceptable use">
        <Bullets
          items={[
            "Use the site to evaluate Eduschol or to run your school's workspace.",
            "Do not enter real student data into a demonstration workspace you do not control.",
            "Do not attempt to disrupt, reverse engineer or overload the site or its infrastructure.",
            "Do not copy the design, content or code into another product without permission.",
            "Do not use the site to misrepresent a school you do not represent.",
          ]}
        />
      </SectionBlock>

      <SectionBlock title="Accounts and roles">
        <p>
          Sign-in on this build is local to your browser. Where real accounts exist, the school is
          responsible for who it gives access to, for keeping credentials secure and for telling us
          promptly if access has been compromised. School administrators remain responsible for the
          accuracy of records and for obtaining any consent required from parents or guardians.
        </p>
      </SectionBlock>

      <SectionBlock title="Fees and payments">
        <p>
          {site.name} does not process payments on this build and never stores card details. Fee
          invoices shown in the demo are illustrative. Paid access is governed by a separate
          written agreement with {site.company}.
        </p>
      </SectionBlock>

      <SectionBlock title="Intellectual property">
        <p>
          The {site.name} name, design, copy and code belong to {site.company} or its licensors.
          Your school's records, marks and photographs remain yours; you grant us only the
          permission needed to operate the workspace for you.
        </p>
      </SectionBlock>

      <SectionBlock title="Availability and changes">
        <p>
          The demo is provided as is, without warranties of any kind. We may change, suspend or
          withdraw it at any time. We may update these terms; the date at the top of this page will
          change when we do.
        </p>
      </SectionBlock>

      <SectionBlock title="Limitation of liability">
        <p>
          To the extent the law allows, {site.company} is not liable for indirect or consequential
          loss, lost profits or lost data arising from use of this demonstration. Nothing here
          limits liability that cannot lawfully be limited.
        </p>
      </SectionBlock>

      <SectionBlock title="Questions">
        <p>
          Contact{" "}
          <a
            className="font-semibold text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand"
            href={`mailto:${site.email}`}
          >
            {site.email}
          </a>{" "}
          about these terms, or read the{" "}
          <a
            href="/privacy"
            className="font-semibold text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand"
          >
            privacy policy
          </a>
          .
        </p>
      </SectionBlock>

      <section className="rounded-xl border border-line bg-canvas p-4">
        <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-muted/70">Demo note</p>
        <p className="mt-2 text-[11px] leading-relaxed text-muted">
          These terms cover a prototype build and are not legal advice. They should be reviewed by
          a qualified lawyer before a production launch.
        </p>
      </section>
    </PageLanding>
  );
}
