import React from "react";
import { Navbar } from "../components/ui/Navbar";
import { Footer } from "../components/ui/Footer";
import { CartDrawer } from "../components/ui/CartDrawer";
import { getCachedPublicSettings } from "../lib/cache/public-data";

export const revalidate = 600;

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await getCachedPublicSettings([
    "social_instagram",
    "social_facebook",
    "contact_whatsapp",
    "social_telegram",
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
      <main className="flex-1 pt-16">{children}</main>
      <Footer initialSocials={socials} />
    </>
  );
}
