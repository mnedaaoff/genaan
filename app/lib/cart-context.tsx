"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { CartItem, PotAddon, Product, ProductVariant } from "./types";

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (product: Product, variant?: ProductVariant, qty?: number, potAddon?: PotAddon) => void;
  removeItem: (itemId: number) => void;
  updateQty: (itemId: number, qty: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  isCartOpen: boolean;
  itemCount: number;
  incrementItem: (itemId: number) => void;
  decrementItem: (itemId: number) => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const CART_KEY = "genaan_cart";

function lineKey(productId: number, variantId?: number, potAddon?: PotAddon) {
  if (potAddon) {
    return `${productId}-pot-${potAddon.pot_product_id}-${potAddon.pot_variant_id}`;
  }
  return `${productId}-${variantId ?? "base"}`;
}

function itemUnitPrice(item: CartItem): number {
  const base = item.variant?.price ?? item.product.price ?? 0;
  return base + (item.pot_addon?.price ?? 0);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((
    product: Product,
    variant?: ProductVariant,
    qty = 1,
    potAddon?: PotAddon,
  ) => {
    const key = lineKey(product.id, variant?.id, potAddon);
    setItems(prev => {
      const existing = prev.find(i => lineKey(i.product_id, i.variant_id, i.pot_addon) === key);
      if (existing) {
        return prev.map(i =>
          i.id === existing.id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      const unitPrice = (variant?.price ?? product.price) + (potAddon?.price ?? 0);
      const newItem: CartItem = {
        id: Date.now(),
        product_id: product.id,
        variant_id: variant?.id,
        quantity: qty,
        product: {
          id: product.id,
          name: product.name,
          price: unitPrice,
          images: product.images,
          slug: product.slug,
          type: product.type,
        },
        variant: variant
          ? { id: variant.id, name: variant.name, price: variant.price, color: variant.color, size: variant.size }
          : undefined,
        pot_addon: potAddon,
      };
      return [...prev, newItem];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((itemId: number) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  }, []);

  const updateQty = useCallback((itemId: number, qty: number) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.id !== itemId));
    } else {
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: qty } : i));
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const count = items.reduce((s, i) => s + i.quantity, 0);

  const decrementItem = useCallback((itemId: number) => {
    setItems(prev => {
      const item = prev.find(i => i.id === itemId);
      if (!item) return prev;
      if (item.quantity <= 1) return prev.filter(i => i.id !== itemId);
      return prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
    });
  }, []);

  const incrementItem = useCallback((itemId: number) => {
    setItems(prev =>
      prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i)
    );
  }, []);

  const subtotal = items.reduce((sum, item) => sum + itemUnitPrice(item) * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      count,
      itemCount: count,
      subtotal,
      addItem,
      removeItem,
      updateQty,
      incrementItem,
      decrementItem,
      clearCart,
      isOpen,
      isCartOpen: isOpen,
      openCart,
      closeCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
