import { CommunitySection } from "./components/landing/CommunitySection";
import { HeroSection } from "./components/landing/HeroSection";
import { InnovationSection } from "./components/landing/InnovationSection";
import { ProductsSection } from "./components/landing/ProductsSection";
import { Navbar } from "./components/ui/Navbar";
import { Footer } from "./components/ui/Footer";
import { CartDrawer } from "./components/ui/CartDrawer";

export default function Home() {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="flex-1">
        {/* Full-width hero — no container */}
        <HeroSection />

        {/* Remaining sections with standard container */}
        <div className="mx-auto max-w-[1200px] px-5 md:px-8">
          <ProductsSection />
          <InnovationSection />
          <CommunitySection />
        </div>
      </main>
      <Footer />
    </>
  );
}

