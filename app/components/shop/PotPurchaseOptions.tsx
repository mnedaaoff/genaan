"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Lang } from "../../lib/translations";
import type { PotAddon, ProductType, ProductVariant } from "../../lib/types";
import {
  findPotVariant,
  findVariantBySelection,
  getVariantColors,
  getVariantSizes,
  potSizeLabel,
  resolvePlantPotSize,
  variantHasColors,
  variantHasSizes,
  type PotProductOption,
  type PotVariantRow,
} from "../../lib/pot-utils";

interface PotPurchaseOptionsProps {
  lang: Lang;
  productType: ProductType;
  plantPotSize?: string | null;
  potProducts?: PotProductOption[];
  variants?: PotVariantRow[];
  basePrice: number;
  onSelectionChange: (state: PotSelectionState) => void;
}

export interface PotSelectionState {
  canAdd: boolean;
  totalPrice: number;
  variant?: ProductVariant;
  potAddon?: PotAddon;
}

function toProductVariant(v: PotVariantRow): ProductVariant {
  return {
    id: v.id,
    product_id: v.product_id,
    name: v.name,
    price: v.price ?? undefined,
    stock: v.stock ?? undefined,
    color: v.color,
    size: v.size,
  };
}

function potImageUrl(pot: PotProductOption): string | null {
  return pot.product_images?.find(i => i.is_primary)?.url ?? pot.product_images?.[0]?.url ?? null;
}

function VariantPicker({
  lang,
  variants,
  basePrice,
  selectedColor,
  selectedSize,
  onColor,
  onSize,
}: {
  lang: Lang;
  variants: PotVariantRow[];
  basePrice: number;
  selectedColor: string;
  selectedSize: string;
  onColor: (c: string) => void;
  onSize: (s: string) => void;
}) {
  const isRTL = lang === "ar";
  const hasColors = variantHasColors(variants);
  const hasSizes = variantHasSizes(variants);
  const colors = getVariantColors(variants);
  const sizes = getVariantSizes(variants, selectedColor || undefined);
  const matched = findVariantBySelection(variants, { color: selectedColor, size: selectedSize });

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
      active ? "bg-[#17583a] text-white border-[#17583a]" : "bg-white text-[#5f786c] border-[#d4ded7] hover:border-[#17583a]"
    }`;

  return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-[#0d3a24]">
        {isRTL ? "اختر المواصفات" : "Choose options"}
      </p>
      {hasColors && (
        <div>
          <label className="block text-xs font-bold text-[#0d3a24] mb-2 uppercase tracking-wide">
            {isRTL ? "اللون" : "Color"}
          </label>
          <div className="flex flex-wrap gap-2">
            {colors.map(color => (
              <button key={color} type="button" onClick={() => { onColor(color); onSize(""); }} className={chip(selectedColor === color)}>
                {color}
              </button>
            ))}
          </div>
        </div>
      )}
      {hasSizes && (
        <div>
          <label className="block text-xs font-bold text-[#0d3a24] mb-2 uppercase tracking-wide">
            {isRTL ? "الحجم" : "Size"}
          </label>
          <div className="flex flex-wrap gap-2">
            {sizes.map(size => {
              const variantForSize = findVariantBySelection(variants, {
                color: selectedColor,
                size,
              });
              const sizePrice = variantForSize?.price ?? basePrice;
              return (
                <button key={size} type="button" onClick={() => onSize(size)} className={chip(selectedSize === size)}>
                  {potSizeLabel(size, lang)}
                  <span className="opacity-80 ms-1">· {sizePrice.toFixed(0)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      {matched && (
        <p className="text-sm font-bold text-[#17583a]">
          EGP {(matched.price ?? basePrice).toFixed(2)}
        </p>
      )}
    </div>
  );
}

export function PotPurchaseOptions({
  lang,
  productType,
  plantPotSize,
  potProducts = [],
  variants = [],
  basePrice,
  onSelectionChange,
}: PotPurchaseOptionsProps) {
  const isRTL = lang === "ar";
  const autoSize = resolvePlantPotSize(plantPotSize);
  const isPlant = productType === "plant";
  const hasOwnVariants = variants.length > 0;

  const [ownColor, setOwnColor] = useState("");
  const [ownSize, setOwnSize] = useState("");
  const [selectedPotId, setSelectedPotId] = useState<number | "">("");
  const [potColor, setPotColor] = useState("");

  const selectedPot = potProducts.find(p => p.id === selectedPotId);
  const selectedPotImg = selectedPot ? potImageUrl(selectedPot) : null;
  const potColors = selectedPot ? getVariantColors(selectedPot.product_variants) : [];
  const potVariant = selectedPot && potColor
    ? findPotVariant(selectedPot.product_variants, potColor, autoSize)
    : undefined;
  const ownVariant = hasOwnVariants
    ? findVariantBySelection(variants, { color: ownColor, size: ownSize })
    : undefined;

  // Helper to select a pot and automatically choose its first color option
  const selectPotAndDefaultColor = (pot: PotProductOption) => {
    setSelectedPotId(pot.id);
    const colors = getVariantColors(pot.product_variants);
    if (colors.length > 0) {
      setPotColor(colors[0]);
    } else {
      setPotColor("");
    }
  };

  // Auto-select the first pot and its first color option on component mount / load
  useEffect(() => {
    if (isPlant && potProducts.length > 0 && selectedPotId === "") {
      const firstPot = potProducts[0];
      selectPotAndDefaultColor(firstPot);
    }
  }, [isPlant, potProducts, selectedPotId]);

  useEffect(() => {
    let canAdd = true;
    let unitPrice = basePrice;
    let variant: ProductVariant | undefined;
    let potAddon: PotAddon | undefined;

    if (hasOwnVariants) {
      const needsColor = variantHasColors(variants);
      const needsSize = variantHasSizes(variants);
      if ((needsColor && !ownColor) || (needsSize && !ownSize) || !ownVariant) {
        canAdd = false;
      } else {
        variant = toProductVariant(ownVariant!);
        unitPrice = ownVariant!.price ?? basePrice;
      }
    }

    if (isPlant) {
      if (!selectedPot || !potColor || !potVariant) {
        canAdd = false;
      } else {
        const potPrice = potVariant.price ?? selectedPot.price;
        potAddon = {
          pot_product_id: selectedPot.id,
          pot_variant_id: potVariant.id,
          pot_name: selectedPot.name,
          color: potColor,
          size: autoSize,
          price: potPrice,
        };
        unitPrice += potPrice;
      }
    }

    if (!isPlant && !hasOwnVariants) {
      canAdd = true;
      unitPrice = basePrice;
    }

    onSelectionChange({ canAdd, totalPrice: unitPrice, variant, potAddon });
  }, [
    hasOwnVariants, variants, ownColor, ownSize, ownVariant, basePrice,
    isPlant, selectedPot, potColor, potVariant, autoSize, onSelectionChange,
  ]);

  const chip = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
      active ? "bg-[#17583a] text-white border-[#17583a]" : "bg-white text-[#5f786c] border-[#d4ded7] hover:border-[#17583a]"
    }`;

  return (
    <div className="space-y-4">
      {hasOwnVariants && (
        <div className="rounded-2xl border border-[#e4ece7] bg-white p-4">
          <VariantPicker
            lang={lang}
            variants={variants}
            basePrice={basePrice}
            selectedColor={ownColor}
            selectedSize={ownSize}
            onColor={setOwnColor}
            onSize={setOwnSize}
          />
        </div>
      )}

      {isPlant && potProducts.length > 0 && (
        <div className="rounded-2xl border border-[#e4ece7] bg-white p-4 space-y-4">
          <div>
            <p className="text-sm font-bold text-[#0d3a24]">{isRTL ? "اختر قصيصاً" : "Select a pot"}</p>
            <p className="text-xs text-[#8aab99] mt-0.5">
              {isRTL
                ? `الحجم تلقائي (${potSizeLabel(autoSize, lang)}) — اختر النوع واللون`
                : `Auto size (${potSizeLabel(autoSize, lang)}) — pick type & color`}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {potProducts.map(p => {
              const img = potImageUrl(p);
              const active = selectedPotId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectPotAndDefaultColor(p)}
                  className={`rounded-xl border-2 overflow-hidden text-start transition-all ${
                    active ? "border-[#17583a] ring-2 ring-[#17583a]/20" : "border-[#e4ece7] hover:border-[#17583a]/50"
                  }`}
                >
                  <div className="relative aspect-square bg-[#f4f5f1]">
                    {img ? (
                      <Image src={img} alt={p.name} fill className="object-cover" sizes="120px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🪴</div>
                    )}
                  </div>
                  <p className="px-2 py-1.5 text-xs font-semibold text-[#0d3a24] line-clamp-2">{p.name}</p>
                </button>
              );
            })}
          </div>

          {selectedPot && (
            <div className="flex gap-4 items-start p-3 bg-[#f4f5f1] rounded-xl">
              {selectedPotImg && (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-[#e4ece7]">
                  <Image src={selectedPotImg} alt={selectedPot.name} fill className="object-cover" sizes="80px" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#0d3a24]">{selectedPot.name}</p>
                <p className="text-xs text-[#8aab99] mt-0.5">
                  {isRTL ? "اختر اللون:" : "Pick a color:"}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {potColors.map(color => (
                    <button key={color} type="button" onClick={() => setPotColor(color)} className={chip(potColor === color)}>
                      {color}
                    </button>
                  ))}
                </div>
                {potColor && potVariant && (
                  <p className="text-sm font-bold text-[#17583a] mt-2">
                    + EGP {(potVariant.price ?? selectedPot.price).toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
