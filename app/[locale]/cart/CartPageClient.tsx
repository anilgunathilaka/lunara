'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { CartLine } from '@/components/commerce/CartLine';
import { CartSummary } from '@/components/commerce/CartSummary';
import { UnstitchedReminder } from '@/components/commerce/UnstitchedReminder';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Toast } from '@/components/feedback/Toast';
import { Button } from '@/components/primitives/Button';
import { useCart, type CartLineItem } from '@/lib/cart/CartContext';

export interface CartPageClientProps {
  emptyMessage: string;
  shopCuratedLabel: string;
  designYourOwnLabel: string;
  editLabel: string;
  removeLabel: string;
  decreaseQuantityLabel: string;
  increaseQuantityLabel: string;
  unstitchedInlineMessage: string;
  unstitchedLabel: string;
  subtotalLabel: string;
  deliveryFeeLabel: string;
  codFeeLabel: string;
  codWaivedLabel: string;
  totalLabel: string;
  checkoutLabel: string;
  continueShoppingLabel: string;
  removedToastMessage: string;
  undoLabel: string;
}

const DELIVERY_FEE = 450;
const COD_FEE = 350;

export function CartPageClient({
  emptyMessage,
  shopCuratedLabel,
  designYourOwnLabel,
  editLabel,
  removeLabel,
  decreaseQuantityLabel,
  increaseQuantityLabel,
  unstitchedInlineMessage,
  unstitchedLabel,
  subtotalLabel,
  deliveryFeeLabel,
  codFeeLabel,
  codWaivedLabel,
  totalLabel,
  checkoutLabel,
  continueShoppingLabel,
  removedToastMessage,
  undoLabel,
}: CartPageClientProps) {
  const { items, hydrated, setQuantity, removeItem, restoreItem, subtotal } = useCart();
  const router = useRouter();
  const [pendingUndo, setPendingUndo] = useState<{ item: CartLineItem; index: number } | null>(null);

  function handleRemove(item: CartLineItem, index: number) {
    removeItem(item.id);
    setPendingUndo({ item, index });
  }

  function handleUndo() {
    if (pendingUndo) restoreItem(pendingUndo.item, pendingUndo.index);
    setPendingUndo(null);
  }

  if (!hydrated) return null;

  if (items.length === 0) {
    return (
      <EmptyState
        message={emptyMessage}
        actions={[
          { href: '/shop', label: shopCuratedLabel },
          { href: '/design-your-own', label: designYourOwnLabel },
        ]}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <UnstitchedReminder variant="inline" message={unstitchedInlineMessage} />

      <div>
        {items.map((item, index) => (
          <CartLine
            key={item.id}
            thumbnail={item.thumbnail}
            designName={item.designName}
            materialLabel={item.materialLabel}
            sareeColourName={item.sareeColourName}
            jacketMaterialName={item.jacketMaterialName}
            jacketColourName={item.jacketColourName}
            drapeLabel={item.drapeLabel}
            unitPrice={item.unitPrice}
            quantity={item.quantity}
            onQuantityChange={(quantity) => setQuantity(item.id, quantity)}
            onRemove={() => handleRemove(item, index)}
            onEdit={item.editHref ? () => router.push('/design-your-own') : undefined}
            editLabel={editLabel}
            removeLabel={removeLabel}
            decreaseQuantityLabel={decreaseQuantityLabel}
            increaseQuantityLabel={increaseQuantityLabel}
            unstitchedLabel={unstitchedLabel}
          />
        ))}
      </div>

      <CartSummary
        rows={[
          { label: subtotalLabel, amount: subtotal },
          { label: deliveryFeeLabel, amount: DELIVERY_FEE },
          { label: codFeeLabel, amount: COD_FEE, note: codWaivedLabel },
        ]}
        totalLabel={totalLabel}
        total={subtotal + DELIVERY_FEE + COD_FEE}
      />

      <div className="flex flex-wrap gap-3">
        <Link href="/checkout" className="btn focus-ring btn-primary btn-lg">
          {checkoutLabel}
        </Link>
        <Link href="/shop" className="btn focus-ring btn-secondary btn-lg">
          {continueShoppingLabel}
        </Link>
      </div>

      {pendingUndo && (
        <Toast message={removedToastMessage} undoLabel={undoLabel} onUndo={handleUndo} onDismiss={() => setPendingUndo(null)} />
      )}
    </div>
  );
}
