import React from "react";
import { Navbar } from "../components/ui/Navbar";
import { CartDrawer } from "../components/ui/CartDrawer";
import { Footer } from "../components/ui/Footer";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </>
  );
}
