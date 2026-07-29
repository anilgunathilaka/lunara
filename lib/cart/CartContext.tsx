'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

/**
 * TEMPORARY client-only cart store (localStorage), standing in for the
 * real Cart & Order API in docs/4-architecture.md §2 (no backend cart
 * service exists yet). Survives across sessions on the same device, which
 * satisfies docs/1-ux.md §2.2 ("Cart contents survive ... for at least 30
 * days") without a server. Replace with a real API-backed store once one
 * exists — the CartLineItem shape is deliberately the same data CartLine
 * already renders, so that swap shouldn't touch component code.
 */
export interface CartLineItem {
  id: string;
  designName: string;
  materialLabel: string;
  sareeColourName?: string;
  jacketMaterialName: string;
  jacketColourName?: string;
  /** Present only for a saree line (paired or configured) — absent for a standalone jacket line. */
  drapeLabel?: string;
  unitPrice: number;
  quantity: number;
  thumbnail: { src: string; alt: string };
  /** Present only for a configured (Design Your Own) line — CartLine's "Edit this design". */
  editHref?: string;
  /** Whether this line carries a saree that ships unstitched (jacket-only lines still ship unstitched too, but always true here since every line includes a jacket). */
  unstitched: boolean;
}

interface CartContextValue {
  items: CartLineItem[];
  addItem: (item: Omit<CartLineItem, 'id'>) => string;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  restoreItem: (item: CartLineItem, index: number) => void;
  clear: () => void;
  itemCount: number;
  subtotal: number;
  hydrated: boolean;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = 'lunara.cart.v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Deliberately effect-based rather than a useState lazy initializer:
    // the server has no `localStorage`, so a lazy initializer reading it
    // synchronously would render different content on the client's first
    // pass than what the server sent, producing a hydration mismatch.
    // Starting from `[]` (matching the server) and swapping in the real
    // value post-mount is the standard fix for that class of bug.
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // Corrupt/blocked storage — start from an empty cart rather than crash.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage full/blocked — cart still works for this tab session.
    }
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    return {
      items,
      addItem: (item) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setItems((prev) => [...prev, { ...item, id }]);
        return id;
      },
      removeItem: (id) => setItems((prev) => prev.filter((i) => i.id !== id)),
      setQuantity: (id, quantity) =>
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i))),
      restoreItem: (item, index) =>
        setItems((prev) => {
          const next = [...prev];
          next.splice(index, 0, item);
          return next;
        }),
      clear: () => setItems([]),
      itemCount,
      subtotal,
      hydrated,
    };
  }, [items, hydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
