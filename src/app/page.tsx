import { MarketingNav } from "@/components/marketing/nav";
import { Hero } from "@/components/marketing/hero";
import { Features, Roles, StatsBand, TrustMarquee } from "@/components/marketing/sections";
import { AiSection } from "@/components/marketing/ai-section";
import { ClosingCta, Faq, Footer, Stories } from "@/components/marketing/closing";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas">
      <MarketingNav />
      <main>
        <Hero />
        <TrustMarquee />
        <StatsBand />
        <Features />
        <AiSection />
        <Roles />
        <Stories />
        <Faq />
        <ClosingCta />
      </main>
      <Footer />
    </div>
  );
}
