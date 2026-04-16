import { CommunitySection } from "./components/landing/CommunitySection";
import { HeroSection } from "./components/landing/HeroSection";
import { InnovationSection } from "./components/landing/InnovationSection";
import { ProductsSection } from "./components/landing/ProductsSection";
import { Navbar } from "./components/ui/Navbar";
import { Footer } from "./components/ui/Footer";
import { CartDrawer } from "./components/ui/CartDrawer";
import { landingProducts } from "./components/landing/data";

export default function Home() {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="flex-1">
        <div className="mx-auto max-w-[1200px] px-5 md:px-8">
          <HeroSection />
          <ProductsSection products={landingProducts} />
          <InnovationSection />
          <CommunitySection />
        </div>
      </main>
      <Footer />
    </>
  );
}
