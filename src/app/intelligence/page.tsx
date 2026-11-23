import type { Metadata } from "next";
import Link from "next/link";
import { BrainCircuit, FileText, MessageSquare, Shield, Sparkles, Users } from "lucide-react";
import { site } from "@/lib/site";
import { PageLanding, SectionBlock, Bullets } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "Intelligence",
  description:
    "AI-powered academic assistant for drafting report comments, generating parent letters, analyzing class performance and answering administrative questions - all grounded in your school's actual records.",
};

export default function IntelligencePage() {
  return (
    <PageLanding
      eyebrow="Intelligence"
      title="The AI layer that reads"
      accent="your records."
      intro="Eduschol's intelligence layer sits on top of admissions, attendance, results and fees - never beside them. Every answer is built from data your school actually holds, and drafts always wait for a human to approve."
      meta={`${site.companyLine} Grounded, not invented.`}
    >
      <SectionBlock title="What the intelligence layer does">
        <p>
          The academic assistant drafts report comments from real scores, generates parent letters
          from actual attendance records, and answers administrative questions from the student and
          staff data already in the workspace. When a field is missing, it says so and points at the
          gap instead of inventing a value.
        </p>
        <p>
          Every draft is shown to a teacher or administrator for review before anything is sent or
          published. The AI suggests, the human approves - never the other way around.
        </p>
      </SectionBlock>

      <SectionBlock title="Six intelligence features">
        <div className="space-y-5">
          <div className="flex gap-4 rounded-[16px] border border-line bg-canvas p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brand/20 bg-brand/5">
              <FileText className="h-4.5 w-4.5 text-brand" />
            </span>
            <div>
              <h3 className="text-[13.5px] font-bold tracking-[-0.01em] text-ink">
                Report comment drafts
              </h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
                Ask for a subject comment for a specific student and the AI reads their scores,
                attendance and any notes already on file. The draft references real assessments, not
                imagined progress.
              </p>
            </div>
          </div>

          <div className="flex gap-4 rounded-[16px] border border-line bg-canvas p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brand/20 bg-brand/5">
              <MessageSquare className="h-4.5 w-4.5 text-brand" />
            </span>
            <div>
              <h3 className="text-[13.5px] font-bold tracking-[-0.01em] text-ink">
                Parent letters
              </h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
                Generate letters for individual parents or whole classes. Attendance percentages,
                outstanding balances and term dates are pulled from live data, not placeholders.
              </p>
            </div>
          </div>

          <div className="flex gap-4 rounded-[16px] border border-line bg-canvas p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brand/20 bg-brand/5">
              <BrainCircuit className="h-4.5 w-4.5 text-brand" />
            </span>
            <div>
              <h3 className="text-[13.5px] font-bold tracking-[-0.01em] text-ink">
                Class performance analysis
              </h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
                Ask "which students are struggling in Mathematics?" or "how did JSS2 perform this
                term?" and get answers grounded in the gradebook, with names and scores you can
                verify.
              </p>
            </div>
          </div>

          <div className="flex gap-4 rounded-[16px] border border-line bg-canvas p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brand/20 bg-brand/5">
              <Users className="h-4.5 w-4.5 text-brand" />
            </span>
            <div>
              <h3 className="text-[13.5px] font-bold tracking-[-0.01em] text-ink">
                Attendance patterns
              </h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
                Identify students with declining attendance, generate alerts for parents, or summarize
                whole-class trends across the term - all from the register data already captured.
              </p>
            </div>
          </div>

          <div className="flex gap-4 rounded-[16px] border border-line bg-canvas p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brand/20 bg-brand/5">
              <Shield className="h-4.5 w-4.5 text-brand" />
            </span>
            <div>
              <h3 className="text-[13.5px] font-bold tracking-[-0.01em] text-ink">
                Administrative queries
              </h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
                Answer questions like "how many students are enrolled in SS1?" or "which parents have
                outstanding balances?" without building a report from scratch. The assistant retrieves
                the data and formats the answer.
              </p>
            </div>
          </div>

          <div className="flex gap-4 rounded-[16px] border border-line bg-canvas p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brand/20 bg-brand/5">
              <Sparkles className="h-4.5 w-4.5 text-brand" />
            </span>
            <div>
              <h3 className="text-[13.5px] font-bold tracking-[-0.01em] text-ink">
                Intervention suggestions
              </h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
                Based on attendance, results and behaviour notes, the assistant can suggest which
                students may need additional support, parent meetings or academic interventions.
              </p>
            </div>
          </div>
        </div>
      </SectionBlock>

      <SectionBlock title="What it will not do">
        <Bullets
          items={[
            "It will not invent scores, attendance records or student details when data is missing.",
            "It will not send emails, publish results or update records without human approval.",
            "It will not share data between roles - teachers cannot query whole-school finance through the assistant.",
            "It will not train public models on your school's data or share records with third parties.",
          ]}
        />
      </SectionBlock>

      <SectionBlock title="How to use it">
        <p>
          The intelligence layer is built into the Eduschol workspace and accessed through the
          assistant panel. Teachers can ask for comment drafts from their classes, administrators can
          query enrolment and finance, and bursars can generate fee reminder letters.
        </p>
        <p>
          Every role sees only what they already have permission to see. A form teacher cannot ask
          about staff payroll, and a parent cannot query other students through the portal assistant.
        </p>
      </SectionBlock>

      <div className="mt-10 rounded-[20px] border border-brand/20 bg-gradient-to-br from-brand/[0.03] to-brand/[0.08] p-6">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand text-white">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-[14px] font-bold tracking-[-0.01em] text-ink">
              Try the intelligence layer in the sample school
            </h3>
            <p className="mt-2 text-[12px] leading-relaxed text-muted">
              The demonstration workspace includes a full term of attendance, results and fee records.
              Log in and ask the assistant about class performance, attendance patterns or draft a
              report comment.
            </p>
            <Link
              href="/auth/sign-in"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-[10px] bg-brand px-5 text-[12.5px] font-semibold text-white shadow-[0_6px_20px_-8px_rgba(109,40,217,0.6)] transition-all hover:bg-brand-hover"
            >
              Open sample school
            </Link>
          </div>
        </div>
      </div>

      <p>
        <Link
          href="/products"
          className="font-semibold text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand"
        >
          See the full module list
        </Link>{" "}
        or{" "}
        <Link
          href="/contact"
          className="font-semibold text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand"
        >
          contact {site.company}
        </Link>
        .
      </p>
    </PageLanding>
  );
}
