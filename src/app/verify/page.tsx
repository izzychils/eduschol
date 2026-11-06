import { Metadata } from "next";
import { MarketingNav } from "@/components/marketing/nav";
import { Footer } from "@/components/marketing/closing";
import { VerificationCard } from "@/components/verification-card";
import { site } from "@/lib/site";
import { Reveal } from "@/components/marketing/reveal";

export const metadata: Metadata = {
  title: "Company Verification | Eduschol",
  description:
    "Verify Eduschol's official registration and company details. Confirm the authenticity of our platform and services.",
};

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <MarketingNav />
      
      <main>
        {/* Hero Section */}
        <section className="border-b border-line bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
            <div className="mx-auto max-w-[720px] text-center">
              <Reveal>
                <p className="eyebrow">Verification</p>
                <h1 className="mt-3 text-[clamp(2rem,4.2vw,3.4rem)] font-extrabold leading-[1.04] tracking-[-0.045em] text-ink">
                  Confirm Official Registration
                </h1>
                <p className="mx-auto mt-5 max-w-[560px] text-[13.5px] leading-relaxed text-muted">
                  Verify the authenticity of Eduschol and confirm official company
                  registration details. Enter a registration ID below to view
                  verification status.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Verification Card */}
        <section className="bg-canvas py-16 sm:py-20">
          <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
            <Reveal>
              <VerificationCard />
            </Reveal>
          </div>
        </section>

        {/* Info Section */}
        <section className="border-t border-line bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
            <Reveal>
              <h2 className="mb-8 text-center text-[clamp(1.7rem,3vw,2.3rem)] font-extrabold tracking-[-0.04em] text-ink">
                Why Verify?
              </h2>
            </Reveal>
            <div className="grid gap-4 md:grid-cols-3">
              <Reveal delay={80}>
                <div className="hover-lift rounded-[22px] border border-line bg-canvas p-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-brand/20 bg-brand-soft text-brand">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-[14.5px] font-bold text-ink">
                    Authenticity
                  </h3>
                  <p className="text-[12.5px] leading-relaxed text-muted">
                    Confirm you're working with the official Eduschol platform
                    and not an impersonator.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={120}>
                <div className="hover-lift rounded-[22px] border border-line bg-canvas p-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-brand/20 bg-brand-soft text-brand">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-[14.5px] font-bold text-ink">
                    Trust
                  </h3>
                  <p className="text-[12.5px] leading-relaxed text-muted">
                    Verify our registration details, operational status, and
                    compliance certifications.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={160}>
                <div className="hover-lift rounded-[22px] border border-line bg-canvas p-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-brand/20 bg-brand-soft text-brand">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-[14.5px] font-bold text-ink">
                    Transparency
                  </h3>
                  <p className="text-[12.5px] leading-relaxed text-muted">
                    Access public records of our company registration and service
                    offerings.
                  </p>
                </div>
              </Reveal>
            </div>
            <p className="mt-8 text-center text-[11px] text-muted">
              Last updated: {site.lastUpdated}
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
