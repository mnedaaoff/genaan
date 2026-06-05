import { Suspense } from "react";
import { getCachedShopCatalog } from "../../lib/cache/public-data";
import ShopClient from "./ShopClient";

export const revalidate = 60;

export default async function ShopPage() {
  const catalog = await getCachedShopCatalog();
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f4f5f1]" />}>
      <ShopClient initialCatalog={catalog} />
    </Suspense>
  );
}
