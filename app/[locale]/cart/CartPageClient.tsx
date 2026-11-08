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
import { useTranslations } from 'next-intl';
import { useCart, type CartLineItem } from '@/lib/cart/CartContext';
import { useCartQuote } from '@/lib/cart/useCartQuote';
import { DELIVERY_FEE_RANGE } from '@/lib/commerce/delivery';
import { formatAmount, formatPriceLKR } from '@/lib/pricing/format';

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
  checkoutLabel: string;
  continueShoppingLabel: string;
  removedToastMessage: string;
  undoLabel: string;
}


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
  checkoutLabel,
  continueShoppingLabel,
  removedToastMessage,
  undoLabel,
}: CartPageClientProps) {
  const { items, hydrated, setQuantity, removeItem, restoreItem } = useCart();
  // Prices come from the server, never from the stored cart (docs/4-architecture.md §3.4).
  const { quote, loading, failed, refresh, lineFor } = useCartQuote(items, { enabled: hydrated });
  const tQuote = useTranslations('commerce.quote');
  const tDelivery = useTranslations('commerce.delivery');
  const tCheckout = useTranslations('commerce.checkout');
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
        {items.map((item, index) => {
          const quoted = lineFor(item.id);
          return (
          <div key={item.id}>
          <CartLine
            thumbnail={item.thumbnail}
            designName={item.designName}
            materialLabel={item.materialLabel}
            sareeColourName={item.sareeColourName}
            jacketMaterialName={item.jacketMaterialName}
            jacketColourName={item.jacketColourName}
            drapeLabel={item.drapeLabel}
            unitPrice={quoted?.unitPrice ?? item.unitPrice}
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
          {quoted?.status === 'unavailable' && (
            <p className="field-message-error" role="status">{tQuote('unavailable')}</p>
          )}
          {quoted?.status === 'insufficient' && (
            <p className="field-message-error" role="status">{tQuote('insufficient', { count: quoted.available ?? 0 })}</p>
          )}
          {quoted?.unitPrice !== undefined && quoted.unitPrice !== item.unitPrice && (
            <p className="price-attribution" role="status">{tQuote('priceChanged', { old: formatPriceLKR(item.unitPrice) })}</p>
          )}
          </div>
          );
        })}
      </div>

      {/* Delivery fee shown here, not later (docs/1-ux.md §3.4): the exact
          fee needs the district, chosen at checkout. */}
      <p className="field-message">
        {deliveryFeeLabel}:{' '}
        {tDelivery('feeRange', { min: formatAmount(DELIVERY_FEE_RANGE.min), max: formatAmount(DELIVERY_FEE_RANGE.max) })}
      </p>
      {quote && <CartSummary rows={[]} totalLabel={subtotalLabel} total={quote.subtotal} />}
      {loading && <p className="field-message" role="status">{tQuote('loading')}</p>}
      {failed && (
        <div className="flex flex-col gap-2" role="alert">
          <p className="field-message-error">{tQuote('failed')}</p>
          <Button variant="secondary" onClick={() => void refresh()}>
            {tCheckout('retry')}
          </Button>
        </div>
      )}

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
