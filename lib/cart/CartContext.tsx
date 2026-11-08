'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { MAX_QUANTITY, type CartLineRef } from '@/lib/commerce/cart-ref';

/**
 * Device-local cart (localStorage). Survives across sessions on the same
 * device (docs/1-ux.md §2.2). Each line carries a `ref` — the only thing
 * the server trusts — plus display fields. `unitPrice` is the price the
 * customer saw when adding; the cart and checkout re-quote every line on
 * the server and show any difference inline (docs/4-architecture.md §3.4).
 */
export interface CartLineItem {
  id: string;
  /** What the server resolves price, stock and SKUs from. */
  ref: CartLineRef;
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

// v2: lines carry a server-resolvable `ref`. v1 carts had none and cannot
// be priced, so they are discarded rather than migrated.
const STORAGE_KEY = 'lunara.cart.v2';

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
      if (raw) setItems((JSON.parse(raw) as CartLineItem[]).filter((item) => item && item.ref));
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
        // Same bounds the server enforces (docs/4-architecture.md §3.4).
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, quantity: Math.min(Math.max(quantity, 1), MAX_QUANTITY) } : i)),
        ),
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
