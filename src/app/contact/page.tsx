import type { Metadata } from "next";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { site } from "@/lib/site";
import { PageLanding, SectionBlock } from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${site.company} about Eduschol — demos, onboarding a school, pricing or support.`,
};

export default function ContactPage() {
  return (
    <PageLanding
      eyebrow="Contact"
      title="Talk to the people who"
      accent="build the thing."
      intro="Tell us the size of your school and the part of the term that costs you the most time. That is usually enough to say whether Eduschol fits."
      meta={`${site.companyLine} ${site.location}.`}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { icon: Mail, label: "General", value: site.email, href: `mailto:${site.email}` },
          {
            icon: Mail,
            label: "Support",
            value: site.supportEmail,
            href: `mailto:${site.supportEmail}`,
          },
          { icon: Phone, label: "Phone", value: site.phone, href: `tel:${site.phone.replace(/\s/g, "")}` },
          { icon: MapPin, label: "Office", value: site.address },
          { icon: Clock, label: "We reply", value: "Within two working days" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-[18px] border border-line bg-canvas p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-brand-ink">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <p className="mt-3 text-[9.5px] font-bold uppercase tracking-[0.12em] text-muted/70">
                {item.label}
              </p>
              {item.href ? (
                <a
                  href={item.href}
                  className="mt-1 block text-[12.5px] font-semibold text-ink transition-colors hover:text-brand"
                >
                  {item.value}
                </a>
              ) : (
                <p className="mt-1 text-[12.5px] font-semibold text-ink">{item.value}</p>
              )}
            </div>
          );
        })}
      </div>

      <SectionBlock title="What to include">
        <p>
          For an evaluation, send the school name, the city, the number of students and which
          modules you would want on day one. For support on a live workspace, include the school
          and the term so we can look at the same screens you are looking at.
        </p>
      </SectionBlock>

      <SectionBlock title="Before you write">
        <p>
          This site is a frontend demonstration: the sample school and any records you create live
          in your own browser and are never transmitted. If you email us, that message is read by{" "}
          {site.company} and handled as described in the{" "}
          <a
            href="/privacy"
            className="font-semibold text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand"
          >
            privacy policy
          </a>
          .
        </p>
      </SectionBlock>
    </PageLanding>
  );
}
