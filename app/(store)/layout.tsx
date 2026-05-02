import React from "react";
import { Navbar } from "../components/ui/Navbar";
import { Footer } from "../components/ui/Footer";
import { CartDrawer } from "../components/ui/CartDrawer";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </>
  );
}
