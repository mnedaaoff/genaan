import { CommunitySection } from "./CommunitySection";
import { landingProducts, footerGroups } from "./data";
import { HeroSection } from "./HeroSection";
import { InnovationSection } from "./InnovationSection";
import { LandingFooter } from "./LandingFooter";
import { LandingHeader } from "./LandingHeader";
import { ProductsSection } from "./ProductsSection";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f4f5f1] text-[#163e2b]">
      <main className="mx-auto max-w-[1120px] px-5 py-7 md:px-8 md:py-9">
        <LandingHeader />
        <HeroSection />
        <ProductsSection products={landingProducts} />
        <InnovationSection />
        <CommunitySection />
        <LandingFooter groups={footerGroups} />
      </main>
    </div>
  );
}
