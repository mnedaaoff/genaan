import type { FooterGroup, LandingProduct } from "./types";

export const landingProducts: LandingProduct[] = [
  {
    id: 1,
    name: "ZZ Sentinel",
    description: "Natural resilient leaves",
    price: "$46.00",
    image:
      "https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    name: "Livista Grand",
    description: "Tropical statement plant",
    price: "$120.00",
    image:
      "https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    name: "Cyber Spirit",
    description: "Minimal premium foliage",
    price: "$78.00",
    image:
      "https://images.unsplash.com/photo-1438109382753-8368e7e1e7cf?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    name: "Ava Ivy",
    description: "Hanging shelf companion",
    price: "$29.00",
    image:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80",
  },
];

export const footerGroups: FooterGroup[] = [
  {
    title: "General",
    links: ["About Us", "Collections", "Blog"],
  },
  {
    title: "Customer Care",
    links: ["Shipping Policy", "FAQ", "Terms of Use"],
  },
  {
    title: "Stay Updated",
    links: ["Instagram", "TikTok", "LinkedIn"],
  },
];
