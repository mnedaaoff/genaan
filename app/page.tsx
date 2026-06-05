import { CommunitySection } from "./components/landing/CommunitySection";
import { HeroSection } from "./components/landing/HeroSection";
import { InnovationSection } from "./components/landing/InnovationSection";
import { HomepageSections } from "./components/landing/HomepageSections";
import { ProductsSection } from "./components/landing/ProductsSection";
import { Navbar } from "./components/ui/Navbar";
import { Footer } from "./components/ui/Footer";
import { CartDrawer } from "./components/ui/CartDrawer";
import {
  getCachedBestSellerProducts,
  getCachedHomepageSections,
  getCachedPublicSettings,
} from "./lib/cache/public-data";

export const revalidate = 300;

export default async function Home() {
  const [sections, bestSellerProducts, settings] = await Promise.all([
    getCachedHomepageSections(),
    getCachedBestSellerProducts(),
    getCachedPublicSettings([
      "social_instagram",
      "social_facebook",
      "contact_whatsapp",
      "social_telegram",
    ]),
  ]);

  const socials = {
    instagram: settings.social_instagram || "#",
    facebook: settings.social_facebook || "#",
    whatsapp: settings.contact_whatsapp
      ? `https://wa.me/${settings.contact_whatsapp.replace(/\D/g, "")}`
      : "#",
    telegram: settings.social_telegram || "#",
  };

  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="flex-1">
        <HeroSection />
        <div className="mx-auto max-w-[1200px] px-5 md:px-8">
          <HomepageSections initialSections={sections} />
          <ProductsSection initialProducts={bestSellerProducts} />
          <InnovationSection />
          <CommunitySection />
        </div>
      </main>
      <Footer initialSocials={socials} />
    </>
  );
}
